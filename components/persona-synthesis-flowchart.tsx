"use client";

import React, { useState } from "react";
import {
  Users,
  Plane,
  Anchor,
  Building2,
  Sprout,
  ArrowRight,
  Filter,
  CheckCircle2,
  Volume2,
  FileCode,
  AlertTriangle,
  Smartphone,
  Cpu,
  Layers,
} from "lucide-react";

export const PersonaSynthesisFlowchart: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<"farmer" | "pilot" | "fisherman" | "city">("farmer");

  // Raw meteorological scenario from Research Doc 2 Page 28
  const rawWeather = {
    location: "Pune, Maharashtra (18.5204° N, 73.8567° E)",
    temp: "29°C",
    rain: "35mm expected tomorrow afternoon",
    humidity: "88%",
    wind: "24 km/h",
    radar: "Convective cell forming at 142° azimuth",
  };

  const personas = [
    {
      id: "farmer",
      name: "1. Smallholder Farmer",
      icon: Sprout,
      category: "Agrarian Producer",
      color: "emerald",
      contextPayload: {
        crop: "Cotton (Flowering Stage)",
        soil: "Black Cotton Clay (Vertisol)",
        location: "Baramati, Pune District",
        preferredMode: "WhatsApp Audio (Marathi)",
      },
      filteredMetrics: ["Rain Volume (35mm)", "Relative Humidity (88%)", "ICAR Pesticide Wash-off Rule"],
      promptInstruction: `You are an expert Agricultural Advisor.
- Translate technical weather into actionable farm advice (Sowing, Spraying, Irrigation, Harvesting).
- Do NOT use scientific terms like "Convective Precipitation"; say "Heavy rain".
- Keep sentences short, conversational, and direct for easy Text-to-Speech conversion.`,
      outputChannel: "WhatsApp Voice Note (Marathi audio note via Bhashini)",
      finalOutput:
        "Namaskar! 35mm of heavy rain is expected in your area tomorrow afternoon. Please delay spraying pesticide on your cotton crop until Thursday morning so it doesn't wash away. Keep harvested crops covered.",
      whyItWorks: "The farmer isn't confused by METAR flight codes or isobar charts; they get 1 concrete action.",
    },
    {
      id: "pilot",
      name: "2. Commercial Aviation Pilot",
      icon: Plane,
      category: "Aviation Operations",
      color: "blue",
      contextPayload: {
        flight: "AI-842 (DEL -> PNQ / VAPO)",
        aircraft: "Airbus A320neo",
        runway: "Runway 28 (Pune Airport)",
        preferredMode: "Electronic Flight Bag (EFB) Data Card",
      },
      filteredMetrics: ["Wind Vectors (24 km/h gusting 32 kts)", "Runway Crosswind Limits", "Cloud Ceiling & Visibility"],
      promptInstruction: `You are a Flight Meteorological Briefing System.
- Focus strictly on flight safety metrics: Ceiling, Visibility, Wind Shear, Turbulence.
- Present data using standard ICAO aviation formats (METAR/TAF) alongside a concise plain-text executive summary.`,
      outputChannel: "Electronic Flight Bag (EFB) / ACARS Digital Dispatch",
      finalOutput:
        "Alert: Convective activity predicted over Pune (VAPO) between 12:00-16:00 UTC. Precip rate 35mm/hr, gusting winds up to 24 kts. Expect low visibility and mid-air holding patterns during approach.",
      whyItWorks: "The pilot isn't given cotton crop advice; they get immediate runway visibility and holding estimates.",
    },
    {
      id: "fisherman",
      name: "3. Traditional Coastal Fisherman",
      icon: Anchor,
      category: "Marine & Coastal Operations",
      color: "cyan",
      contextPayload: {
        vessel: "Motorized Wooden Trawler (9m)",
        harbor: "Ratnagiri Coast (Arabian Sea)",
        navigationLimit: "12 Nautical Miles",
        preferredMode: "VHF Marine Radio / WhatsApp Voice (Konkani)",
      },
      filteredMetrics: ["Surface Winds (24 km/h)", "Wave Swell Height (2.5m)", "Squall Probability"],
      promptInstruction: `You are a Marine Safety Officer.
- Focus on Sea-State, Wave Heights, Squall probability, and Distance from Shore.
- State explicitly whether it is SAFE or UNSAFE to go to sea.`,
      outputChannel: "Harbor Loudspeaker Broadcast & WhatsApp Voice Note",
      finalOutput:
        "Warning: Wind speeds reaching 24 km/h with 2.5m wave swells tomorrow afternoon. Unsafe for small trawlers beyond 5 nautical miles. Return to shore before 2:00 PM.",
      whyItWorks: "Gives an unequivocal binary decision: SAFE or UNSAFE to go to sea.",
    },
    {
      id: "city",
      name: "4. Smart City Disaster Engineer",
      icon: Building2,
      category: "Urban Municipality & CWC",
      color: "amber",
      contextPayload: {
        municipality: "Pune Municipal Corporation (PMC)",
        catchment: "Mutha River Basin (Zone 3)",
        drainCapacity: "25 mm/hr peak flow",
        preferredMode: "Emergency Dashboard Push & Automated SMS",
      },
      filteredMetrics: ["Rainfall Intensity (35mm in 1 hr)", "Urban Runoff Index (82%)", "River Sump Capacity"],
      promptInstruction: `You are an Urban Flood Management System.
- Focus on runoff coefficients, storm drain discharge limits, and catchment overflow.
- Issue specific gate-opening and evacuation instructions.`,
      outputChannel: "Municipal Operations Center (EOC) Dashboard Alert",
      finalOutput:
        "Red Alert: Zone 3 rainfall intensity will exceed 30mm/hr at 14:00 hrs. Runoff probability at 82%. Recommended action: Clear storm drain inlets near River Bridge #2 immediately and open sluice gates.",
      whyItWorks: "Enables city engineers to pre-emptively clear culverts and open sluice gates before streets flood.",
    },
  ];

  const current = personas.find((p) => p.id === selectedPersona) || personas[0];
  const Icon = current.icon;

  return (
    <div className="web2-panel rounded-lg border border-zinc-300 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider">
              Research Blueprint &bull; Pages 28–31
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            5-Step Persona Adaptation Flowchart: One Raw Weather Event, Four Distinct Actions
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
            WeatherGPT never uses a generic prompt like &quot;act like a weather bot&quot;. Instead, our LangGraph router identifies who is asking, isolates persona-specific metrics, and adapts formatting dynamically.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {personas.map((p) => {
            const PIcon = p.icon;
            const isSel = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id as any)}
                className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 border ${
                  isSel
                    ? "bg-zinc-900 text-white border-zinc-950 shadow-sm"
                    : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                }`}
              >
                <PIcon className="w-3.5 h-3.5" />
                <span>{p.name.split(". ")[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Raw Event Banner */}
      <div className="bg-zinc-100 border border-zinc-300 rounded-md p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-800 uppercase">Incoming Raw Event:</span>
          <span className="text-zinc-700">{rawWeather.location}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-600">
          <span>Temp: <strong>{rawWeather.temp}</strong></span>
          <span>&bull;</span>
          <span>Rain: <strong className="text-blue-700">{rawWeather.rain}</strong></span>
          <span>&bull;</span>
          <span>Wind: <strong>{rawWeather.wind}</strong></span>
          <span>&bull;</span>
          <span>RH: <strong>{rawWeather.humidity}</strong></span>
        </div>
      </div>

      {/* 5-Step Visual Pipeline Flowchart */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Step 1 */}
          <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/70 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase">
                <span>Step 01</span>
                <span className="bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700">Resolver</span>
              </div>
              <h4 className="font-bold text-xs text-zinc-900 mt-1">Context Extraction</h4>
              <p className="text-[11px] text-zinc-600 mt-1 leading-normal font-sans">
                Inspects metadata, query intent, and GPS to resolve persona profile.
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-zinc-200 font-mono text-[10px] text-zinc-700 space-y-0.5">
              <div className="text-zinc-500 uppercase font-bold">Resolved Profile:</div>
              <div className="font-bold text-zinc-900">{current.category}</div>
              <div className="text-zinc-500 truncate">{current.contextPayload.preferredMode}</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/70 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase">
                <span>Step 02</span>
                <span className="bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">Filter</span>
              </div>
              <h4 className="font-bold text-xs text-zinc-900 mt-1">Tool Execution</h4>
              <p className="text-[11px] text-zinc-600 mt-1 leading-normal font-sans">
                Fires selective background tools strictly required by this user type.
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-zinc-200 font-mono text-[10px] text-zinc-700 space-y-0.5">
              <div className="text-zinc-500 uppercase font-bold">Filtered Metrics:</div>
              {current.filteredMetrics.map((m, i) => (
                <div key={i} className="truncate text-blue-800 font-semibold">&bull; {m}</div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/70 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase">
                <span>Step 03</span>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">Fusion</span>
              </div>
              <h4 className="font-bold text-xs text-zinc-900 mt-1">Domain Rule Fusion</h4>
              <p className="text-[11px] text-zinc-600 mt-1 leading-normal font-sans">
                Merges numbers with domain operational boundaries (ICAR / ICAO / CWC).
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-zinc-200 font-mono text-[10px] text-zinc-700">
              <span className="text-zinc-500 block">[Raw Metrics] + [Domain Rules] =</span>
              <strong className="text-emerald-700 block mt-0.5">Actionable Target Plan</strong>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/70 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase">
                <span>Step 04</span>
                <span className="bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded">Prompt</span>
              </div>
              <h4 className="font-bold text-xs text-zinc-900 mt-1">Prompt Injection</h4>
              <p className="text-[11px] text-zinc-600 mt-1 leading-normal font-sans">
                Locks down tone, vocabulary, and units using targeted prompt templates.
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-zinc-200 font-mono text-[10px] text-zinc-600 truncate">
              {current.promptInstruction.slice(0, 70)}...
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-lg border border-emerald-400 bg-emerald-50/60 flex flex-col justify-between space-y-2 shadow-sm">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-800 uppercase">
                <span>Step 05</span>
                <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">Delivery</span>
              </div>
              <h4 className="font-bold text-xs text-emerald-950 mt-1">Tailored Action</h4>
              <p className="text-[11px] text-emerald-800 mt-1 leading-normal font-sans">
                Formats output for the specific device and literacy level.
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-emerald-200 font-mono text-[10px] text-emerald-900 font-semibold">
              {current.outputChannel}
            </div>
          </div>
        </div>
      </div>

      {/* Persona Output Showcase Box */}
      <div className="p-4 rounded-lg border border-zinc-300 bg-zinc-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-xs uppercase font-mono text-zinc-600">
              Synthesized Output for {current.name}:
            </span>
          </div>
          <p className="text-sm font-semibold text-zinc-900 bg-white p-3 rounded border border-zinc-200 leading-relaxed font-sans shadow-inner">
            &quot;{current.finalOutput}&quot;
          </p>
          <div className="text-[11px] font-mono text-zinc-500 pt-1">
            <strong>Why this works:</strong> {current.whyItWorks}
          </div>
        </div>

        <div className="shrink-0 bg-white p-3 rounded border border-zinc-200 text-xs font-mono text-zinc-700 space-y-1.5">
          <div className="font-bold text-zinc-800 uppercase text-[10px]">Verification Summary</div>
          <div>Latency: <strong className="text-emerald-700">&lt; 180ms</strong></div>
          <div>Accuracy: <strong className="text-emerald-700">100% GFS Match</strong></div>
          <div>Jargon Level: <strong className="text-zinc-900">Zero Code Words</strong></div>
        </div>
      </div>
    </div>
  );
};
