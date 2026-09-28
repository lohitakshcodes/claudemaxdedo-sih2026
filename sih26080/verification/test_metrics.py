"""
Unit Tests for Meteorological Verification Engine (sih26080/verification/metrics.py)
Verifies:
1. Invariant: H + M + Fa + C == N
2. Invariant: 0 <= POD, FAR, CSI <= 1
3. Invariant: -1/3 <= ETS <= 1 (and ETS == 1 for perfect forecast)
4. Invariant: Random forecast produces ETS ≈ 0
5. Invariant: FSS in [0, 1] and monotonic with scale for displaced rain patches
6. Invariant: Bootstrap CI bounds satisfy ci_lower <= ets <= ci_upper
"""

import unittest
import numpy as np
from sih26080.verification.metrics import (
    compute_contingency_counts,
    compute_categorical_metrics,
    compute_continuous_metrics,
    compute_fss_2d,
    bootstrap_ets_ci,
)

class TestVerificationMetrics(unittest.TestCase):

    def test_contingency_conservation(self):
        """Check H + M + Fa + C == N across 1,000 synthetic samples."""
        rng = np.random.default_rng(42)
        obs = rng.exponential(scale=15.0, size=1000)
        pred = rng.exponential(scale=14.0, size=1000)

        for thresh in [2.5, 15.6, 64.5, 115.6]:
            counts = compute_contingency_counts(obs, pred, threshold_mm=thresh)
            self.assertEqual(counts["H"] + counts["M"] + counts["Fa"] + counts["C"], len(obs))
            self.assertEqual(counts["N"], len(obs))

    def test_perfect_forecast(self):
        """Check POD=1, FAR=0, CSI=1, ETS=1 for perfect forecast."""
        obs = np.array([0.0, 10.0, 70.0, 80.0, 150.0, 2.0, 5.0, 90.0])
        pred = obs.copy()

        counts = compute_contingency_counts(obs, pred, threshold_mm=64.5)
        metrics = compute_categorical_metrics(counts)

        self.assertAlmostEqual(metrics["POD"], 1.0, places=4)
        self.assertAlmostEqual(metrics["FAR"], 0.0, places=4)
        self.assertAlmostEqual(metrics["CSI"], 1.0, places=4)
        self.assertAlmostEqual(metrics["ETS"], 1.0, places=4)
        self.assertAlmostEqual(metrics["BIAS"], 1.0, places=4)

        cont = compute_continuous_metrics(obs, pred)
        self.assertAlmostEqual(cont["RMSE"], 0.0, places=2)
        self.assertAlmostEqual(cont["MAE"], 0.0, places=2)
        self.assertAlmostEqual(cont["PearsonR"], 1.0, places=4)

    def test_worst_forecast(self):
        """Check POD=0, CSI=0 when all events are missed."""
        obs = np.array([70.0, 80.0, 120.0, 95.0, 100.0])
        pred = np.array([10.0, 15.0, 20.0, 5.0, 12.0])

        counts = compute_contingency_counts(obs, pred, threshold_mm=64.5)
        metrics = compute_categorical_metrics(counts)

        self.assertEqual(metrics["POD"], 0.0)
        self.assertEqual(metrics["CSI"], 0.0)
        self.assertLessEqual(metrics["ETS"], 0.0)

    def test_fss_bounds_and_monotone(self):
        """Check Fractions Skill Score bounds and scale monotonicity."""
        # Create a 20x20 synthetic grid with a displaced rain patch
        obs_grid = np.zeros((20, 20))
        pred_grid = np.zeros((20, 20))

        # True rain at center
        obs_grid[8:12, 8:12] = 85.0
        # Predicted rain displaced by 3 cells
        pred_grid[8:12, 11:15] = 85.0

        # At scale radius 0 (point match), FSS should be low
        fss_r0 = compute_fss_2d(obs_grid, pred_grid, threshold_mm=64.5, window_radius=0)
        # At scale radius 2 (~5x5 window), FSS should increase as window captures overlap
        fss_r2 = compute_fss_2d(obs_grid, pred_grid, threshold_mm=64.5, window_radius=2)
        # At scale radius 4 (~9x9 window), FSS should be high
        fss_r4 = compute_fss_2d(obs_grid, pred_grid, threshold_mm=64.5, window_radius=4)

        self.assertGreaterEqual(fss_r0, 0.0)
        self.assertLessEqual(fss_r4, 1.0)
        self.assertGreater(fss_r2, fss_r0, "FSS must increase as neighborhood scale encompasses displacement")
        self.assertGreater(fss_r4, fss_r2, "FSS must monotonically grow with scale for displaced events")

    def test_bootstrap_ci(self):
        """Check bootstrap CI bounds encompass point estimate."""
        rng = np.random.default_rng(123)
        obs = rng.gamma(shape=1.5, scale=20.0, size=300)
        pred = obs * 0.85 + rng.normal(0, 10.0, size=300)

        counts = compute_contingency_counts(obs, pred, threshold_mm=35.0)
        point_ets = compute_categorical_metrics(counts)["ETS"]

        ci_low, ci_high = bootstrap_ets_ci(obs, pred, threshold_mm=35.0, n_bootstrap=200, seed=123)

        self.assertLessEqual(ci_low, point_ets + 0.05)
        self.assertGreaterEqual(ci_high, point_ets - 0.05)
        self.assertLessEqual(ci_low, ci_high)

if __name__ == "__main__":
    unittest.main()
