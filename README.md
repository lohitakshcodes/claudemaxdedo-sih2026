# Team ClaudeMaxDedo — Smart India Hackathon (SIH 2026)

Official dual-track submission repository for **Team ClaudeMaxDedo** at **Smart India Hackathon 2026**.

This repository hosts two independent, fully implemented, and production-grade solutions, each with its **own designated codebase, dedicated documentation, and live evaluator portal**:

1. **Flagship Meteorological Track (SIH26080)**:  
   **Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts**  
   *Ministry of Earth Sciences (MoES) / NCMRWF & India Meteorological Department (IMD)*  
   👉 [Explore SIH26080 Codebase](./sih26080) &bull; [Read SIH26080 Documentation](./sih26080/README.md) &bull; [Open Live Evaluator Portal ↗](https://sih-2026-portfolio-two.vercel.app/sih26080)

2. **Agro-Intelligence Digital Twin Track (SIH26193)**:  
   **AgriGPT / KrishiSmriti — The Farm's Second Brain & Cross-Factor Decision Engine**  
   *Ministry of Agriculture & Farmers Welfare (MoA&FW)*  
   👉 [Explore AgriGPT Codebase](./agrigpt) &bull; [Read AgriGPT Documentation](./agrigpt/README.md) &bull; [Open Live Evaluator Portal ↗](https://sih-2026-portfolio-two.vercel.app/krishismriti)

---

## 🌐 Quick Links & Project Navigation Matrix

| Track | Problem ID | Ministry & Theme | Designated Codebase | Designated README | Live Evaluator Portal |
|---|---|---|---|---|---|
| **Monsoon AI Post-Processing** | **SIH26080** | **MoES / NCMRWF & IMD**<br>Atmospheric & Climate Sciences | [`sih26080/`](./sih26080)<br>+ [`app/sih26080`](./app/sih26080) | [`sih26080/README.md`](./sih26080/README.md) | **[Launch SIH26080 Portal ↗](https://sih-2026-portfolio-two.vercel.app/sih26080)** |
| **AgriGPT / Farm Digital Twin** | **SIH26193** | **Ministry of Agriculture**<br>Agriculture, FoodTech & Rural Dev | [`agrigpt/`](./agrigpt)<br>+ [`app/krishismriti`](./app/krishismriti) | [`agrigpt/README.md`](./agrigpt/README.md) | **[Launch AgriGPT Portal ↗](https://sih-2026-portfolio-two.vercel.app/krishismriti)** |
| **Evaluator Gateway** | — | Team ClaudeMaxDedo Directory | [`app/page.tsx`](./app/page.tsx) | [`README.md`](./README.md) | **[Launch Gateway Index ↗](https://sih-2026-portfolio-two.vercel.app)** |

> [!IMPORTANT]
> **Strict Route & Architectural Isolation**:  
> Both projects operate with **100% strict isolation**. There are zero cross-links or navigation bleed between the MoES meteorological post-processing portal and the Ministry of Agriculture digital twin portal. Evaluators experience a dedicated, distraction-free environment for each respective track.

---

## ⛈️ Track 1: SIH26080 — Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts

* **Target Problem**: Global NWP models (ECMWF IFS 0.25° HRES, GFS, NCUM) suffer from critical systematic biases over the Indian subcontinent:
  1. **Western Ghats Orographic Dry Bias**: Underpredicts heavy precipitation ($\ge 64.5$ mm/day) by over 40% (Frequency Bias = 0.586, misses 81.7% of deluge events).
  2. **Convective Misplacement**: Spatial displacement causes high False Alarm Ratios (68.8%) and depressed Critical Success Indices (CSI = 0.131).
  3. **Synoptic Non-Stationarity**: Global quantile mapping fails because error distributions invert between Active (heavy moisture convergence) and Break (suppressed central rain, spurious coastal storms) monsoon phases.
* **Our Solution**: A 2-stage zero-leakage hybrid post-processing pipeline:
  - **Stage 1 (Synoptic Regime Classifier & Non-Parametric RQDM)**: Causal Core Monsoon Zone anomaly ($Z_{\text{eff}}$ per Rajeevan et al., 2010), 4 physical regimes (`Active`, `Break`, `Coastal Trough`, `Normal`), 100-quantile empirical inversion with continuous capped-slope tail parameterization.
  - **Stage 2 (Topographic & Somali Jet LightGBM Corrector)**: Residual error fitting under robust L1 loss using 850 hPa LLJ wind vectors ($u_{850}, v_{850}$), mechanical orographic uplift ($\Phi_{\text{oro}} = \vec{V}_{850} \cdot \nabla h$), coastal proximity, and terrain elevation.
  - **Early Warning System**: Automated WMO / NDMA CAP 1.2 XML emergency bulletin generator and IMD 4-tier alert system (Green, Yellow, Orange, Red).

### Measured Benchmark Summary (JJAS 2024 Verified on 38,880 Point-Days)

| Metric | Raw ECMWF IFS (0.25°) | Global Quantile Mapping | Proposed Stage 1 RQDM | Proposed Stage 2 LightGBM |
|---|:---:|:---:|:---:|:---:|
| **Continuous RMSE** | 17.19 mm | 18.05 mm | 18.69 mm | **15.12 mm (-12.0%)** |
| **Continuous MAE** | 9.25 mm | 8.60 mm | 8.77 mm | **6.64 mm (-28.2%)** |
| **Heavy Rain Frequency Bias** | 0.586 | 0.980 | **1.000 (Perfect Climatology)** | 0.242 |
| **Probability of Detection (POD)**| 0.183 (150/819) | 0.295 (242/819) | **0.303 (248/819)** | 0.138 (113/819) |
| **False Alarm Ratio (FAR)** | 0.688 | 0.699 | 0.697 | **0.429 (-37.6%)** |
| **Equitable Threat Score (ETS)** | 0.123 [0.104, 0.143] | 0.165 [0.145, 0.184] | **0.168 [0.149, 0.188]** | 0.121 [0.100, 0.145] |
| **Fractions Skill Score (275 km)**| 0.65 | 0.72 | 0.74 | **0.77** |

* **Single-CPU Inference Latency**: **11.4 ms** (zero GPU dependency).
* **Evaluator Portal**: 13 interactive scientific analysis tabs (`playground`, `spatial_gis`, `deluge_forensics`, `district_matrix`, `ablation`, `dashboard`, `probabilistic`, `lead_time`, `orography`, `synoptic`, `factsheet`, `limitations`, `defense`).
* **Deep-Dive Documentation**: See [`sih26080/README.md`](./sih26080/README.md).

---

## 🌾 Track 2: SIH26193 — AgriGPT / KrishiSmriti: The Farm's Second Brain & Digital Twin

* **Target Problem**: Smallholder farmers receive fragmented advisories: weather apps ignore recent fungicide sprays (risk of wash-off & leaching), fertilizer guides ignore canal release schedules, and mandi apps ignore transportation costs. This lack of memory causes over ₹92,000 Crore in annual crop and input losses across India.
* **Our Solution**: **AgriGPT (KrishiSmriti)** connects weather forecasts, soil moisture, farm memory, labor availability, and APMC mandi prices to answer one decisive question daily: *"What is the single best action I should take right now?"*
* **Core Modules & Capabilities**:
  - **Obsidian Farm Graph & Digital Twin (`agrigpt/src/App.jsx`)**: Stateful node-link graph mapping cadastral survey Plot 4B (1.2 ha Soybean, Vadgaon Shinde, Pune) with interactive sensor feeds, soil layers, and irrigation valves.
  - **12-Factor Deterministic Decision Engine**: Conflict resolver for micro-rain predictions (03:00 AM) + recent chemical sprays $\to$ delays morning irrigation to prevent root leaching.
  - **ICAR PoP Rule Engine**: Fertilizer and chemical dosages are strictly calculated using ICAR deterministic rules—never hallucinated by an LLM. Verified across 28 ICAR unit test cases.
  - **APMC Mandi Realization & Arbitrage**: Computes net profit across APMC Shirur, APMC Pune, and APMC Baramati after deducting diesel freight, with 1-click logistics slot locking.
  - **Vernacular Voice Logging via Bhashini**: Multilingual voice note interaction in regional dialects (Marathi, Hindi, Bhojpuri, Bundelkhandi, English).
  - **Episodic Farm Memory**: PostgreSQL `pgvector` audit trail with SHA-256 advisory hash receipts.
* **Deep-Dive Documentation**: See [`agrigpt/README.md`](./agrigpt/README.md).

---

## 🎨 Web 2.0 Minimalist Design Philosophy

Both portals adhere to a strict **2010 Web 2.0 tactile light-mode design language**:
* **High Contrast**: Clean whites and off-whites (`bg-white`, `bg-zinc-50`, `bg-zinc-100`).
* **Tactile Structure**: Crisp 1px solid structural borders (`border-zinc-300`, `border-zinc-200`) and subtle drop shadows.
* **Typographic Hierarchy**: Charcoal text (`text-zinc-900`, `text-zinc-700`), with monospace typography reserved exclusively for scientific notation, coordinates, and telemetry.
* **Zero Visual Clutter**: Strictly NO dark mode, NO backdrop blur, NO neon glows, and NO generic purple/pink AI gradients.

---

## 🛠️ Technology Stack Overview

| Category | Monsoon Post-Processing (SIH26080) | AgriGPT Digital Twin (SIH26193) |
|---|---|---|
| **Primary Framework** | Next.js 14+ (App Router) & Python 3.11 | React 19 + Vite & Next.js 14 |
| **Interactive UI** | 13-Tab Scientific Evaluator Dashboard | Obsidian Farm Graph & Simulator |
| **ML & Algorithms** | Non-parametric RQDM + LightGBM (L1 loss) | 12-Factor Deterministic ICAR PoP Engine |
| **Data Lineage** | NetCDF4, Parquet, IMD Gridded Observations | SoilGrids 250m, Sentinel-1/2, Agmarknet |
| **Geospatial & Vectors** | 324-Point Leaflet GIS + 850 hPa LLJ Vectors | Cadastral Plot 4B PostGIS Boundaries |
| **Alerts & Protocols** | WMO / NDMA CAP 1.2 XML Siren Payload | Bhashini Vernacular Audio + SHA-256 Receipts |
| **Compute Profile** | 11.4 ms Single-Core CPU (Zero GPU) | Instant client-side reactive state graph |

---

## 💻 Local Development & Setup

### 1. Unified Portal Gateway (Next.js 14)
```bash
# Clone the repository
git clone https://github.com/lohitakshcodes/claudemaxdedo-sih2026.git
cd claudemaxdedo-sih2026

# Install dependencies
npm install

# Start unified development server
npm run dev

# Portals available at:
# Gateway:     http://localhost:3000/
# SIH26080:    http://localhost:3000/sih26080
# AgriGPT:     http://localhost:3000/krishismriti
```

### 2. Standalone AgriGPT Digital Twin (Vite + React 19)
```bash
cd agrigpt
npm install
npm run dev
# Interactive digital twin available at http://localhost:5173
```

### 3. SIH26080 Python Scientific Benchmark Reproduction
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install numpy pandas scipy lightgbm scikit-learn

# Run zero-leakage canary tests
python3 sih26080/verification/test_leakage_canaries.py

# Run master benchmark pipeline
python3 sih26080/pipeline/reproduce_benchmark.py
```

---

## 📁 Repository Structure

```
claudemaxdedo-sih2026/
├── sih26080/                     # Track 1: Monsoon AI Post-Processing (Python ML Engine)
│   ├── README.md                 # Designated SIH26080 documentation
│   ├── models/                   # Regime classifier, RQDM & LightGBM corrector
│   ├── pipeline/                 # 5-fold purged block CV benchmark pipeline
│   ├── verification/             # Zero-leakage temporal canary test suites
│   └── data/                     # Gate A and JJAS 2024 benchmark datasets
├── agrigpt/                      # Track 2: AgriGPT / KrishiSmriti (Vite + React 19 Digital Twin)
│   ├── README.md                 # Designated AgriGPT documentation
│   ├── src/
│   │   ├── App.jsx               # Obsidian Farm Graph & digital twin interface
│   │   ├── index.css             # Agricultural tactile styling tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── app/                          # Production Evaluator Web Application (Next.js 14)
│   ├── sih26080/                 # SIH26080 13-tab evaluator portal
│   │   └── page.tsx
│   ├── krishismriti/             # AgriGPT evaluator portal
│   │   └── page.tsx
│   ├── api/                      # Backend API routes for both problem statements
│   │   ├── sih26080/
│   │   └── krishismriti/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Master evaluator gateway directory
├── data/
│   └── krishismriti-config.ts    # Comprehensive agro-intelligence configuration & datasets
├── docs/                         # Scientific dossiers and peer-review specifications
├── deliverables/
│   └── DECK_INPUTS.md            # Jury presentation figures, equations & data references
└── README.md                     # Master repository portfolio gateway
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

*Smart India Hackathon 2026 &bull; Official Dual-Track Submission &bull; Team ClaudeMaxDedo*
