# Team ClaudeMaxDedo — SIH 2026 Developer & AI Handover Dossier

> **Complete Project Context & Technical Architecture Guide**  
> Use this document on any device or in any new AI conversation to immediately restore 100% context and continue development seamlessly.

---

## 1. Quick Links & Repository Info

* **GitHub Remote**: `https://github.com/lohitakshcodes/claudemaxdedo-sih2026.git`
* **Default Branch**: `main`
* **Local Workspace Directory**: `/Users/LMac/.gemini/antigravity-ide/scratch/sih-2026-portfolio`
* **Team Name**: `ClaudeMaxDedo`
* **Event**: Smart India Hackathon 2026 (SIH 2026)

### How to Run on Another Machine:
```bash
# 1. Clone repository
git clone https://github.com/lohitakshcodes/claudemaxdedo-sih2026.git
cd claudemaxdedo-sih2026

# 2. Install dependencies (Node 18+ or Node 20+)
npm install

# 3. Start local development server
npm run dev
# App will be live at http://localhost:3000

# 4. Or build and run production server
npm run build
npm run start
```

---

## 2. Project Mission & Two Isolated Portals

This application hosts **two distinct, strictly isolated portals** for two different Smart India Hackathon problem statements:

### Route 1: `/weathergpt`
* **Problem Statement ID**: `SIH26068`
* **Ministry**: Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)
* **Theme**: Disaster Management & Climate Tech
* **Product Name**: **WeatherGPT**
* **Tagline**: Autonomous Agro-Meteorological Voice Intelligence via WMO WIS 2.0 & Bhashini
* **Core Problem**: IMD produces high-precision forecasts and Doppler radar scans, but 78% of rural producers never read the 12-page PDF bulletins due to linguistic alienation and illiteracy.
* **Our Solution**: Replaces PDFs with proactive WhatsApp audio voice notes in 14 local Indic dialects (e.g. Bhojpuri, Marathi, Tamil) with sub-180ms latency and 100% deterministic CAP 1.2 safety gatekeeping.
* **Telemetry Data**: WMO WIS 2.0 MQTT topic subscriptions, S-Band Doppler radar reflectivity (dBZ), Open-Meteo GFS coordinates, and Bhashini TTS dispatch packets.

### Route 2: `/krishismriti`
* **Problem Statement ID**: `SIH26193`
* **Ministry**: Ministry of Agriculture & Farmers Welfare (MoA & FW)
* **Theme**: Agriculture, FoodTech & Rural Development
* **Product Name**: **KrishiSmriti**
* **Tagline**: Autonomous Multimodal Agro-Advisory & Mandi Arbitrage Engine
* **Core Problem**: ₹92,000 Crore annual post-harvest and distress sale losses caused by market price asymmetry (middlemen cartels) and generic district-wide fertilizer advice that ignores field soil physics.
* **Our Solution**: Ingests Sentinel-1 Synthetic Aperture Radar (SAR) dual-pol backscatter to calculate 10m field-level soil moisture, computes real-time mandi arbitrage across 2,400+ APMCs (factoring diesel freight costs), and delivers dial-in voice advice locked to ICAR chemical package of practices.
* **Telemetry Data**: Sentinel-1 SAR VV/VH backscatter, Agmarknet live mandi auction ticks (e.g. Nashik/Lasalgaon onions), and village LoRa ground probe packets (NPK, pH, VWC).

### Route 3: `/` (Root Gateway)
* Institutional directory allowing evaluators to pick their assigned ministry portal.

### ⚠️ STRICT ARCHITECTURAL INVARIANT: 100% ROUTE ISOLATION
* An evaluator on `/weathergpt` must experience a **100% dedicated, standalone portal** for WeatherGPT.
* There are **ZERO cross-links, switchers, or mentions** of KrishiSmriti on `/weathergpt`.
* There are **ZERO cross-links, switchers, or mentions** of WeatherGPT on `/krishismriti`.

---

## 3. Design System: 2010 Web 2.0 Minimalist (Strict Light Mode)

The entire design language strictly follows a high-credibility, government/enterprise Web 2.0 aesthetic:
1. **Strict Light Mode Only**: Solid white (`bg-white`), warm light-gray panels (`bg-zinc-50`, `bg-zinc-100`).
2. **Crisp 1px Borders**: Solid `border-zinc-300` or `border-zinc-200`.
3. **Tactile Subtle Shadows**: `shadow-sm`, `shadow-tactile` (`0 1px 3px rgba(0,0,0,0.08)`), beveled button gradients (`linear-gradient(180deg, #ffffff 0%, #f4f4f5 100%)`).
4. **Typography**: Helvetica / System Sans (`font-sans`) for charcoal high-contrast text (`text-zinc-900`, `text-zinc-600`). Monospace (`font-mono`) reserved strictly for telemetry streams, status pills, and API code blocks.
5. **Natural Language Everywhere**:
   - Navigation links: **Problem & Diagnostic**, **Architecture**, **Live Data Feed**, **Safeguards**, **Impact Comparison**, **Code & Demos**, **Team** (NO raw `#` characters!).
   - Prototype status: **`Live Working Prototype`** with pulsing green indicator (NOT robotic "TRL-3 Prototype Type").
6. **Strictly Avoided**:
   - NO dark mode
   - NO glassmorphism / `backdrop-blur`
   - NO neon glowing borders
   - NO purple/pink modern AI gradients

---

## 4. Complete Codebase Architecture & File Map

```
claudemaxdedo-sih2026/
├── app/
│   ├── layout.tsx              # Root HTML shell, light mode definition, metadata
│   ├── globals.css             # Tailwind base + Web 2.0 tactile button & panel utility classes + scroll-padding-top
│   ├── page.tsx                # Institutional SIH 2026 Team ClaudeMaxDedo Gateway Index
│   ├── weathergpt/
│   │   └── page.tsx            # Isolated Evaluator Portal for PS SIH26068 (MoES / IMD)
│   └── krishismriti/
│       └── page.tsx            # Isolated Evaluator Portal for PS SIH26193 (Ministry of Agriculture)
├── components/
│   ├── portal-template.tsx     # Master Reusable Layout Engine consuming PortalConfig
│   ├── mobile-phone-modal.tsx  # iPhone hardware mockup + WhatsApp / Agro chat + underneath evaluator explainer
│   ├── telemetry-stream.tsx    # Deterministic live MQTT 2.5s streaming engine + topic filter + latency monitor
│   └── modal-dialog.tsx        # Tactile Web 2.0 modals (OpenAPI Swagger preview, datasets, audio player)
├── data/
│   ├── weathergpt-config.ts    # Comprehensive MoES dataset, architecture pipeline, risk table, team
│   └── krishismriti-config.ts  # Comprehensive Agriculture dataset, SAR pipeline, mandi arbitrage, team
├── types/
│   └── portal.ts               # Strict TypeScript interfaces for all data structures
├── public/                     # Static assets (if needed)
├── package.json                # Next.js 14, React 18, Tailwind CSS, Lucide icons
├── tailwind.config.ts          # Custom tactile shadows, Helvetica system font stack
├── tsconfig.json               # Path alias @/* mapped to root
└── README.md                   # Project overview & evaluator guide
```

---

## 5. Detailed Component Specifications

### A. [`components/portal-template.tsx`](components/portal-template.tsx)
The core modular UI engine. Both `/weathergpt` and `/krishismriti` pass their data config to this template.
* **Top Institutional Alert Bar**: Displays official submission metadata, theme, and `Live Working Prototype` badge.
* **Sticky Navbar**:
  - Brand identity + pulsing green `Live Working Prototype` status pill.
  - Smooth anchor tabs with 76px scroll-offset compensation (`Problem & Diagnostic`, `Architecture`, `Live Data Feed`, `Safeguards`, `Impact Comparison`, `Code & Demos`, `Team`).
  - Tactile primary button: **`[Launch WeatherGPT Voice Bot ↗]`** / **`[Launch KrishiSmriti Agro-Engine ↗]`**.
* **Split Hero Section**:
  - Left: Headline, 2-line punchy thesis, primary Launch button, Architecture button, Demo Video button, and 3-metric summary strip.
  - Right: Responsive 16:9 YouTube video iframe container with crisp 1px border and official prototype corner badge.
* **Live Ingestion Telemetry Section (`#live-telemetry`)**:
  - Houses the **"What is this Live Telemetry Feed?"** natural-language explainer card.
  - Houses the interactive `TelemetryStream` console.
* **Slide Sections**:
  - `#problem`: 4 quantified metric cards + Last-Mile Comprehension Gap table (Legacy PDF vs Conversational Voice).
  - `#architecture`: 3-column structured architecture (Layer 1: Ingestion & Spatial, Layer 2: Agentic Orchestration & RAG, Layer 3: Zero-UI Delivery & Bhashini).
  - `#feasibility`: 2-column Risk vs. Engineering Safeguard table (AI hallucinations, rural dialect noise, traffic surges, offline resilience).
  - `#impact`: High-contrast comparison table (Legacy Portals vs Our Solution).
  - `#code-demo`: Proof of Work hub (GitHub Repo, Interactive OpenAPI / Swagger Preview, Datasets / Postman, Bhashini Dialect Audio Samples).
  - `#team`: 2x3 grid displaying all 6 team members with verified roles, contributions, GitHub, and LinkedIn links.
* **Institutional Footer**: AICTE/SIH compliance declaration and build audit hash.

### B. [`components/mobile-phone-modal.tsx`](components/mobile-phone-modal.tsx)
Triggered whenever an evaluator clicks **"Launch WeatherGPT Voice Bot"** or **"Launch KrishiSmriti Agro-Engine"**:
1. **iPhone Device Frame**:
   - Sleek hardware bezel with Dynamic Island, iOS top status bar (`9:41`, `5G`, battery indicator), and bottom swipe home indicator bar.
   - Screen displays authentic WhatsApp chat (WeatherGPT) or Agro-Assistant (KrishiSmriti).
   - **Interactive Audio Scrubber**: Evaluators can click the play button on the WhatsApp voice note to play/pause with a real-time progress bar.
   - Vernacular speech bubble in regional dialect (e.g. Bhojpuri, Marathi, Bundelkhandi) + English translation summary.
2. **Underneath / Beside Evaluator Explainer Card**:
   - Plain-English breakdown of why this mobile voice experience is revolutionary:
     - **Point 1 (Zero-App Barrier)**: Farmer speaks into WhatsApp without installing an app or having digital literacy.
     - **Point 2 (Behind-the-Scenes Pipeline)**: How audio is transcribed by Bhashini Conformer ASR, validated against Doppler radar / Sentinel-1 SAR, and returned in <180ms.
     - **Point 3 (Quantified Impact)**: Prevents crop destruction and distress selling.
     - **Audit Checkpoints**: ASR WER < 7.8%, Latency < 180ms, 0% Hallucination Rate.
3. **Scenario Switcher**:
   - 3 clickable scenario chips per portal (e.g., Storm Warning, Cyclone Harbor Evacuation, Wheat Sowing; or Mandi Arbitrage, Radar Soil Deficit, Yellow Rust Dosage).
   - Clicking a scenario dynamically updates the messages on the iPhone and updates the explainer card text.

### C. [`components/telemetry-stream.tsx`](components/telemetry-stream.tsx)
* Deterministic simulated MQTT stream ticking every 2.5 seconds using `useEffect`.
* Simulates live telemetry packets arriving with sub-38ms latency.
* Interactive controls: **Pause/Resume stream**, **Clear buffer**, **Filter by topic tabs**, **Auto-scroll ON/OFF**, and **Expandable JSON syntax-highlighted payload viewer**.
* Header displays: `Stream Status: Connected (MQTT over WSS)` with pulsing green dot, average latency, and throughput rate.

### D. [`components/modal-dialog.tsx`](components/modal-dialog.tsx)
Tactile Web 2.0 dialogs for Proof of Work:
1. **Interactive OpenAPI / Swagger Documentation**: Displays real endpoints (`POST /telemetry/wis2-ingest`, `POST /agent/query`, `POST /sar/backscatter-ingest`, `GET /mandi/arbitrage-matrix`), sample JSON bodies, and copyable cURL commands.
2. **Raw Historical Datasets**: NetCDF4 radar scans, Sentinel-1 SAR GeoTIFFs, Postman collection v2.1.
3. **Recorded Audio Dialect Samples**: Interactive player testing synthesized rural dialect samples (Bhojpuri, Malwi, Marathi, Tamil) with Word Error Rate (WER) benchmarks.

---

## 6. Team ClaudeMaxDedo Roster

| Name | Operational Role | Core Discipline |
|---|---|---|
| **Aarav Sharma** | Team Lead & Agentic AI Architect | Applied AI & LLM Systems / Knowledge Graphs |
| **Rohan Kulkarni** | Distributed Backend & Streaming Engineer | High-Throughput Ingestion, MQTT 5.0, Queues |
| **Pooja Venkataraman** | Geospatial & Remote Sensing Specialist | Radar Informatics, Sentinel-1 SAR, H3 Indexing |
| **Karan Singh** | Fullstack & Client Lead (Web/WhatsApp) | Next.js, WebSockets, WhatsApp Cloud API |
| **Ananya Deshmukh** | ASR/TTS & Multilingual NLP Engineer | Bhashini Conformer-CTC, FastSpeech2 Vocoder |
| **Vikram Malhotra** | Cloud Infrastructure & DevOps Lead | Kubernetes, Edge Security, TLS 1.3 Mutual Auth |

---

## 7. Key Ideas for Future Swift / Native Expansion

In your voice note, you mentioned potentially using your Swift skills:
* The current iPhone frame is built with pure Tailwind CSS and React state (`components/mobile-phone-modal.tsx`).
* If building an actual iOS companion app in Swift/SwiftUI:
  - You can connect via WebSocket (`URLSessionWebSocketTask`) to the same MQTT edge broker feed.
  - Use `AVAudioPlayer` / `AVAudioRecorder` to capture native m4a audio and send to the Bhashini ASR endpoint.
  - Wrap the Next.js portal inside a `WKWebView` or build native SwiftUI views replicating the 3-column architecture cards.
