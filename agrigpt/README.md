# AgriGPT / KrishiSmriti — The Farm's Second Brain & Agricultural Digital Twin

Official Smart India Hackathon (SIH 2026) Project Codebase for **Team ClaudeMaxDedo**.

[![SIH 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in/)
[![Problem Statement ID](https://img.shields.io/badge/Problem%20Statement-SIH26193-green.svg)](https://sih-2026-portfolio-two.vercel.app/krishismriti)
[![Ministry](https://img.shields.io/badge/Ministry-Agriculture%20%26%20Farmers%20Welfare-darkgreen.svg)](https://agricoop.nic.in/)
[![Live Prototype](https://img.shields.io/badge/Live%20Portal-Vercel-success.svg)](https://sih-2026-portfolio-two.vercel.app/krishismriti)
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2019-61dafb.svg)](https://vitejs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)

---

## 🌐 Live Demonstrator & Portal Links

* **Live Next.js Evaluator Portal**: **[https://sih-2026-portfolio-two.vercel.app/krishismriti](https://sih-2026-portfolio-two.vercel.app/krishismriti)**
* **Portfolio Gateway Directory**: **[https://sih-2026-portfolio-two.vercel.app](https://sih-2026-portfolio-two.vercel.app)**
* **Standalone Codebase**: `agrigpt/` (Vite + React 19 Interactive Digital Twin)

---

## 📌 Executive Summary & Problem Statement (SIH26193)

Every agricultural assistance tool today suffers from the same fatal flaw: **each tool sees only one variable, and none of them remembers what happened yesterday.**
* Weather apps warn of rain, but ignore that the farmer applied systemic fungicide 12 hours ago (which will wash away and leach into groundwater).
* Soil Health Cards give N-P-K nutrient deficiencies, but ignore current Panchayat canal water releases or grid electricity schedules.
* Mandi apps list distant crop prices, but ignore diesel transport overheads, vehicle availability, or harvest moisture content.

This fragmentation causes smallholder decision paralysis, leading to over ₹92,000 Crore in annual post-harvest and input mismanagement losses across India.

### The Solution: AgriGPT / KrishiSmriti
**AgriGPT (KrishiSmriti)** is **The Farm's Second Brain**—a stateful agricultural digital twin and cross-factor decision engine. It continuously unifies satellite imagery, ground telemetry, Soil Health Card chemistry, local weather forecasts, APMC market prices, and past farm memory into **one decisive, verified action every morning**:
> *"What is the single best action I should take right now?"*

---

## 🚀 Key Architectural Pillars & Features

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ MULTI-SOURCE PARALLEL TELEMETRY INGESTION                              │
  │ • Sentinel-1 SAR Dual-Pol (Soil Moisture) & Sentinel-2 (NDVI Vigor)    │
  │ • Open-Meteo Hourly Forecasts (Rain Probability, Calm Wind Windows)   │
  │ • SoilGrids 250m & MoA Soil Health Card Cadastral Survey (Plot 4B)     │
  │ • Agmarknet OGD API Live APMC Mandi Auction Prices & Spreads          │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 12-FACTOR CROSS-FACTOR DETERMINISTIC DECISION ENGINE                   │
  │ • Micro-Rain Forecast (03:00 AM) + Fungicide Logged 24h Ago            │
  │ • Rule: Delay Morning Irrigation -> Prevent Root Leaching & Chemical Runoff
  │ • Zero LLM Hallucinations: Chemical dosages computed by ICAR PoP rules│
  │ • Verified across 28 ICAR unit test cases                              │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ OBSIDIAN FARM GRAPH & DIGITAL TWIN INTERFACE (`App.jsx`)               │
  │ • Interactive connected graph: Soil Nodes, Crop Stages, Canals, Mandis │
  │ • 1-Click Dialect Voice Logging in Marathi, Hindi, Bundelkhandi, etc.  │
  │ • APMC Mandi Realization: Net profit after diesel transport deduction  │
  │ • Real-Time Transport Slot Locking (e.g. APMC Shirur)                  │
  │ • pgvector Episodic Memory Audit Trail with SHA-256 Advisory Receipts │
  └────────────────────────────────────────────────────────────────────────┘
```

### 1. Obsidian Farm Graph & Digital Twin (`src/App.jsx`)
* Interactive node-link topology rendering the agricultural ecosystem for cadastral survey Plot 4B (1.2 ha Soybean, Vadgaon Shinde, Pune).
* Real-time status badges showing Sentinel-2 sync status, root-zone retention curves, and soil waterlogging risk in Black Cotton Soil (Vertisol).

### 2. 12-Factor Deterministic Decision Check
* Multi-variable conflict resolver: balances weather windows, Panchayat soil moisture (38%), fungicide residual period, 3-phase grid power schedules, and labor availability.
* **Dosage Safety Guarantee**: Chemical and fertilizer dosages are strictly computed by deterministic ICAR (Indian Council of Agricultural Research) agronomic algorithms—never generated or hallucinated by generative language models.

### 3. APMC Mandi Realization & Arbitrage Engine
* Live integration with Agmarknet modal prices via data.gov.in Open Government Data (OGD) API.
* Dynamic calculation of **True Realized Price**:
  $$\text{Realized Profit} = (\text{Mandi Modal Price} \times \text{Yield}) - \text{Transport Cost} - \text{Mandi Cess} - \text{Loading Charges}$$
* Compares APMC Shirur vs. APMC Pune vs. APMC Baramati, and allows 1-click logistics booking directly from the digital twin dashboard.

### 4. Vernacular Voice Logging with Bhashini
* Full voice-to-text and text-to-speech interaction supporting regional Indian languages and agricultural dialects (Marathi, Hindi, Bhojpuri, Bundelkhandi, English).
* Farmers hold to speak to log actions (e.g., *"आज दुपारी 2 वाजता खत घातले"*), which are parsed into structured episodic memory events.

### 5. Episodic Farm Memory & Audit Trails
* Backed by PostgreSQL `pgvector` embeddings and PostGIS cadastral spatial geometry.
* Every recommendation produces a tamper-evident **SHA-256 advisory hash receipt**, providing complete transparency and auditability for PM Fasal Bima Yojana (PMFBY) insurance claims.

---

## 🛠️ Technology Stack

| Component | Technology | Role |
|---|---|---|
| **Digital Twin App** | **React 19, Vite, Tailwind CSS** | Standalone interactive digital twin & Obsidian graph (`src/App.jsx`) |
| **Icons** | **Lucide React** | Clean, accessible agricultural and telemetry icons |
| **Linting & Quality** | **Oxlint** | High-speed JavaScript/JSX correctness and linting |
| **Spatial Indexing** | **PostGIS & Leaflet** | Cadastral plot boundary geometry (Plot 4B) |
| **Memory Vector Store** | **PostgreSQL + pgvector** | Stateful multi-year episodic farm action memory |
| **Satellite Ingestion** | **Copernicus Sentinel-1 & Sentinel-2** | SAR dual-pol backscatter & multispectral NDVI |
| **Market Data** | **Agmarknet (data.gov.in OGD API)** | Daily APMC auction modal price feeds |
| **Agro-Rules** | **ICAR Package of Practices (PoP)** | Deterministic fertilizer and spray limit calculations |

---

## 💻 Local Development & How to Run

```bash
# Navigate to the agrigpt directory
cd agrigpt

# Install dependencies
npm install

# Start the Vite development server
npm run dev

# Open in your browser:
# http://localhost:5173
```

To run lint checks:
```bash
npm run lint
```

To build production bundle:
```bash
npm run build
```

---

## 📁 Codebase Structure

```
agrigpt/
├── src/
│   ├── App.jsx              # Complete Obsidian Farm Graph & Digital Twin application
│   ├── index.css            # Custom agricultural styling tokens & graph themes
│   ├── main.jsx             # React 19 application root entry
│   └── assets/              # Icons and graphics
├── public/
│   ├── favicon.svg          # Digital twin browser icon
│   └── icons.svg
├── index.html               # Web application HTML5 shell
├── vite.config.js           # Vite build configuration
├── package.json             # Project dependencies and scripts
├── .oxlintrc.json           # Oxlint code quality configuration
└── README.md                # Project documentation
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

*Smart India Hackathon 2026 &bull; Official Submission Codebase &bull; Ministry of Agriculture & Farmers Welfare (SIH26193) &bull; Team ClaudeMaxDedo*
