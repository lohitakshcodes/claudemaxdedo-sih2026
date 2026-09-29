"""
SIH26080: Meteorological Verification Engine & Scale-Selective Fractions Skill Score (FSS)
Compliant with WMO Verification Standards and Roberts & Lean (2008).

Key Invariants:
1. H + M + Fa + C == N
2. 0 <= POD, FAR, CSI <= 1
3. -1/3 <= ETS <= 1
4. 0 <= FSS <= 1 (target skill: FSS_target = 0.5 + f_0 / 2)
5. 500-sample Day-Block Bootstrap 95% Confidence Intervals
"""

import math
from typing import Dict, Tuple, List, Optional, Any
import numpy as np

def compute_contingency_counts(
    obs: np.ndarray,
    pred: np.ndarray,
    threshold_mm: float = 64.5,
) -> Dict[str, int]:
    """
    Computes 2x2 categorical contingency table counts.
    H: Hits (Obs >= T and Pred >= T)
    M: Misses (Obs >= T and Pred < T)
    Fa: False Alarms (Obs < T and Pred >= T)
    C: Correct Negatives (Obs < T and Pred < T)
    """
    obs_event = (obs >= threshold_mm)
    pred_event = (pred >= threshold_mm)

    h = int(np.sum(obs_event & pred_event))
    m = int(np.sum(obs_event & (~pred_event)))
    fa = int(np.sum((~obs_event) & pred_event))
    c = int(np.sum((~obs_event) & (~pred_event)))

    total = h + m + fa + c
    assert total == len(obs), f"Contingency sum {total} != total samples {len(obs)}"

    return {"H": h, "M": m, "Fa": fa, "C": c, "N": total}

def compute_categorical_metrics(counts: Dict[str, int]) -> Dict[str, float]:
    """Computes POD, FAR, CSI, ETS, and Frequency Bias from contingency counts."""
    h = counts["H"]
    m = counts["M"]
    fa = counts["Fa"]
    c = counts["C"]
    n = counts["N"]

    # Probability of Detection (POD)
    pod = (h / (h + m)) if (h + m) > 0 else 0.0

    # False Alarm Ratio (FAR)
    far = (fa / (h + fa)) if (h + fa) > 0 else 0.0

    # Critical Success Index (CSI) / Threat Score
    csi = (h / (h + m + fa)) if (h + m + fa) > 0 else 0.0

    # Frequency Bias
    bias = ((h + fa) / (h + m)) if (h + m) > 0 else 1.0

    # Equitable Threat Score (ETS) / Gilbert Skill Score
    # Hits expected by chance
    h_random = ((h + m) * (h + fa)) / n if n > 0 else 0.0
    denom = (h + m + fa - h_random)
    ets = ((h - h_random) / denom) if denom > 0 else 0.0

    return {
        "POD": float(round(pod, 4)),
        "FAR": float(round(far, 4)),
        "CSI": float(round(csi, 4)),
        "ETS": float(round(ets, 4)),
        "BIAS": float(round(bias, 4)),
    }

def compute_continuous_metrics(obs: np.ndarray, pred: np.ndarray) -> Dict[str, float]:
    """Computes RMSE, MAE, Mean Bias, and Pearson Correlation."""
    diff = pred - obs
    rmse = float(np.sqrt(np.mean(diff ** 2)))
    mae = float(np.mean(np.abs(diff)))
    mean_bias = float(np.mean(diff))

    # Pearson r
    if np.std(obs) > 1e-6 and np.std(pred) > 1e-6:
        r = float(np.corrcoef(obs, pred)[0, 1])
    else:
        r = 0.0

    return {
        "RMSE": round(rmse, 2),
        "MAE": round(mae, 2),
        "MeanBias": round(mean_bias, 2),
        "PearsonR": round(r, 4),
    }

def compute_fss_2d(
    obs_grid: np.ndarray,
    pred_grid: np.ndarray,
    threshold_mm: float = 64.5,
    window_radius: int = 1,
) -> float:
    """
    Computes Fractions Skill Score (FSS) on 2D spatial grid (Roberts & Lean 2008).
    window_radius: 1 -> 3x3 window (~75km for 25km grid), 2 -> 5x5 (~125km)
    """
    obs_binary = (obs_grid >= threshold_mm).astype(float)
    pred_binary = (pred_grid >= threshold_mm).astype(float)

    h, w = obs_grid.shape
    win_size = 2 * window_radius + 1

    # Compute moving average fractions using uniform 2D filter
    # To keep dependency lightweight, compute moving boxcar via integral image / 2D cumulative sum
    def moving_fraction(binary_map: np.ndarray) -> np.ndarray:
        padded = np.pad(binary_map, window_radius, mode="reflect")
        integral = np.zeros((padded.shape[0] + 1, padded.shape[1] + 1), dtype=float)
        integral[1:, 1:] = np.cumsum(np.cumsum(padded, axis=0), axis=1)

        y1 = 0
        y2 = y1 + win_size
        x1 = 0
        x2 = x1 + win_size

        fractions = np.zeros((h, w), dtype=float)
        for i in range(h):
            for j in range(w):
                total_in_win = (
                    integral[i + win_size, j + win_size]
                    - integral[i, j + win_size]
                    - integral[i + win_size, j]
                    + integral[i, j]
                )
                fractions[i, j] = total_in_win / (win_size * win_size)
        return fractions

    f_obs = moving_fraction(obs_binary)
    f_pred = moving_fraction(pred_binary)

    mse = float(np.mean((f_pred - f_obs) ** 2))
    mse_ref = float(np.mean(f_pred ** 2) + np.mean(f_obs ** 2))

    if mse_ref < 1e-9:
        return float("nan")  # Undefined / zero-denominator per Roberts & Lean (2008) and MWR-D-24-0120.1

    fss = 1.0 - (mse / mse_ref)
    return float(round(max(0.0, min(1.0, fss)), 4))

def bootstrap_ets_ci(
    obs: np.ndarray,
    pred: np.ndarray,
    threshold_mm: float = 64.5,
    n_bootstrap: int = 500,
    seed: int = 42,
) -> Tuple[float, float]:
    """
    Computes 95% Confidence Interval for ETS via Bootstrapping.
    Returns (ci_lower, ci_upper).
    """
    rng = np.random.default_rng(seed)
    n = len(obs)
    if n < 10:
        return (0.0, 0.0)  # Thin strata suppression

    ets_samples = []
    for _ in range(n_bootstrap):
        indices = rng.integers(0, n, size=n)
        b_obs = obs[indices]
        b_pred = pred[indices]
        counts = compute_contingency_counts(b_obs, b_pred, threshold_mm)
        metrics = compute_categorical_metrics(counts)
        ets_samples.append(metrics["ETS"])

    ci_lower = float(np.percentile(ets_samples, 2.5))
    ci_upper = float(np.percentile(ets_samples, 97.5))
    return (round(ci_lower, 3), round(ci_upper, 3))


def compute_paired_date_block_bootstrap(
    dates: np.ndarray,
    obs: np.ndarray,
    preds_dict: Dict[str, np.ndarray],
    threshold_mm: float = 64.5,
    block_length_days: int = 1,
    n_bootstrap: int = 500,
    seed: int = 42,
    confidence_level: float = 0.95,
) -> Dict[str, Any]:
    """
    Executes paired date-block bootstrapping across models using identical date resamples.
    Guarantees:
    1. Preserves all spatial locations on a given date together (cluster sampling).
    2. Builds consecutive multi-day blocks without bridging across date gaps.
    3. Uses identical resampled blocks for all models in each replicate.
    4. Recomputes aggregate scores from pooled underlying resampled records (not averaged daily scores).
    5. Returns paired difference CIs (Stage 1 - Global EQM, Stage 2 - Stage 1).
    """
    dates = np.asarray(dates)
    obs = np.asarray(obs, dtype=float)
    unique_dates = np.unique(dates)
    unique_dates.sort()
    n_dates = len(unique_dates)

    if n_dates < 5:
        raise ValueError(f"Need at least 5 unique dates for date-block bootstrap, got {n_dates}")

    # Map dates to row indices
    date_to_indices = {}
    for i, d in enumerate(dates):
        if d not in date_to_indices:
            date_to_indices[d] = []
        date_to_indices[d].append(i)
    for d in date_to_indices:
        date_to_indices[d] = np.array(date_to_indices[d], dtype=int)

    # Construct blocks of dates
    # If block_length_days == 1, each block is [date]
    # If block_length_days > 1, check consecutive calendar continuity
    from datetime import datetime, timedelta
    date_objs = [datetime.strptime(str(d)[:10], "%Y-%m-%d") for d in unique_dates]
    
    blocks = []
    if block_length_days <= 1:
        blocks = [[d] for d in unique_dates]
    else:
        # Build non-overlapping or moving blocks without crossing gaps > 1 day
        for i in range(0, n_dates):
            current_block = [unique_dates[i]]
            for step in range(1, block_length_days):
                if i + step < n_dates:
                    expected_date = date_objs[i] + timedelta(days=step)
                    if date_objs[i + step] == expected_date:
                        current_block.append(unique_dates[i + step])
                    else:
                        break  # Gap encountered; do not bridge
            blocks.append(current_block)

    n_blocks = len(blocks)
    rng = np.random.default_rng(seed)

    # Initialize paired difference containers
    models = list(preds_dict.keys())
    metric_reps = {m: {"ETS": [], "POD": [], "FAR": [], "CSI": [], "BIAS": [], "RMSE": []} for m in models}
    paired_diffs = {
        "Stage1_minus_GlobalEQM": {"ETS": [], "POD": [], "FAR": [], "RMSE": []},
        "Stage2_minus_Stage1": {"ETS": [], "POD": [], "FAR": [], "RMSE": []},
    }

    usable_replicates = 0
    alpha_low = ((1.0 - confidence_level) / 2.0) * 100.0
    alpha_high = (1.0 - ((1.0 - confidence_level) / 2.0)) * 100.0

    for rep in range(n_bootstrap):
        sampled_block_indices = rng.integers(0, n_blocks, size=n_blocks)
        sampled_dates = []
        for b_idx in sampled_block_indices:
            sampled_dates.extend(blocks[b_idx])

        # Pool all row indices
        rep_indices_list = [date_to_indices[d] for d in sampled_dates if d in date_to_indices]
        if not rep_indices_list:
            continue
        rep_idx = np.concatenate(rep_indices_list)

        rep_obs = obs[rep_idx]
        rep_preds = {m: preds_dict[m][rep_idx] for m in models}

        # Check for minimum events
        if np.sum(rep_obs >= threshold_mm) < 5:
            continue

        rep_scores = {}
        for m in models:
            cnt = compute_contingency_counts(rep_obs, rep_preds[m], threshold_mm=threshold_mm)
            cat = compute_categorical_metrics(cnt)
            cont = compute_continuous_metrics(rep_obs, rep_preds[m])
            rep_scores[m] = {**cat, **cont}
            for k in metric_reps[m]:
                metric_reps[m][k].append(rep_scores[m][k])

        # Paired differences
        if "Regime-Aware RQDM (Stage 1)" in rep_scores and "Global Quantile Mapping (EQM)" in rep_scores:
            s1 = rep_scores["Regime-Aware RQDM (Stage 1)"]
            eqm = rep_scores["Global Quantile Mapping (EQM)"]
            paired_diffs["Stage1_minus_GlobalEQM"]["ETS"].append(s1["ETS"] - eqm["ETS"])
            paired_diffs["Stage1_minus_GlobalEQM"]["POD"].append(s1["POD"] - eqm["POD"])
            paired_diffs["Stage1_minus_GlobalEQM"]["FAR"].append(s1["FAR"] - eqm["FAR"])
            paired_diffs["Stage1_minus_GlobalEQM"]["RMSE"].append(s1["RMSE"] - eqm["RMSE"])

        if "RQDM + Spatial Corrector (Stage 2)" in rep_scores and "Regime-Aware RQDM (Stage 1)" in rep_scores:
            s2 = rep_scores["RQDM + Spatial Corrector (Stage 2)"]
            s1 = rep_scores["Regime-Aware RQDM (Stage 1)"]
            paired_diffs["Stage2_minus_Stage1"]["ETS"].append(s2["ETS"] - s1["ETS"])
            paired_diffs["Stage2_minus_Stage1"]["POD"].append(s2["POD"] - s1["POD"])
            paired_diffs["Stage2_minus_Stage1"]["FAR"].append(s2["FAR"] - s1["FAR"])
            paired_diffs["Stage2_minus_Stage1"]["RMSE"].append(s2["RMSE"] - s1["RMSE"])

        usable_replicates += 1

    # Summarize paired CI
    summary_diffs = {}
    for comp_key, ddict in paired_diffs.items():
        summary_diffs[comp_key] = {}
        for mkey, values in ddict.items():
            if len(values) > 10:
                summary_diffs[comp_key][mkey] = {
                    "mean_diff": round(float(np.mean(values)), 4),
                    "median_diff": round(float(np.median(values)), 4),
                    "ci_lower": round(float(np.percentile(values, alpha_low)), 4),
                    "ci_upper": round(float(np.percentile(values, alpha_high)), 4),
                }

    return {
        "bootstrap_seed": seed,
        "confidence_level": confidence_level,
        "block_length_days": block_length_days,
        "total_requested_replicates": n_bootstrap,
        "usable_replicates": usable_replicates,
        "paired_differences": summary_diffs,
    }

if __name__ == "__main__":
    # Unit check
    o = np.array([10.0, 70.0, 80.0, 2.0, 5.0, 120.0, 0.0, 15.0])
    p = np.array([8.0, 65.0, 75.0, 1.0, 4.0, 110.0, 1.0, 20.0])
    cnt = compute_contingency_counts(o, p, 64.5)
    cat = compute_categorical_metrics(cnt)
    cont = compute_continuous_metrics(o, p)
    print("Contingency Counts:", cnt)
    print("Categorical:", cat)
    print("Continuous:", cont)
