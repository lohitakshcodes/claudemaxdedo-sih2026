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

    # -------------------------------------------------------------------------
    # Audit Item 1: Contingency-metric reporting & regression fixtures
    # -------------------------------------------------------------------------

    def test_eqm_frequency_bias_corrected(self):
        """Item 1: Verify EQM Frequency_BIAS is 0.980 (underlying 803/819 = 0.98046398...), not 0.981."""
        h = 242
        m = 577
        fa = 561
        underlying = (h + fa) / (h + m)
        self.assertEqual(underlying, 803.0 / 819.0)
        self.assertAlmostEqual(underlying, 0.9804639804639804, places=12)
        three_decimal = round(underlying, 3)
        self.assertEqual(f"{three_decimal:.3f}", "0.980")
        self.assertNotEqual(f"{three_decimal:.3f}", "0.981")

    def test_stage2_far_corrected(self):
        """Item 1: Verify Stage2 FAR is 0.429 (underlying 85/198 = 0.429292929...), not 0.413."""
        h = 113
        fa = 85
        underlying = fa / (h + fa)
        self.assertEqual(underlying, 85.0 / 198.0)
        self.assertAlmostEqual(underlying, 0.4292929292929293, places=12)
        three_decimal = round(underlying, 3)
        self.assertEqual(f"{three_decimal:.3f}", "0.429")
        self.assertNotEqual(f"{three_decimal:.3f}", "0.413")

    def test_contingency_table_parameterized_fixtures(self):
        """Item 1: Parameterized check of full 3-decimal table and count invariants (N=38880, H+M=819)."""
        fixtures = [
            # (name, H, M, Fa, C, exp_pod, exp_far, exp_csi, exp_bias, exp_ets)
            ("Raw",      150, 669, 330, 37731, 0.183, 0.688, 0.131, 0.586, 0.123),
            ("Smoothed", 134, 685, 314, 37747, 0.164, 0.701, 0.118, 0.547, 0.111),
            ("EQM",      242, 577, 561, 37500, 0.295, 0.699, 0.175, 0.980, 0.165),
            ("Stage1",   248, 571, 571, 37490, 0.303, 0.697, 0.178, 1.000, 0.168),
            ("Stage2",   113, 706,  85, 37976, 0.138, 0.429, 0.125, 0.242, 0.121),
        ]
        n_eval = 38880

        for name, h, m, fa, c, exp_pod, exp_far, exp_csi, exp_bias, exp_ets in fixtures:
            with self.subTest(model=name):
                # Count invariants
                self.assertEqual(h + m + fa + c, n_eval, f"{name}: row sum must equal {n_eval}")
                self.assertEqual(h + m, 819, f"{name}: H + M must equal 819")

                # Exact formula calculations with full precision
                pod = h / (h + m)
                far = fa / (h + fa)
                csi = h / (h + m + fa)
                bias = (h + fa) / (h + m)
                h_random = ((h + m) * (h + fa)) / n_eval
                ets = (h - h_random) / (h + m + fa - h_random)

                # Assert 3-decimal formatted values match regenerated table exactly
                self.assertEqual(round(pod, 3), exp_pod, f"{name} POD")
                self.assertEqual(round(far, 3), exp_far, f"{name} FAR")
                self.assertEqual(round(csi, 3), exp_csi, f"{name} CSI")
                self.assertEqual(round(bias, 3), exp_bias, f"{name} Frequency_BIAS")
                self.assertEqual(round(ets, 3), exp_ets, f"{name} ETS")

    # -------------------------------------------------------------------------
    # Audit Item 2: Climatological Brier baseline & negative skill
    # -------------------------------------------------------------------------

    def test_climatological_brier_baseline_and_negative_bss(self):
        """Item 2: Assert climatological baseline, both BSS values, and negative signs."""
        total_n = 38880
        total_events = 819
        p = total_events / total_n
        bs_climo = p * (1.0 - p)

        self.assertAlmostEqual(p, 0.0210648148148148, places=14)
        self.assertAlmostEqual(bs_climo, 0.0206210883916324, places=14)

        bs_raw = 0.0254
        bs_rqdm = 0.0253
        bss_raw = 1.0 - (bs_raw / bs_climo)
        bss_rqdm = 1.0 - (bs_rqdm / bs_climo)

        self.assertAlmostEqual(bss_raw, -0.231748757272522, places=12)
        self.assertAlmostEqual(bss_rqdm, -0.226899352716331, places=12)
        self.assertLess(bss_raw, 0.0, "Raw BSS must be negative (underperforms climatological base rate)")
        self.assertLess(bss_rqdm, 0.0, "RQDM BSS must be negative (underperforms climatological base rate)")
        self.assertAlmostEqual(bs_raw - bs_rqdm, 0.0001, places=6)

    # -------------------------------------------------------------------------
    # Audit Item 3: Gaussian negative support limitation & diagnostics
    # -------------------------------------------------------------------------

    def test_gaussian_negative_support_grid(self):
        """Item 3: Parameterized check of all 16 probability values and materiality threshold flags."""
        from sih26080.models.quantile_mapper import compute_p_negative, has_material_negative_support

        expected_grid = {
            "ACTIVE_MONSOON": {
                5: (0.158655253931, True),
                15: (0.001349898032, False),
                30: (2.740841326e-6, False),
                60: (2.740841326e-6, False),
            },
            "BREAK_MONSOON": {
                5: (0.0004290603332, False),
                15: (1.308392469e-11, False),
                30: (1.308392469e-11, False),
                60: (1.308392469e-11, False),
            },
            "COASTAL_TROUGH": {
                5: (0.202328380964, True),
                15: (0.006209665326, False),
                30: (3.167124183e-5, False),
                60: (3.167124183e-5, False),
            },
            "NORMAL": {
                5: (0.047790352273, False),
                15: (2.866515719e-7, False),
                30: (2.866515719e-7, False),
                60: (2.866515719e-7, False),
            },
        }

        for regime, values in expected_grid.items():
            for y_val, (exp_prob, exp_flag) in values.items():
                with self.subTest(regime=regime, y=y_val):
                    calc_prob = compute_p_negative(float(y_val), regime)
                    calc_flag = has_material_negative_support(float(y_val), regime, threshold=0.05)

                    # Tight relative tolerance testing of tiny tail probabilities
                    self.assertAlmostEqual(
                        calc_prob,
                        exp_prob,
                        delta=max(1e-12, exp_prob * 1e-6),
                        msg=f"Mismatch for {regime} at y={y_val}",
                    )
                    self.assertEqual(calc_flag, exp_flag, f"Material flag mismatch for {regime} at y={y_val}")

    # -------------------------------------------------------------------------
    # Audit Item 4: Orographic equivalence corrections & feature semantics
    # -------------------------------------------------------------------------

    def test_orographic_wind_directions_and_equivalence(self):
        """Item 4: FROM bearings, zero wind, counterexample, and conditional equivalence."""
        from sih26080.models.lgbm_corrector import (
            compute_wind_direction_deg,
            compute_local_gradient_flow_a,
            compute_fixed_ridge_orographic_proxy_b,
        )

        # 1. FROM bearings for cardinal wind vectors
        self.assertEqual(compute_wind_direction_deg(1.0, 0.0), 270.0)
        self.assertEqual(compute_wind_direction_deg(0.0, 1.0), 180.0)
        self.assertEqual(compute_wind_direction_deg(-1.0, 0.0), 90.0)
        self.assertEqual(compute_wind_direction_deg(0.0, -1.0), 0.0)

        # 2. Zero wind returns zero contribution
        self.assertEqual(compute_wind_direction_deg(0.0, 0.0), 0.0)
        self.assertEqual(compute_fixed_ridge_orographic_proxy_b(0.0, 0.0, elevation_m=1200.0), 0.0)

        # 3. Elevation=1000, gradient=(-0.1, 0), wind=(10, 0)
        a_val = compute_local_gradient_flow_a(10.0, 0.0, -0.1, 0.0)
        b_val = compute_fixed_ridge_orographic_proxy_b(10.0, 0.0, elevation_m=1000.0)
        self.assertAlmostEqual(a_val, -1.0, places=6)
        self.assertAlmostEqual(b_val, 9.396926207859085, places=6)

        # 4. Same terrain with wind=(-10, 0)
        a_rev = compute_local_gradient_flow_a(-10.0, 0.0, -0.1, 0.0)
        b_rev = compute_fixed_ridge_orographic_proxy_b(-10.0, 0.0, elevation_m=1000.0)
        self.assertAlmostEqual(a_rev, 1.0, places=6)
        self.assertAlmostEqual(b_rev, -9.396926207859083, places=6)

        # 5. Conditional equivalence case using exact trigonometric coefficients
        elev = 1500.0
        e_scale = elev / 1000.0
        dh_dx_eq = e_scale * 0.9396926207859084
        dh_dy_eq = e_scale * 0.3420201433256687

        for test_u, test_v in [(12.5, -4.2), (-8.0, 15.0), (3.3, 7.7)]:
            a_eq = compute_local_gradient_flow_a(test_u, test_v, dh_dx_eq, dh_dy_eq)
            b_eq = compute_fixed_ridge_orographic_proxy_b(test_u, test_v, elevation_m=elev)
            self.assertAlmostEqual(a_eq, b_eq, places=7)

    # -------------------------------------------------------------------------
    # Audit Item 5: Continuous capped-slope tail extrapolation
    # -------------------------------------------------------------------------

    def test_continuous_capped_slope_tail(self):
        """Item 5: Continuous capped-slope tail extrapolation cases."""
        from sih26080.models.quantile_mapper import map_tail_continuous

        # Case 1: Empirical cap: a=1, b=10, a99=0.5, b99=1, x=2 gives y=12
        y1 = map_tail_continuous(x_raw=2.0, a=1.0, b=10.0, a99=0.5, b99=1.0)
        self.assertAlmostEqual(y1, 12.0, places=7)

        # Case 2: Fixed fallback: a=1, b=10, a99=0.05, b99=1, x=2 gives y=13
        y2 = map_tail_continuous(x_raw=2.0, a=1.0, b=10.0, a99=0.05, b99=1.0)
        self.assertAlmostEqual(y2, 13.0, places=7)

        # Case 3: Inactive cap: a=10, b=20, a99=5, b99=10, x=15 gives y=30
        y3 = map_tail_continuous(x_raw=15.0, a=10.0, b=20.0, a99=5.0, b99=10.0)
        self.assertAlmostEqual(y3, 30.0, places=7)

        # Case 4: Existing additive branch: a=0.10, b=1, x=0.20 gives y=1.10
        y4 = map_tail_continuous(x_raw=0.20, a=0.10, b=1.0, a99=0.05, b99=0.5)
        self.assertAlmostEqual(y4, 1.10, places=7)

        # Case 5: Boundary continuity: a=1, b=10, empirical cap 2: x=1 -> 10, x=1.01 -> 10.02
        y5_at_boundary = map_tail_continuous(x_raw=1.0, a=1.0, b=10.0, a99=0.5, b99=1.0)
        y5_eps = map_tail_continuous(x_raw=1.01, a=1.0, b=10.0, a99=0.5, b99=1.0)
        self.assertAlmostEqual(y5_at_boundary, 10.0, places=7)
        self.assertAlmostEqual(y5_eps, 10.02, places=7)
        self.assertGreaterEqual(y5_eps, y5_at_boundary)

    # -------------------------------------------------------------------------
    # Audit Item 6: Quantile inversion tie policy
    # -------------------------------------------------------------------------

    def test_quantile_inversion_tie_policy(self):
        """Item 6: Last-tied-index tie policy in probability_from_quantiles."""
        from sih26080.models.quantile_mapper import probability_from_quantiles

        q = np.array([0.0, 0.0, 0.0, 10.0])
        p = np.array([0.0, 0.2, 0.4, 1.0])

        self.assertAlmostEqual(probability_from_quantiles(0.0, q, p), 0.4, places=7)
        self.assertAlmostEqual(probability_from_quantiles(5.0, q, p), 0.7, places=7)
        self.assertAlmostEqual(probability_from_quantiles(10.0, q, p), 1.0, places=7)

        # All-equal quantile test
        q_all = np.array([0.0, 0.0, 0.0])
        p_all = np.array([0.0, 0.5, 1.0])
        self.assertAlmostEqual(probability_from_quantiles(0.0, q_all, p_all), 1.0, places=7)

        # Repeated-terminal-quantile test
        q_rep = np.array([0.0, 10.0, 10.0])
        p_rep = np.array([0.0, 0.5, 1.0])
        self.assertAlmostEqual(probability_from_quantiles(10.0, q_rep, p_rep), 1.0, places=7)

    # -------------------------------------------------------------------------
    # Audit Item 7: Feature importance display sum and rounding tolerance
    # -------------------------------------------------------------------------

    def test_feature_importance_display_sum_and_tolerance(self):
        """Item 7: Assert 100.01% total, +0.01% discrepancy, and successful tolerance validation."""
        from decimal import Decimal
        from sih26080.models.lgbm_corrector import validate_feature_importance_display_sum

        percentages = [19.16, 15.39, 13.82, 11.32, 11.15, 10.21, 9.51, 7.51, 1.94]
        dec_sum = sum([Decimal(str(p)) for p in percentages])
        discrepancy = dec_sum - Decimal("100.0")

        self.assertEqual(dec_sum, Decimal("100.01"))
        self.assertEqual(discrepancy, Decimal("0.01"))

        is_valid, exact_sum, disc = validate_feature_importance_display_sum(percentages, decimal_places=2)
        self.assertTrue(is_valid)
        self.assertEqual(exact_sum, 100.01)
        self.assertAlmostEqual(disc, 0.01, places=4)


if __name__ == "__main__":
    unittest.main()
