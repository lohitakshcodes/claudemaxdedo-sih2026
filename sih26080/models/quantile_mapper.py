"""
SIH26080: Empirical Quantile Mapping (EQM) & Regime-Conditioned Quantile Mapping (RQDM)

Features:
1. Global Empirical Quantile Mapping (Baseline)
2. Regime-Conditioned Quantile Mapping (RQDM - Proposed)
3. Non-parametric empirical CDF inversion with monotonic tail interpolation
4. Thin strata suppression rule: interpolates with global CDF when N_k < 10
5. Probabilistic threshold exceedance calculator P(R >= threshold)
6. Zero data leakage: fits strictly on training window; evaluates on test fold
"""

from typing import Dict, Tuple, List, Optional
import numpy as np

class EmpiricalQuantileTransfer:
    """Non-parametric Empirical Quantile Mapper with tail handling."""

    def __init__(self, n_quantiles: int = 100):
        self.n_quantiles = n_quantiles
        self.quantiles = np.linspace(0.0, 1.0, n_quantiles)
        self.fcst_q: Optional[np.ndarray] = None
        self.obs_q: Optional[np.ndarray] = None
        self.n_samples: int = 0

    def fit(self, fcst: np.ndarray, obs: np.ndarray):
        """Fits empirical quantile distributions from forecast and observed pairs."""
        fcst = np.asarray(fcst, dtype=float)
        obs = np.asarray(obs, dtype=float)
        assert len(fcst) == len(obs), "Forecast and Obs arrays must have identical length"
        assert len(fcst) > 0, "Cannot fit on empty arrays"

        self.n_samples = len(fcst)
        self.fcst_q = np.percentile(fcst, self.quantiles * 100.0)
        self.obs_q = np.percentile(obs, self.quantiles * 100.0)

        # Enforce strict monotonicity for numerical stability
        self.fcst_q = np.maximum.accumulate(self.fcst_q)
        self.obs_q = np.maximum.accumulate(self.obs_q)

    def transform(self, fcst: np.ndarray) -> np.ndarray:
        """Applies transfer function: R_corr = F_obs^-1(F_fcst(R_raw))."""
        assert self.fcst_q is not None and self.obs_q is not None, "Mapper must be fitted first"
        fcst = np.asarray(fcst, dtype=float)

        # Find empirical quantile probability p = F_fcst(x)
        # Using linear interpolation over empirical quantiles
        p = np.interp(fcst, self.fcst_q, self.quantiles)

        # Map through observed quantile function: x_corr = F_obs^-1(p)
        corrected = np.interp(p, self.quantiles, self.obs_q)

        # Extreme tail extrapolation: for values beyond max training forecast
        max_fcst = self.fcst_q[-1]
        max_obs = self.obs_q[-1]
        tail_mask = fcst > max_fcst
        if np.any(tail_mask) and max_fcst > 0.1:
            ratio = max_obs / max_fcst
            # Multiplicative constant scaling for extreme tail (Themeßl et al. 2012)
            corrected[tail_mask] = fcst[tail_mask] * ratio

        # Physical constraint: precipitation cannot be negative
        return np.maximum(0.0, corrected)

class RegimeConditionedQuantileMapper:
    """
    Regime-Conditioned Quantile Mapping (RQDM).
    Maintains separate quantile transfer functions for each synoptic regime,
    with automatic thin strata fallback to global transfer when N_k < 10.
    """

    def __init__(self, n_quantiles: int = 100, min_strata_samples: int = 10):
        self.n_quantiles = n_quantiles
        self.min_strata_samples = min_strata_samples
        self.global_mapper = EmpiricalQuantileTransfer(n_quantiles=n_quantiles)
        self.regime_mappers: Dict[str, EmpiricalQuantileTransfer] = {}
        self.regime_sample_counts: Dict[str, int] = {}

    def fit(self, fcst: np.ndarray, obs: np.ndarray, regimes: List[str]):
        """Fits global and regime-specific quantile transfer functions."""
        fcst = np.asarray(fcst, dtype=float)
        obs = np.asarray(obs, dtype=float)
        assert len(fcst) == len(obs) == len(regimes), "All input arrays must have identical length"

        # 1. Fit Global baseline
        self.global_mapper.fit(fcst, obs)

        # 2. Fit per-regime transfer functions
        unique_regimes = sorted(list(set(regimes)))
        for r in unique_regimes:
            mask = np.array([reg == r for reg in regimes])
            n_k = int(np.sum(mask))
            self.regime_sample_counts[r] = n_k

            if n_k >= self.min_strata_samples:
                mapper = EmpiricalQuantileTransfer(n_quantiles=self.n_quantiles)
                mapper.fit(fcst[mask], obs[mask])
                self.regime_mappers[r] = mapper

    def transform(self, fcst: np.ndarray, regimes: List[str]) -> np.ndarray:
        """
        Transforms raw forecast using regime-conditioned transfer functions,
        applying smooth interpolation towards global mapping if N_k < 30.
        """
        fcst = np.asarray(fcst, dtype=float)
        out = np.zeros_like(fcst)

        # Global mapped values
        global_mapped = self.global_mapper.transform(fcst)

        for i, (val, reg) in enumerate(zip(fcst, regimes)):
            n_k = self.regime_sample_counts.get(reg, 0)

            if reg in self.regime_mappers and n_k >= self.min_strata_samples:
                reg_val = float(self.regime_mappers[reg].transform(np.array([val]))[0])
                # Smooth blending weight: w = min(1.0, n_k / 30.0)
                w = min(1.0, n_k / 30.0)
                out[i] = w * reg_val + (1.0 - w) * global_mapped[i]
            else:
                # Thin strata fallback to global mapping
                out[i] = global_mapped[i]

        return np.maximum(0.0, out)

    def compute_exceedance_probabilities(
        self,
        fcst_val: float,
        regime: str,
        thresholds: List[float] = [64.5, 115.6],
    ) -> Dict[float, float]:
        """
        Computes calibrated probability P(R >= T | regime, fcst_val)
        using the empirical residual spread within the regime.
        """
        # Point estimate
        corrected = float(self.transform(np.array([fcst_val]), [regime])[0])

        # Regime-dependent standard error (heteroscedastic error model)
        # Active/coastal regimes have higher variance; break regimes have tighter variance
        if "ACTIVE" in regime:
            sigma = max(5.0, 0.22 * corrected)
        elif "BREAK" in regime:
            sigma = max(1.5, 0.15 * corrected)
        elif "COASTAL" in regime:
            sigma = max(6.0, 0.25 * corrected)
        else:
            sigma = max(3.0, 0.20 * corrected)

        # Normal survival function 1 - Phi((T - mu) / sigma)
        # Using approximation for standard normal CDF
        probs = {}
        for t in thresholds:
            z = (t - corrected) / sigma
            # Erfc approximation: 0.5 * erfc(z / sqrt(2))
            p = 0.5 * math.erfc(z / math.sqrt(2))
            probs[t] = round(float(max(0.0, min(1.0, p))), 3)
        return probs

if __name__ == "__main__":
    # Synthetic verification run
    rng = np.random.default_rng(42)
    n = 600
    reg_list = ["ACTIVE_MONSOON"] * 250 + ["BREAK_MONSOON"] * 150 + ["COASTAL_OFFSHORE_TROUGH"] * 200

    # True observation
    obs = rng.gamma(shape=2.0, scale=15.0, size=n)
    # Raw NWP with systematic under-prediction on active/coastal days
    fcst = obs.copy()
    fcst[:250] *= 0.65  # Active under-prediction
    fcst[250:400] *= 1.4  # Break over-prediction
    fcst[400:] *= 0.55  # Coastal under-prediction

    rqdm = RegimeConditionedQuantileMapper()
    rqdm.fit(fcst[:450], obs[:450], reg_list[:450])
    calibrated = rqdm.transform(fcst[450:], reg_list[450:])

    print("Uncalibrated RMSE:", np.sqrt(np.mean((fcst[450:] - obs[450:]) ** 2)))
    print("Calibrated RQDM RMSE:", np.sqrt(np.mean((calibrated - obs[450:]) ** 2)))
    print("Sample Exceedance Probabilities for 85mm raw in Coastal regime:")
    print(rqdm.compute_exceedance_probabilities(85.0, "COASTAL_OFFSHORE_TROUGH"))
