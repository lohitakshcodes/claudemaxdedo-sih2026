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
import numpy as np

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
