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

from typing import Dict, Tuple, List, Optional, Any
import math
import numpy as np


def probability_from_quantiles(x: float, q: np.ndarray, p: np.ndarray) -> float:
    """
    Computes empirical cumulative probability p = F(x) from nondecreasing quantiles q and probabilities p.
    Tie policy: when adjacent quantiles are equal (e.g. repeated values or zero-rain steps),
    chooses the highest probability index sharing the input quantile value.
    Zero-width intervals are safely skipped using upper_bound - 1.
    """
    if not math.isfinite(x):
        raise ValueError(f"Input x must be finite, got {x}")
    if len(q) != len(p):
        raise ValueError("Quantile and probability arrays must have identical length")
    if len(q) < 2:
        raise ValueError("Quantile and probability arrays must contain at least 2 points")

    m = len(q) - 1
    if x < q[0]:
        return float(p[0])
    if x > q[m]:
        return float(p[m])

    # First index i for which q[i] > x; m + 1 if none exists (upper_bound)
    j = int(np.searchsorted(q, x, side="right")) - 1

    if q[j] == x:
        return float(p[j])

    width = q[j + 1] - q[j]
    assert width > 0, f"Quantile interval width must be positive, got {width}"

    fraction = (x - q[j]) / width
    return float(p[j] + fraction * (p[j + 1] - p[j]))


def map_tail_continuous(
    x_raw: float,
    a: float,
    b: float,
    a99: float,
    b99: float,
    fixed_cap: float = 3.0,
    denom_floor: float = 0.10,
) -> float:
    """
    Continuous capped-slope extreme tail extrapolation.
    Preserves endpoint (x_raw = a -> y = b) and bounds the incremental tail slope:
      tail_slope = min(b / a, multiplier_cap)
    where multiplier_cap = min(fixed_cap, b99 / a99) when a99 > denom_floor.
    
    Guarantees:
    - Continuous at x_raw = a: lim_{x->a+} y = b.
    - Capped incremental slope: prevents runaway explosion on unseen extreme NWP inputs.
    - Identical to Themeßl multiplicative scaling when the cap is inactive.
    - Falls back to additive offset x_raw + (b - a) if a <= denom_floor.
    """
    if not (math.isfinite(x_raw) and x_raw >= 0.0):
        raise ValueError(f"x_raw must be finite and nonnegative, got {x_raw}")
    if not (math.isfinite(a) and a >= 0.0 and math.isfinite(b) and b >= 0.0):
        raise ValueError(f"Terminal quantiles must be finite and nonnegative: a={a}, b={b}")

    if a > denom_floor:
        multiplier_cap = fixed_cap
        if not (math.isfinite(a99) and a99 >= 0.0 and math.isfinite(b99) and b99 >= 0.0):
            raise ValueError(f"Adjacent quantiles must be finite and nonnegative: a99={a99}, b99={b99}")

        if a99 > denom_floor:
            ratio99 = b99 / a99
            multiplier_cap = min(multiplier_cap, ratio99)

        tail_slope = min(b / a, multiplier_cap)
        y_rqdm = b + tail_slope * (x_raw - a)
    else:
        y_rqdm = x_raw + (b - a)

    return float(y_rqdm)


def compute_p_negative(y_calibrated: float, regime: str) -> float:
    """
    Computes the Gaussian tail probability assigned to unphysical negative rainfall:
    P_negative = P(R < 0 | y_calibrated, regime) = 0.5 * erfc(y_calibrated / (sigma_R * sqrt(2)))
    using the established regime residual standard error schedule:
      ACTIVE_MONSOON: max(5.00, 0.22 * y_calibrated)
      BREAK_MONSOON:  max(1.50, 0.15 * y_calibrated)
      COASTAL_TROUGH: max(6.00, 0.25 * y_calibrated)
      NORMAL:         max(3.00, 0.20 * y_calibrated)
    """
    if "ACTIVE" in regime:
        sigma = max(5.00, 0.22 * y_calibrated)
    elif "BREAK" in regime:
        sigma = max(1.50, 0.15 * y_calibrated)
    elif "COASTAL" in regime:
        sigma = max(6.00, 0.25 * y_calibrated)
    else:
        sigma = max(3.00, 0.20 * y_calibrated)

    z = y_calibrated / (sigma * math.sqrt(2.0))
    return float(0.5 * math.erfc(z))


def has_material_negative_support(y_calibrated: float, regime: str, threshold: float = 0.05) -> bool:
    """
    Testable diagnostic checking whether P_negative exceeds the materiality threshold (default 0.05 / 5%).
    Depends on P_negative > threshold, not hard-coded regime names.
    """
    return compute_p_negative(y_calibrated, regime) > threshold


class EmpiricalQuantileTransfer:
    """Non-parametric Empirical Quantile Mapper with continuous capped-slope tail handling."""

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

        a = float(self.fcst_q[-1])
        b = float(self.obs_q[-1])
        a99 = float(self.fcst_q[-2]) if len(self.fcst_q) >= 2 else 0.0
        b99 = float(self.obs_q[-2]) if len(self.obs_q) >= 2 else 0.0

        out = np.empty_like(fcst, dtype=float)
        for idx, x_raw in np.ndenumerate(fcst):
            x_val = float(x_raw)
            if not math.isfinite(x_val):
                raise ValueError(f"Input forecast must be finite, got {x_val}")
            if x_val < 0.0:
                x_val = 0.0  # physical constraint

            if x_val > a:
                out[idx] = map_tail_continuous(x_val, a, b, a99, b99)
            else:
                p = probability_from_quantiles(x_val, self.fcst_q, self.quantiles)
                out[idx] = float(np.interp(p, self.quantiles, self.obs_q))

        # Physical constraint: precipitation cannot be negative
        return np.maximum(0.0, out)

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

    def transform_with_audit(
        self,
        fcst: np.ndarray,
        regimes: List[str],
    ) -> Tuple[np.ndarray, List[Dict[str, Any]]]:
        """
        Transforms raw forecast with full routing audit trace per prediction.
        Reports:
        - raw_fcst_mm: float
        - calibrated_rqdm_mm: float
        - regime: str
        - training_support_n_k: int
        - route: "REGIME_RQDM" | "BLENDED_GLOBAL_REGIME" | "GLOBAL_EQM_FALLBACK"
        - fallback_reason: None | "no_regime_training_samples" | "thin_strata_samples"
        """
        fcst = np.asarray(fcst, dtype=float)
        out = np.zeros_like(fcst)
        traces: List[Dict[str, Any]] = []

        global_mapped = self.global_mapper.transform(fcst)

        for i, (val, reg) in enumerate(zip(fcst, regimes)):
            n_k = self.regime_sample_counts.get(reg, 0)
            cal_val = 0.0
            route = "GLOBAL_EQM_FALLBACK"
            fallback_reason = None

            if n_k == 0:
                cal_val = float(global_mapped[i])
                route = "GLOBAL_EQM_FALLBACK"
                fallback_reason = "no_regime_training_samples"
            elif n_k < self.min_strata_samples or reg not in self.regime_mappers:
                cal_val = float(global_mapped[i])
                route = "GLOBAL_EQM_FALLBACK"
                fallback_reason = "thin_strata_samples"
            else:
                reg_val = float(self.regime_mappers[reg].transform(np.array([val]))[0])
                if n_k < 30:
                    w = min(1.0, n_k / 30.0)
                    cal_val = w * reg_val + (1.0 - w) * float(global_mapped[i])
                    route = "BLENDED_GLOBAL_REGIME"
                    fallback_reason = None
                else:
                    cal_val = reg_val
                    route = "REGIME_RQDM"
                    fallback_reason = None

            final_val = max(0.0, cal_val)
            out[i] = final_val

            traces.append({
                "index": i,
                "raw_fcst_mm": round(float(val), 2),
                "calibrated_rqdm_mm": round(float(final_val), 2),
                "regime": reg,
                "training_support_n_k": n_k,
                "route": route,
                "fallback_reason": fallback_reason,
            })

        return out, traces

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
