# SIH26080: Mathematical Specification, Scientific Architecture & Peer-Review Dossier

**Target Reviewer:** Claude (Atmospheric Science, Numerical Weather Prediction & Machine Learning Evaluator)  
**Problem Statement:** SIH26080 (Software) — *Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts*  
**Institutional Stakeholders:** Ministry of Earth Sciences (MoES), NCMRWF, India Meteorological Department (IMD)  
**Dataset Grounding:** Real JJAS 2024 Indian Summer Monsoon (June 1 – September 30, 2024; 120 days, 38,880 point-days)  
**Domain:** 324 gridded points covering Maharashtra Corridor, Western Ghats orographic barrier, and Core Monsoon Zone (CMZ)  
**Live Application Target:** `http://localhost:3000/sih26080` (Next.js 14 App Router, Zero GPU dependency, 11.4ms single-CPU latency)  

---

## Document Overview & Screen/UI Reference Legend
This document provides the definitive mathematical formulations, physical equations, operational screen/screenshot references, empirical benchmark outcomes, and targeted review queries for **Claude**.

### UI Screen / Screenshot ("ss") Location Mapping
Every equation in this dossier is mapped to its exact visual location on the live `/sih26080` interface:
* **[Screen SS-1] Tab 1 (`playground`)**: Operational Mission Control & Live Sandbox (Sliders, Thresholds, Hyetograph).
* **[Screen SS-2] Tab 2 (`spatial_gis`)**: 2D Spatial GIS Domain Grid & Station Telemetry (Terrain Stratum Filter, LLJ Vectors).
* **[Screen SS-3] Tab 3 (`deluge_forensics`)**: Forensic Episodes & Civil Defense Dispatcher (Mahabaleshwar, Siren, CAP 1.2 XML).
* **[Screen SS-4] Tab 4 (`district_matrix`)**: Categorical 2×2 Contingency Matrix ($H, M, Fa, C$), POD, FAR, CSI, ETS.
* **[Screen SS-5] Tab 5 (`ablation`)**: Gate A vs Gate B Ablation Study (Zero Leakage, Negative Control, RQDM, LightGBM).
* **[Screen SS-6] Tab 6 (`dashboard`)**: JJAS 2024 Master Benchmark (38,880 point-days, 1,000-replicate Bootstrap 95% CIs).
* **[Screen SS-7] Tab 7 (`probabilistic`)**: Probabilistic Reliability, Brier Score, BSS, and Reliability Curves.
* **[Screen SS-8] Tab 8 (`lead_time`)**: Lead-Time Skill Degradation (Day-1 $T+24\text{h}$, Day-2 $T+48\text{h}$, Day-3 $T+72\text{h}$).
* **[Screen SS-9] Tab 9 (`orography`)**: Gate B Spatial Orography, Western Ghats Cross-Section, LightGBM Feature Importance & FSS.
* **[Screen SS-10] Tab 10 (`synoptic`)**: Synoptic Regimes, CMZ Cycle & Rajeevan et al. (2010) Standardized Anomaly.
* **[Screen SS-11] Tab 11 (`factsheet`)**: Verified Provenance, SHA-256 Hashes & NetCDF/Parquet Data Lineage.
* **[Screen SS-12] Tab 12 (`limitations`)**: Methodological Boundaries, Extreme Tail Extrapolation & Negative Results.
* **[Screen SS-13] Tab 13 (`defense`)**: Jury Defense Dossier, Stakeholder Alignment & Operational Deployment Plan.

---

## 1. Mathematical Formulations & Physical Equations

### 1.1 Synoptic Monsoon Regime Classification via Core Monsoon Zone (CMZ) Anomaly

#### Mathematical Formulation
Following Rajeevan et al. (2010), synoptic weather regimes are partitioned deterministically using the area-weighted standardized precipitation anomaly over the Core Monsoon Zone (CMZ: $18^\circ\text{N}\text{--}25^\circ\text{N}, 65^\circ\text{E}\text{--}88^\circ\text{E}$):

$$Z_{\text{CMZ}}(t) = \frac{R_{\text{CMZ}}(t) - \mu_{\text{clim}}(t)}{\sigma_{\text{clim}}(t)}$$

Where:
* $R_{\text{CMZ}}(t)$ is the daily area-averaged rainfall across the CMZ on day $t$.
* $\mu_{\text{clim}}(t) = 8.20\text{ mm/day}$ is the 30-year daily climatological normal from the IMD 1991–2020 baseline.
* $\sigma_{\text{clim}}(t) = 2.80\text{ mm/day}$ is the 30-year daily standard deviation.

#### Operational Zero-Leakage Anomaly Formulation
At operational forecast issuance (Day $D$ 05:30 IST), Day $D$ observations do not exist. To guarantee zero data leakage, an effective operational anomaly $Z_{\text{eff}}(D)$ is computed using antecedent observations up to Day $D-1$ and the Day $D$ NWP model prediction:

$$Z_{\text{eff}}(D) = 0.35 \cdot Z_{\text{obs}}(D-2) + 0.35 \cdot Z_{\text{obs}}(D-1) + 0.30 \cdot Z_{\text{NWP}}(D)$$

#### Partitioning Criteria
$$\text{Regime}(D) = \begin{cases} 
\text{ACTIVE\_MONSOON} & \text{if } Z_{\text{eff}} \ge +1.00 \text{ or } (Z_{\text{eff}} \ge +0.50 \text{ with Bay Depression}) \\
\text{BREAK\_MONSOON} & \text{if } Z_{\text{eff}} \le -1.00 \text{ or } (Z_{\text{obs}}(D-1) \le -0.80 \text{ and } Z_{\text{NWP}} \le -1.00) \\
\text{COASTAL\_OFFSHORE\_TROUGH} & \text{if } |\vec{V}_{850}^{\text{coast}}| \ge 25.0\text{ knots } (12.86\text{ m/s}) \text{ and } Z_{\text{eff}} \ge -0.50 \\
\text{NORMAL\_TRANSITION} & \text{otherwise} (-1.00 < Z_{\text{eff}} < +1.00)
\end{cases}$$

* **Screen Reference:** **[Screen SS-10] Tab 9 (`synoptic`)** at `app/sih26080/page.tsx:L3022-L3080` (Equation callout box and Active/Break partition metrics) and **[Screen SS-1] Tab 1 (`playground`)** at `app/sih26080/page.tsx:L830-L875`.
* **Backend Source Code:** `sih26080/models/regime_classifier.py:L40-L105` and `sih26080/pipeline/reproduce_benchmark.py:L21-L27`.
* **Literature Reference:** Rajeevan, M., Gadgil, S., & Bhate, J. (2010), *Journal of Earth System Science*, 119(3), 229–247.

---

### 1.2 Non-Parametric Regime-Conditioned Quantile Mapping (RQDM)

#### Mathematical Formulation
For any gridded station coordinate $(x, y)$ and synoptic regime $k \in \{\text{Active}, \text{Break}, \text{Coastal}, \text{Normal}\}$, the empirical cumulative distribution functions (eCDFs) of numerical model forecasts $F_{m|k}(x)$ and IMD observations $F_{o|k}(y)$ are inverted:

$$\hat{y}_{\text{RQDM}} = Q_{o|k}\left(F_{m|k}(x_{\text{raw}})\right) = F_{o|k}^{-1}\left(F_{m|k}(x_{\text{raw}})\right)$$

Where probability $p$ is obtained through piecewise linear interpolation across $M = 100$ quantiles:

$$p = F_{m|k}(x_{\text{raw}}) = p_j + \frac{x_{\text{raw}} - q_{m, j}^k}{q_{m, j+1}^k - q_{m, j}^k} (p_{j+1} - p_j), \quad x_{\text{raw}} \in [q_{m, j}^k, q_{m, j+1}^k]$$

Monotonicity is enforced by cumulative maximum accumulation:
$$q_{m, j+1}^k = \max\left(q_{m, j+1}^k, q_{m, j}^k\right), \quad q_{o, j+1}^k = \max\left(q_{o, j+1}^k, q_{o, j}^k\right)$$

#### Extreme Tail Parameterization (Continuous Capped-Slope Tail)
For raw forecast values exceeding the maximum quantile in the training distribution ($x_{\text{raw}} > a = q_{m, 100}^k$):

$$\hat{y}_{\text{RQDM}} = \begin{cases}
b + \text{tail\_slope} \cdot (x_{\text{raw}} - a) & \text{if } a > 0.10\text{ mm} \\
x_{\text{raw}} + (b - a) & \text{otherwise}
\end{cases}$$

Where $b = q_{o, 100}^k$, $\text{multiplier\_cap} = \min\left(3.0, \frac{q_{o, 99}^k}{q_{m, 99}^k}\right)$ (when $q_{m, 99}^k > 0.10\text{ mm}$), and $\text{tail\_slope} = \min\left(\frac{b}{a}, \text{multiplier\_cap}\right)$.  
*Boundary Continuity Guarantee:* $\lim_{x_{\text{raw}} \to a^+} \hat{y}_{\text{RQDM}} = b$, preventing downward jump discontinuities at the training boundary.

#### Thin Strata Shrinkage Regularization
When sample count in regime stratum $N_k < 30$, the estimator shrinks toward the global empirical quantile transfer function $\hat{y}_{\text{global}}$:

$$\hat{y}_{\text{blended}} = w_k \cdot \hat{y}_{\text{RQDM}} + (1 - w_k) \cdot \hat{y}_{\text{global}}, \quad w_k = \min\left(1.0, \frac{N_k}{30.0}\right)$$

Physical boundary enforcement:
$$\hat{y}_{\text{final}} = \max\left(0.0, \hat{y}_{\text{blended}}\right)$$

* **Screen Reference:** **[Screen SS-5] Tab 5 (`ablation`)** at `app/sih26080/page.tsx:L1936-L2005` (RQDM vs Global EQM contrast) and **[Screen SS-6] Tab 6 (`dashboard`)** at `app/sih26080/page.tsx:L2006-L2150`.
* **Backend Source Code:** `sih26080/models/quantile_mapper.py:L18-L125`.
* **Literature Reference:** Themeßl, M. J., Gobiet, A., & Heinrich, G. (2012), *Climatic Change*, 112(2), 449–468; Cannon, A. J., et al. (2015), *Journal of Climate*, 28(17), 6938–6959.

---

### 1.3 Heteroscedastic Calibrated Exceedance Probability Engine

#### Mathematical Formulation
State Disaster Management Authorities (SDMAs) require probabilistic exceedance outputs for IMD warning criteria ($T \in \{64.5\text{ mm (Heavy)}, 115.6\text{ mm (Very Heavy)}, 204.5\text{ mm (Extremely Heavy)}\}$). The conditional exceedance probability is formulated via the Gaussian survival function conditioned on regime-dependent residual dispersion:

$$P(R \ge T \mid \hat{y}, \text{Regime}) = 1 - \Phi\left(\frac{T - \hat{y}}{\sigma_R}\right) = \frac{1}{2} \operatorname{erfc}\left(\frac{T - \hat{y}}{\sigma_R \sqrt{2}}\right)$$

Where $\operatorname{erfc}(z) = \frac{2}{\sqrt{\pi}} \int_z^\infty e^{-t^2} \, dt$ is the complementary error function, and residual spread $\sigma_R$ scales heteroscedastically:

$$\sigma_R = \begin{cases}
\max\left(5.00, 0.22 \cdot \hat{y}\right) & \text{if Regime} = \text{ACTIVE\_MONSOON} \\
\max\left(1.50, 0.15 \cdot \hat{y}\right) & \text{if Regime} = \text{BREAK\_MONSOON} \\
\max\left(6.00, 0.25 \cdot \hat{y}\right) & \text{if Regime} = \text{COASTAL\_OFFSHORE\_TROUGH} \\
\max\left(3.00, 0.20 \cdot \hat{y}\right) & \text{if Regime} = \text{NORMAL\_TRANSITION}
\end{cases}$$

#### Gaussian Negative-Support Limitation Table
Because Gaussian support extends to $-\infty$, probability assigned to unphysical negative rainfall is $P(R < 0) = \frac{1}{2}\operatorname{erfc}\left(\frac{\hat{y}}{\sigma_R \sqrt{2}}\right)$:

| Regime | $y = 5\text{ mm}$ | $y = 15\text{ mm}$ | $y = 30\text{ mm}$ | $y = 60\text{ mm}$ |
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
> - Diagnostic test: `P_negative > 0.05` dynamically alerts on excessive negative support.

* **Screen Reference:** **[Screen SS-7] Tab 7 (`probabilistic`)** at `app/sih26080/page.tsx:L2325-L2403`, **[Screen SS-1] Tab 1 (`playground`)** at `app/sih26080/page.tsx:L910-L950`, and **[Screen SS-3] Tab 3 (`deluge_forensics`)** at `app/sih26080/page.tsx:L1705-L1740`.
* **Backend Source Code:** `sih26080/models/quantile_mapper.py:L127-L185`.
* **Literature Reference:** Gneiting, T., & Katzfuss, M. (2014), *Annual Review of Statistics and Its Application*, 1, 125–151.

---

### 1.4 Mechanical Orographic Lift & Fixed-Ridge Proxy Semantics

#### Semantic Distinction: Formula A vs Formula B
Formulas A and B are fundamentally distinct operators:
* **Formula A (Local Terrain-Gradient Flow)**:
$$\Phi_{\text{oro}} = \vec{V}_{850} \cdot \nabla h = u_{850} \frac{\partial h}{\partial x} + v_{850} \frac{\partial h}{\partial y}$$
A reaches its maximum in the local uphill slope direction.
* **Formula B (Elevation-Weighted Fixed-Ridge Proxy)**:
$$w_{\text{oro}} = E \cdot \left(- \cos(160^\circ) u_{850} + \sin(160^\circ) v_{850}\right) = E \cdot (0.9396926 u_{850} + 0.3420201 v_{850})$$
Where $E = h_{\text{elev}} / 1000.0$. Handled $u=v=0 \implies w_{\text{oro}} = 0$. B is maximized when wind is FROM $250^\circ$ (angle of attack $= 90^\circ$).  
A and B are identical for all wind vectors ONLY under conditional equivalence: $\frac{\partial h}{\partial x} = 0.9396926 E$ and $\frac{\partial h}{\partial y} = 0.3420201 E$.

* **Screen Reference:** **[Screen SS-9] Tab 8 (`orography`)** at `app/sih26080/page.tsx:L2469-L2700` (Western Ghats Transect SVG canvas across Arabian Sea $\to$ Konkan $\to$ Crest $\to$ Pune) and **[Screen SS-2] Tab 2 (`spatial_gis`)** at `app/sih26080/page.tsx:L1420-L1510`.
* **Backend Source Code:** `sih26080/models/lgbm_corrector.py:L70-L96` and `sih26080/data/spatial_case_slices.json`.
* **Literature Reference:** Smith, R. B. (1979), *The influence of mountains on the atmosphere*, Advances in Geophysics, 21, 87–230; Grossman, R. L., & Durran, D. R. (1984), *Monthly Weather Review*, 112(1), 158–172.

---

### 1.5 Stage 2 LightGBM Spatial Residual Corrector

#### Objective Function & Optimization
The spatial corrector fits residual spatial errors $\Delta = y_{\text{obs}} - \hat{y}_{\text{RQDM}}$ using gradient boosted decision trees. To prevent overfitting on convective extreme outliers, an L1 / Mean Absolute Error (MAE) objective is optimized:

$$\mathcal{L}_{L1}(\Theta) = \frac{1}{N} \sum_{i=1}^N \left| y_{\text{obs}, i} - \left(\hat{y}_{\text{RQDM}, i} + g(X_i; \Theta)\right) \right| + \lambda \sum_{j=1}^J w_j^2 + \gamma J$$

#### Input Feature Vector $X \in \mathbb{R}^9$:
$$X_i = \begin{bmatrix}
x_{\text{raw}, i} & \text{(Raw ECMWF IFS accumulated rainfall, mm)} \\
\hat{y}_{\text{RQDM}, i} & \text{(Stage 1 regime-calibrated rainfall baseline, mm)} \\
h_{\text{elev}, i} & \text{(Station elevation MSL, m)} \\
d_{\text{coast}, i} & \text{(Distance to Arabian Sea coastline, km)} \\
u_{850, i} & \text{(850 hPa zonal wind component, m/s)} \\
v_{850, i} & \text{(850 hPa meridional wind component, m/s)} \\
\Phi_{\text{oro}, i} & \text{(Perpendicular orographic flux } |\vec{V}| \times \frac{h}{1000}\text{)} \\
R_{\text{code}, i} & \text{(Categorical regime: Active=0, Break=1, Coastal=2, Normal=3)} \\
Z_{\text{CMZ}, i} & \text{(Core Monsoon Zone standardized anomaly)}
\end{bmatrix}$$

#### Hyperparameter Configuration:
* Estimators: $M = 150$, Learning Rate: $\eta = 0.05$, Num Leaves: $31$, Max Depth: $6$.
* Regularization: Subsample Ratio $= 0.80$, Feature Fraction (colsample) $= 0.80$.

#### Empirical Feature Importance Ranking (Gate B 5-Fold Cross-Validation):
1. `dist_coast_km` (Distance to Arabian Sea coast): **19.16%**
2. `wind_v_850` (Meridional low-level jet vector): **13.82%**
3. `rqdm_fcst_mm` (Stage 1 calibrated baseline): **11.32%**
4. `raw_fcst_mm` (Original NWP forecast): **11.15%**
5. `wind_u_850` (Zonal cross-peninsular transport): **10.21%**
6. `orographic_flux` (Mechanical ascent parameter $\Phi_{\text{oro}}$): **9.51%**
7. `elevation_m` (Station altitude MSL): **7.51%**
8. `lat_y` / `lon_x` (Coordinates): **11.81%**
9. `regime_code` & $Z_{\text{CMZ}}$: **3.68%**

* **Screen Reference:** **[Screen SS-9] Tab 8 (`orography`)** at `app/sih26080/page.tsx:L2705-L2780` (Feature importance bar meters) and **[Screen SS-5] Tab 5 (`ablation`)** at `app/sih26080/page.tsx:L1960-L2005`.
* **Backend Source Code:** `sih26080/models/lgbm_corrector.py:L24-L140` and `sih26080/data/gate_b_results.json`.

---

### 1.6 Verification Metrics & Skill Formulations

#### 2×2 Contingency Table Counts ($T = 64.5\text{ mm/day}$, $N = 38,880$)
* **Hits ($H$)**: $\sum \mathbb{I}(y_{\text{obs}} \ge T \land \hat{y} \ge T)$
* **Misses ($M$)**: $\sum \mathbb{I}(y_{\text{obs}} \ge T \land \hat{y} < T)$
* **False Alarms ($Fa$)**: $\sum \mathbb{I}(y_{\text{obs}} < T \land \hat{y} \ge T)$
* **Correct Negatives ($C$)**: $\sum \mathbb{I}(y_{\text{obs}} < T \land \hat{y} < T)$
* **Invariant Constraint**: $H + M + Fa + C = N$

#### Categorical Verification Equations
$$\text{POD} = \frac{H}{H + M} \quad (\text{Probability of Detection})$$

$$\text{FAR} = \frac{Fa}{H + Fa} \quad (\text{False Alarm Ratio})$$

$$\text{CSI} = \frac{H}{H + M + Fa} \quad (\text{Critical Success Index / Threat Score})$$

$$\text{Frequency Bias} = \frac{H + Fa}{H + M}$$

$$\text{ETS} = \frac{H - H_{\text{random}}}{H + M + Fa - H_{\text{random}}} \quad (\text{Equitable Threat Score / Gilbert Skill Score})$$

Where hits expected purely by random chance $H_{\text{random}}$ is given by:
$$H_{\text{random}} = \frac{(H + M)(H + Fa)}{N}$$

#### Scale-Selective Fractions Skill Score (FSS) (Roberts & Lean 2008)
For square spatial neighborhood window $n \times n$ (where $n=1$ cell $\approx 55\text{ km}$, $n=3 \approx 165\text{ km}$, $n=5 \approx 275\text{ km}$):

$$\text{FSS}_{(n)} = 1 - \frac{\text{MSE}_{(n)}}{\text{MSE}_{(n), \text{ref}}} = 1 - \frac{\frac{1}{N_x N_y} \sum_{i=1}^{N_x} \sum_{j=1}^{N_y} \left(P_{\text{fcst}, (n)}(i,j) - P_{\text{obs}, (n)}(i,j)\right)^2}{\frac{1}{N_x N_y} \sum_{i=1}^{N_x} \sum_{j=1}^{N_y} \left(P_{\text{fcst}, (n)}^2(i,j) + P_{\text{obs}, (n)}^2(i,j)\right)}$$

Target useful spatial skill criterion:
$$\text{FSS}_{\text{target}} = 0.5 + \frac{f_o}{2}, \quad \text{where } f_o = \text{base rate of threshold exceedance}$$

#### Probabilistic Reliability & Brier Skill Score
$$\text{BS} = \frac{1}{N} \sum_{i=1}^N \left(p_i - o_i\right)^2, \quad o_i \in \{0, 1\}$$

$$\text{BSS} = 1 - \frac{\text{BS}}{\text{BS}_{\text{climo}}}, \quad \text{where } \text{BS}_{\text{climo}} = \bar{o}(1 - \bar{o})$$

$$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} \left| \operatorname{conf}(B_m) - \operatorname{acc}(B_m) \right| \quad (\text{Expected Calibration Error})$$

#### Continuous Performance Metrics
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N \left(\hat{y}_i - y_{\text{obs}, i}\right)^2}$$

$$\text{MAE} = \frac{1}{N} \sum_{i=1}^N \left| \hat{y}_i - y_{\text{obs}, i} \right|$$

$$\text{Pearson } r = \frac{\sum_{i=1}^N (\hat{y}_i - \bar{\hat{y}})(y_{\text{obs}, i} - \bar{y}_{\text{obs}})}{\sqrt{\sum_{i=1}^N (\hat{y}_i - \bar{\hat{y}})^2 \sum_{i=1}^N (y_{\text{obs}, i} - \bar{y}_{\text{obs}})^2}}$$

* **Screen Reference:** **[Screen SS-4] Tab 4 (`district_matrix`)** at `app/sih26080/page.tsx:L1802-L1935`, **[Screen SS-6] Tab 6 (`dashboard`)** at `app/sih26080/page.tsx:L2006-L2150`, **[Screen SS-7] Tab 7 (`probabilistic`)** at `app/sih26080/page.tsx:L2325-L2403`, and **[Screen SS-9] Tab 8 (`orography`)** at `app/sih26080/page.tsx:L2785-L2830`.
* **Backend Source Code:** `sih26080/verification/metrics.py:L17-L140` and `sih26080/pipeline/reproduce_benchmark.py:L37-L91`.
* **Literature Reference:** Roberts, N. M., & Lean, H. W. (2008), *Monthly Weather Review*, 136(1), 78–97; Wilks, D. S. (2011), *Statistical Methods in the Atmospheric Sciences*, Academic Press.

---

### 1.7 Block Bootstrap Confidence Intervals (1,000 Day-Block Replicates)
Because daily atmospheric fields exhibit strong spatial cross-correlation and temporal persistence, naive sample bootstrapping yields artificially narrow confidence bounds. We execute a **Day-Block Bootstrap**:

$$\mathcal{D}^* = \bigcup_{b=1}^{120} \left\{ (x_{s, d_b}, y_{s, d_b}) \mid s \in \{1, \dots, 324\} \right\}, \quad d_b \sim \operatorname{Uniform}(\{1, \dots, 120\})$$

$$\text{CI}_{95\%}[\text{ETS}] = \left[ \operatorname{Percentile}_{2.5}\left(\{\text{ETS}_k^*\}_{k=1}^{1000}\right), \operatorname{Percentile}_{97.5}\left(\{\text{ETS}_k^*\}_{k=1}^{1000}\right) \right]$$

* **Screen Reference:** **[Screen SS-6] Tab 6 (`dashboard`)** at `app/sih26080/page.tsx:L2030-L2085` and **[Screen SS-4] Tab 4 (`district_matrix`)** at `app/sih26080/page.tsx:L1820-L1860`.
* **Backend Source Code:** `sih26080/pipeline/reproduce_benchmark.py:L65-L91`.

---

## 2. Empirical Benchmark Outcomes (JJAS 2024 Verified)

### Master Verification Table (38,880 Point-Days)
*All metrics read directly from measured pipeline results in `sih26080/data/results.json` and `sih26080/data/gate_b_results.json`:*

| Pipeline Model / Stage | Domain RMSE (mm) | MAE (mm) | Frequency Bias | POD (Heavy $\ge 64.5\text{mm}$) | FAR (False Alarm) | CSI (Threat Score) | ETS [95% Bootstrap CI] | FSS (55 km) | FSS (165 km) | FSS (275 km) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Raw ECMWF IFS (0.25° HRES)** | 17.19 | 9.25 | 0.586 | 0.183 (150/819) | 0.688 (330/480) | 0.131 | 0.123 [0.104, 0.143] | 0.46 | 0.58 | 0.65 |
| **Negative Control (Smoothed)** | 16.97 | 9.21 | 0.547 | 0.164 (134/819) | 0.701 (314/448) | 0.118 | 0.111 [0.093, 0.130] | 0.44 | 0.55 | 0.62 |
| **Global Quantile Mapping (EQM)** | 18.05 | 8.60 | 0.980 | 0.295 (242/819) | 0.699 (561/803) | 0.175 | 0.165 [0.145, 0.184] | 0.50 | 0.63 | 0.72 |
| **Stage 1 Regime RQDM (Proposed)** | 18.69 | 8.77 | **1.000** | **0.303** (248/819) | 0.697 (571/819) | **0.178** | **0.168** [0.149, 0.188] | 0.52 | 0.65 | 0.74 |
| **Stage 2 LightGBM Spatial Corrector** | **15.12** | **6.64** | 0.242 | 0.138 (113/819) | **0.429** (85/198) | 0.125 | 0.121 [0.100, 0.145] | **0.54** | **0.68** | **0.77** |

---

## 3. Review & Fact-Checking Requests for Claude

*Claude: Please review this dossier and provide your detailed, expert analysis on the following 4 dimensions:*

### Dimension 1: Mathematical & Equation Fact-Check
1. **Dimensional Consistency & Monotonicity**: Are the equations for $Z_{\text{eff}}$, Themeßl extreme tail scaling, thin strata shrinkage, and mechanical orographic flux $\Phi_{\text{oro}} = \vec{V}_{850} \cdot \nabla h$ dimensionally consistent and mathematically sound?
2. **Extreme Value Theory (EVT)**: In Section 1.2, is multiplicative tail scaling ($x \cdot \frac{y_{\max}}{x_{\max}}$) adequate for Indian monsoon extremes, or should an explicit Peaks-Over-Threshold (POT) Generalized Pareto Distribution (GPD) be fitted for $p > 0.95$? What are the statistical risks of each under a non-stationary climate?
3. **Probability Density Formulation**: In Section 1.3, we use a Gaussian survival function $\frac{1}{2}\operatorname{erfc}\left(\frac{T - \hat{y}}{\sigma_R \sqrt{2}}\right)$ with heteroscedastic dispersion $\sigma_R$. Given the positive skewness of precipitation, would a Zero-Adjusted Gamma (ZAG) or censored log-normal distribution yield superior reliability?

### Dimension 2: Synoptic & Physical Meteorological Authenticity
1. **Regime Index Validation**: Does the Rajeevan et al. (2010) CMZ standardized anomaly ($Z_{\text{CMZ}}$) combined with low-level wind speed provide a physically authentic representation of synoptic monsoon phases? How will an IMD / NCMRWF / IITM atmospheric scientist critique our effective anomaly formula $Z_{\text{eff}} = 0.35 Z(D-2) + 0.35 Z(D-1) + 0.30 Z_{\text{NWP}}(D)$?
2. **Feature Importance Physical Attribution**: In Stage 2 LightGBM, `dist_coast_km` (19.16%), `wind_v_850` (13.82%), and `orographic_flux` (9.51%) dominate the model. Does this physical attribution convincingly demonstrate to a meteorologist that the model is learning Somali Jet orographic ascent rather than memorizing station noise?

### Dimension 3: Final Goal Alignment for Problem Statement SIH26080
1. **The MoES Expectation**: What was the ultimate objective envisioned by the Ministry of Earth Sciences for Problem Statement SIH26080 (*Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts*)?
2. **Did We Solve It?**: Does our 2-stage hybrid pipeline (RQDM for bias/tail frequency calibration + LightGBM for spatial orography) solve the problem in a manner that will genuinely impress government atmospheric scientists?
3. **Vulnerabilities**: What are the top 2–3 scientific or methodological questions an expert IMD jury member will press us on during the viva/defense, and how should we defend them?

### Dimension 4: Strategic Recommendations for Refinement
* What are 3 to 5 concrete changes, feature additions, or visual upgrades you recommend we implement before the final jury presentation?

---

## 4. Authoritative Verification Literature

Please anchor your critique and evaluation in the following peer-reviewed atmospheric and statistical downscaling literature:
1. **Rajeevan, M., Gadgil, S., & Bhate, J. (2010)**: *Active and break spells of the Indian summer monsoon*, Journal of Earth System Science, 119(3), 229–247.
2. **Roberts, N. M., & Lean, H. W. (2008)**: *Scale-selective verification of rainfall accumulations from high-resolution NWP with the Fractions Skill Score*, Monthly Weather Review, 136(1), 78–97.
3. **Cannon, A. J., Sobie, S. R., & Murdock, T. Q. (2015)**: *Bias correction of GCM precipitation by quantile mapping: How well do methods preserve changes in quantiles and extremes?*, Journal of Climate, 28(17), 6938–6959.
4. **Themeßl, M. J., Gobiet, A., & Heinrich, G. (2012)**: *Empirical-statistical downscaling and error correction of regional climate models and its impact on the climate change signal of extreme precipitation*, Climatic Change, 112(2), 449–468.
5. **Gadgil, S. (2003)**: *The Indian monsoon and its variability*, Annual Review of Earth and Planetary Sciences, 31(1), 429–467.
6. **Smith, R. B. (1979)**: *The influence of mountains on the atmosphere*, Advances in Geophysics, 21, 87–230.
7. **World Meteorological Organization (WMO-No. 1150)**: *Guidelines on the Verification of Public Weather Forecasts*, Geneva, Switzerland.
8. **ECMWF IFS Documentation (Part IV: Physical Processes)**: *Subgrid-scale orographic drag, convection, and boundary layer moisture transport parameterization*.
