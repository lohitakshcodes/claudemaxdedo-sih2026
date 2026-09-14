"use client";

import React, { useState } from "react";
import { ApiCategoryTier, ParadigmShift } from "@/types/portal";
import {
  CloudLightning,
  Bot,
  Mic,
  BellRing,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Cpu,
  Radio,
  Clock,
  Database,
} from "lucide-react";

interface ApiEcosystemVisualizerProps {
  apiTiers: ApiCategoryTier[];
  paradigmShifts: ParadigmShift[];
}

export const ApiEcosystemVisualizer: React.FC<ApiEcosystemVisualizerProps> = ({
  apiTiers,
  paradigmShifts,
}) => {
  const [activeTierIndex, setActiveTierIndex] = useState<number>(0);
  const [activeShiftIndex, setActiveShiftIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"apis" | "shifts">("apis");

  const currentTier = apiTiers[activeTierIndex] || apiTiers[0];
  const currentShift = paradigmShifts[activeShiftIndex] || paradigmShifts[0];

  const getTierIcon = (categoryNumber: number) => {
    switch (categoryNumber) {
      case 1:
        return <CloudLightning className="w-4 h-4 text-blue-600" />;
      case 2:
        return <Bot className="w-4 h-4 text-emerald-600" />;
      case 3:
        return <Mic className="w-4 h-4 text-rose-600" />;
      case 4:
        return <BellRing className="w-4 h-4 text-amber-600" />;
      case 5:
        return <MapPin className="w-4 h-4 text-purple-600" />;
      default:
        return <Layers className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-zinc-900"></span>
            <h3 className="font-bold text-base text-zinc-900">
              Complete API Ecosystem Directory &amp; Technological Paradigm Shifts
            </h3>
            <span className="web2-badge text-[10px] font-mono py-0.5 px-2 bg-zinc-100 text-zinc-800 border-zinc-300">
              5 Core Tiers
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-sans mt-0.5">
            Browse all 5 production API categories powering WeatherGPT and inspect the 4 modern architectural breakthroughs that make zero-hallucination meteorological voice intelligence possible.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setViewMode("apis")}
            className={`px-3 py-1 rounded border transition-colors ${
              viewMode === "apis"
                ? "bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm"
                : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            5-Tier API Directory
          </button>
          <button
            onClick={() => setViewMode("shifts")}
            className={`px-3 py-1 rounded border transition-colors ${
              viewMode === "shifts"
                ? "bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm"
                : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            4 Modern Paradigm Shifts
          </button>
        </div>
      </div>

      {/* Architecture Reality & Verification Banner */}
      <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/70 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <strong className="text-zinc-900 font-mono text-xs">
              Live Prototype Status vs. Enterprise Deployment Matrix
            </strong>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Official Endpoints &amp; Hyperlinked Docs
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="font-bold text-emerald-900 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>🟢 Live in Prototype</span>
            </div>
            <p className="text-zinc-700 leading-snug">
              Open-Meteo GFS, Nominatim Geocoding, Gemini 3.6 Flash LLM, and Browser Web SpeechSynthesis execute live in this codebase.
            </p>
          </div>
          <div className="p-2 rounded bg-amber-50/70 border border-amber-200 space-y-1">
            <div className="font-bold text-amber-900 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>🟡 Scaffolded Pipeline</span>
            </div>
            <p className="text-zinc-700 leading-snug">
              Bhashini ULCA &amp; Qdrant RAG clients are coded with resilient fallbacks; activates live once keys are populated in <code>.env.local</code>.
            </p>
          </div>
          <div className="p-2 rounded bg-blue-50/70 border border-blue-200 space-y-1">
            <div className="font-bold text-blue-900 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>🔵 Enterprise Gateway</span>
            </div>
            <p className="text-zinc-700 leading-snug">
              Meta WhatsApp Business Cloud API &amp; WMO WIS 2.0 MQTT broker require registered enterprise phone accounts and MoES mTLS certs.
            </p>
          </div>
        </div>
      </div>

      {viewMode === "apis" ? (
        /* ------------------------------------------------------------- */
        /* VIEW 1: 5-TIER API DIRECTORY                                  */
        /* ------------------------------------------------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: 5 Tier Nav Strip */}
          <div className="lg:col-span-4 space-y-2">
            {apiTiers.map((tier, idx) => {
              const isSelected = activeTierIndex === idx;
              return (
                <div
                  key={tier.categoryNumber}
                  onClick={() => setActiveTierIndex(idx)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all text-xs font-mono flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-tactile"
                      : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded border shrink-0 ${
                        isSelected ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-100 border-zinc-200"
                      }`}
                    >
                      {getTierIcon(tier.categoryNumber)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">
                        {tier.categoryNumber}. {tier.categoryName.split("(")[0]}
                      </div>
                      <div
                        className={`text-[11px] truncate font-sans ${
                          isSelected ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        {tier.apis.length} Active Services
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Tier Endpoints List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="web2-panel p-5 rounded-lg border border-zinc-300 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold">
                    TIER 0{currentTier.categoryNumber}: {currentTier.categoryName}
                  </span>
                  <h4 className="font-bold text-base text-zinc-900">{currentTier.headline}</h4>
                </div>
                <span className="web2-badge text-[10px] font-mono py-0.5 px-2 bg-emerald-50 text-emerald-800 border-emerald-300">
                  Active Ingestion
                </span>
              </div>

              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                {currentTier.description}
              </p>

              {/* Endpoints Table / Cards */}
              <div className="space-y-2.5 pt-1">
                {currentTier.apis.map((api, aIdx) => {
                  const isLive = api.status === "LIVE_IN_PROTOTYPE" || !api.status;
                  const isScaffolded = api.status === "SCAFFOLDED_KEY_REQUIRED";
                  const isEnterprise = api.status === "ENTERPRISE_GATEWAY";

                  return (
                    <div
                      key={aIdx}
                      className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/80 hover:bg-zinc-50 transition-colors space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isLive
                                ? "bg-emerald-600 animate-pulse"
                                : isScaffolded
                                ? "bg-amber-600"
                                : "bg-blue-600"
                            }`}
                          ></span>
                          <strong className="text-xs text-zinc-900 font-mono">{api.name}</strong>
                        </div>

                        {/* Status & Latency Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                          {isLive && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                              🟢 Live in Prototype
                            </span>
                          )}
                          {isScaffolded && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                              🟡 Scaffolded (Needs Key)
                            </span>
                          )}
                          {isEnterprise && (
                            <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full font-bold">
                              🔵 Enterprise Gateway
                            </span>
                          )}
                          <span className="bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded font-medium">
                            {api.type}
                          </span>
                          <span className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded font-bold border border-zinc-200">
                            {api.latency}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600 font-sans leading-relaxed">{api.description}</p>

                      <div className="text-[11px] font-mono text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1.5 border-t border-zinc-200/60">
                        <div className="flex items-center gap-1.5 truncate max-w-full sm:max-w-[65%]">
                          <span className="text-zinc-500 font-medium shrink-0">Endpoint:</span>
                          {api.endpoint.startsWith("http") ? (
                            <a
                              href={api.endpoint}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 font-mono font-medium truncate"
                              title={`Open live endpoint in browser: ${api.endpoint}`}
                            >
                              <code className="truncate">{api.endpoint}</code>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <code className="text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded truncate">
                              {api.endpoint}
                            </code>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-zinc-600 font-medium">Provider: {api.provider}</span>
                          {api.docUrl && (
                            <a
                              href={api.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 hover:underline"
                              title={`View official documentation for ${api.name}`}
                            >
                              <span>Docs</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW 2: 4 MODERN PARADIGM SHIFTS                              */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paradigmShifts.map((shift, idx) => (
              <div
                key={shift.id}
                className="web2-panel p-5 rounded-lg border border-zinc-300 bg-white shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-900">
                      {shift.title}
                    </span>
                    <span className="web2-badge text-[10px] font-mono py-0.5 px-2 bg-emerald-50 text-emerald-800 border-emerald-300">
                      {shift.badge}
                    </span>
                  </div>

                  {/* Contrast Box: Then vs Now */}
                  <div className="space-y-2 text-xs">
                    {/* Then */}
                    <div className="p-2.5 rounded bg-rose-50/60 border border-rose-200 text-zinc-700">
                      <div className="text-[10px] font-mono text-rose-800 font-bold uppercase mb-0.5">
                        Then (Legacy Bottleneck):
                      </div>
                      <p className="leading-relaxed font-sans">{shift.thenState}</p>
                    </div>

                    {/* Now */}
                    <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200 text-zinc-800">
                      <div className="text-[10px] font-mono text-emerald-800 font-bold uppercase mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Now (State of the Art):</span>
                      </div>
                      <p className="leading-relaxed font-sans font-medium">{shift.nowState}</p>
                    </div>
                  </div>
                </div>

                {/* Solution Impact */}
                <div className="pt-2 border-t border-zinc-200 text-xs text-zinc-800 font-sans">
                  <strong>How We Use It:</strong> {shift.solutionImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
