# SIH26080: Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts

Official Machine Learning & Scientific Pipeline Codebase for **Team ClaudeMaxDedo** (Smart India Hackathon 2026).

[![SIH 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in/)
[![Problem Statement ID](https://img.shields.io/badge/Problem%20Statement-SIH26080-emerald.svg)](https://sih-2026-portfolio-two.vercel.app/sih26080)
[![Ministry](https://img.shields.io/badge/Ministry-MoES%20%2F%20NCMRWF%20%26%20IMD-blueviolet.svg)](https://moes.gov.in/)
[![Live Evaluator Portal](https://img.shields.io/badge/Live%20Portal-Next.js%2014-success.svg)](https://sih-2026-portfolio-two.vercel.app/sih26080)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab.svg)](https://www.python.org/)
[![Inference Latency](https://img.shields.io/badge/Single--CPU%20Latency-11.4ms-green.svg)](#-computational-performance)

---

## 🌐 Live Evaluator Portal & Demo

* **Live Evaluator Application (13 Interactive Screens)**: **[https://sih-2026-portfolio-two.vercel.app/sih26080](https://sih-2026-portfolio-two.vercel.app/sih26080)**
* **Portfolio Gateway Directory**: **[https://sih-2026-portfolio-two.vercel.app](https://sih-2026-portfolio-two.vercel.app)**
* **Repository Root**: [`github.com/lohitakshcodes/claudemaxdedo-sih2026`](https://github.com/lohitakshcodes/claudemaxdedo-sih2026)

---

## 📌 Problem Formulation & Scientific Motivation

Operational Numerical Weather Prediction (NWP) models (e.g., ECMWF IFS 0.25° HRES, GFS, NCUM) exhibit recurring systematic errors across the Indian subcontinent during the Southwest Monsoon (JJAS):
* **Western Ghats Orographic Dry Bias**: Over mountain escarpments (e.g., Mahabaleshwar, Konkan coastline), raw NWP underestimates heavy rainfall ($\ge 64.5$ mm/day) by over 40% (Frequency Bias = 0.586, missing 81.7% of deluge events).
* **Convective Misplacement**: Spatial double-penalty displacement leads to high False Alarm Ratios (68.8%) and depressed Critical Success Indices (CSI = 0.131).
* **Synoptic Non-Stationarity**: Global quantile mapping fails because error distributions invert between Active (heavy moisture convergence) and Break (suppressed central rain, spurious coastal storms) monsoon phases.

### The 2-Stage Zero-Leakage Architecture
To overcome these limitations, we designed a physically conditioned, two-stage post-processing architecture:

```
[Raw NWP: ECMWF IFS / GFS / NCUM Grid]
                 │
                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ STAGE 1: Synoptic Regime Classifier & Non-Parametric RQDM    │
  │ • Core Monsoon Zone (CMZ: 18°-25°N, 65°-88°E) Anomaly       │
  │ • Zero-Leakage Causal Formula: Z_eff(D) from D-2, D-1 & D   │
  │ • 4 Regimes: Active, Break, Coastal Trough, Normal           │
  │ • 100-Quantile Empirical Inversion per Regime Stratum       │
  │ • Capped-Slope Tail Parameterization for Out-of-Sample Spells│
  │ • Thin-Strata Regularization Shrinkage (N < 30)             │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 Regime-Calibrated Rainfall (y_RQDM)
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ STAGE 2: Topographic & Low-Level Jet LightGBM Corrector     │
  │ • Fits Residual Error: Delta = Obs - y_RQDM                  │
  │ • Robust L1 Loss (MAE) preventing heavy-tail overfitting    │
  │ • 9 Physical Drivers: Somali Jet (u850, v850),              │
  │   Mechanical Orographic Uplift Phi_oro = V_850 · grad(h),   │
  │   Coast Distance, Elevation MSL, Z_eff Anomaly, Regime Code │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
             Corrected Point Rainfall & Attributions
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ PROBABILISTIC EXCEEDANCE ENGINE & EARLY WARNING DISPATCHER  │
  │ • Heteroscedastic Survival Probabilities P(Rain >= T) via erfc
  │ • IMD 4-Tier Warning Matrix (Moderate, Heavy, Very Heavy)   │
  │ • Automated WMO / NDMA CAP 1.2 XML Siren Payload Generator  │
  └─────────────────────────────────────────────────────────────┘
```

---

## 🔬 Mathematical Formulations

### 1. Synoptic Monsoon Regime Classification (Zero Leakage)
Following **Rajeevan et al. (2010)**, the standardized precipitation anomaly across the Core Monsoon Zone (CMZ: $18^\circ\text{N}\text{--}25^\circ\text{N}, 65^\circ\text{E}\text{--}88^\circ\text{E}$) is:

$$Z_{\text{CMZ}}(t) = \frac{R_{\text{CMZ}}(t) - \mu_{\text{clim}}(t)}{\sigma_{\text{clim}}(t)}$$

At operational issuance (05:30 IST on Day $D$), Day $D$ observations do not exist. To prevent data leakage:
$$Z_{\text{eff}}(D) = 0.35 \cdot Z_{\text{obs}}(D-2) + 0.35 \cdot Z_{\text{obs}}(D-1) + 0.30 \cdot Z_{\text{NWP}}(D)$$

**Classification Logic**:
* **`ACTIVE_MONSOON`**: $Z_{\text{eff}} \ge +1.00$ (or $Z_{\text{eff}} \ge +0.50$ with active Bay depression).
* **`BREAK_MONSOON`**: $Z_{\text{eff}} \le -1.00$ (or $Z_{\text{obs}}(D-1) \le -0.80$ and $Z_{\text{NWP}} \le -1.00$).
* **`COASTAL_OFFSHORE_TROUGH`**: $|\vec{V}_{850}^{\text{coast}}| \ge 25.0\text{ knots } (12.86\text{ m/s})$ and $Z_{\text{eff}} \ge -0.50$.
* **`NORMAL_TRANSITION`**: Baseline transitional state ($-1.00 < Z_{\text{eff}} < +1.00$).

### 2. Regime-Conditioned Quantile Mapping (RQDM)
Empirical cumulative distribution functions (eCDFs) of model forecasts $F_{m|k}(x)$ and IMD observations $F_{o|k}(y)$ are inverted:

$$\hat{y}_{\text{RQDM}} = Q_{o|k}\left(F_{m|k}(x_{\text{raw}})\right) = F_{o|k}^{-1}\left(F_{m|k}(x_{\text{raw}})\right)$$

* Monotonicity enforced: $q_{j+1} = \max(q_{j+1}, q_j)$.
* Tail continuity: For $x_{\text{raw}} > a = q_{m, 100}^k$:
  $$\hat{y} = b + \min\left(\frac{b}{a}, 3.0\right) \cdot (x_{\text{raw}} - a)$$
  guaranteeing continuity at the training boundary without step-function cliff drops.

### 3. Stage 2 LightGBM Corrector & Mechanical Orographic Uplift
Residual error $\Delta = y_{\text{obs}} - \hat{y}_{\text{RQDM}}$ is learned using LightGBM with L1 loss (MAE).
Key physical features:
* Somali Low-Level Jet (LLJ): Zonal ($u_{850}$) and meridional ($v_{850}$) winds.
* Mechanical Orographic Uplift: $\Phi_{\text{oro}} = \vec{V}_{850} \cdot \nabla h = u_{850} \frac{\partial h}{\partial x} + v_{850} \frac{\partial h}{\partial y}$.
* Topography: Elevation MSL ($h$), slope, aspect, distance to coast ($d_{\text{coast}}$).

---

## 📊 Measured Benchmark Results (JJAS 2024 Verified)

Evaluated across **38,880 point-days** (324 gridded points $\times$ 120 days) on real **JJAS 2024 Indian Summer Monsoon data** under 5-Fold Purged Block Cross-Validation (5-day blackout buffer):

| Pipeline Stage | Continuous RMSE (mm) | Continuous MAE (mm) | Frequency BIAS | POD (Hits/Obs) | FAR (Fa/Fcst) | CSI (Threat Score) | ETS [95% CI] | FSS (275 km) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Raw ECMWF IFS (0.25°)** | 17.19 | 9.25 | 0.586 | 0.183 (150/819) | 0.688 (330/480) | 0.131 | 0.123 [0.104, 0.143] | 0.65 |
| **Negative Control (Smoothed)** | 16.97 | 9.21 | 0.547 | 0.164 (134/819) | 0.701 (314/448) | 0.118 | 0.111 [0.093, 0.130] | 0.62 |
| **Global Quantile Mapping (EQM)** | 18.05 | 8.60 | 0.980 | 0.295 (242/819) | 0.699 (561/803) | 0.175 | 0.165 [0.145, 0.184] | 0.72 |
| **Stage 1 Regime RQDM (Proposed)** | 18.69 | 8.77 | **1.000** | **0.303** (248/819) | 0.697 (571/819) | **0.178** | **0.168** [0.149, 0.188] | 0.74 |
| **Stage 2 LightGBM Corrector** | **15.12** | **6.64** | 0.242 | 0.138 (113/819) | **0.429** (85/198) | 0.125 | 0.121 [0.100, 0.145] | **0.77** |

---

## ⚡ Computational Performance

* **Inference Latency**: **11.4 ms** on a standard single-core x86 CPU.
* **GPU Requirement**: **Zero GPU dependency**—runs entirely on commodity CPU infrastructure.
* **Model Serialization**: Lookup tables and LightGBM model footprint **< 4.2 MB**.

---

## 💻 Local Execution & Benchmark Reproduction

```bash
# Setup Python 3.11 virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install numpy pandas scipy lightgbm scikit-learn

# Run zero-leakage canary verification tests
python3 sih26080/verification/test_leakage_canaries.py

# Run full benchmark reproduction pipeline
python3 sih26080/pipeline/reproduce_benchmark.py
```

---

## 📁 Codebase Structure

```
sih26080/
├── models/
│   ├── regime_classifier.py     # Rajeevan et al. (2010) CMZ anomaly classifier
│   ├── quantile_mapper.py       # Non-parametric RQDM with capped-slope tail
│   └── lgbm_corrector.py        # Stage 2 residual LightGBM with 850 hPa LLJ features
├── pipeline/
│   ├── reproduce_benchmark.py   # 5-fold purged block CV benchmark pipeline
│   └── evaluate_metrics.py      # Continuous (RMSE/MAE) & categorical (POD/FAR/CSI/ETS) metrics
├── verification/
│   ├── test_leakage_canaries.py # Automated temporal and spatial zero-leakage tests
│   └── test_data_contract_and_audits.py # Lineage & schema validation tests
├── data/
│   ├── demo_cases.json          # Historical flood episode test cases (e.g. Mahabaleshwar)
│   ├── gate_a_results.json      # Gate A empirical validation metrics
│   └── jjas_2024_master_benchmark.json # 38,880 point-day benchmark results
└── README.md                    # Project documentation
```

---

## 👥 Team ClaudeMaxDedo

- **Shreya Deshpande** (Team Leader)
- **Lohitaksh Bisen**
- **Tanvi Hardas**
- **Anuj Bhure**
- **Siddharth Gupta**
- **Arush Sinha**

---

*Smart India Hackathon 2026 &bull; Official Submission Codebase &bull; Ministry of Earth Sciences (MoES) / NCMRWF & IMD (SIH26080) &bull; Team ClaudeMaxDedo*
