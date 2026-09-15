"use client";

import React, { useState } from "react";
import {
  TrendingDown,
  Sprout,
  ShieldAlert,
  Building2,
  Plane,
  Anchor,
  IndianRupee,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";

interface MacroLossFlowchartProps {
  projectId: "weathergpt" | "krishismriti";
}

export const MacroLossFlowchart: React.FC<MacroLossFlowchartProps> = ({ projectId }) => {
  const [selectedSector, setSelectedSector] = useState<number>(0);

  const isWeather = projectId === "weathergpt";

  // Data from Research Doc 2 Page 15
  const weatherSectors = [
    {
      id: 0,
      name: "Farmers & Agriculture",
      icon: Sprout,
      annualLossUsd: "$10B – $15B",
      annualLossInr: "₹80,000 Cr – ₹1,20,000 Cr+",
      sharePct: 62,
      coreDriver: "Misinterpreting rainfall timing/intensity; unguided pesticide & sowing schedules.",
      consequence: "Destroyed crop yields, wasted inputs (seeds/fertilizers), post-harvest rotting in open fields.",
      solution: "Hyperlocal H3 geofenced 14-second WhatsApp voice notes in native dialect with radar rain warnings.",
      evidence: "Between 2015-2021, India lost 33.9M hectares to excess rain and 35M hectares to droughts (WEF Report).",
    },
    {
      id: 1,
      name: "Disaster Response & Relief",
      icon: ShieldAlert,
      annualLossUsd: "$5B – $8B",
      annualLossInr: "₹40,000 Cr – ₹64,000 Cr",
      sharePct: 24,
      coreDriver: "Delayed action on broad regional warnings; failure to run geo-fenced targeted evacuations.",
      consequence: "Over-allocation of municipal emergency funds, redundant shelters, destroyed bridges and roads.",
      solution: "Uber H3 spatial geofencing matching active CAP hazard polygons in sub-milliseconds to push targeted alerts.",
      evidence: "State Disaster Management Authorities (SDMAs) suffer from lack of dynamic spatial polygon mapping.",
    },
    {
      id: 2,
      name: "Urban Centers & Smart Cities",
      icon: Building2,
      annualLossUsd: "$1.5B – $3B",
      annualLossInr: "₹12,000 Cr – ₹24,000 Cr",
      sharePct: 9,
      coreDriver: "Lack of block-level urban flood & drainage capacity forecasting.",
      consequence: "Submerged commercial hubs, vehicular destruction, lost working hours due to traffic paralysis.",
      solution: "Real-time rain gauge MQTT streams calculating runoff probability to trigger pre-emptive sluice gate opening.",
      evidence: "Concrete heat islands alter drainage paths, leaving urban centers paralyzed by unpredicted cloudbursts.",
    },
    {
      id: 3,
      name: "Aviation & Logistics",
      icon: Plane,
      annualLossUsd: "$200M – $400M",
      annualLossInr: "₹1,600 Cr – ₹3,200 Cr",
      sharePct: 3,
      coreDriver: "Inability to translate general forecasts into flight-level turbulence & runway crosswinds.",
      consequence: "Flight diversions, millions of liters in excess jet fuel burn, perishable cargo spoilage in transit.",
      solution: "Queries WRF high-resolution grid data for flight ceiling, visibility, and wind shear vectors in tabular METAR.",
      evidence: "Northern India winter fog and sudden convective microbursts cause cascading airline holding patterns.",
    },
    {
      id: 4,
      name: "Fishing & Marine",
      icon: Anchor,
      annualLossUsd: "$150M – $300M",
      annualLossInr: "₹1,200 Cr – ₹2,500 Cr",
      sharePct: 2,
      coreDriver: "Ineffective hyper-local sea-state & wave-height communication to traditional fishermen.",
      consequence: "Capsized boats, abandoned fishing nets, unnecessary shore returns during false alarms, wasted diesel.",
      solution: "Dialect voice warnings calculating wave swell height and squall probability with explicit SAFE/UNSAFE advisory.",
      evidence: "Coastal bulletins broadcast broad wave warnings across hundreds of kilometers of open sea.",
    },
  ];

  // Data from Research Doc 3 Page 20 (Indian Agriculture Breakdown)
  const agriSectors = [
    {
      id: 0,
      name: "Extreme Weather Yield Destruction",
      icon: Sprout,
      annualLossUsd: "$15B – $18B",
      annualLossInr: "₹1,20,000 Cr – ₹1,50,000 Cr",
      sharePct: 38,
      coreDriver: "Unpredicted heavy rain during harvest, unadjusted irrigation schedules, frost/heatwaves.",
      consequence: "33.9 million hectares lost to excess rains and 35 million hectares to drought between 2015–2021.",
      solution: "Sentinel-1 SAR radar soil moisture + Open-Meteo micro-forecasts alerting farmers 72h prior to harvest.",
      evidence: "National Disaster Management Authority (NDMA) & World Economic Forum (WEF) 2024 Audit.",
    },
    {
      id: 1,
      name: "Mandi Price Asymmetry & Distress Sales",
      icon: TrendingDown,
      annualLossUsd: "$6B – $11B",
      annualLossInr: "₹50,000 Cr – ₹90,000 Cr",
      sharePct: 24,
      coreDriver: "Farmers harvest without knowing real-time demand across neighboring APMC yards.",
      consequence: "Truckloads arrive at flooded yards where prices crashed, forcing distress sales at 30-40% discounts.",
      solution: "Real-time Agmarknet mandi arbitrage calculator factoring diesel transit cost per km to maximize net profit.",
      evidence: "NITI Aayog Agrarian Economy Working Group Report on post-harvest market arrival shocks.",
    },
    {
      id: 2,
      name: "Peak Labor Shortages & Harvest Delays",
      icon: AlertOctagon,
      annualLossUsd: "$6B – $10B",
      annualLossInr: "₹50,000 Cr – ₹80,000 Cr",
      sharePct: 20,
      coreDriver: "Simultaneous national demand surges during harvest; labor migration to government schemes (MGNREGA).",
      consequence: "Crops rot in open fields before workers can pick them; emergency wage spikes bankrupt smallholders.",
      solution: "Village-level labor demand smoothing engine that staggers harvest and pools Custom Hiring Center (CHC) machinery.",
      evidence: "ICAR field studies on localized harvest bottlenecking across cotton, soybean, and wheat belts.",
    },
    {
      id: 3,
      name: "Chemical Fertilizer & Pesticide Overuse",
      icon: ShieldAlert,
      annualLossUsd: "$3B – $4.5B",
      annualLossInr: "₹25,000 Cr – ₹35,000 Cr",
      sharePct: 10,
      coreDriver: "Farmers over-apply Urea and toxic pesticides as an unguided precautionary measure.",
      consequence: "Burns cash, causes pest resistance, and strips ₹1.97 Lakh Crore in long-term soil nutrient capacity.",
      solution: "Deterministic Python Math engine locking fertilizer advice to ICAR soil health card equations (NPK/acre).",
      evidence: "ICAR National Bureau of Soil Survey & Land Use Planning; PIB Fertilizer Subsidy Report.",
    },
    {
      id: 4,
      name: "Informal Moneylender Debt Traps",
      icon: IndianRupee,
      annualLossUsd: "$5B",
      annualLossInr: "₹40,000 Cr",
      sharePct: 8,
      coreDriver: "Lacking formal crop planning and scheme access, farmers borrow from local moneylenders at 24%–36% APR.",
      consequence: "Over ₹40,000 Crore lost in exorbitant interest payments alone, leading to chronic generational distress.",
      solution: "Direct integration with PMFBY crop insurance deadlines, AgriStack Farmer IDs, and KVK extension co-pilots.",
      evidence: "RBI Working Group on Agricultural Credit in Rural India.",
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
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider">
              Quantified Problem Evidence &bull; Research Blueprint (Doc 2, P. 15)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            {isWeather
              ? "The Multi-Billion-Dollar Economic Drain: Misinterpretation of Weather across 5 Sectors"
              : "Financial Losses in Indian Agriculture: ₹1.5+ Lakh Crore Annual Breakdown"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
            {isWeather
              ? "The crisis is not the absence of supercomputer weather models—it is the 'Last-Mile Interpretation Deficit'. Click any sector to inspect root causes and quantified consequences."
              : "Smallholder farmers do not lack effort; they lack connected context. Click any economic failure mode to view verified research data and our engineering mitigation."}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 p-2.5 rounded-md text-xs font-mono shrink-0">
          <div className="text-red-900 font-bold">Total Annual Loss in India:</div>
          <div className="text-sm font-extrabold text-red-700">₹1.2L Cr – ₹1.5L Cr+ ($15–18B)</div>
        </div>
      </div>

      {/* Visual Proportional Loss Distribution Bar */}
      <div className="space-y-1.5 select-none">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Sector Loss Distribution:</span>
          <span>Click any block below to inspect</span>
        </div>
        <div className="h-6 w-full rounded-md overflow-hidden flex border border-zinc-300 shadow-inner">
          {currentSectors.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSector(s.id)}
              style={{ width: `${s.sharePct}%` }}
              className={`h-full cursor-pointer transition-all flex items-center justify-center text-[10px] font-mono font-bold truncate px-1 ${
                selectedSector === s.id
                  ? "bg-red-700 text-white"
                  : "bg-zinc-200 hover:bg-red-200 text-zinc-800 border-r border-white/50"
              }`}
              title={`${s.name}: ${s.sharePct}% of total loss (${s.annualLossInr})`}
            >
              {s.sharePct > 7 && `${s.name.split(" ")[0]} (${s.sharePct}%)`}
            </div>
          ))}
        </div>
      </div>

      {/* Sector Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {currentSectors.map((s) => {
          const SIcon = s.icon;
          const isSel = selectedSector === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSector(s.id)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between select-none ${
                isSel
                  ? "bg-red-50 border-red-500 shadow-sm ring-1 ring-red-400"
                  : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <SIcon
                    className={`w-4 h-4 ${isSel ? "text-red-700" : "text-zinc-600"}`}
                  />
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    {s.sharePct}%
                  </span>
                </div>
                <div className="font-bold text-xs text-zinc-900 leading-tight truncate">
                  {s.name}
                </div>
              </div>
              <div className="text-[11px] font-mono font-bold text-red-700 mt-2">
                {s.annualLossUsd}
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Interactive Drilldown Box */}
      <div className="p-4 rounded-lg border border-zinc-300 bg-zinc-50 space-y-3 font-sans text-xs">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-red-700" />
            <span className="font-bold text-sm text-zinc-900">{current.name}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded font-bold border border-red-300">
              Loss: {current.annualLossInr} ({current.annualLossUsd})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase font-bold text-zinc-500">
              Core Driver of Misinterpretation:
            </div>
            <p className="text-zinc-700 leading-relaxed">{current.coreDriver}</p>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase font-bold text-zinc-500">
              Primary Financial Consequence:
            </div>
            <p className="text-red-900 font-medium leading-relaxed">{current.consequence}</p>
          </div>

          <div className="bg-white p-3 rounded border border-zinc-200 space-y-1 font-mono text-[11px]">
            <div className="text-emerald-800 font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>How Our Platform Stops This:</span>
            </div>
            <p className="text-zinc-700 font-sans text-xs leading-relaxed">{current.solution}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Official Benchmark: {current.evidence}</span>
          <span className="text-zinc-400">SIH 2026 Audit Registry</span>
        </div>
      </div>
    </div>
  );
};
