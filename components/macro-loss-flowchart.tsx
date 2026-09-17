"use client";

import React, { useState } from "react";
import {
  CloudLightning,
  ShieldAlert,
  Sprout,
  Users,
  FlaskConical,
  ExternalLink,
  Info,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

interface MacroLossFlowchartProps {
  projectId: "weathergpt" | "krishismriti";
}

export const MacroLossFlowchart: React.FC<MacroLossFlowchartProps> = ({ projectId }) => {
  const [selectedSector, setSelectedSector] = useState<number>(0);

  const isWeather = projectId === "weathergpt";

  // Verified figures matching PPT Slide 6 references
  const weatherSectors = [
    {
      id: 0,
      name: "Extreme Weather Days & Casualties",
      icon: CloudLightning,
      primaryStat: "99% of days in Jan–Sep 2025",
      secondaryStat: "4,064 Deaths Recorded",
      sourceName: "CSE & Down To Earth (Nov 2025)",
      sourceUrl: "https://www.cseindia.org/extreme-weather-events-2025-report",
      tagType: "Source",
      sharePct: 35,
      coreDriver: "Extreme weather occurred on nearly every day in early 2025 across 33 states/UTs.",
      consequence: "Loss of 4,064 lives, 3.2M hectares of crops damaged, and massive infrastructure disruption.",
      solution: "Warning-locked voice advisories that instantly prioritize CAP 1.2 alerts over casual queries.",
    },
    {
      id: 1,
      name: "Lightning Casualties (Rural Bias)",
      icon: ShieldAlert,
      primaryStat: "39.7% of Nature-Related Deaths",
      secondaryStat: "2,558 Deaths in 2023",
      sourceName: "NCRB ADSI 2023",
      sourceUrl: "https://downtoearth.org.in/natural-disasters/lightning-deaths-ncrb-2023",
      tagType: "Source",
      sharePct: 25,
      coreDriver: "Outdoor agricultural workers in rural states (e.g. Rohtas, Bihar) receive radar alerts too late.",
      consequence: "Lightning accounted for 2,558 deaths out of 6,437 nature-related accidental deaths nationwide in 2023.",
      solution: "Local polygon-matched lightning warnings that alert the user when their GPS point falls inside an active CAP zone.",
    },
    {
      id: 2,
      name: "Early Warning Payoff (50x Benefit)",
      icon: TrendingDown,
      primaryStat: "₹50,447 Cr Economic Benefit",
      secondaryStat: "₹990 Cr HPC Investment",
      sourceName: "NCAER 2020 for MoES",
      sourceUrl: "https://www.deccanherald.com/india/monsoon-mission-yields-50-times-returns-ncaer-study-897368.html",
      tagType: "Source",
      sharePct: 20,
      coreDriver: "High-performance forecasting creates immense value, but 98% of benefit depends on farmer comprehension.",
      consequence: "Farmers who received and acted on agromet advisories saved substantial input and irrigation costs.",
      solution: "Two-way voice communication converting complex meteorologist radar data into clear, actionable advice.",
    },
    {
      id: 3,
      name: "WMO Global Early Warning Benchmark",
      icon: Info,
      primaryStat: "Damage Cut Up To 30%",
      secondaryStat: "8x Lower Mortality",
      sourceName: "WMO Early Warnings for All",
      sourceUrl: "https://wmo.int/early-warnings-for-all",
      tagType: "Source",
      sharePct: 12,
      coreDriver: "WMO findings prove that a 24-hour warning reduces impending disaster damage by nearly a third.",
      consequence: "Countries with limited early warning coverage experience 8 times higher disaster mortality.",
      solution: "Zero-latency warning check ensuring active hazard polygons override normal weather responses.",
    },
    {
      id: 4,
      name: "Rural Digital & Literacy Barrier",
      icon: Users,
      primaryStat: "43% Penetration in Bihar",
      secondaryStat: "886M Internet Users Total",
      sourceName: "IAMAI–Kantar (Jan 2025)",
      sourceUrl: "https://yourstory.com/2025/01/iamai-kantar-report-india-internet-users-2024",
      tagType: "Source",
      sharePct: 8,
      coreDriver: "While national internet penetration grows, states like Bihar remain below 45% digital reach.",
      consequence: "Complex English/Hindi weather apps fail rural citizens who rely solely on spoken dialect.",
      solution: "Voice-first PWA with Bhashini Indic ASR/TTS for Bhojpuri and Hindi, with SMS fallback.",
    },
  ];

  // Verified figures matching KrishiSmriti PPT references
  const agriSectors = [
    {
      id: 0,
      name: "Agricultural Extension Gap",
      icon: Users,
      primaryStat: "57.8% Received No Advice",
      secondaryStat: "42.2% Got Technical Guidance",
      sourceName: "NSS 77th Round, NSO (2021)",
      sourceUrl: "https://mospi.gov.in/sites/default/files/publication_reports/Report_no_587_NSS_77th_Round.pdf",
      tagType: "Source",
      sharePct: 35,
      coreDriver: "The majority of smallholder households have zero access to reliable agronomic extension officers.",
      consequence: "Critical decisions on sowing, spraying, and irrigation are made through guesswork or input shopkeepers.",
      solution: "An autonomous farm second brain that remembers plot history and provides one verified daily action.",
    },
    {
      id: 1,
      name: "Extreme Weather Crop Losses",
      icon: Sprout,
      primaryStat: "68.9 Million Hectares Damaged",
      secondaryStat: "33.9M Ha Rain + 35M Ha Drought",
      sourceName: "WEF Report via AffairsCloud (2015–21)",
      sourceUrl: "https://affairscloud.com/india-lost-33-9-million-hectares-of-crops-due-to-excess-rain-wef-report/",
      tagType: "Source",
      sharePct: 25,
      coreDriver: "Unpredicted heavy rainfall and severe droughts during critical vegetative and harvest phases.",
      consequence: "Massive localized crop failure across 68.9M ha over 6 years without farm-level contingency guidance.",
      solution: "Cross-factor check combining Open-Meteo hourly rain/wind with soil moisture to protect field work.",
    },
    {
      id: 2,
      name: "Accidental Chemical Poisoning",
      icon: FlaskConical,
      primaryStat: "~7,000 Deaths / Year",
      secondaryStat: "NCRB ADSI (2014–21 Avg)",
      sourceName: "NCRB Accidental Deaths & Suicides in India",
      sourceUrl: "https://ncrb.gov.in/adsi-reports-of-previous-years",
      tagType: "Source",
      sharePct: 20,
      coreDriver: "Unguided chemical dosages and dangerous spraying in high winds lead to severe respiratory and dermal toxicity.",
      consequence: "Tragic loss of lives and long-term farmer neurological impairment from over-concentrated spraying.",
      solution: "Deterministic rule engine that locks dosages to ICAR PoP and warns against spraying in windy conditions.",
    },
    {
      id: 3,
      name: "Agromet Advisory Return on Investment",
      icon: TrendingDown,
      primaryStat: "50x Economic Return",
      secondaryStat: "₹990 Cr → ₹50,447 Cr",
      sourceName: "NCAER 2020 Study for MoES",
      sourceUrl: "https://www.deccanherald.com/india/monsoon-mission-yields-50-times-returns-ncaer-study-897368.html",
      tagType: "Source",
      sharePct: 12,
      coreDriver: "Quantified proof that timely weather and crop advisories generate massive direct savings for cultivators.",
      consequence: "Farmers who synchronize irrigation with rainfall forecasts avoid wasting costly diesel and electricity.",
      solution: "Daily 'Single Best Action' home card synthesizing weather, soil moisture, and power schedules.",
    },
    {
      id: 4,
      name: "Digital Agriculture Mission",
      icon: Layers,
      primaryStat: "₹2,817 Cr Approved",
      secondaryStat: "Krishi-DSS & AgriStack Base",
      sourceName: "PIB Press Release (Sept 2024)",
      sourceUrl: "https://pib.gov.in/PressReleasePage.aspx?PRID=2050965",
      tagType: "Source",
      sharePct: 8,
      coreDriver: "Government initiative establishing digital public infrastructure for Indian agriculture.",
      consequence: "Enables vendor-neutral public platforms to connect farmer IDs (AgriStack) with decision support systems.",
      solution: "Free B2G deployment model funded through state Digital Agriculture Mission grants for Gram Panchayats.",
    },
  ];

  const currentSectors = isWeather ? weatherSectors : agriSectors;
  const current = currentSectors[selectedSector] || currentSectors[0];
  const Icon = current.icon;

  return (
    <div className="web2-panel rounded-lg border border-zinc-300 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider">
              Evidence-Backed Problem Diagnostics &bull; Verified Citations
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            {isWeather
              ? "The Last-Mile Weather Deficit: 5 Verified Structural Vulnerabilities"
              : "Decision Blindness in Agriculture: 5 Verified Ground-Truth Evidence Points"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
            {isWeather
              ? "The crisis is not the lack of satellite data—it is the last-mile comprehension deficit. Click any sector to view verified government and academic evidence."
              : "Smallholder farmers struggle with single-factor thinking. Click any ground-truth challenge to inspect verified research data and our rule-engine mitigation."}
          </p>
        </div>

        <div className="bg-zinc-100 border border-zinc-300 p-2.5 rounded-md text-xs font-mono shrink-0">
          <div className="text-zinc-600 font-bold uppercase text-[10px]">Benchmark Research Base:</div>
          <div className="text-xs font-bold text-zinc-900 mt-0.5">
            {isWeather ? "CSE, NCRB, NCAER & WMO" : "NSS 77th, NCRB, WEF & PIB"}
          </div>
        </div>
      </div>

      {/* Visual Proportional Distribution Bar */}
      <div className="space-y-1.5 select-none">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Evidence Distribution:</span>
          <span>Click any block below to inspect details</span>
        </div>
        <div className="h-6 w-full rounded-md overflow-hidden flex border border-zinc-300 shadow-inner">
          {currentSectors.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSector(s.id)}
              style={{ width: `${s.sharePct}%` }}
              className={`h-full cursor-pointer transition-all border-r border-white/40 flex items-center justify-center text-[10px] font-bold text-white ${
                selectedSector === s.id
                  ? "bg-zinc-900 ring-2 ring-zinc-950 z-10"
                  : s.id === 0
                  ? "bg-emerald-800 hover:bg-emerald-900"
                  : s.id === 1
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : s.id === 2
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : s.id === 3
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-emerald-400 hover:bg-emerald-500"
              }`}
              title={`${s.name}: ${s.primaryStat}`}
            >
              <span className="truncate px-1 hidden sm:inline">{s.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Sector Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Sector Selector Tabs */}
        <div className="lg:col-span-4 space-y-2">
          {currentSectors.map((s) => {
            const isSelected = selectedSector === s.id;
            const SectorIcon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSector(s.id)}
                className={`cursor-pointer p-3 rounded-lg border transition-all text-xs font-mono flex items-center justify-between ${
                  isSelected
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded shrink-0 ${
                      isSelected ? "bg-zinc-800 text-emerald-400" : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    <SectorIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{s.name}</div>
                    <div
                      className={`text-[11px] truncate font-sans ${
                        isSelected ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {s.primaryStat}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                    isSelected
                      ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                      : "bg-zinc-100 text-zinc-600 border-zinc-200"
                  }`}
                >
                  {s.tagType}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Column: In-Depth Diagnostic Audit */}
        <div className="lg:col-span-8 bg-zinc-50 border border-zinc-300 rounded-lg p-5 space-y-4">
          {/* Header of Selected Item */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-white border border-zinc-300 text-zinc-800">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-zinc-900">{current.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    {current.primaryStat}
                  </span>
                  <span className="text-xs text-zinc-400">&bull;</span>
                  <span className="text-xs font-mono text-zinc-600">{current.secondaryStat}</span>
                </div>
              </div>
            </div>

            <a
              href={current.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="web2-button text-xs py-1 px-2.5 flex items-center gap-1.5 shrink-0"
            >
              <span>{current.sourceName}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Root Cause & Real-World Consequence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-3 bg-white rounded border border-zinc-200 space-y-1">
              <div className="font-mono text-zinc-500 font-bold uppercase text-[10px]">
                Underlying Ground-Truth Cause:
              </div>
              <p className="text-zinc-700 leading-relaxed">{current.coreDriver}</p>
            </div>

            <div className="p-3 bg-white rounded border border-zinc-200 space-y-1">
              <div className="font-mono text-red-900 font-bold uppercase text-[10px]">
                Documented Impact on Ground:
              </div>
              <p className="text-zinc-700 leading-relaxed">{current.consequence}</p>
            </div>
          </div>

          {/* Engineering Mitigation */}
          <div className="bg-emerald-50/80 border border-emerald-300 rounded p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-emerald-950 uppercase">
                Our Engineering Architecture Counter-Measure:
              </div>
              <p className="text-xs text-emerald-900 font-sans leading-relaxed">
                {current.solution}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
