# Team ClaudeMaxDedo — Smart India Hackathon (SIH 2026)

Official dual-portal evaluator portfolio for **Team ClaudeMaxDedo** at **Smart India Hackathon 2026**.

## 🌐 Live Production Deployment

- **Production URL**: **[https://sih-2026-portfolio-two.vercel.app](https://sih-2026-portfolio-two.vercel.app)**
- **WeatherGPT Evaluator Portal (MoES / IMD - SIH26068)**: **[https://sih-2026-portfolio-two.vercel.app/weathergpt](https://sih-2026-portfolio-two.vercel.app/weathergpt)**
- **KrishiSmriti Evaluator Portal (Ministry of Agriculture - SIH26193)**: **[https://sih-2026-portfolio-two.vercel.app/krishismriti](https://sih-2026-portfolio-two.vercel.app/krishismriti)**
- **Continuous Deployment**: Connected directly to [`github.com/lohitakshcodes/claudemaxdedo-sih2026`](https://github.com/lohitakshcodes/claudemaxdedo-sih2026)

## 📌 Problem Statements & Isolated Routes

| Route | Problem Statement ID | Ministry / Theme | Status |
|---|---|---|---|
| [`/weathergpt`](https://sih-2026-portfolio-two.vercel.app/weathergpt) | **SIH26068** | Ministry of Earth Sciences (MoES) / IMD &bull; Disaster Management & Climate Tech | **Live Working Prototype** |
| [`/krishismriti`](https://sih-2026-portfolio-two.vercel.app/krishismriti) | **SIH26193** | Ministry of Agriculture & Farmers Welfare &bull; Agriculture, FoodTech & Rural Dev | **Live Working Prototype** |
| [`/`](https://sih-2026-portfolio-two.vercel.app/) | Gateway Directory | Team ClaudeMaxDedo Institutional Directory | Active |

> [!IMPORTANT]
> **Strict Route Isolation Guarantee**:
> Both routes operate with **100% strict isolation**. There are zero cross-links, toggles, or navigation between WeatherGPT and KrishiSmriti. An evaluator visiting `/weathergpt` experiences a dedicated production portal for MoES/IMD.

---

## 🚀 Key Features

1. **2010 Web 2.0 Minimalist Design System**:
   - Strict Light Mode (`bg-white`, `bg-zinc-50`, `bg-zinc-100`).
   - Crisp 1px solid borders (`border-zinc-300`, `border-zinc-200`) and tactile drop shadows.
   - High-contrast charcoal typography (`text-zinc-900`, `text-zinc-600`), monospace reserved strictly for telemetry & code.
   - Strictly NO dark mode, NO backdrop-blur, NO neon glows, and NO modern purple/pink AI gradients.

2. **Live Ingestion Telemetry Engine**:
   - Deterministic live stream ticking every 2.5 seconds simulating incoming data packets:
     - **WeatherGPT**: WMO WIS 2.0 MQTT notifications, CAP 1.2 disaster alerts, Doppler radar arrays, and Open-Meteo GFS coordinates with latency (<38ms).
     - **KrishiSmriti**: Sentinel-1 Synthetic Aperture Radar (SAR) dual-pol backscatter, Agmarknet live mandi auction ticks, and village LoRa ground sensors.
   - Plain-English explainer card answering *"What is this Live Telemetry Feed?"*.

3. **Interactive Mobile Phone Simulator (iPhone Frame & Underneath Explainer)**:
   - Clicking **"Launch WeatherGPT Voice Bot"** or **"Launch KrishiSmriti Agro-Engine"** opens an authentic iPhone hardware frame with dynamic island, status bar, and audio voice scrubber.
   - Includes a dedicated, plain-English **Evaluator Explainer Pop-up** underneath explaining what is happening, why it matters, and technical checkpoints.
   - 3 switchable operational test scenarios with vernacular voice note playback in local Indic dialects (Bhojpuri, Marathi, Bundelkhandi, Punjabi).

4. **Slide-by-Slide Deep Dive Suite**:
   - `#problem`: Quantified economic loss cards ($10.8B losses / ₹92,000 Crore post-harvest loss) + last-mile comprehension gap diagnostic.
   - `#architecture`: 3-column structured layout (Ingestion Layer, Agentic Orchestration Layer, Zero-UI Delivery Layer).
   - `#feasibility`: 2-column Risk vs. Engineering Safeguard table (AI hallucinations, dialect noise, severe traffic bursts, offline resilience).
   - `#impact`: High-contrast comparison table (Status Quo vs Our Solution).
   - `#code-demo`: Proof of Work hub linking to GitHub, OpenAPI/Swagger interactive modal, raw NetCDF/GeoTIFF datasets, and Bhashini dialect audio samples.
   - `#team`: Clean 2x3 grid displaying all 6 team members with verified roles.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS with custom 2010 Web 2.0 tactile utility tokens
- **Icons**: Lucide React
- **Code Quality**: Zero hydration errors, fully responsive (desktop-first, mobile-compatible), strict type safety.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Visit:
- Gateway: [http://localhost:3000/](http://localhost:3000/)
- WeatherGPT: [http://localhost:3000/weathergpt](http://localhost:3000/weathergpt)
- KrishiSmriti: [http://localhost:3000/krishismriti](http://localhost:3000/krishismriti)

---

## 👥 Team ClaudeMaxDedo

- **Aarav Sharma** — Team Lead & Agentic AI Architect
- **Rohan Kulkarni** — Distributed Backend & Streaming Engineer
- **Pooja Venkataraman** — Geospatial & Remote Sensing Specialist
- **Karan Singh** — Fullstack & Client Lead (Web/WhatsApp)
- **Ananya Deshmukh** — ASR/TTS & Multilingual NLP Engineer
- **Vikram Malhotra** — Cloud Infrastructure & DevOps Lead

---
*Smart India Hackathon 2026 &bull; Official Submission Repository &bull; Team ClaudeMaxDedo*
