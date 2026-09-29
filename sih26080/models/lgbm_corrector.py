"""
SIH26080: LightGBM Spatial Orographic Residual Corrector (Gate B)

Purpose:
Applies gradient boosted decision trees on top of Regime-Conditioned Quantile Mapping (RQDM)
to resolve fine-scale spatial displacement, orographic moisture convergence along the
Western Ghats ridge, and coastal vortex enhancement.

Features:
1. raw_fcst_mm: Raw NWP accumulated precipitation
2. rqdm_fcst_mm: Regime-conditioned quantile mapped precipitation
3. elevation_m: Station/grid point terrain elevation
4. dist_coast_km: Distance to Arabian Sea coast
5. wind_u_850: 850 hPa zonal wind component
6. wind_v_850: 850 hPa meridional wind component
7. orographic_flux: wind_speed_850 * (elevation_m / 1000.0)
8. regime_code: Categorical synoptic class (0: Active, 1: Break, 2: Coastal, 3: Normal)
9. mcz_z_score: Core Monsoon Zone standardized anomaly Z
"""

from typing import List, Dict, Any, Tuple, Optional
import math
from decimal import Decimal
import numpy as np


def compute_wind_direction_deg(u: float, v: float) -> float:
    """
    Converts eastward (u) and northward (v) wind components to meteorological FROM bearing in degrees [0, 360).
    Formula: mod(270 - atan2(v, u) * 180/pi, 360)
    Explicitly handles u = v = 0 by returning 0.0 without requiring a meaningful direction.
    """
    if u == 0.0 and v == 0.0:
        return 0.0
    return float(np.mod(270.0 - np.arctan2(v, u) * (180.0 / np.pi), 360.0))


def compute_local_gradient_flow_a(u: float, v: float, dh_dx: float, dh_dy: float) -> float:
    """
    Formula A: Local terrain-gradient flow V · grad(h) = u * dh_dx + v * dh_dy.
    Represents localized mechanical ascent governed by the in-situ slope gradient.
    Maximizes in the local uphill direction grad(h).
    """
    return float(u * dh_dx + v * dh_dy)


def compute_fixed_ridge_orographic_proxy_b(
    u: float,
    v: float,
    elevation_m: float,
    ridge_azimuth_deg: float = 160.0,
) -> float:
    """
    Formula B: Elevation-weighted fixed-ridge directional proxy.
    B = sqrt(u*u + v*v) * sin((wind_direction_deg - ridge_azimuth_deg) * pi/180) * (elevation_m / 1000)
    Under ridge_azimuth_deg = 160.0:
      E = elevation_m / 1000
      B = E * (-cos(160*pi/180) * u + sin(160*pi/180) * v)
        = E * (0.9396926207859084 * u + 0.3420201433256687 * v)

    Explicitly handles u = v = 0 by returning 0.0.
    Maximizes when angle_of_attack = 90 degrees (wind FROM 250 degrees, blowing toward 70 degrees).

    CRITICAL SEMANTIC DISTINCTION:
    Formulas A and B are NOT generally equivalent.
    They are identical for every wind vector (u, v) ONLY under the conditional equivalence constraint:
      dh_dx = E * 0.9396926207859084
      dh_dy = E * 0.3420201433256687
    Otherwise, A represents local slope ascent while B represents a bulk ridge-barrier directional proxy.
    """
    if u == 0.0 and v == 0.0:
        return 0.0
    speed = math.sqrt(u * u + v * v)
    w_dir = compute_wind_direction_deg(u, v)
    alpha = (w_dir - ridge_azimuth_deg) * (math.pi / 180.0)
    elev_scale = elevation_m / 1000.0
    return float(speed * math.sin(alpha) * elev_scale)


def validate_feature_importance_display_sum(
    percentages: List[float],
    decimal_places: int = 2,
    numerical_tolerance: float = 1e-9,
) -> Tuple[bool, float, float]:
    """
    Validates that the sum of independently rounded percentages falls within
    the theoretical aggregate rounding bound:
      abs(sum(displayed_percentages) - 100.0) <= N * (0.5 * 10^(-decimal_places)) + numerical_tolerance

    For N=9 features rounded to 2 decimal places:
      Max allowed discrepancy = 9 * 0.005 = 0.045 percentage points.
    With percentages summing to 100.01%, the discrepancy is +0.01%, which is strictly <= 0.045%.

    Returns: (is_valid, exact_sum, discrepancy)
    """
    dec_sum = sum([Decimal(str(p)) for p in percentages])
    discrepancy = abs(dec_sum - Decimal("100.0"))
    max_allowed = Decimal(len(percentages)) * Decimal("0.5") * (Decimal("10") ** (-decimal_places))
    is_valid = discrepancy <= (max_allowed + Decimal(str(numerical_tolerance)))
    return bool(is_valid), float(dec_sum), float(discrepancy)


class LightGBMSpatialCorrector:
    """LightGBM regressor predicting post-RQDM spatial residuals."""

    FEATURE_NAMES = [
        "raw_fcst_mm",
        "rqdm_fcst_mm",
        "elevation_m",
        "dist_coast_km",
        "wind_u_850",
        "wind_v_850",
        "orographic_flux",
        "regime_code",
        "mcz_z_score",
    ]

    REGIME_MAP = {
        "ACTIVE_MONSOON": 0,
        "BREAK_MONSOON": 1,
        "COASTAL_OFFSHORE_TROUGH": 2,
        "NORMAL_TRANSITION": 3,
    }

    def __init__(
        self,
        n_estimators: int = 150,
        learning_rate: float = 0.05,
        num_leaves: int = 31,
        max_depth: int = 6,
        subsample: float = 0.8,
        colsample_bytree: float = 0.8,
        random_state: int = 42,
    ):
        self.params = {
            "objective": "regression_l1",  # MAE / Huber loss is robust to rainfall extremes
            "n_estimators": n_estimators,
            "learning_rate": learning_rate,
            "num_leaves": num_leaves,
            "max_depth": max_depth,
            "subsample": subsample,
            "colsample_bytree": colsample_bytree,
            "random_state": random_state,
            "verbose": -1,
        }
        self.model = None

    def _extract_features(
        self,
        raw_fcst: np.ndarray,
        rqdm_fcst: np.ndarray,
        elevations: np.ndarray,
        dist_coasts: np.ndarray,
        wind_u: np.ndarray,
        wind_v: np.ndarray,
        regimes: List[str],
        mcz_z_scores: np.ndarray,
    ) -> np.ndarray:
        """Constructs the feature matrix X."""
        wind_speed = np.sqrt(wind_u ** 2 + wind_v ** 2)
        orographic_flux = wind_speed * (elevations / 1000.0)
        reg_codes = np.array([self.REGIME_MAP.get(r, 3) for r in regimes], dtype=float)

        x = np.column_stack([
            raw_fcst,
            rqdm_fcst,
            elevations,
            dist_coasts,
            wind_u,
            wind_v,
            orographic_flux,
            reg_codes,
            mcz_z_scores,
        ])
        return np.nan_to_num(x, nan=0.0, posinf=1000.0, neginf=-1000.0)

    def fit(
        self,
        raw_fcst: np.ndarray,
        rqdm_fcst: np.ndarray,
        elevations: np.ndarray,
        dist_coasts: np.ndarray,
        wind_u: np.ndarray,
        wind_v: np.ndarray,
        regimes: List[str],
        mcz_z_scores: np.ndarray,
        obs_truth: np.ndarray,
    ):
        """Fits gradient boosted decision tree on residuals: y = obs - rqdm_fcst."""
        x = self._extract_features(
            raw_fcst, rqdm_fcst, elevations, dist_coasts, wind_u, wind_v, regimes, mcz_z_scores
        )
        y_residual = obs_truth - rqdm_fcst

        try:
            import lightgbm as lgb
            self.model = lgb.LGBMRegressor(**self.params)
            self.model.fit(x, y_residual)
            self.is_lgb = True
        except ImportError:
            try:
                from sklearn.ensemble import HistGradientBoostingRegressor
                self.model = HistGradientBoostingRegressor(
                    max_iter=self.params.get("n_estimators", 100),
                    learning_rate=self.params.get("learning_rate", 0.05),
                    max_depth=self.params.get("max_depth", 6),
                    random_state=42,
                )
                self.model.fit(x, y_residual)
                self.is_lgb = False
            except ImportError:
                # Pure NumPy Ridge Regression fallback with lstsq (numerically robust)
                x_mean = np.mean(x, axis=0)
                x_std = np.std(x, axis=0)
                x_std[x_std < 1e-4] = 1.0
                x_norm = np.clip((x - x_mean) / x_std, -5.0, 5.0)
                x_bias = np.column_stack([np.ones(len(x)), x_norm])
                self.weights = np.linalg.lstsq(x_bias, y_residual, rcond=None)[0]
                self.x_mean = x_mean
                self.x_std = x_std
                self.model = "numpy_ridge"
                self.is_lgb = False

    def predict(
        self,
        raw_fcst: np.ndarray,
        rqdm_fcst: np.ndarray,
        elevations: np.ndarray,
        dist_coasts: np.ndarray,
        wind_u: np.ndarray,
        wind_v: np.ndarray,
        regimes: List[str],
        mcz_z_scores: np.ndarray,
    ) -> np.ndarray:
        """Predicts calibrated rainfall: R_final = max(0.0, rqdm_fcst + pred_residual)."""
        assert self.model is not None, "Model must be fitted first"

        x = self._extract_features(
            raw_fcst, rqdm_fcst, elevations, dist_coasts, wind_u, wind_v, regimes, mcz_z_scores
        )
        if self.model == "numpy_ridge":
            x_norm = np.clip((x - self.x_mean) / self.x_std, -5.0, 5.0)
            x_bias = np.column_stack([np.ones(len(x)), x_norm])
            predicted_residuals = x_bias @ self.weights
            predicted_residuals = np.nan_to_num(predicted_residuals, nan=0.0, posinf=0.0, neginf=0.0)
        else:
            predicted_residuals = self.model.predict(x)

        # Combine baseline RQDM + residual adjustment
        corrected = rqdm_fcst + predicted_residuals
        return np.maximum(0.0, corrected)

    def get_feature_importances(self) -> Dict[str, float]:
        """Returns relative feature importance scores."""
        assert self.model is not None, "Model must be fitted first"
        if hasattr(self.model, "feature_importances_"):
            imps = self.model.feature_importances_
            total = float(np.sum(imps)) if np.sum(imps) > 0 else 1.0
            return {
                name: round(float(imp / total) * 100.0, 2)
                for name, imp in zip(self.FEATURE_NAMES, imps)
            }
        elif hasattr(self, "weights") and self.weights is not None:
            raw_w = np.abs(self.weights[1:])
            total = float(np.sum(raw_w)) if np.sum(raw_w) > 0 else 1.0
            return {
                name: round(float(w / total) * 100.0, 2)
                for name, w in zip(self.FEATURE_NAMES, raw_w)
            }
        else:
            return {name: 0.0 for name in self.FEATURE_NAMES}
