# SIH26080: Complete System Summary, Mathematical Specifications & Claude Review Dossier
**File Name:** `agy work.md`  
**Author:** Antigravity (AGY) & Team ClaudeMaxDedo  
**Target System:** Problem Statement SIH26080 (Software) — *Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts*  
**Stakeholder Ministries:** Ministry of Earth Sciences (MoES), NCMRWF, India Meteorological Department (IMD)  
**Evaluation Dataset:** Real JJAS 2024 Indian Summer Monsoon (June 1 – September 30, 2024; 120 days, 38,880 point-days across Maharashtra Corridor, Western Ghats & Core Monsoon Zone)  
**Operational Target:** Single-CPU inference (11.4 ms latency, zero GPU dependency, Next.js 14 Web Portal at `/sih26080`)

---

## TABLE OF CONTENTS
1. [Executive Summary: What We Built & Current Architecture](#1-executive-summary-what-we-built--current-architecture)
2. [Master Measured Benchmark Results (JJAS 2024 Verified)](#2-master-measured-benchmark-results-jjas-2024-verified)
3. [Plain-Text Mathematical Equations (Word-Ready & Copy-Paste Safe)](#3-plain-text-mathematical-equations-word-ready--copy-paste-safe)
4. [The Complete Copy-Paste Evaluation Prompt for Claude](#4-the-complete-copy-paste-evaluation-prompt-for-claude)
5. [Frontend UI Screen Architecture (13 Operational Tabs)](#5-frontend-ui-screen-architecture-13-operational-tabs)
6. [Data Lineage, Provenance Hashes & Test Suite Verifications](#6-data-lineage-provenance-hashes--test-suite-verifications)

---

## 1. EXECUTIVE SUMMARY: WHAT WE BUILT & CURRENT ARCHITECTURE

### The Core Problem in Numerical Weather Prediction (NWP)
Global and regional numerical weather prediction models (e.g., ECMWF IFS 0.25° HRES, NCUM, GFS) exhibit severe, localized systematic errors during the Indian Summer Monsoon (JJAS):
* **Western Ghats Orographic Dry Bias**: Over steep mountain slopes (e.g., Mahabaleshwar, Ratnagiri) and the Konkan coast, raw ECMWF severely underpredicts heavy rainfall ($\ge 64.5$ mm/day), exhibiting a Frequency Bias of only **0.586** and missing over 81% of extreme rain events (Probability of Detection $\text{POD} = 18.3\%$).
* **Convective Displacement & Double Penalties**: Spatial offset in convective cloud triggers results in high False Alarm Ratios ($\text{FAR} = 68.8\%$) and low Critical Success Index ($\text{CSI} = 0.131$).
* **Synoptic Non-Stationarity**: Standard global bias-correction methods (like global Empirical Quantile Mapping) apply a single static transfer function. This fails because error dynamics invert between synoptic regimes: Active spells feature intense low-level jet moisture convergence and heavy orographic ascent, whereas Break spells feature suppressed rain over central India and spurious false alarms along the coast.

### Our Solution: 2-Stage Hybrid Regime-Aware Post-Processing Pipeline
We built a physically grounded, highly interpretable 2-stage post-processing architecture:

```
[Raw ECMWF IFS 0.25° + GFS / NCUM Forecasts]
                     │
                     ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ STAGE 1: Synoptic Regime Classifier & Non-Parametric RQDM    │
  │ • Core Monsoon Zone (CMZ: 18°-25°N, 65°-88°E) Anomaly       │
  │ • Zero-Leakage Causal Formula: Z_eff(D) from D-2, D-1 & D   │
  │ • 4 Regimes: Active, Break, Coastal Trough, Normal           │
  │ • 100-Quantile Empirical Inversion per Regime               │
  │ • Themeßl Extreme Tail Multiplier for Out-of-Sample Spells  │
  │ • Thin-Strata Shrinkage Regularization (N < 30)             │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 Regime-Calibrated Rainfall (y_RQDM)
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ STAGE 2: Topographic & Low-Level Jet LightGBM Corrector     │
  │ • Fits Residual Error: Delta = Obs - y_RQDM                  │
  │ • Robust L1 Loss (MAE) preventing outlier overfitting       │
  │ • 9 Physical Features: Somali Jet (u850, v850),              │
  │   Mechanical Orographic Uplift Phi_oro = V_850 · grad(h),   │
  │   Coast Distance, Elevation MSL, Z_eff Anomaly, Regime Code │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
             Corrected Rainfall & Physical Attributions
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ HETEROSCEDASTIC EXCEEDANCE PROBABILITY ENGINE & CAP 1.2     │
  │ • Survival Probabilities P(Rain >= T) via Gaussian erfc     │
  │ • Regime-conditioned spread: sigma_R = f(Regime, Rain)      │
  │ • Heavy (64.5mm), Very Heavy (115.6mm), Extreme (204.5mm)   │
  │ • Automated WMO / NDMA CAP 1.2 XML Siren Payload Generator  │
  └─────────────────────────────────────────────────────────────┘
```

---

## 2. MASTER MEASURED BENCHMARK RESULTS (JJAS 2024 VERIFIED)

All metrics were measured across **38,880 point-days** (324 gridded points $\times$ 120 days) on real JJAS 2024 data (June 1 to September 30, 2024) under 5-Fold Purged Block Cross-Validation with a 5-day blackout buffer.

### Verification Benchmark Table (Heavy Rain Threshold $\ge 64.5$ mm/day)

| Pipeline Stage | Continuous RMSE (mm) | Continuous MAE (mm) | Frequency BIAS | POD (Hits/Obs) | FAR (Fa/Fcst) | CSI (Threat Score) | ETS [95% Day-Block CI, 1000 reps] | FSS (55 km) | FSS (165 km) | FSS (275 km) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Raw ECMWF IFS (0.25°)** | 17.19 | 9.25 | 0.586 | 0.183 (150/819) | 0.688 (330/480) | 0.131 | 0.123 [0.104, 0.143] | 0.46 | 0.58 | 0.65 |
| **Negative Control (Smoothed)** | 16.97 | 9.21 | 0.547 | 0.164 (134/819) | 0.701 (314/448) | 0.118 | 0.111 [0.093, 0.130] | 0.44 | 0.55 | 0.62 |
| **Global Quantile Mapping (EQM)** | 18.05 | 8.60 | 0.980 | 0.295 (242/819) | 0.699 (561/803) | 0.175 | 0.165 [0.145, 0.184] | 0.50 | 0.63 | 0.72 |
| **Stage 1 Regime RQDM (Proposed)** | 18.69 | 8.77 | **1.000** | **0.303** (248/819) | 0.697 (571/819) | **0.178** | **0.168** [0.149, 0.188] | 0.52 | 0.65 | 0.74 |
| **Stage 2 LightGBM Corrector** | **15.12** | **6.64** | 0.242 | 0.138 (113/819) | **0.429** (85/198) | 0.125 | 0.121 [0.100, 0.145] | **0.54** | **0.68** | **0.77** |

### Contingency Counts Breakdown ($N = 38,880$, $T = 64.5$ mm)
* **Raw ECMWF**: Hits = 150 | Misses = 669 | False Alarms = 330 | Correct Negatives = 37,731
* **Global EQM**: Hits = 242 | Misses = 577 | False Alarms = 561 | Correct Negatives = 37,500
* **Stage 1 RQDM**: Hits = 248 | Misses = 571 | False Alarms = 571 | Correct Negatives = 37,490
* **Stage 2 LightGBM**: Hits = 113 | Misses = 706 | False Alarms = 85 | Correct Negatives = 37,976

### Measured Feature Importance Attribution (LightGBM 5-Fold CV)
1. `dist_coast_km`: **19.16%** (Orographic proximity to Arabian Sea moisture)
2. `mcz_z_score`: **15.39%** (Core Monsoon Zone synoptic index)
3. `wind_v_850`: **13.82%** (Meridional low-level jet vector)
4. `rqdm_fcst_mm`: **11.32%** (Stage 1 regime-calibrated baseline)
5. `raw_fcst_mm`: **11.15%** (Raw NWP precipitation)
6. `wind_u_850`: **10.21%** (Zonal westerly monsoon jet speed)
7. `orographic_flux`: **9.51%** (Perpendicular mechanical uplift parameter)
8. `elevation_m`: **7.51%** (Station terrain altitude MSL)
9. `regime_code`: **1.94%** (Categorical regime)

---

## 3. PLAIN-TEXT MATHEMATICAL EQUATIONS (WORD-READY & COPY-PASTE SAFE)

> All equations below are written in standard ASCII plain-text formatting without any LaTeX symbols or broken characters, so they can be copied directly into Microsoft Word, Google Docs, or text chat prompts.

### 3.1 Synoptic Monsoon Regime Anomaly (Rajeevan et al., 2010)
```
Z_CMZ(t) = [ R_CMZ(t) - mu_clim(t) ] / sigma_clim(t)
```
* `R_CMZ(t)`: Area-weighted average daily rainfall across the Core Monsoon Zone (18.0°N–25.0°N, 65.0°E–88.0°E) in mm/day.
* `mu_clim(t)`: 30-year daily climatological normal from IMD 1991–2020 baseline (8.20 mm/day).
* `sigma_clim(t)`: 30-year daily standard deviation (2.80 mm/day).

### 3.2 Operational Zero-Leakage Anomaly
At 05:30 IST forecast issue time, Day D observation does not exist. To prevent future-data leakage:
```
Z_effective(D) = 0.35 * Z_obs(D-2) + 0.35 * Z_obs(D-1) + 0.30 * Z_NWP(D)
```

### 3.3 Synoptic Regime Partitioning Rule
```
IF (Z_effective >= +1.00) OR (Z_effective >= +0.50 AND Bay_Depression_Flag == TRUE):
    Regime = ACTIVE_MONSOON (Code 0)
ELSE IF (Z_effective <= -1.00) OR (Z_obs(D-1) <= -0.80 AND Z_NWP(D) <= -1.00):
    Regime = BREAK_MONSOON (Code 1)
ELSE IF (|Wind_850_coast| >= 25.0 knots [12.86 m/s]) AND (Z_effective >= -0.50):
    Regime = COASTAL_OFFSHORE_TROUGH (Code 2)
ELSE:
    Regime = NORMAL_TRANSITION (Code 3)
```

### 3.4 Non-Parametric Regime Quantile Mapping (RQDM)
```
y_RQDM = Quantile_obs|regime_k( Probability_value )
where:
Probability_value = CDF_nwp|regime_k( x_raw )
```
Piecewise linear interpolation across 100 quantiles:
```
Probability_p = p_j + [ (x_raw - q_nwp[k, j]) / (q_nwp[k, j+1] - q_nwp[k, j]) ] * (p_j+1 - p_j)
for x_raw in [ q_nwp[k, j], q_nwp[k, j+1] ]
```
Monotonicity enforcement:
```
q_nwp[k, j+1] = max( q_nwp[k, j+1], q_nwp[k, j] )
q_obs[k, j+1] = max( q_obs[k, j+1], q_obs[k, j] )
```

### 3.5 Continuous Capped-Slope Extreme Tail Extrapolation
To eliminate runaway multiplicative extrapolation while preserving boundary continuity at the terminal training quantile:
```text
FIXED_CAP = 3.0
DENOM_FLOOR = 0.10

a = q_nwp[k, 100]  (terminal forecast quantile)
b = q_obs[k, 100]  (terminal observed quantile)

IF x_raw > a:
    IF a > DENOM_FLOOR:
        multiplier_cap = FIXED_CAP
        a99 = q_nwp[k, 99]
        b99 = q_obs[k, 99]
        IF a99 > DENOM_FLOOR:
            multiplier_cap = min(multiplier_cap, b99 / a99)
        tail_slope = min(b / a, multiplier_cap)
        y_RQDM = b + tail_slope * (x_raw - a)
    ELSE:
        y_RQDM = x_raw + (b - a)
ELSE:
    y_RQDM = piecewise_in_range_mapping(x_raw)
```
*Guarantees:* Capped incremental tail slope. Preserves boundary endpoint ($x = a \to y = b$). Strictly identical to Themeßl multiplicative scaling when the cap is inactive. Does not impose an absolute rainfall ceiling.

### 3.6 Thin-Strata Regularization & Monotonic Tie Policy
* Tie Policy in Inversion: When adjacent model quantiles are equal ($q_j = q_{j+1}$), the tie policy selects the highest probability index sharing the input value, skipping zero-width intervals via upper_bound - 1.
```text
weight_regime = min( 1.00, sample_count_k / 30.0 )
y_blended = weight_regime * y_RQDM + (1.00 - weight_regime) * y_global_EQM
y_final = max( 0.00, y_blended )
```

### 3.7 Mechanical Orographic Uplift & Directional Proxy Semantics
CRITICAL DISTINCTION: Formulas A and B are NOT generally equivalent.
* Formula A (Local Terrain-Gradient Flow):
```text
A = Vector_V850 dot Gradient_Elevation = u850 * (dh/dx) + v850 * (dh/dy)
```
A reaches its maximum in the local uphill direction $\nabla h$.

* Formula B (Elevation-Weighted Fixed-Ridge Directional Proxy):
```text
wind_direction_deg = modulo( 270.0 - atan2(v850, u850) * (180.0 / pi), 360.0 )
[Handle u = v = 0 explicitly by returning zero orographic contribution]

E = elevation_m / 1000.0
B = E * (-cos(160 * pi / 180) * u850 + sin(160 * pi / 180) * v850)
B = E * (0.9396926207859084 * u850 + 0.3420201433256687 * v850)
```
B reaches its maximum when angle_of_attack = 90 degrees (wind FROM 250 degrees, blowing toward 70 degrees).
A and B are identical for every wind vector $(u, v)$ ONLY under conditional equivalence:
```text
dh_dx = E * 0.9396926207859084
dh_dy = E * 0.3420201433256687
```

### 3.8 Stage 2 LightGBM L1 Optimization Function
```text
Loss_L1 = (1 / N) * sum_{i=1 to N} | y_obs[i] - ( y_RQDM[i] + g(X[i]; Weights) ) | 
          + lambda_reg * sum_{j=1 to J} (weight_j)^2 + gamma_reg * J
```
Feature Importance Display Sum Tolerance: 9 independently rounded two-decimal percentages sum to 100.01% (+0.01% discrepancy). The theoretical aggregate rounding bound is $9 \times 0.005 = 0.045\%$. The displayed sum is within the verified rounding tolerance:
```text
abs(sum(displayed_percentages) - 100.0) <= 0.045
```

### 3.9 Heteroscedastic Calibrated Exceedance Engine & Negative Support Limitation
```text
P(Rain >= Threshold | y_calibrated, Regime) = 0.5 * erfc( (Threshold - y_calibrated) / [ sigma_R * sqrt(2) ] )

Where:
IF (Regime == ACTIVE_MONSOON):  sigma_R = max( 5.00, 0.22 * y_calibrated )
IF (Regime == BREAK_MONSOON):   sigma_R = max( 1.50, 0.15 * y_calibrated )
IF (Regime == COASTAL_TROUGH):  sigma_R = max( 6.00, 0.25 * y_calibrated )
IF (Regime == NORMAL):          sigma_R = max( 3.00, 0.20 * y_calibrated )
```

#### Gaussian Negative-Support Limitation Table:
Probability assigned to unphysical negative rainfall: $P(R < 0) = 0.5 \operatorname{erfc}(y / (\sigma_R \sqrt{2}))$:

| Regime | y = 5 mm | y = 15 mm | y = 30 mm | y = 60 mm |
| :--- | :--- | :--- | :--- | :--- |
| **ACTIVE_MONSOON** | 0.158655253931 | 0.001349898032 | 2.740841326e-6 | 2.740841326e-6 |
| **BREAK_MONSOON** | 0.0004290603332 | 1.308392469e-11 | 1.308392469e-11 | 1.308392469e-11 |
| **COASTAL_TROUGH** | 0.202328380964 | 0.006209665326 | 3.167124183e-5 | 3.167124183e-5 |
| **NORMAL** | 0.047790352273 | 2.866515719e-7 | 2.866515719e-7 | 2.866515719e-7 |

> [!WARNING]
> **Prominent Gaussian Model Limitation Warning:**
> - ACTIVE_MONSOON at $y = 5$ mm assigns **15.8655%** probability to negative rainfall.
> - COASTAL_TROUGH at $y = 5$ mm assigns **20.2328%** probability to negative rainfall.
> - Both exceed the 5% materiality threshold ($P_{\text{negative}} > 0.05$).
> - NORMAL at $y = 5$ mm assigns **4.7790%** (below threshold, but not negligible).
> - Diagnostic flag: `has_material_negative_support(y, regime, threshold=0.05)` is triggered dynamically on $P_{\text{negative}} > 0.05$.
> - Future evaluation plan: Censored or zero-adjusted gamma/log-normal distribution with explicit mass at zero.

### 3.10 Verification Skill Metrics Formulations & Honest Brier Baseline
```text
POD                 = H / (H + M)
FAR                 = Fa / (H + Fa)
CSI                 = H / (H + M + Fa)
Frequency_BIAS      = (H + Fa) / (H + M)
Hits_random         = [ (H + M) * (H + Fa) ] / N
ETS                 = (H - Hits_random) / [ H + M + Fa - Hits_random ]
FSS(n)              = 1.0 - [ MSE(n) / MSE_ref(n) ]
```

#### Climatological Brier Baseline (N = 38,880, Events = 819):
```text
p = 819 / 38880 = 0.0210648148148148
BS_climatology = p * (1.0 - p) = 0.0206210883916324
BSS = 1.0 - ( BS / BS_climatology )
```
Measured Brier scores for supplied fixtures:
* $BS_{\text{raw}} = 0.0254 \implies BSS_{\text{raw}} = -0.231748757272522$
* $BS_{\text{rqdm}} = 0.0253 \implies BSS_{\text{rqdm}} = -0.226899352716331$

> [!NOTE]
> **Honest Negative Skill Assessment:**
> Both probability forecasts underperform the constant observed-base-rate forecast on this sample ($BSS < 0$). Stage 1 RQDM reduces the Brier score by 0.0001 (from 0.0254 to 0.0253), demonstrating a marginal improvement, but remains below climatology in skill due to Gaussian probability over-issuance across dry non-event days.

---

## 4. THE COMPLETE COPY-PASTE EVALUATION PROMPT FOR CLAUDE

```text
You are acting as an elite peer-reviewer and domain expert in Atmospheric Sciences, Numerical Weather Prediction (NWP), and Machine Learning Post-Processing. You are evaluating our system developed for Smart India Hackathon (SIH 2026) under Problem Statement SIH26080: "Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts", sponsored by the Ministry of Earth Sciences (MoES), National Centre for Medium Range Weather Forecasting (NCMRWF), and the India Meteorological Department (IMD).

Please review the technical architecture, mathematical formulations, empirical results, and operational UI detailed below. I need you to fact-check our equations, evaluate whether our methodology accomplishes what MoES scientists were expecting, point out vulnerabilities an expert jury will press us on, and provide concrete recommendations for improvement.

---

### 1. PROBLEM CONTEXT & THE SCIENTIFIC BOTTLENECK

In operational numerical weather prediction across India during the Summer Monsoon (JJAS), global models (such as ECMWF IFS 0.25-degree HRES, GFS, and NCUM) struggle with severe localized biases:
1. Orographic Precipitation Deficit: Over the Western Ghats mountain barrier (e.g., Mahabaleshwar, Ratnagiri) and Konkan coast, models exhibit a severe dry bias for heavy rain (threshold >= 64.5 mm/day), with an operational Frequency Bias of only ~0.59 (missing ~82% of heavy events, POD = 18.3%).
2. Convective Displacement & Double Penalties: Spatial displacement of convective cores leads to high False Alarm Ratios (FAR ~69%) and low Critical Success Index (CSI ~0.13).
3. Synoptic Non-Stationarity: Global bias-correction methods (like standard Global Empirical Quantile Mapping) apply a single static transfer function across the entire season. This fails because error dynamics invert between synoptic regimes: Active spells feature intense Somali Low-Level Jet (LLJ) moisture transport and heavy orographic rain, while Break spells feature suppressed rain over central India and spurious false alarms along the coast.

---

### 2. OUR ARCHITECTURE: 2-STAGE REGIME-AWARE HYBRID POST-PROCESSING

We engineered an interpretable, physically constrained, two-stage post-processing pipeline that runs on a single CPU with an inference latency of only 11.4 ms (zero GPU required):

#### Stage 1: Synoptic Monsoon Regime Classifier & RQDM
- Monitors the Core Monsoon Zone (CMZ: 18.0N to 25.0N, 65.0E to 88.0E) area-weighted precipitation anomaly based on the Rajeevan et al. (2010) baseline (mean = 8.20 mm/day, std = 2.80 mm/day).
- To guarantee zero future-data leakage at 05:30 IST operational forecast release, it computes a causal composite effective anomaly (Z_effective) combining antecedent observations (D-2, D-1) with Day D raw NWP forecasts.
- Partitions synoptic weather into 4 distinct physical regimes: ACTIVE_MONSOON, BREAK_MONSOON, COASTAL_OFFSHORE_TROUGH, and NORMAL_TRANSITION.
- Fits non-parametric Regime-Conditioned Quantile Mapping (RQDM) across 100 quantiles per regime, utilizing Themeßl et al. (2012) extreme tail ratio scaling for values exceeding the training maximum, and shrinkage regularization toward the global transfer function for sample-sparse regimes (< 30 days).

#### Stage 2: Topographic & Low-Level Jet LightGBM Spatial Residual Corrector
- Trains gradient boosted decision trees on spatial residuals: Delta = Observation - RQDM_Forecast.
- Uses an L1 (Mean Absolute Error) loss function to prevent overfitting to extreme convective outliers.
- Ingests 9 physical features: raw NWP rainfall, Stage 1 RQDM baseline, station elevation (MSL), distance to the Arabian Sea coast, 850 hPa zonal wind (u850), 850 hPa meridional wind (v850), mechanical orographic flux (ridge-normal forced ascent speed), categorical regime code, and the CMZ anomaly.

#### Heteroscedastic Calibrated Exceedance Probability Engine
- Generates automated CAP 1.2 XML emergency alert payloads for State Disaster Management Authorities (SDMAs).

---

### 3. MATHEMATICAL FORMULATIONS (PLAIN-TEXT FORMAT)

#### A. CMZ Standardized Anomaly (Rajeevan et al., 2010):
```
Z_CMZ(t) = [ R_CMZ(t) - mu_clim(t) ] / sigma_clim(t)
```
Where R_CMZ(t) is daily CMZ area-averaged rainfall (mm/day), mu_clim = 8.20 mm/day, and sigma_clim = 2.80 mm/day.

#### B. Operational Zero-Leakage Composite Anomaly:
```
Z_effective(D) = 0.35 * Z_obs(D-2) + 0.35 * Z_obs(D-1) + 0.30 * Z_NWP(D)
```

#### C. Regime Partitioning Criteria:
```
IF (Z_effective >= +1.00) OR (Z_effective >= +0.50 AND Bay_of_Bengal_Depression == TRUE):
    Regime = ACTIVE_MONSOON
ELSE IF (Z_effective <= -1.00) OR (Z_obs(D-1) <= -0.80 AND Z_NWP(D) <= -1.00):
    Regime = BREAK_MONSOON
ELSE IF (|Wind_850_coast| >= 25.0 knots [12.86 m/s]) AND (Z_effective >= -0.50):
    Regime = COASTAL_OFFSHORE_TROUGH
ELSE:
    Regime = NORMAL_TRANSITION
```

#### D. Non-Parametric RQDM Quantile Inversion:
```
y_RQDM = Quantile_obs|regime_k( CDF_nwp|regime_k( x_raw ) )
```
Piecewise linear interpolation across 100 quantiles with monotonicity and monotonic tie policy:
```
# Monotonic tie policy: choose highest probability index sharing the input value:
j = upper_bound(q_nwp, x_raw) - 1
IF q_nwp[j] == x_raw:
    Probability_p = p[j]
ELSE:
    width = q_nwp[j+1] - q_nwp[j]
    Probability_p = p[j] + [ (x_raw - q_nwp[j]) / width ] * (p[j+1] - p[j])

q_nwp[k, j+1] = max( q_nwp[k, j+1], q_nwp[k, j] )
q_obs[k, j+1] = max( q_obs[k, j+1], q_obs[k, j] )
```

#### E. Continuous Capped-Slope Tail Extrapolation (x_raw > a = q_nwp[k, 100]):
```
FIXED_CAP = 3.0
DENOM_FLOOR = 0.10
a = q_nwp[k, 100]
b = q_obs[k, 100]

IF x_raw > a:
    IF a > DENOM_FLOOR:
        multiplier_cap = FIXED_CAP
        a99 = q_nwp[k, 99]
        b99 = q_obs[k, 99]
        IF a99 > DENOM_FLOOR:
            multiplier_cap = min(multiplier_cap, b99 / a99)
        tail_slope = min(b / a, multiplier_cap)
        y_RQDM = b + tail_slope * (x_raw - a)
    ELSE:
        y_RQDM = x_raw + (b - a)
ELSE:
    y_RQDM = in_range_mapping(x_raw)
```

#### F. Thin-Strata Regularization (Sample size N_k < 30):
```
weight_k = min( 1.00, N_k / 30.0 )
y_blended = weight_k * y_RQDM + (1.00 - weight_k) * y_global_EQM
y_final = max( 0.00, y_blended )
```

#### G. Mechanical Orographic Uplift (Terrain Gradient vs Fixed Ridge Proxy):
CRITICAL DISTINCTION: Formulas A and B are NOT generally equivalent.
* Formula A (Local Terrain-Gradient Flow):
```
A = Vector_V850 dot Gradient_Elevation = u850 * (dh/dx) + v850 * (dh/dy)
```
* Formula B (Elevation-Weighted Fixed-Ridge Directional Proxy):
```
wind_speed_850 = sqrt( (u850)^2 + (v850)^2 )
wind_direction_deg = modulo( 270.0 - atan2(v850, u850) * (180.0 / pi), 360.0 )
[Handle u = v = 0 explicitly by returning zero orographic contribution]

E = station_elevation_m / 1000.0
B = E * (0.9396926207859084 * u850 + 0.3420201433256687 * v850)
```
B is maximized at angle_of_attack = 90 deg (wind FROM 250 deg). A and B are conditionally equivalent ONLY when dh/dx = E * 0.9396926207859084 and dh/dy = E * 0.3420201433256687.

#### H. Exceedance Probability & Gaussian Negative-Support Limitation:
```
P(Rain >= Threshold | y_calibrated, Regime) = 0.5 * erfc( (Threshold - y_calibrated) / [ sigma_R * sqrt(2) ] )

Where:
IF Regime == ACTIVE_MONSOON: sigma_R = max( 5.00, 0.22 * y_calibrated )
IF Regime == BREAK_MONSOON:  sigma_R = max( 1.50, 0.15 * y_calibrated )
IF Regime == COASTAL_TROUGH: sigma_R = max( 6.00, 0.25 * y_calibrated )
IF Regime == NORMAL:         sigma_R = max( 3.00, 0.20 * y_calibrated )
```
Gaussian Negative-Support Limitation: $P(R < 0) = 0.5 \operatorname{erfc}(y / (\sigma_R \sqrt{2}))$. At $y = 5$ mm, ACTIVE assigns 15.87% and COASTAL assigns 20.23% to negative rain (both > 5% materiality threshold). Diagnostic flag: `P_negative > 0.05`.

#### I. Categorical & Spatial Verification Metrics:
```
POD = Hits / (Hits + Misses)
FAR = False_Alarms / (Hits + False_Alarms)
CSI = Hits / (Hits + Misses + False_Alarms)
Frequency_BIAS = (Hits + False_Alarms) / (Hits + Misses)

Hits_random = [ (Hits + Misses) * (Hits + False_Alarms) ] / Total_N
ETS = (Hits - Hits_random) / [ Hits + Misses + False_Alarms - Hits_random ]

FSS(n) = 1.0 - [ MSE(n) / MSE_ref(n) ]

p = 819 / 38880 = 0.0210648148148148
BS_climatology = p * (1.0 - p) = 0.0206210883916324
BSS = 1.0 - [ Brier_Score / BS_climatology ]
(BSS_raw = -0.2317, BSS_rqdm = -0.2269: honest reporting of negative skill vs climatology)
```

---

### 4. DATA GROUNDING & VERIFIED BENCHMARKS (JJAS 2024)

- Observation Ground Truth: Real IMD 0.25-degree daily gridded analysis (`RF25_ind2024_rfp25.nc`, Pai et al. 2014; SHA-256: `1ef02aeba5694dbb57a6cca23a3c2cc11740affb185137c1eacbeab59893228a`).
- Model Forecasts: ECMWF IFS 0.25-degree HRES archived forecasts from Open-Meteo (`openmeteo_ecmwf_jjas2024.parquet`, SHA-256: `5230553914e4751aa512097382e1577b7c8bc373280fc843e69e52d146e975a1`).
- Domain & Sample Size: 324 spatial points over Maharashtra, Western Ghats, and Core Monsoon Zone over all 120 days of JJAS 2024 = 38,880 point-days.
- Cross-Validation: 5-Fold Purged Block Cross-Validation with a 5-day blackout buffer to eliminate temporal autocorrelation leakage.
- Synthetic Data Audit: 100% passed (`test_no_synthetic_in_pipeline.py` passed, zero synthetic generators in benchmark path).

#### Master Benchmark Table (Heavy Rain Threshold >= 64.5 mm/day):
| Model Pipeline Stage | Continuous RMSE (mm) | Continuous MAE (mm) | Frequency BIAS | POD (Hits/Obs) | FAR (Fa/Fcst) | CSI (Threat Score) | ETS [95% Day-Block CI, 1000 reps] | FSS (55 km) | FSS (165 km) | FSS (275 km) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Raw ECMWF IFS (0.25 deg)** | 17.19 | 9.25 | 0.586 | 0.183 (150/819) | 0.688 (330/480) | 0.131 | 0.123 [0.104, 0.143] | 0.46 | 0.58 | 0.65 |
| **Negative Control (Smoothed)** | 16.97 | 9.21 | 0.547 | 0.164 (134/819) | 0.701 (314/448) | 0.118 | 0.111 [0.093, 0.130] | 0.44 | 0.55 | 0.62 |
| **Global Quantile Mapping (EQM)** | 18.05 | 8.60 | 0.980 | 0.295 (242/819) | 0.699 (561/803) | 0.175 | 0.165 [0.145, 0.184] | 0.50 | 0.63 | 0.72 |
| **Stage 1 Regime RQDM (Ours)** | 18.69 | 8.77 | 1.000 | 0.303 (248/819) | 0.697 (571/819) | 0.178 | 0.168 [0.149, 0.188] | 0.52 | 0.65 | 0.74 |
| **Stage 2 LightGBM Corrector** | 15.12 | 6.64 | 0.242 | 0.138 (113/819) | 0.429 (85/198) | 0.125 | 0.121 [0.100, 0.145] | 0.54 | 0.68 | 0.77 |

#### LightGBM Feature Importance Attribution (Physical Validation):
1. `dist_coast_km`: 19.16% (Orographic proximity to Arabian Sea)
2. `mcz_z_score`: 15.39% (Synoptic monsoon index)
3. `wind_v_850`: 13.82% (Meridional low-level jet component)
4. `rqdm_fcst_mm`: 11.32% (Calibrated baseline)
5. `raw_fcst_mm`: 11.15% (Raw model output)
6. `wind_u_850`: 10.21% (Zonal westerly monsoon jet speed)
7. `orographic_flux`: 9.51% (Perpendicular mechanical ascent parameter)
8. `elevation_m`: 7.51% (Station altitude)
9. `regime_code`: 1.94% (Categorical class)
(Sum: 100.01%, within verified aggregate rounding bound 9 * 0.005 = 0.045%)

---

### 5. FRONTEND OPERATIONAL DASHBOARD

We built an operational Web 2.0 institutional portal at `/sih26080` in Next.js 14 containing 13 interactive screens:
- Tab 1 (`playground`): Operational Sandbox with sliders for raw rainfall, wind, and elevation, demonstrating live Stage 1 and Stage 2 corrections and dispatching CAP 1.2 alerts.
- Tab 2 (`spatial_gis`): Interactive 324-point 2D domain grid over Maharashtra with terrain filters and Somali Jet wind vectors, toggling between Observed Ground Truth, Raw ECMWF, RQDM, and Absolute Error.
- Tab 3 (`deluge_forensics`): Case-study forensics for extreme episodes (Mahabaleshwar July 2024, Wayanad disaster) with live siren triggers and CAP 1.2 XML output.
- Tab 4 (`district_matrix`): Complete 2x2 contingency table (H, M, Fa, C) with interactive threshold selectors and skill score gauges.
- Tab 5 (`ablation`): Gate A vs Gate B progressive ablation study demonstrating zero data leakage.
- Tab 6 (`dashboard`): Master JJAS 2024 benchmark with 1,000-replicate bootstrap 95% confidence intervals.
- Tab 7 (`probabilistic`): 10-decile reliability diagram, sharpness histogram, and Brier Skill Score decomposition.
- Tab 8 (`lead_time`): T+24h, T+48h, and T+72h lead-time skill degradation curves.
- Tab 9 (`orography`): Interactive Western Ghats elevation transect SVG (Arabian Sea -> Konkan -> Crest -> Pune), LightGBM feature importance meters, and multi-scale Fractions Skill Score.
- Tab 10 (`synoptic`): Rajeevan et al. (2010) CMZ anomaly time-series with Active/Break spell color coding.
- Tab 11 (`factsheet`): Complete cryptographic provenance with SHA-256 hashes, NetCDF metadata, and license attribution.
- Tab 12 (`limitations`): Honest scientific boundary disclosure (tail extrapolation, Coastal Trough zero-sample constraint, Stage 1 vs Stage 2 trade-offs).
- Tab 13 (`defense`): Institutional jury defense dossier with expected questions and answers for MoES/NCMRWF/IMD evaluators.

---

### 6. QUESTIONS FOR CLAUDE (EVALUATE & FACT-CHECK)

Please provide a detailed, critical, and rigorous evaluation addressing the following 4 core areas:

#### Question 1: Mathematical & Equation Fact-Check
1. Check each of our equations (Z_effective, RQDM piecewise inversion with monotonic tie policy, continuous capped-slope tail extrapolation, thin-strata shrinkage, mechanical orographic uplift distinctions between local gradient flow A and fixed-ridge proxy B, and heteroscedastic erfc survival probability). Are they mathematically sound, dimensionally homogeneous, and free of algebraic flaws?
2. In extreme tail extrapolation, we replaced unconstrained multiplicative extrapolation with a continuous capped-slope tail (FIXED_CAP = 3.0, DENOM_FLOOR = 0.10, multiplier_cap = min(3.0, ratio99)). Does this adequately control explosive tail inflation during monsoon cloudbursts while preserving endpoint continuity?
3. For probabilistic exceedance P(Rain >= Threshold), we utilized a Gaussian survival function (erfc) with heteroscedastic spread sigma_R. We identified that at y = 5 mm, ACTIVE assigns 15.87% and COASTAL assigns 20.23% to negative rainfall. Given this material negative support, how should we plan the transition to a Zero-Adjusted Gamma (ZAG) or censored log-normal distribution?

#### Question 2: Synoptic & Physical Meteorological Authenticity
1. Does our operational effective anomaly formula `Z_effective(D) = 0.35 * Z_obs(D-2) + 0.35 * Z_obs(D-1) + 0.30 * Z_NWP(D)` hold physical validity as an operational proxy for synoptic active/break phases? How will an IMD/NCMRWF/IITM scientist evaluate this weighting, and what refinements would they suggest?
2. In Stage 2 LightGBM, `dist_coast_km` (19.16%), `wind_v_850` (13.82%), and `orographic_flux` (9.51%) dominate the feature importance. Does this attribution convincingly demonstrate that the tree ensemble has learned physical Somali Jet orographic forcing rather than memorizing local station noise?
3. We observed that in JJAS 2024, no days triggered the pure `COASTAL_OFFSHORE_TROUGH` regime criteria because active Bay of Bengal low-pressure systems dominated the classification. Is our transparent reporting of this limitation scientifically credible?

#### Question 3: Alignment with MoES Expectations for SIH26080
1. What was the ultimate objective that MoES and NCMRWF envisioned for Problem Statement SIH26080 (*Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts*)?
2. Did we solve it in a way that will genuinely impress government atmospheric scientists? Contrast our approach against typical hackathon entries (e.g., black-box deep learning like U-Nets or ConvLSTMs that often ignore boundary physics, hallucinate rainfall, and fail during operational runtime).
3. The Classic Post-Processing Trade-Off: Stage 1 RQDM completely fixes the frequency bias (0.59 -> 1.00) and maximizes heavy-rain detection (POD = 30.3%, ETS = 0.168), but leaves RMSE around 18.7 mm. Conversely, Stage 2 LightGBM cuts continuous RMSE to 15.1 mm and slashes False Alarms (FAR = 42.9%), but suppresses the tail (Frequency Bias drops to 0.24). How should we present this dual-model behavior to the jury to demonstrate deep statistical maturity rather than a pipeline defect?
4. What are the top 2-3 toughest scientific questions an IMD jury panel will challenge us with during the viva/defense, and what are the exact winning answers?

#### Question 4: Recommendations for Changes & Next Steps
1. What are 3 to 5 concrete changes, visual upgrades, or methodological refinements you recommend we implement before the final jury presentation?
2. Are there specific diagnostic diagrams (e.g., Murphy-Winkler joint distribution decomposition, rank histograms) that would strengthen our presentation?

---

### 7. VERIFICATION SOURCES & LITERATURE
Please anchor your evaluation in authoritative peer-reviewed literature, including:
- Rajeevan, M., Gadgil, S., & Bhate, J. (2010): "Active and break spells of the Indian summer monsoon", Journal of Earth System Science, 119(3), 229–247.
- Roberts, N. M., & Lean, H. W. (2008): "Scale-selective verification of rainfall accumulations from high-resolution NWP with the Fractions Skill Score", Monthly Weather Review, 136(1), 78–97.
- Cannon, A. J., Sobie, S. R., & Murdock, T. Q. (2015): "Bias correction of GCM precipitation by quantile mapping: How well do methods preserve changes in quantiles and extremes?", Journal of Climate, 28(17), 6938–6959.
- Themeßl, M. J., Gobiet, A., & Heinrich, G. (2012): "Empirical-statistical downscaling and error correction of regional climate models", Climatic Change, 112(2), 449–468.
- Pai, D. S., et al. (2014): "Development of a new high spatial resolution (0.25° × 0.25°) long period (1901–2010) daily gridded rainfall data set over India and its comparison with existing data sets", Mausam, 65(1), 1–18.
- Smith, R. B. (1979): "The influence of mountains on the atmosphere", Advances in Geophysics, 21, 87–230.
- Grossman, R. L., & Durran, D. R. (1984): "Interaction of low-level flow with the Western Ghats Mountains and offshore convection in the summer monsoon", Monthly Weather Review, 112(1), 158–172.
- Gneiting, T., & Katzfuss, M. (2014): "Probabilistic forecasting", Annual Review of Statistics and Its Application, 1, 125–151.
- World Meteorological Organization (WMO-No. 1150): "Guidelines on the Verification of Public Weather Forecasts", Geneva.
- ECMWF IFS Documentation (Part IV: Physical Processes): Subgrid-scale orographic drag and convection parameterization.

Please cite any other credible, peer-reviewed atmospheric science, numerical weather prediction, or statistical downscaling publications you find relevant.
```

---

## 5. FRONTEND UI SCREEN ARCHITECTURE (13 OPERATIONAL TABS)

The web dashboard is fully implemented in `app/sih26080/page.tsx` (3,331 lines of TypeScript and React with zero hardcoded metric literals):

1. **Tab 1: Mission Control Sandbox (`playground`)**
   - Interactive parameter sliders for raw rainfall, Somali Jet wind vector, and station elevation.
   - Dynamic stage-by-stage calibration hyetograph.
   - Live civil defense siren and emergency CAP 1.2 XML dispatch trigger.
2. **Tab 2: 2D Spatial GIS Domain Grid (`spatial_gis`)**
   - 324-cell interactive canvas representing the Maharashtra & Western Ghats domain.
   - Layer toggles: Ground Truth Observation vs Raw ECMWF vs Regime RQDM vs Absolute Error ($|\text{RQDM} - \text{Obs}|$).
   - Point inspector displaying elevation, coastal distance, and Somali Jet wind arrows.
3. **Tab 3: Deluge Forensics & Civil Defense (`deluge_forensics`)**
   - Forensic analysis of extreme events (Mahabaleshwar July 2024 deluge, Wayanad landslide episode).
   - Audio alert siren synthesizer and WMO/NDMA CAP 1.2 payload inspection.
4. **Tab 4: Categorical 2×2 Contingency Matrix (`district_matrix`)**
   - Full 2×2 matrix ($H, M, Fa, C$) with dynamic threshold selectors (64.5 mm, 115.6 mm, 204.5 mm).
   - Quantitative gauges for POD, FAR, CSI, ETS, and Frequency Bias.
5. **Tab 5: Progressive Ablation Study (`ablation`)**
   - Systematic ablation from Raw NWP $\to$ Spatial Smoothing $\to$ Global EQM $\to$ Regime RQDM $\to$ LightGBM Spatial Corrector.
   - Strict audit verification of zero data leakage.
6. **Tab 6: JJAS 2024 Master Benchmark Dashboard (`dashboard`)**
   - Full 38,880 point-day measured results across all models.
   - 1,000-replicate Day-Block Bootstrap 95% confidence intervals.
7. **Tab 7: Probabilistic Reliability & Brier Skill (`probabilistic`)**
   - 10-decile reliability curve vs 1:1 diagonal.
   - Sharpness sample distribution histogram.
   - Brier Score decomposition ($\text{BS}_{\text{raw}} = 0.0254$ vs $\text{BS}_{\text{rqdm}} = 0.0253$).
8. **Tab 8: Lead-Time Skill Degradation (`lead_time`)**
   - Day-1 ($T+24\text{h}$), Day-2 ($T+48\text{h}$), and Day-3 ($T+72\text{h}$) performance tracks.
   - RMSE growth and ETS decay dynamics.
9. **Tab 9: Western Ghats Orography & Spatial Skill (`orography`)**
   - Interactive elevation transect SVG (Arabian Sea $\to$ Konkan $\to$ Crest $\to$ Pune).
   - LightGBM physical feature importance attribution meters.
   - Scale-Selective Fractions Skill Score (FSS) at 55 km, 165 km, and 275 km.
10. **Tab 10: Synoptic Regimes & CMZ Anomaly Cycle (`synoptic`)**
    - Active vs Break spell classification timeline following Rajeevan et al. (2010).
    - Anomaly $Z_{\text{CMZ}}$ time-series across all 120 days of JJAS 2024.
11. **Tab 11: Data Provenance & Lineage Factsheet (`factsheet`)**
    - SHA-256 cryptographic hashes for observation and model forecast files.
    - NetCDF4 / Parquet file schemas and open-data license attribution.
12. **Tab 12: Methodological Boundaries & Limitations (`limitations`)**
    - Transparent documentation of extreme tail extrapolation assumptions.
    - Zero-sample Coastal Trough regime explanation.
    - Honest discussion of the Stage 1 vs Stage 2 bias-RMSE trade-off.
13. **Tab 13: Jury Defense Dossier (`defense`)**
    - Anticipated jury questions and comprehensive answers for MoES / NCMRWF evaluators.
    - Production deployment roadmap (Docker, NCMRWF Mihir/Pratyush supercomputers, 11.4 ms CPU latency).

---

## 6. DATA LINEAGE, PROVENANCE HASHES & TEST SUITE VERIFICATIONS

### Data Lineage Table
* **IMD 0.25° Gridded Rainfall Observation:**
  * File: `data/raw/imd/RF25_ind2024_rfp25.nc`
  * Product: Pai et al. (2014) National Climate Centre Analysis
  * SHA-256: `1ef02aeba5694dbb57a6cca23a3c2cc11740affb185137c1eacbeab59893228a`
  * Size: 25.5 MB (366 days, 135 lons $\times$ 129 lats, float32)
* **ECMWF IFS 0.25° HRES Multi-Lead Forecast Archive:**
  * File: `data/cache/openmeteo_ecmwf_jjas2024.parquet`
  * Source: Open-Meteo Previous Runs API (CC BY 4.0)
  * SHA-256: `5230553914e4751aa512097382e1577b7c8bc373280fc843e69e52d146e975a1`
  * Coverage: 39,528 point-days (100.0% non-null)

### Automated Verification Test Evidence
* **Leakage Canary Verification (`test_leakage_canaries.py`)**:
  * Canary A (Day D Observation Invariance): PASSED (0.000s)
  * Canary B (Purged Block Cross-Validation): PASSED (0.015s)
  * Canary C (Strict Train-Only Quantile Fitting): PASSED (0.016s)
* **Zero Synthetic Data in Pipeline (`test_no_synthetic_in_pipeline.py`)**:
  * Verified zero synthetic generators in the benchmark calculation path: PASSED
* **Frontend Metric Literals Audit (`test_no_frontend_metric_literals.py`)**:
  * Verified that all metrics displayed in `app/sih26080/page.tsx` are dynamically bound: PASSED (14 tests passed)
