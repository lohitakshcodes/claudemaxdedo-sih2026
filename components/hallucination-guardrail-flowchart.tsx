"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Code,
  FileCheck,
  XCircle,
} from "lucide-react";

export const HallucinationGuardrailFlowchart: React.FC = () => {
  const [testMode, setTestMode] = useState<"normal" | "hallucination">("normal");
  const [simulationRunning, setSimulationRunning] = useState(false);

  const runSimulation = (mode: "normal" | "hallucination") => {
    setSimulationRunning(true);
    setTestMode(mode);
    setTimeout(() => {
      setSimulationRunning(false);
    }, 450);
  };

  return (
    <div className="web2-panel rounded-lg border border-zinc-300 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider">
              Safety Architecture &bull; Research Blueprint (P. 24–26)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            Decoupled Truth &amp; Assertion Pipeline: Eliminating LLM Hallucinations in Disaster &amp; Agro Advice
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
            In weather and agriculture, hallucinating a temperature or fertilizer dosage causes crop death or loss of life. We decouple generative language from factual retrieval via a multi-tier Assertion Node.
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2 shrink-0 select-none">
          <button
            onClick={() => runSimulation("normal")}
            disabled={simulationRunning}
            className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all border ${
              testMode === "normal"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            Normal Flow (100% Match)
          </button>
          <button
            onClick={() => runSimulation("hallucination")}
            disabled={simulationRunning}
            className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all border ${
              testMode === "hallucination"
                ? "bg-red-700 text-white border-red-800 shadow-sm"
                : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            Simulate Mismatch Bug
          </button>
        </div>
      </div>

      {/* Visual Pipeline Flowchart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Node 1: Intent Parser Only */}
        <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/70 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase">
              <span>Stage 01</span>
              <span className="bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700">Intent Only</span>
            </div>
            <h4 className="font-bold text-xs text-zinc-900">LangGraph State Router</h4>
            <p className="text-[11px] text-zinc-600 leading-normal font-sans">
              The LLM never guesses numbers from memory. It only parses natural language into strict JSON arguments.
            </p>
          </div>

          <pre className="bg-zinc-900 text-emerald-400 p-2 rounded text-[10px] font-mono overflow-x-auto">
{`{
  "tool": "get_nwp_forecast",
  "lat": 18.52,
  "lon": 73.85,
  "param": "precip"
}`}
          </pre>
        </div>

        {/* Node 2: Deterministic Tool Call */}
        <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/70 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase">
              <span>Stage 02</span>
              <span className="bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
                Raw Truth
              </span>
            </div>
            <h4 className="font-bold text-xs text-zinc-900">Deterministic Tool Call</h4>
            <p className="text-[11px] text-zinc-600 leading-normal font-sans">
              Queries NOAA GFS S3 byte-ranges or IMD Doppler radar arrays. Returns immutable raw numbers.
            </p>
          </div>

          <div className="bg-white p-2 rounded border border-zinc-200 font-mono text-[10px] text-zinc-700 space-y-0.5">
            <div className="text-zinc-500 uppercase font-bold">Immutable Raw API JSON:</div>
            <div className="text-blue-800 font-bold">precipitation_mm: 12.0</div>
            <div className="text-zinc-500">wind_gust_knots: 24.0</div>
          </div>
        </div>

        {/* Node 3: Fact-Checker Assertion Layer */}
        <div
          className={`p-3.5 rounded-lg border space-y-2 flex flex-col justify-between transition-all ${
            testMode === "hallucination"
              ? "bg-red-50 border-red-400 shadow-md ring-1 ring-red-300"
              : "bg-emerald-50/70 border-emerald-300"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase">
              <span className={testMode === "hallucination" ? "text-red-800" : "text-emerald-800"}>
                Stage 03
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  testMode === "hallucination"
                    ? "bg-red-600 text-white"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {testMode === "hallucination" ? "Regex Assertion Guard" : "Verified Match"}
              </span>
            </div>
            <h4 className="font-bold text-xs text-zinc-900">Fact-Checker Assertion Node</h4>
            <p className="text-[11px] text-zinc-600 leading-normal font-sans">
              Lightweight Python verifier extracts all numbers, units (mm, °C, km/h) via Regex and checks against raw API JSON.
            </p>
          </div>

          <div
            className={`p-2 rounded border font-mono text-[10px] space-y-0.5 ${
              testMode === "hallucination"
                ? "bg-white border-red-200 text-red-700"
                : "bg-white border-emerald-200 text-emerald-800"
            }`}
          >
            {testMode === "hallucination" ? (
              <>
                <div className="font-bold flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-600" />
                  <span>LLM output says 20mm (Mismatch!)</span>
                </div>
                <div className="text-[9px] text-red-600 font-sans">
                  Auto-Redacted &amp; Replaced with: <strong>Expected: 12mm</strong>
                </div>
              </>
            ) : (
              <>
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>All numbers match raw JSON</span>
                </div>
                <div className="text-[9px] text-zinc-500 font-sans">Passes through with zero alteration.</div>
              </>
            )}
          </div>
        </div>

        {/* Node 4: Grounded Delivery */}
        <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/70 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase">
              <span>Stage 04</span>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                Grounded
              </span>
            </div>
            <h4 className="font-bold text-xs text-zinc-900">Zero-Hallucination Output</h4>
            <p className="text-[11px] text-zinc-600 leading-normal font-sans">
              Enforces Citation Contracts ([ICAR_Manual_P22]). Synthesizes verified speech note.
            </p>
          </div>

          <div className="bg-white p-2 rounded border border-zinc-200 font-mono text-[10px] text-zinc-800">
            <div className="text-zinc-500 uppercase font-bold text-[9px]">Delivered Speech Text:</div>
            <div className="font-semibold text-zinc-900 text-[11px]">
              &quot;Expected rainfall: 12mm. Delay spray by 24h.&quot;
            </div>
          </div>
        </div>
      </div>

      {/* Key Reliability Strategies Table from Research Doc 2 Page 26 */}
      <div className="border-t border-zinc-200 pt-4">
        <h4 className="font-bold text-xs text-zinc-900 uppercase font-mono tracking-wide mb-2.5">
          Four Hard Architectural Boundaries Enforced Across Agent Lifecycle:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded border border-zinc-200 bg-zinc-50 space-y-1">
            <div className="font-bold text-zinc-900 font-mono text-[11px]">1. System Prompt Abstention</div>
            <p className="text-zinc-600 text-[11px] font-sans leading-relaxed">
              If weather context does not contain data for the coordinate, model must output &apos;Data unavailable&apos; rather than guessing.
            </p>
          </div>

          <div className="p-3 rounded border border-zinc-200 bg-zinc-50 space-y-1">
            <div className="font-bold text-zinc-900 font-mono text-[11px]">2. Temperature Zero</div>
            <p className="text-zinc-600 text-[11px] font-sans leading-relaxed">
              LLM sampling temperature is hard-locked to 0.0 for all tool routing to cut token variance and eliminate creative improvisation.
            </p>
          </div>

          <div className="p-3 rounded border border-zinc-200 bg-zinc-50 space-y-1">
            <div className="font-bold text-zinc-900 font-mono text-[11px]">3. Citation Contract (RAG)</div>
            <p className="text-zinc-600 text-[11px] font-sans leading-relaxed">
              Every factual agricultural advice sentence must cite vector DB chunk IDs (e.g., [ICAR_Manual_P22]); ungrounded sentences are dropped.
            </p>
          </div>

          <div className="p-3 rounded border border-zinc-200 bg-zinc-50 space-y-1">
            <div className="font-bold text-zinc-900 font-mono text-[11px]">4. Fallback Static Router</div>
            <p className="text-zinc-600 text-[11px] font-sans leading-relaxed">
              If an external API drops, the system fails over instantly to 24-hour cached state mirrors, guaranteeing operational uptime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
