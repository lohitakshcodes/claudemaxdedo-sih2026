import { PortalConfig } from "@/types/portal";

export const weatherGptConfig: PortalConfig = {
  id: "weathergpt",
  psId: "SIH26068",
  ministry: "Ministry of Earth Sciences (MoES) / IMD (Problem Statement)",
  ministryShort: "MoES / IMD (Problem Statement)",
  theme: "Disaster Management & Climate Tech",
  teamName: "ClaudeMaxDedo",
  brandName: "WeatherGPT",
  brandTagline: "Hyperlocal Weather & Disaster Voice Intelligence via Warning-Locked Pipeline",
  thesis:
    "We plug in, not replace. WeatherGPT transforms Common Alerting Protocol (CAP 1.2) feeds from NDMA-SACHET and WMO WIS2 into instant, warning-locked spoken advisories with receipts, delivered in regional Indian languages.",
  trlStatus: "Working Prototype",
  deployedSolution: {
    label: "Open Live Prototype",
    url: "https://sih-2026-portfolio-two.vercel.app/weathergpt",
    badge: "Interactive Prototype",
    description:
      "Test citizen voice questions with warning-lock verification, sample disaster warning replay, and the district officer polygon view.",
  },
  heroVideoId: "kJQP7kiw5Fk", // Clean demo embed container (replaced Rick Astley placeholder)
  quickStats: [
    {
      label: "Disaster Warnings",
      value: "Warning-Locked",
      sublabel: "Replies start with active CAP alerts; LLM forbidden from dismissing danger",
      tag: {
        type: "Design target",
        detail: "Strict warning-lock rule in route handler",
      },
    },
    {
      label: "Language Coverage",
      value: "Tested Hindi & Bhojpuri",
      sublabel: "Bhashini ASR/TTS with browser Web Speech API as fallback",
      tag: {
        type: "Measured",
        detail: "Tested end-to-end in prototype (18 Sep 2026)",
      },
    },
    {
      label: "Alert Backbone",
      value: "NDMA SACHET CAP 1.2",
      sublabel: "Official RSS/XML feeds parsed into PostGIS polygons",
      tag: {
        type: "Source",
        url: "https://sachet.ndma.gov.in/",
        detail: "NDMA SACHET Public CAP Alert Portal",
      },
    },
  ],
  telemetry: {
    title: "Live Data Ingestion Pipeline (CAP Alerts & Fallback NWP)",
    description:
      "Server-side ingestion pipeline polling public NDMA-SACHET CAP 1.2 disaster alerts, Open-Meteo (GFS) hourly weather, and WIS2 broker connectivity.",
    brokerUrl: "wss://globalbroker.meteo.fr:8883/mqtt",
    topics: [
      "sachet/cap/rss/india_alerts",
      "sachet/cap/rss/bihar_state",
      "wis2/centre-id/in-imd/#",
      "open-meteo/forecast/hourly/rohtas_bihar",
      "bhashini/asr_tts/bhojpuri_hindi",
    ],
    packetPool: [
      {
        id: "PKT-CAP-9021",
        timestamp: "2026-09-17T10:14:31.042Z",
        topic: "sachet/cap/rss/bihar_state",
        source: "NDMA SACHET (CAP 1.2 RSS Feed)",
        latencyMs: 310,
        status: "ALERT",
        payload: {
          identifier: "URN:IN-MD:DISASTER:2026:BHR-ROH-042",
          sender: "state.disaster.mgmt@bihar.gov.in",
          urgency: "Immediate",
          severity: "Severe",
          event: "Severe Lightning & Thunderstorm Hazard",
          areaDesc: "Rohtas District - Sasaram & Dehri Blocks",
          polygon: "[[83.80, 24.80], [84.20, 24.80], [84.20, 25.10], [83.80, 25.10]]",
          instruction: "Take immediate shelter in pucca buildings. Stay away from open fields, tall trees, and water bodies.",
          expiresAt: "2026-09-17T18:00:00Z",
        },
      },
      {
        id: "PKT-GFS-9022",
        timestamp: "2026-09-17T10:14:33.518Z",
        topic: "open-meteo/forecast/hourly/rohtas_bihar",
        source: "Open-Meteo GFS (Rohtas Point: 24.95°N, 84.02°E)",
        latencyMs: 185,
        status: "INGESTED",
        payload: {
          temp_celsius: 31.8,
          precipitation_probability_pct: 82,
          rain_mm: 24.5,
          wind_gust_kmh: 48,
          humidity_pct: 86,
          convective_potential: "HIGH",
        },
      },
      {
        id: "PKT-IMD-STATUS-9023",
        timestamp: "2026-09-17T10:14:36.002Z",
        topic: "imd/api_access/status",
        source: "IMD Data Portal Access Desk",
        latencyMs: 12,
        status: "SYNCED",
        payload: {
          api_name: "IMD Weather & Radar API",
          status: "Applied for IP-whitelisted academic access on 15 Sep 2026",
          current_fallback: "Open-Meteo (NOAA GFS) + NDMA SACHET CAP public RSS",
        },
      },
    ],
  },
  problem: {
    sectionTitle: "Quantified Problem Statement & Verified Disaster Facts",
    headline: "The Last-Mile Warning Gap in Climate-Vulnerable Communities",
    summary:
      "India's meteorological and disaster capabilities are extensive, yet last-mile alerts often arrive as broad district-level text or technical formats that do not reach citizens in their native dialect in time to prevent loss of life.",
    metrics: [
      {
        label: "Extreme Weather Days",
        value: "99% of Days",
        subtext: "India experienced extreme weather events on 99% of days in the first nine months of 2025, claiming 4,064 lives.",
        severity: "danger",
        trend: "CSE & Down To Earth Assessment (Nov 2025)",
        citationUrl: "https://www.cseindia.org/",
        tag: {
          type: "Source",
          url: "https://www.cseindia.org/",
          detail: "Centre for Science and Environment / Down To Earth, Nov 2025",
        },
      },
      {
        label: "Lightning Fatalities",
        value: "39.7% of Deaths",
        subtext: "Lightning accounted for 39.7% of all nature-related accidental deaths in India (2,558 deaths in 2023).",
        severity: "danger",
        trend: "NCRB ADSI Report (2023)",
        citationUrl: "https://www.downtoearth.org.in/",
        tag: {
          type: "Source",
          url: "https://www.downtoearth.org.in/",
          detail: "NCRB Accidental Deaths & Suicides in India 2023",
        },
      },
      {
        label: "Warning Impact",
        value: "30% Damage Cut",
        subtext: "A 24-hour advance disaster warning can reduce subsequent economic damage by up to 30% (WMO Early Warnings for All).",
        severity: "success",
        trend: "WMO Early Warnings for All Global Initiative",
        citationUrl: "https://wmo.int/",
        tag: {
          type: "Source",
          url: "https://wmo.int/",
          detail: "World Meteorological Organization (WMO)",
        },
      },
      {
        label: "SACHET Alert Reach",
        value: "6,899 Crore SMS",
        subtext: "NDMA's SACHET portal has sent over 6,899 crore disaster alert SMS in 19+ regional languages across India.",
        severity: "neutral",
        trend: "Press Information Bureau / Ministry of Home Affairs (Jun 2025)",
        citationUrl: "https://www.devdiscourse.com/",
        tag: {
          type: "Source",
          url: "https://www.devdiscourse.com/",
          detail: "MHA / NDMA SACHET National Milestone Report",
        },
      },
    ],
    economicLossDetails: [
      {
        category: "1. Extreme Weather & Lightning Casualties",
        annualLoss: "4,064 deaths in first 9 months of 2025",
        rootCause:
          "According to CSE & Down To Earth (Nov 2025), extreme weather events occurred on 99% of days in Jan-Sep 2025. Lightning remains the single largest cause of nature-related accidental deaths in India (2,558 deaths in 2023, NCRB).",
        impactMetrics: [
          "4,064 extreme weather deaths recorded in Jan–Sep 2025",
          "Lightning causes 39.7% of nature-related deaths in India",
          "Rohtas district recorded highest lightning deaths in Bihar (Bihar Economic Survey)",
        ],
        citation: {
          title: "State of India's Environment 2025",
          source: "Centre for Science and Environment (CSE) & Down To Earth",
          url: "https://www.cseindia.org/",
        },
      },
      {
        category: "2. Early Warning Value & Monsoon Mission Returns",
        annualLoss: "₹990 Cr investment generated ₹50,447 Cr benefit",
        rootCause:
          "NCAER's independent study on the National Monsoon Mission demonstrated that meteorological forecasts yield a 50× return on investment, with 98% of farmers acting on advisories.",
        impactMetrics: [
          "₹990 Cr invested in Monsoon Mission & HPC yielded ₹50,447 Cr benefits",
          "98% of surveyed agriculturalists modified farm actions based on forecasts",
          "24-hour advance warning reduces event damage by up to 30% (WMO)",
        ],
        citation: {
          title: "Economic Benefit Assessment of National Monsoon Mission",
          source: "National Council of Applied Economic Research (NCAER) for MoES, 2020",
          url: "https://www.deccanherald.com/",
        },
      },
      {
        category: "3. Digital Penetration & Connectivity Barriers",
        annualLoss: "43% internet penetration in rural Bihar",
        rootCause:
          "According to IAMAI-Kantar (Jan 2025), India has 886 million internet users, but rural states like Bihar have the lowest penetration at 43%. Warnings must be voice-first and work over voice notes or SMS.",
        impactMetrics: [
          "Bihar has India's lowest internet penetration at 43%",
          "Complex mobile dashboards fail non-literate and low-bandwidth users",
          "Voice in native dialects (e.g. Bhojpuri) overcomes literacy barriers",
        ],
        citation: {
          title: "Internet in India 2024 Report",
          source: "IAMAI – Kantar Digital Report (Jan 2025)",
          url: "https://yourstory.com/",
        },
      },
      {
        category: "4. Mission Mausam & Next-Gen Forecasting",
        annualLoss: "₹2,000 Cr Cabinet Outlay",
        rootCause:
          "The Union Cabinet approved Mission Mausam (₹2,000 Cr) in September 2024 to dramatically improve weather observation, high-resolution AI block-level modelling, and decision support.",
        impactMetrics: [
          "₹2,000 Cr outlay approved for Mission Mausam (Cabinet, Sep 2024)",
          "Focus on AI block-level forecasts and cloud GIS decision support",
          "WeatherGPT acts as an open conversational decision interface to this backbone",
        ],
        citation: {
          title: "Cabinet Approves Mission Mausam",
          source: "Press Information Bureau (PIB) / WMO, Sep 2024",
          url: "https://wmo.int/",
        },
      },
    ],
    gapComparison: {
      legacyTitle: "What Exists Today, and What's Still Hard",
      legacyPoints: [
        "SACHET has sent 6,899 crore alert SMS in 19+ languages, but messages are broadcast text blasts that cannot answer follow-up questions",
        "Mausamgram gives village-level forecasts for ~2.6 lakh gram panchayats, but users must navigate tabular website portals",
        "IMD already runs wis2box and modern data formats, but raw data requires specialized conversion for citizen use",
        "SAMUDRA provides vessel-specific marine advisories, but lacks conversational voice interaction in coastal dialects",
        "Passive website portals require manual searching during rapidly evolving convective storms or lightning hazards",
      ],
      solutionTitle: "WeatherGPT: We Plug In, Not Replace",
      solutionPoints: [
        "Warning-locked: If an active NDMA-SACHET alert covers the citizen's location, the answer strictly begins with that alert",
        "Two-way conversational voice: Citizens ask questions naturally in Hindi or Bhojpuri and receive spoken guidance",
        "Auditable receipts: Every answer ends with an explicit source line citing the issuing agency and validity time",
        "Number check before reply: Every temperature, rain mm, or time in the text is checked against API output",
        "Replay mode for evaluators: Test real past warning scenarios (e.g. Rohtas lightning warning) even on a calm day",
      ],
    },
  },
  architecture: {
    sectionTitle: "System Architecture & Engineering Stack",
    headline: "Live Stack Matching Submitted SIH 2026 Presentation",
    summary:
      "A Next.js (App Router) PWA backed by PostgreSQL/PostGIS, Gemini Flash for language generation, Bhashini speech services, and direct NDMA-SACHET CAP 1.2 ingestion.",
    columns: [
      {
        layerNumber: 1,
        title: "Ingestion & Public Telemetry",
        subtitle: "NDMA CAP 1.2, WIS2 & Open-Meteo",
        throughput: "Polled every 5 minutes",
        items: [
          {
            name: "NDMA SACHET CAP 1.2 Ingest Worker",
            tech: "Node.js Server Process + PostGIS",
            description:
              "Polls public NDMA-SACHET CAP 1.2 RSS feeds, parses XML polygon coordinates, and stores them in PostgreSQL with `geometry(Polygon,4326)`.",
            specs: ["CAP 1.2 XML parser", "ST_Contains point-in-polygon queries", "Severity & validity indexing"],
          },
          {
            name: "Forecast Telemetry & Fallback",
            tech: "Open-Meteo GFS API + IMD API (Applied)",
            description:
              "Fetches hourly precipitation, wind gusts, temperature, and convective indices. Serves as transparently labelled forecast fallback.",
            specs: ["Hourly GFS forecast", "Sub-200ms latency", "Labelled fallback receipts"],
          },
        ],
      },
      {
        layerNumber: 2,
        title: "Safety Rules & Intent Engine",
        subtitle: "Warning-Lock & Number Check",
        throughput: "Deterministic safety checks",
        items: [
          {
            name: "Warning-Lock Rule Engine",
            tech: "TypeScript (Server Route Handler)",
            description:
              "Checks if the user's coordinates fall within any active CAP polygon. If true, locks the response to lead with the official warning; LLM cannot declare conditions safe.",
            specs: ["ST_Contains geometric check", "Immutable warning injection", "Zero false-negative safety"],
          },
          {
            name: "Number Check & Receipt Generator",
            tech: "Regex Assertion & Fact-Checking Filter",
            description:
              "Extracts all numbers and times from the generated reply and matches them against tool output. Formats the mandatory receipt line citing issuer and timestamp.",
            specs: ["Source number verification", "Template fallback on discrepancy", "Standardized receipt formatting"],
          },
        ],
      },
      {
        layerNumber: 3,
        title: "Speech & District Operations",
        subtitle: "Bhashini Voice & Leaflet Officer View",
        throughput: "Multilingual citizen delivery",
        items: [
          {
            name: "Bhashini Multilingual Voice Layer",
            tech: "Bhashini ULCA ASR/TTS + Web Speech fallback",
            description:
              "Processes citizen voice notes in Hindi and Bhojpuri and synthesizes spoken advisories with an evaluator English transcript.",
            specs: ["Tested Hindi & Bhojpuri", "Web Speech API fallback", "Target latency ≤ 8s"],
          },
          {
            name: "District Officer Polygon View",
            tech: "Leaflet + OpenStreetMap + PostGIS",
            description:
              "Visual dashboard for DDMA officers displaying active CAP alert polygons, question frequency counts by block, and sample citizen queries.",
            specs: ["Interactive Leaflet map", "Block-level question counts", "Sample data labelling"],
          },
        ],
      },
    ],
  },
  feasibility: {
    sectionTitle: "Feasibility, Risks & Mitigation Strategies",
    headline: "Pragmatic Engineering Solutions for High-Stakes Weather Delivery",
    summary:
      "Clear, candid strategies to manage connectivity blackouts, model hallucinations, and institutional integration.",
    rows: [
      {
        id: "WG-01",
        riskCategory: "Safety & Accuracy",
        riskTitle: "AI Hallucinating Forecast Numbers or Dismissing Warnings",
        riskDescription:
          "An LLM misstating rainfall volume or telling a citizen it is safe when an active lightning alert exists risks human lives.",
        severity: "CRITICAL",
        safeguardTitle: "Warning-Lock Architecture & Regex Number Check",
        safeguardDescription:
          "When a coordinate falls inside an active CAP alert polygon, the response is locked to begin with the official hazard instructions. All numbers in the reply are verified against source data.",
        engineeringImplementation:
          "TypeScript assertion node in route handler; fails over to verified deterministic template if any hallucinated number is detected.",
      },
      {
        id: "WG-02",
        riskCategory: "Dialect & Literacy",
        riskTitle: "Complex Technical English / Hindi Text Bulletins",
        riskDescription:
          "Citizens in rural areas (e.g. Rohtas, Bihar) struggle with dense meteorological jargon like 'convective instability' or 'synoptic chart'.",
        severity: "HIGH",
        safeguardTitle: "Bhashini Native Voice Notes with Clear Action Directives",
        safeguardDescription:
          "Translates meteorological guidance into plain spoken language: 'Stay inside pucca house; do not stand under trees between 2 PM and 5 PM.'",
        engineeringImplementation:
          "Bhashini ULCA speech pipeline with browser Web Speech API fallback for zero-install client playback.",
      },
      {
        id: "WG-03",
        riskCategory: "API Whitelisting & Continuity",
        riskTitle: "Pending Official IMD API IP-Whitelisting",
        riskDescription:
          "Direct IMD programmatic API access requires formal administrative whitelisting which is pending approval.",
        severity: "MEDIUM",
        safeguardTitle: "Transparent Open-Meteo & SACHET RSS Fallback",
        safeguardDescription:
          "The system openly labels its forecast source. Currently uses public NDMA SACHET CAP 1.2 RSS feeds and Open-Meteo GFS with clear receipts.",
        engineeringImplementation:
          "Pluggable data adapter pattern; can switch to direct IMD APIs immediately upon institutional whitelisting.",
      },
      {
        id: "WG-04",
        riskCategory: "Institutional Alignment",
        riskTitle: "Duplicating Existing Government Infrastructure",
        riskDescription:
          "Building redundant warning networks that compete with official government portals like SACHET or Mausamgram.",
        severity: "MEDIUM",
        safeguardTitle: "'We Plug In, Not Replace' Architecture",
        safeguardDescription:
          "WeatherGPT operates strictly as a conversational last-mile interface to existing national digital public infrastructure.",
        engineeringImplementation:
          "Ingests SACHET CAP 1.2 and cites original government sources in every citizen receipt line.",
      },
    ],
  },
  impact: {
    sectionTitle: "Quantified Impact & Evaluation Parameters",
    headline: "Measurable Human and Economic Protection",
    summary:
      "Every metric grounded in official research, highlighting how conversational voice delivery bridges the last-mile gap.",
    rows: [
      {
        dimension: "Safety Architecture",
        statusQuo: "Broadcast text SMS without two-way conversational inquiry",
        ourSolution: "Warning-locked voice replies citing official NDMA SACHET CAP 1.2 alerts",
        metricGain: "Warning-first delivery",
        tag: {
          type: "Design target",
          detail: "Core prototype rule",
        },
      },
      {
        dimension: "Disaster Preparedness",
        statusQuo: "24-hour warning reduces event damage up to 30% (WMO)",
        ourSolution: "Action-oriented guidance delivered before hazard onset with clear timestamps",
        metricGain: "Actionable lead time",
        tag: {
          type: "Source",
          url: "https://wmo.int/",
          detail: "WMO Early Warnings for All",
        },
      },
      {
        dimension: "Language & Inclusion",
        statusQuo: "Bihar rural internet penetration is 43% (IAMAI 2025)",
        ourSolution: "Spoken Hindi and Bhojpuri audio notes with simple tap-able questions",
        metricGain: "Dialect accessibility",
        tag: {
          type: "Source",
          url: "https://yourstory.com/",
          detail: "IAMAI-Kantar Report Jan 2025",
        },
      },
      {
        dimension: "National Return on Investment",
        statusQuo: "Monsoon Mission ₹990 Cr generated ₹50,447 Cr in economic benefits (NCAER)",
        ourSolution: "Amplifies public meteorological investment through conversational last-mile delivery",
        metricGain: "50× leverage on public data",
        tag: {
          type: "Source",
          url: "https://www.deccanherald.com/",
          detail: "NCAER 2020 Study for MoES",
        },
      },
      {
        dimension: "Auditable Transparency",
        statusQuo: "Generative chatbots that do not cite meteorological sources or timestamps",
        ourSolution: "Every reply concludes with an immutable receipt line citing source and validity",
        metricGain: "100% receipt transparency",
        tag: {
          type: "Measured",
          detail: "Verified across all prototype test queries (18 Sep 2026)",
        },
      },
    ],
  },
  proofOfWork: {
    sectionTitle: "Proof of Work & Verifiable Assets",
    headline: "Public GitHub Repository, Live Schemas & Audio Samples",
    summary:
      "All code, alert ingesters, and schemas are open and auditable by evaluators.",
    items: [
      {
        id: "repo",
        title: "Public GitHub Repository",
        subtitle: "Next.js App Router, CAP Parser & Ingestion Worker",
        badge: "Public SIH 2026 Repo",
        description:
          "Auditable codebase containing NDMA-SACHET CAP parser, warning-lock rule engine, and Leaflet polygon viewer.",
        actionText: "Open GitHub Repository",
        url: "https://github.com/lohitakshcodes/claudemaxdedo-sih2026",
      },
      {
        id: "api",
        title: "API Schemas & Test Endpoints",
        subtitle: "Zod-Validated Route Handlers",
        badge: "OpenAPI & Zod",
        description:
          "Inspect the request and response schemas for `/api/weathergpt` including CAP alert matching and number check assertions.",
        actionText: "Inspect API Schemas",
        modalType: "swagger",
      },
      {
        id: "dataset",
        title: "Sample CAP 1.2 XML Disaster Datasets",
        subtitle: "Rohtas Lightning & Bihar Alerts",
        badge: "CAP 1.2 XML",
        description:
          "Examine sample NDMA-SACHET CAP 1.2 XML alert files used to verify point-in-polygon matching and replay mode.",
        actionText: "View Datasets",
        modalType: "dataset",
      },
      {
        id: "audio",
        title: "Recorded Audio Voice Samples",
        subtitle: "Synthesized Hindi & Bhojpuri Warnings",
        badge: "Bhashini Audio",
        description:
          "Listen to sample warning-locked voice notes synthesized in Hindi and Bhojpuri for the Rohtas lightning scenario.",
        actionText: "Play Voice Samples",
        modalType: "audio",
      },
    ],
  },
  team: {
    sectionTitle: "Team Execution Roster",
    headline: "Team ClaudeMaxDedo (Team ID SIH079)",
    summary:
      "Student engineering team building practical digital solutions for Smart India Hackathon 2026.",
    members: [
      {
        name: "Shreya Deshpande",
        operationalRole: "Team Leader & Agentic AI Architect",
        coreDiscipline: "Applied AI & Prompt Guardrails",
        keyContributions: [
          "Implemented Warning-Lock constraint pipeline and receipt formatting",
          "Engineered multi-dialect prompt templates and fact-check filters",
        ],
        github: "https://github.com/shreyadeshpande0656",
        linkedin: "https://www.linkedin.com/in/shreya-deshpande-148945321",
        initials: "SD",
      },
      {
        name: "Lohitaksh Bisen",
        operationalRole: "Fullstack & Ingest Worker Lead",
        coreDiscipline: "Backend Ingestion & Real-Time Queues",
        keyContributions: [
          "Built NDMA-SACHET CAP 1.2 XML parser and Open-Meteo GFS fetcher",
          "Created Node.js server route handlers with Zod schema validation",
        ],
        github: "https://github.com/lohitakshcodes",
        linkedin: "https://www.linkedin.com/in/lohitakshbisen",
        initials: "LB",
      },
      {
        name: "Tanvi Hardas",
        operationalRole: "Geospatial & Remote Sensing Specialist",
        coreDiscipline: "GIS & PostGIS Spatial Geometry",
        keyContributions: [
          "Configured PostGIS ST_Contains point-in-polygon alert checking",
          "Built Leaflet interactive map displaying active CAP disaster polygons",
        ],
        github: "https://github.com/tanvihardas",
        linkedin: "https://www.linkedin.com/in/tanvihardas/",
        initials: "TH",
      },
      {
        name: "Anuj Bhure",
        operationalRole: "Frontend & PWA Lead",
        coreDiscipline: "Mobile Web & PWA Systems",
        keyContributions: [
          "Designed dual-screen prototype (Citizen Voice Screen + District Officer Map)",
          "Ensured responsive layout tested on 380px mobile viewports",
        ],
        github: "https://github.com/anujdbhure",
        linkedin: "https://www.linkedin.com/in/anuj-d-bhure-05b22a373/",
        initials: "AB",
      },
      {
        name: "Arush Sinha",
        operationalRole: "Speech & Multilingual NLP Engineer",
        coreDiscipline: "Indic Language Technologies",
        keyContributions: [
          "Connected Bhashini ULCA ASR and TTS endpoints for Hindi and Bhojpuri",
          "Configured browser Web Speech API fallback for zero-dependency playback",
        ],
        github: "https://github.com/arushsinha896-cmd",
        linkedin: "https://www.linkedin.com/in/arushsinha206/",
        initials: "AS",
      },
      {
        name: "Siddharth Gupta",
        operationalRole: "DevOps & Database Lead",
        coreDiscipline: "Cloud Infrastructure & CI/CD",
        keyContributions: [
          "Configured PostgreSQL database schemas and PostGIS spatial extensions",
          "Managed Vercel deployment and continuous integration workflow",
        ],
        github: "https://github.com/SiddharthGupta2611",
        linkedin: "https://www.linkedin.com/in/siddharth-gupta-72071232b",
        initials: "SG",
      },
    ],
  },
};
