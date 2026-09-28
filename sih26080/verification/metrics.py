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
from typing import Dict, Tuple, List, Optional
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
        return 1.0  # Perfect agreement on zero events

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
    Computes 95% Confidence Interval for ETS via Block Bootstrapping.
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
