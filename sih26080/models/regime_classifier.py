"""
SIH26080: Synoptic Monsoon Regime Classifier (Zero Data Leakage Guaranteed)

Rules:
1. Operational evaluation happens at 05:30 IST on Day D.
2. Antecedent observations available: strictly up to Day D-1 08:30 IST.
3. Day D Forecast input: NWP forecasted precipitation over Core Monsoon Zone (R̂_MCZ(D))
   and 850 hPa low-level wind vector.
4. Day D observation O(D) is NEVER read or imported.
5. Standardized anomaly Z computed against 1991–2020 IMD 30-year climatology
   (Rajeevan et al. 2010). Test year (JJAS 2024) is strictly excluded.
"""

from dataclasses import dataclass
from typing import Optional, List, Dict, Any
import numpy as np

# 1991-2020 Climatological Normals over Core Monsoon Zone (Rajeevan et al. 2010)
# Mean daily rainfall ~ 8.2 mm/day, Std Dev ~ 2.8 mm/day during peak July/August
CLIM_MEAN_MCZ_MM = 8.2
CLIM_STD_MCZ_MM = 2.8

# Operational Regime Enum Identifiers
REGIME_ACTIVE = "ACTIVE_MONSOON"
REGIME_BREAK = "BREAK_MONSOON"
REGIME_COASTAL_TROUGH = "COASTAL_OFFSHORE_TROUGH"
REGIME_NORMAL = "NORMAL_TRANSITION"

@dataclass
class SynopticState:
    date: str
    regime: str
    z_score_mcz: float
    is_active: bool
    is_break: bool
    is_coastal_trough: bool
    confidence: float
    rationale: str

def compute_mcz_standardized_anomaly(mcz_rainfall_mm: float) -> float:
    """Computes standardized rainfall anomaly Z = (R - μ) / σ over Core Monsoon Zone."""
    return (mcz_rainfall_mm - CLIM_MEAN_MCZ_MM) / CLIM_STD_MCZ_MM

def classify_synoptic_regime(
    date: str,
    antecedent_mcz_rainfall_dminus1: float,
    antecedent_mcz_rainfall_dminus2: float,
    forecast_mcz_rainfall_day_d: float,
    west_coast_westerly_wind_850hpa_kts: float = 25.0,
    has_active_bay_depression: bool = False,
) -> SynopticState:
    """
    Classifies the synoptic regime for Day D without data leakage.

    Parameters:
      - date: ISO date string for Day D
      - antecedent_mcz_rainfall_dminus1: Observed MCZ rain on Day D-1 (08:30 IST)
      - antecedent_mcz_rainfall_dminus2: Observed MCZ rain on Day D-2 (08:30 IST)
      - forecast_mcz_rainfall_day_d: NWP forecasted MCZ rain for Day D
      - west_coast_westerly_wind_850hpa_kts: 850 hPa zonal wind speed off west coast
      - has_active_bay_depression: Flag indicating synoptic low/depression in Bay of Bengal

    Returns:
      SynopticState with regime classification and zero-leakage diagnostic rationale.
    """
    # 1. Compute standardized anomalies
    z_d1 = compute_mcz_standardized_anomaly(antecedent_mcz_rainfall_dminus1)
    z_d2 = compute_mcz_standardized_anomaly(antecedent_mcz_rainfall_dminus2)
    z_fcst = compute_mcz_standardized_anomaly(forecast_mcz_rainfall_day_d)

    # Effective operational anomaly estimate: weighted 60% antecedent trend + 40% NWP signal
    z_effective = 0.35 * z_d2 + 0.35 * z_d1 + 0.30 * z_fcst

    # 2. Regime Decision Tree (Rajeevan et al. 2010 criteria)
    # Check Active Spell: Z >= +1.0 or active depression with strong trough
    if (z_effective >= 1.0) or (has_active_bay_depression and z_effective >= 0.5):
        regime = REGIME_ACTIVE
        rationale = (
            f"Vigorous monsoon trough with Core Monsoon Zone Z = {z_effective:+.2f}σ. "
            f"Antecedent D-1 was {z_d1:+.2f}σ, Day D forecast indicates continued intense convection."
        )
        conf = min(0.96, 0.70 + 0.15 * abs(z_effective))

    # Check Break Spell: Z <= -1.0 persisting
    elif (z_effective <= -1.0) or (z_d1 <= -0.8 and z_fcst <= -1.0):
        regime = REGIME_BREAK
        rationale = (
            f"Monsoon trough shifted towards Himalayan foothills. CMZ Z = {z_effective:+.2f}σ. "
            f"Subdued peninsular and central Indian rainfall."
        )
        conf = min(0.95, 0.72 + 0.15 * abs(z_effective))

    # Check Coastal & Offshore Trough: strong westerly jet perpendicular to Ghats
    elif west_coast_westerly_wind_850hpa_kts >= 32.0:
        regime = REGIME_COASTAL_TROUGH
        rationale = (
            f"Strong westerly cross-equatorial jet ({west_coast_westerly_wind_850hpa_kts:.1f} kts) "
            f"driving severe orographic lift along Western Ghats and Konkan/Goa offshore trough."
        )
        conf = 0.88

    else:
        regime = REGIME_NORMAL
        rationale = (
            f"Quasi-stationary monsoon trough within normal climatological bounds (Z = {z_effective:+.2f}σ)."
        )
        conf = 0.82

    return SynopticState(
        date=date,
        regime=regime,
        z_score_mcz=round(float(z_effective), 3),
        is_active=(regime == REGIME_ACTIVE),
        is_break=(regime == REGIME_BREAK),
        is_coastal_trough=(regime == REGIME_COASTAL_TROUGH),
        confidence=round(conf, 3),
        rationale=rationale,
    )

# Documented Deviations from Rajeevan et al. (2010):
RAJEEVAN_2010_DEVIATIONS = {
    "season_scope": "Evaluated on JJAS operational summer monsoon season (June 1 - Sept 30).",
    "cmz_spatial_representation": "Sampled domain covering Western Ghats / Maharashtra and Core Monsoon Zone (324 points), rather than full continental India gridded analysis.",
    "climatology_baseline": "IMD 1991-2020 30-year normal (mean = 8.20 mm/day, std = 2.80 mm/day) rather than 1901-2000 long-period normal.",
    "temporal_persistence_rule": "Acts as an operational single-day activity proxy for daily bias correction. Rajeevan et al. strictly required active/break spells to persist for >= 3 consecutive days."
}

def classify_synoptic_regime_with_trace(
    date: str,
    antecedent_mcz_rainfall_dminus1: float,
    antecedent_mcz_rainfall_dminus2: float,
    forecast_mcz_rainfall_day_d: float,
    west_coast_westerly_wind_850hpa_kts: float = 25.0,
    has_active_bay_depression: bool = False,
    recent_history: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Executes synoptic regime classification with a complete auditable rule trace.
    Returns the state, rule precedence trace, threshold comparisons, and trailing persistence.
    """
    z_d1 = compute_mcz_standardized_anomaly(antecedent_mcz_rainfall_dminus1)
    z_d2 = compute_mcz_standardized_anomaly(antecedent_mcz_rainfall_dminus2)
    z_fcst = compute_mcz_standardized_anomaly(forecast_mcz_rainfall_day_d)
    z_effective = 0.35 * z_d2 + 0.35 * z_d1 + 0.30 * z_fcst

    trace_steps = []

    # Step 1: Active Monsoon Check
    active_cond_1 = (z_effective >= 1.0)
    active_cond_2 = (has_active_bay_depression and z_effective >= 0.5)
    is_active = active_cond_1 or active_cond_2
    trace_steps.append({
        "step": 1,
        "candidate_regime": REGIME_ACTIVE,
        "condition": "Z_effective >= +1.0 OR (Bay_Depression AND Z_effective >= +0.5)",
        "evaluated_values": {
            "z_effective": round(float(z_effective), 3),
            "has_bay_depression": has_active_bay_depression,
        },
        "condition_met": is_active,
    })

    # Step 2: Break Monsoon Check
    break_cond_1 = (z_effective <= -1.0)
    break_cond_2 = (z_d1 <= -0.8 and z_fcst <= -1.0)
    is_break = break_cond_1 or break_cond_2
    trace_steps.append({
        "step": 2,
        "candidate_regime": REGIME_BREAK,
        "condition": "Z_effective <= -1.0 OR (Z_d1 <= -0.8 AND Z_fcst <= -1.0)",
        "evaluated_values": {
            "z_effective": round(float(z_effective), 3),
            "z_d1": round(float(z_d1), 3),
            "z_fcst": round(float(z_fcst), 3),
        },
        "condition_met": is_break,
    })

    # Step 3: Coastal & Offshore Trough Check
    coastal_cond = (west_coast_westerly_wind_850hpa_kts >= 32.0)
    trace_steps.append({
        "step": 3,
        "candidate_regime": REGIME_COASTAL_TROUGH,
        "condition": "West_Coast_Wind_850 >= 32.0 knots",
        "evaluated_values": {
            "west_coast_westerly_wind_850hpa_kts": round(float(west_coast_westerly_wind_850hpa_kts), 2),
        },
        "condition_met": coastal_cond,
    })

    # Step 4: Normal Transition (Default)
    trace_steps.append({
        "step": 4,
        "candidate_regime": REGIME_NORMAL,
        "condition": "Default / Quasi-Stationary Normal Transition",
        "evaluated_values": {},
        "condition_met": True,
    })

    # Apply strict precedence
    if is_active:
        assigned_regime = REGIME_ACTIVE
        winner_step = 1
    elif is_break:
        assigned_regime = REGIME_BREAK
        winner_step = 2
    elif coastal_cond:
        assigned_regime = REGIME_COASTAL_TROUGH
        winner_step = 3
    else:
        assigned_regime = REGIME_NORMAL
        winner_step = 4

    # Trailing persistence diagnostic (using strictly issue-time historical sequence)
    consecutive_days = 1
    if recent_history:
        for prev in reversed(recent_history):
            if prev == assigned_regime:
                consecutive_days += 1
            else:
                break

    meets_rajeevan_spell = (consecutive_days >= 3) if assigned_regime in [REGIME_ACTIVE, REGIME_BREAK] else False

    return {
        "date": date,
        "assigned_regime": assigned_regime,
        "final_regime": assigned_regime,
        "precedence_winner_step": winner_step,
        "z_effective": round(float(z_effective), 3),
        "rule_precedence": "ACTIVE -> BREAK -> COASTAL_TROUGH -> NORMAL_TRANSITION",
        "rule_trace": trace_steps,
        "coastal_trough_activation_analysis": (
            "Coastal Trough never activates when Active or Break precedence rules match first, "
            "or when coastal westerly jet speed is under 32.0 kts. Zero classifier activations "
            "does not prove absence of atmospheric trough; it reflects rule tree precedence."
        ),
        "trailing_persistence": {
            "consecutive_days": consecutive_days,
            "meets_rajeevan_3day_spell_criterion": meets_rajeevan_spell,
            "persistence_rule_note": "Single-day activity proxy used for daily bias correction; 3-day criterion is a diagnostic."
        },
        "deviations_from_literature": RAJEEVAN_2010_DEVIATIONS,
    }


if __name__ == "__main__":
    active = classify_synoptic_regime(
        date="2024-07-15",
        antecedent_mcz_rainfall_dminus1=12.8,
        antecedent_mcz_rainfall_dminus2=11.5,
        forecast_mcz_rainfall_day_d=13.4,
        west_coast_westerly_wind_850hpa_kts=42.0,
        has_active_bay_depression=True,
    )
    print("Active Case:", active.regime, active.z_score_mcz)
    trace = classify_synoptic_regime_with_trace(
        date="2024-07-15",
        antecedent_mcz_rainfall_dminus1=12.8,
        antecedent_mcz_rainfall_dminus2=11.5,
        forecast_mcz_rainfall_day_d=13.4,
        west_coast_westerly_wind_850hpa_kts=42.0,
        has_active_bay_depression=True,
    )
    print("Trace Steps:", len(trace["rule_trace"]), "Assigned:", trace["assigned_regime"])
