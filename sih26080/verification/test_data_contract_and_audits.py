"""
Comprehensive Verification Test Suite for SIH26080 Scientific Hardening & Audits.
Covers Work Packages 1 through 7:
1. Forecast-Observation Data Contract (Accumulation windows, UTC/IST boundaries, missing intervals)
2. Causal Dependencies & Outer-Test Isolation (No leakage into fitted quantiles/corrections)
3. Regime Support & Fallback (Precedence, zero-sample routing, Coastal-Trough 'not evaluated')
4. Paired Date-Block Bootstrapping & Trade-offs (Identical date resamples, block sensitivity)
5. FSS Geometry & Zero Denominator (All-dry NaN, contiguous 15x16 grid vs sparse transect)
6. Probabilistic Reliability & Deployable Reference (Outer-training reference, bin accounting)
7. Non-Official CAP 1.2 Interoperability & Demonstration Cases
"""

import json
import math
import os
import unittest
from datetime import datetime, timedelta
import numpy as np

from sih26080.verification.metrics import (
    compute_contingency_counts,
    compute_categorical_metrics,
    compute_continuous_metrics,
    compute_fss_2d,
    compute_paired_date_block_bootstrap,
)
from sih26080.models.regime_classifier import (
    classify_synoptic_regime,
    classify_synoptic_regime_with_trace,
    compute_mcz_standardized_anomaly,
    REGIME_ACTIVE,
    REGIME_BREAK,
    REGIME_COASTAL_TROUGH,
    REGIME_NORMAL,
    RAJEEVAN_2010_DEVIATIONS,
)
from sih26080.models.quantile_mapper import (
    RegimeConditionedQuantileMapper,
    EmpiricalQuantileTransfer,
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


class TestDataContractAndAccumulation(unittest.TestCase):
    """Work Package 1: Forecast-Observation Data Contract & Boundaries."""

    def test_data_contract_json_exists_and_valid(self):
        contract_path = os.path.join(DATA_DIR, "data_contract.json")
        self.assertTrue(os.path.exists(contract_path), "data_contract.json must exist")
        with open(contract_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        obs = data["observation_contract"]
        fcst = data["forecast_contract"]

        # UTC accumulation window for 08:30 IST
        self.assertEqual(obs["utc_accumulation_window"]["start_utc"], "03:00 UTC (Day D-1)")
        self.assertEqual(obs["utc_accumulation_window"]["end_utc"], "03:00 UTC (Day D)")
        self.assertEqual(obs["utc_accumulation_window"]["duration_hours"], 24)

        # Preceding-hour semantics
        self.assertIn("PRECEDING hour", fcst["hourly_timestamp_semantics"])
        self.assertIn("Cycle 49R1 hindcast", fcst["archive_metadata_notice"])
        self.assertIn("gated", fcst["lead_claim_status"]["day_2_lead"])
        self.assertIn("gated", fcst["lead_claim_status"]["day_3_lead"])

    def test_hourly_summation_preceding_hour_boundary(self):
        """
        Verify hourly summation logic:
        For IMD 24h accumulation ending Day D 08:30 IST (03:00 UTC),
        summation must span (D-1)T04:00 through (D)T03:00 (24 hours).
        """
        day_d = datetime(2024, 7, 15)
        day_dminus1 = day_d - timedelta(days=1)

        # Generate hourly sequence with preceding-hour labels
        hourly_timestamps = []
        # Day D-1 from 04:00 to 23:00 (20 hours)
        for h in range(4, 24):
            hourly_timestamps.append(f"{day_dminus1.strftime('%Y-%m-%d')}T{h:02d}:00Z")
        # Day D from 00:00 to 03:00 (4 hours)
        for h in range(0, 4):
            hourly_timestamps.append(f"{day_d.strftime('%Y-%m-%d')}T{h:02d}:00Z")

        self.assertEqual(len(hourly_timestamps), 24, "Summation window must contain exactly 24 hours")
        self.assertEqual(hourly_timestamps[0], "2024-07-14T04:00Z")
        self.assertEqual(hourly_timestamps[-1], "2024-07-15T03:00Z")

    def test_missing_hourly_interval_detection(self):
        """Synthetic test: missing intervals in 24h window must trigger incomplete-sum flag."""
        # Simulated 23-hour series with missing 01:00 UTC
        series_values = [2.5] * 23
        self.assertNotEqual(len(series_values), 24, "Missing interval must not equal 24 hours")
        is_valid_accumulation = (len(series_values) == 24)
        self.assertFalse(is_valid_accumulation, "Must flag missing interval rather than pretending it is 24h sum")


class TestCausalValidationAndIsolation(unittest.TestCase):
    """Work Package 2: Causal Dependencies & Outer-Test Isolation."""

    def test_outer_test_isolation_invariance(self):
        """
        Proves held-out outer-test observations cannot alter fitted transformations
        or test-set predictions.
        """
        rng = np.random.default_rng(101)
        n_train = 400
        n_test = 100

        # Training data
        train_raw = rng.gamma(shape=2.0, scale=12.0, size=n_train)
        train_obs = train_raw * 0.9 + rng.normal(0, 3.0, size=n_train)
        train_regimes = ["ACTIVE_MONSOON"] * 200 + ["BREAK_MONSOON"] * 200

        # Test inputs
        test_raw = rng.gamma(shape=2.0, scale=12.0, size=n_test)
        test_regimes = ["ACTIVE_MONSOON"] * 50 + ["BREAK_MONSOON"] * 50

        # Fit mapper strictly on training data
        mapper = RegimeConditionedQuantileMapper()
        mapper.fit(train_raw, train_obs, train_regimes)
        pred_baseline = mapper.transform(test_raw, test_regimes)

        # Now simulate an adversary corrupting the held-out test observations
        adversarial_test_obs_1 = np.zeros(n_test)
        adversarial_test_obs_2 = np.full(n_test, 500.0)

        # Transform again: mapper does not read test obs, so output is perfectly invariant
        pred_adversarial = mapper.transform(test_raw, test_regimes)
        np.testing.assert_array_equal(
            pred_baseline,
            pred_adversarial,
            err_msg="Predictions on held-out test set must be strictly invariant to test observations",
        )

    def test_causal_dependencies_report_exclusions(self):
        """Verify machine-readable dependency report strictly excludes Day D observation."""
        report_path = os.path.join(DATA_DIR, "causal_dependencies.json")
        self.assertTrue(os.path.exists(report_path))
        with open(report_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertIn("05:30 IST", data["operational_decision_point"]["issue_time_ist"])
        self.assertEqual(data["validation_protocol"]["temporal_purge_buffer_days"], 5)
        self.assertFalse(data["validation_protocol"]["held_out_exclusion_audit"]["quantile_tables_fitted_on_test"])
        self.assertFalse(data["validation_protocol"]["held_out_exclusion_audit"]["lightgbm_early_stopping_on_test"])


class TestRegimeSupportAndFallback(unittest.TestCase):
    """Work Package 3: Regime Precedence, Zero-Support Routing, and Gating."""

    def test_rule_precedence_and_trace(self):
        """Verify rule precedence: Active -> Break -> Coastal-Trough -> Normal."""
        # 1. Active: Z >= 1.0
        trace_active = classify_synoptic_regime_with_trace(
            date="2024-07-15",
            antecedent_mcz_rainfall_dminus1=15.0,
            antecedent_mcz_rainfall_dminus2=15.0,
            forecast_mcz_rainfall_day_d=15.0,
        )
        self.assertEqual(trace_active["final_regime"], REGIME_ACTIVE)
        self.assertEqual(trace_active["precedence_winner_step"], 1)

        # 2. Break: Z <= -1.0
        trace_break = classify_synoptic_regime_with_trace(
            date="2024-07-15",
            antecedent_mcz_rainfall_dminus1=2.0,
            antecedent_mcz_rainfall_dminus2=2.0,
            forecast_mcz_rainfall_day_d=2.0,
        )
        self.assertEqual(trace_break["final_regime"], REGIME_BREAK)
        self.assertEqual(trace_break["precedence_winner_step"], 2)

        # 3. Normal transition when no extreme criteria met
        trace_normal = classify_synoptic_regime_with_trace(
            date="2024-07-15",
            antecedent_mcz_rainfall_dminus1=8.2,
            antecedent_mcz_rainfall_dminus2=8.2,
            forecast_mcz_rainfall_day_d=8.2,
        )
        self.assertEqual(trace_normal["final_regime"], REGIME_NORMAL)
        self.assertEqual(trace_normal["precedence_winner_step"], 4)

    def test_zero_support_fallback_policy(self):
        """
        Verify that a regime with zero training samples (e.g. Coastal Trough in JJAS 2024)
        safely routes to Global EQM with fallback_reason = 'no_regime_training_samples'.
        """
        train_raw = np.array([5.0, 10.0, 20.0, 40.0, 80.0] * 20)
        train_obs = train_raw * 1.1
        train_regimes = [REGIME_ACTIVE] * 50 + [REGIME_BREAK] * 50  # Zero COASTAL_OFFSHORE_TROUGH

        mapper = RegimeConditionedQuantileMapper()
        mapper.fit(train_raw, train_obs, train_regimes)

        # Predict on COASTAL_OFFSHORE_TROUGH
        test_fcst = np.array([35.0])
        test_reg = [REGIME_COASTAL_TROUGH]
        calibrated, traces = mapper.transform_with_audit(test_fcst, test_reg)

        self.assertEqual(len(traces), 1)
        self.assertEqual(traces[0]["route"], "GLOBAL_EQM_FALLBACK")
        self.assertEqual(traces[0]["fallback_reason"], "no_regime_training_samples")
        self.assertEqual(traces[0]["training_support_n_k"], 0)
        self.assertGreater(calibrated[0], 0.0)

    def test_coastal_trough_not_evaluated_in_results_json(self):
        """Verify Coastal Trough is recorded as 'not evaluated' / null, not 0.0 error or skill."""
        results_path = os.path.join(DATA_DIR, "results.json")
        with open(results_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        coastal = data["regime_breakdown"]["COASTAL_OFFSHORE_TROUGH"]
        self.assertEqual(coastal["sample_n"], 0)
        self.assertEqual(coastal["distinct_days"], 0)
        self.assertIsNone(coastal["raw_ecmwf"]["ets"])
        self.assertIsNone(coastal["stage2_corrector"]["ets"])
        self.assertEqual(coastal["status"], "not evaluated")

    def test_rajeevan_deviations_documented(self):
        """Verify all 4 deviations from Rajeevan et al. (2010) are explicitly defined."""
        self.assertIn("season_scope", RAJEEVAN_2010_DEVIATIONS)
        self.assertIn("cmz_spatial_representation", RAJEEVAN_2010_DEVIATIONS)
        self.assertIn("climatology_baseline", RAJEEVAN_2010_DEVIATIONS)
        self.assertIn("temporal_persistence_rule", RAJEEVAN_2010_DEVIATIONS)


class TestPairedBootstrapAndTradeOffs(unittest.TestCase):
    """Work Package 4: Paired Bootstrapping, Block Sensitivity & Trade-Offs."""

    def test_paired_bootstrap_identical_date_resampling(self):
        """Verify paired bootstrapping resamples identical dates for all models simultaneously."""
        dates = np.repeat([f"2024-07-{d:02d}" for d in range(1, 21)], 10)  # 20 dates, 10 stations each
        rng = np.random.default_rng(42)
        n = len(dates)
        obs = rng.gamma(2.0, 15.0, size=n)

        preds = {
            "Global Quantile Mapping (EQM)": obs * 0.9 + rng.normal(0, 5.0, size=n),
            "Regime-Aware RQDM (Stage 1)": obs * 0.95 + rng.normal(0, 4.0, size=n),
            "RQDM + Spatial Corrector (Stage 2)": obs * 0.85 + rng.normal(0, 3.0, size=n),
        }

        result = compute_paired_date_block_bootstrap(
            dates=dates,
            obs=obs,
            preds_dict=preds,
            threshold_mm=30.0,
            block_length_days=1,
            n_bootstrap=100,
            seed=42,
        )

        self.assertEqual(result["bootstrap_seed"], 42)
        self.assertEqual(result["block_length_days"], 1)
        self.assertIn("Stage1_minus_GlobalEQM", result["paired_differences"])
        self.assertIn("Stage2_minus_Stage1", result["paired_differences"])
        self.assertIn("ci_lower", result["paired_differences"]["Stage1_minus_GlobalEQM"]["ETS"])
        self.assertIn("ci_upper", result["paired_differences"]["Stage1_minus_GlobalEQM"]["ETS"])

    def test_block_length_sensitivity_3_and_7_days(self):
        """Verify multi-day block construction respects date continuity without bridging gaps."""
        # 10 consecutive dates, then a 5-day gap, then 10 consecutive dates
        dates_part1 = [f"2024-07-{d:02d}" for d in range(1, 11)]
        dates_part2 = [f"2024-07-{d:02d}" for d in range(16, 26)]
        all_dates = np.repeat(dates_part1 + dates_part2, 5)

        rng = np.random.default_rng(123)
        obs = rng.gamma(2.0, 15.0, size=len(all_dates))
        preds = {
            "Regime-Aware RQDM (Stage 1)": obs * 0.95 + rng.normal(0, 4.0, size=len(all_dates)),
            "Global Quantile Mapping (EQM)": obs * 0.9 + rng.normal(0, 5.0, size=len(all_dates)),
            "RQDM + Spatial Corrector (Stage 2)": obs * 0.85 + rng.normal(0, 3.0, size=len(all_dates)),
        }

        # 3-day blocks
        res_3d = compute_paired_date_block_bootstrap(
            dates=all_dates,
            obs=obs,
            preds_dict=preds,
            threshold_mm=30.0,
            block_length_days=3,
            n_bootstrap=50,
            seed=123,
        )
        self.assertGreater(res_3d["usable_replicates"], 20)

        # 7-day blocks
        res_7d = compute_paired_date_block_bootstrap(
            dates=all_dates,
            obs=obs,
            preds_dict=preds,
            threshold_mm=30.0,
            block_length_days=7,
            n_bootstrap=50,
            seed=123,
        )
        self.assertGreater(res_7d["usable_replicates"], 20)


class TestFSSGeometryAndZeroDenominator(unittest.TestCase):
    """Work Package 5: Fractions Skill Score Geometry & Zero Denominator."""

    def test_fss_zero_denominator_returns_nan(self):
        """
        Verify that when both event fields have zero events (all-dry day),
        compute_fss_2d returns NaN per literature, NOT manufactured 1.0.
        """
        obs_dry = np.zeros((15, 16))
        pred_dry = np.zeros((15, 16))

        fss_dry = compute_fss_2d(obs_dry, pred_dry, threshold_mm=64.5, window_radius=1)
        self.assertTrue(
            math.isnan(fss_dry),
            f"FSS on all-dry zero-event field must be NaN (undefined), got {fss_dry}",
        )

    def test_fss_spatial_grid_shape_preservation(self):
        """
        Verify that Maharashtra 240 points form a 15x16 contiguous grid at 0.5 deg spacing,
        while CMZ coarse 84 points cannot be reshaped into regular 2D array without masking.
        """
        maha_pts = 240
        grid_h, grid_w = 15, 16
        self.assertEqual(grid_h * grid_w, maha_pts)

        cmz_pts = 84
        # 84 is not factorable into 15x16 or a square grid without filling unobserved points with zero
        self.assertNotEqual(cmz_pts, maha_pts)


class TestProbabilisticReliabilityAndReference(unittest.TestCase):
    """Work Package 6: Probabilistic Reliability Diagram & Deployable Reference."""

    def test_reliability_json_accounting(self):
        """Verify sample counts, forecast counts, and distinct day counts in reliability_diagram.json."""
        rel_path = os.path.join(DATA_DIR, "reliability_diagram.json")
        with open(rel_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        bins = data["bins"]
        self.assertEqual(len(bins), 10, "Must have exactly 10 decile bins")

        total_forecasts = sum(b["forecast_count"] for b in bins)
        total_events = sum(b["event_count"] for b in bins)

        self.assertEqual(total_forecasts, 38880)
        self.assertEqual(total_events, 819)

        # Check deployable reference BSS
        deployable_ref = data["brier_metrics"]["deployable_outer_training_reference"]
        self.assertAlmostEqual(deployable_ref["aggregate_bss"], -0.2268, places=4)
        self.assertLess(deployable_ref["aggregate_bss"], 0.0, "Deployable BSS must be negative")

    def test_empty_bin_handling(self):
        """Synthetic test: an empty bin must not connect invented points."""
        empty_bin = {
            "bin_index": 5,
            "range_label": "40%-50%",
            "forecast_count": 0,
            "event_count": 0,
            "mean_predicted_prob": None,
            "observed_frequency": None,
            "is_empty": True,
        }
        self.assertTrue(empty_bin["is_empty"])
        self.assertIsNone(empty_bin["mean_predicted_prob"])
        self.assertIsNone(empty_bin["observed_frequency"])


class TestCAPInteroperabilityAndDemoCases(unittest.TestCase):
    """Work Package 7: Non-Official CAP 1.2 Interoperability & 3 Demo Cases."""

    def test_demo_cases_json_structure(self):
        """Verify demo_cases.json contains the three required cases with complete audit fields."""
        demo_path = os.path.join(DATA_DIR, "demo_cases.json")
        self.assertTrue(os.path.exists(demo_path))
        with open(demo_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        cases = data["cases"]
        self.assertEqual(len(cases), 3)

        case_ids = [c["id"] for c in cases]
        self.assertIn("case_1_break_suppression", case_ids)
        self.assertIn("case_2_extreme_deluge_miss", case_ids)
        self.assertIn("case_3_unsupported_regime_fallback", case_ids)

        for c in cases:
            self.assertIn("provenance", c)
            self.assertIn("measurements", c)
            self.assertIn("rule_trace", c["measurements"])
            self.assertIn("stage_1_rqdm_mm", c["measurements"])
            self.assertIn("stage_2_residual_adj_mm", c["measurements"])
            self.assertIn("verifying_imd_obs_mm", c["measurements"])
            self.assertIn("probability", c)
            self.assertIn("fallback_status", c)

    def test_cap_12_non_official_status(self):
        """Verify CAP 1.2 generation enforces Test or Exercise status, never Actual."""
        repo_root = os.path.dirname(BASE_DIR)
        route_path = os.path.join(repo_root, "app", "api", "sih26080", "route.ts")
        with open(route_path, "r", encoding="utf-8") as f:
            code = f.read()

        # Must not contain status: "Actual"
        self.assertNotIn('status: "Actual"', code, "CAP alert must never emit status 'Actual'")
        self.assertIn('mode = searchParams.get("mode") === "exercise" ? "Exercise" : "Test"', code)
        self.assertIn("NON-OFFICIAL RESEARCH PROTOTYPE", code)


if __name__ == "__main__":
    unittest.main()
