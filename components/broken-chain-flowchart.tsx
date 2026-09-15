"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  FileText,
  Radio,
  Zap,
  Layers,
  Cpu,
  Smartphone,
  ChevronRight,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
  Server,
} from "lucide-react";

interface BrokenChainFlowchartProps {
  projectId: "weathergpt" | "krishismriti";
}

export const BrokenChainFlowchart: React.FC<BrokenChainFlowchartProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<"broken" | "solution">("broken");
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const isWeather = projectId === "weathergpt";

  // Data for the Legacy Broken Transmission Chain (Research Doc 2 Pages 17-18, Doc 1 Page 1)
  const legacyNodes = isWeather
    ? [
        {
          id: 1,
          badge: "Step 01 &bull; Heavy Data Ingestion",
          title: "Supercomputer NWP Models (GFS / ECMWF)",
          payload: "10 GB GRIB2 / NetCDF4 Binary Bloat",
          status: "FAIL",
          issue: "Massive file sizes designed for supercomputers; traditional web servers crash or take 15+ seconds to parse a single lat/long point.",
          metric: "15s Ingestion Latency",
          icon: Server,
        },
        {
          id: 2,
          badge: "Step 02 &bull; Institutional Silos",
          title: "Fragmented Disjointed Agencies",
          payload: "IMD, CWC, ISRO, State Boards in Silos",
          status: "FAIL",
          issue: "Data is split across incompatible proprietary APIs with rate limits and legacy WMO WIS 1.0 protocols. No unified query layer.",
          metric: "Zero Data Synthesis",
          icon: Database,
        },
        {
          id: 3,
          badge: "Step 03 &bull; Passive Dissemination",
          title: "Static Web Portals & 12-Page PDFs",
          payload: "PDF Bulletins on Mausam Portal",
          status: "FAIL",
          issue: "Pushes raw PDF documents expecting farmers or pilots to seek out websites on desktop browsers and parse complex synoptic charts.",
          metric: "78.4% Unread Rate",
          icon: FileText,
        },
        {
          id: 4,
          badge: "Step 04 &bull; Cognitive & Dialect Barrier",
          title: "Uncontextualized Technical Jargon",
          payload: "'Convective precipitation', 'Synoptic trough'",
          status: "FAIL",
          issue: "Pushes raw scientific metrics ('35mm rain expected') with zero translation into practical field actions. Alienates 14 major Indic dialects.",
          metric: "Zero Rural Comprehension",
          icon: Radio,
        },
        {
          id: 5,
          badge: "Step 05 &bull; Catastrophic Failure",
          title: "Systemic Economic Drain",
          payload: "$10B–$15B Annual Disaster Losses in India",
          status: "CRITICAL",
          issue: "Farmers spray pesticide hours before unpredicted squalls wash it away; fishermen venture into unsafe swell zones; municipal storm drains overflow.",
          metric: "$10B–$15B Annual Damage",
          icon: TrendingDown,
        },
      ]
    : [
        {
          id: 1,
          badge: "Step 01 &bull; Information Fragmentation",
          title: "Disconnected App Silos",
          payload: "App 1: Weather &bull; App 2: Mandi &bull; Local Gossip",
          status: "FAIL",
          issue: "Forces the smallholder farmer to act as an unassisted 'human integration tool', toggling 3 separate apps with no unified context.",
          metric: "3+ Disconnected Portals",
          icon: Smartphone,
        },
        {
          id: 2,
          badge: "Step 02 &bull; Single-Variable Bias",
          title: "Unassisted Decision Blindness",
          payload: "Farmer focuses on price spike, ignores storm",
          status: "FAIL",
          issue: "A farmer sees an onion price rise and rushes to harvest, blind to a heavy rainstorm 24h away. Or over-sprays chemical on hot days.",
          metric: "Single-Variable Trap",
          icon: AlertTriangle,
        },
        {
          id: 3,
          badge: "Step 03 &bull; Generic & Out-of-Context Advice",
          title: "District-Wide Static Bulletins",
          payload: "'Rain expected tomorrow' (Ignoring Plot Soil)",
          status: "FAIL",
          issue: "Broad 50km district averages ignore micro-plot soil physics. Fails to account for 12-parameter soil health card or slope waterlogging.",
          metric: "50km Broad Aggregation",
          icon: FileText,
        },
        {
          id: 4,
          badge: "Step 04 &bull; Uncalibrated Hallucinations",
          title: "Generic 'Super-App' AI Failures",
          payload: "KissanGPT / Cropin Conversational Data Dumping",
          status: "FAIL",
          issue: "Basic LLM wrappers dump agricultural Wikipedia search answers and approximate fertilizer dosages without isolated math guardrails.",
          metric: "High Hallucination Risk",
          icon: ShieldAlert,
        },
        {
          id: 5,
          badge: "Step 05 &bull; Agrarian Distress",
          title: "Systemic Farmgate Revenue Collapse",
          payload: "₹92,000 Cr Distress Sales + ₹1.5L Cr Weather Loss",
          status: "CRITICAL",
          issue: "Post-harvest price crashes upon arrival at local APMC, 64% sub-optimal fertilizer application, and standing crops rotting in open fields.",
          metric: "₹1.5 Lakh Crore Lost/Yr",
          icon: TrendingDown,
        },
      ];

  // Data for Our Solution Pipeline
  const solutionNodes = isWeather
    ? [
        {
          id: 1,
          badge: "Stage 01 &bull; Cloud-Optimized Subsetting",
          title: "Zero-Copy Byte-Range Streaming",
          payload: "Kerchunk / Zarr + Xarray on AWS S3 & WIS 2.0",
          status: "SUCCESS",
          tech: "Streams only the exact lat/long byte-range out of 10GB GRIB2 files in <300ms without downloading full binary rasters.",
          metric: "< 300ms Data Slice",
          icon: Zap,
        },
        {
          id: 2,
          badge: "Stage 02 &bull; Agentic Orchestration",
          title: "LangGraph Tool-Calling State Machine",
          payload: "Decoupled Generation from Factual Truth",
          status: "SUCCESS",
          tech: "LLM acts purely as an intent router (temperature 0.0). Calls verified REST tools, queries GFS NWP, and enforces strict Pydantic schemas.",
          metric: "0% Memory Hallucination",
          icon: Cpu,
        },
        {
          id: 3,
          badge: "Stage 03 &bull; Deterministic Gatekeeper",
          title: "CAP 1.2 & Regex Assertion Node",
          payload: "Post-Validation Verification Layer",
          status: "SUCCESS",
          tech: "Hardcoded safety gatekeeper. If LLM outputs numbers differing from raw API JSON, sentence is auto-replaced with deterministic value.",
          metric: "100% Rule-Enforced",
          icon: CheckCircle2,
        },
        {
          id: 4,
          badge: "Stage 04 &bull; Spatial Geofencing",
          title: "PostGIS + Uber H3 Spatial Hexagons",
          payload: "H3 Hexagon Resolution 8 (~700m Granularity)",
          status: "SUCCESS",
          tech: "Intersects active hazard polygons (cyclone track / cloudburst) with user H3 cell IDs in sub-milliseconds to trigger geo-fenced push.",
          metric: "Sub-Millisecond Match",
          icon: Layers,
        },
        {
          id: 5,
          badge: "Stage 05 &bull; Zero-Friction Delivery",
          title: "Bhashini Vernacular Voice Synthesis",
          payload: "14 Indic Dialects &bull; WhatsApp Voice Notes",
          status: "SUCCESS",
          tech: "Translates and synthesizes a natural 14-second audio note delivered directly to WhatsApp: 'Do not spray pesticide—rain expected at 3:30 PM'.",
          metric: "180ms End-to-End Voice",
          icon: Smartphone,
        },
      ]
    : [
        {
          id: 1,
          badge: "Stage 01 &bull; Parallel Ingestion",
          title: "Zero-Touch GPS & 5 Parallel APIs",
          payload: "Open-Meteo &bull; SoilGrids &bull; Copernicus &bull; Agmarknet &bull; Sentinel-1/2",
          status: "SUCCESS",
          tech: "On GPS pin trigger, fires 5 asynchronous APIs simultaneously in FastAPI. Captures 250m soil chemistry, terrain slope, and live mandi bids.",
          metric: "5 APIs in < 450ms",
          icon: Zap,
        },
        {
          id: 2,
          badge: "Stage 02 &bull; Filtered RAG & Context",
          title: "Dynamic Context Aggregator",
          payload: "Crop & Region Metadata Hard-Filtering",
          status: "SUCCESS",
          tech: "Filters vector database specifically by Crop and Region before vector search. Retrieves exact ICAR manuals and PMFBY policy chunks.",
          metric: "Zero Irrelevant Chunks",
          icon: Database,
        },
        {
          id: 3,
          badge: "Stage 03 &bull; Deterministic Math Engine",
          title: "ICAR Nutrient & Mandi Arbitrage Code",
          payload: "Python Math: Target NPK - Measured Soil NPK × Acres",
          status: "SUCCESS",
          tech: "LLM is strictly barred from calculating chemical dosage or profit math. Hardcoded Python formulas calculate exact 45kg bag counts.",
          metric: "100% Deterministic Math",
          icon: Cpu,
        },
        {
          id: 4,
          badge: "Stage 04 &bull; Multi-Variable Conflict Engine",
          title: "The Second Brain Reconciler",
          payload: "Reconciles: Rain in 24h + Peak Mandi Price + Scarce Labor",
          status: "SUCCESS",
          tech: "Evaluates competing variables simultaneously to deliver one single, decisive, mathematically optimal action for the day.",
          metric: "One Decisive Action",
          icon: Layers,
        },
        {
          id: 5,
          badge: "Stage 05 &bull; B2G Zero-UI Delivery",
          title: "Bhashini Dialect Audio & Visual Cards",
          payload: "Dialect Voice Notes &bull; WhatsApp &bull; KVK Tablets",
          status: "SUCCESS",
          tech: "Delivers 15-second natural audio instructions in regional dialects (Bhojpuri, Malwi, Marathi) alongside intuitive visual color status cards.",
          metric: "Zero Digital Friction",
          icon: Smartphone,
        },
      ];

  const currentNodes = activeTab === "broken" ? legacyNodes : solutionNodes;

  return (
    <div className="web2-panel rounded-lg border border-zinc-300 bg-white p-6 shadow-sm space-y-6">
      {/* Header & Flow Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider">
              Diagnostic Flowchart &bull; Research Blueprint
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            {isWeather
              ? "The Broken Meteorological Transmission Chain vs. WeatherGPT Zero-Copy Pipeline"
              : "The 'Decision Blindness' Trap vs. AgriGPT Autonomous Second Brain Pipeline"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
            {isWeather
              ? "Visualizing why India loses $10B–$15B annually despite supercomputers, and how our decoupled 5-stage architecture resolves the last-mile barrier."
              : "Visualizing why existing single-feature apps fail smallholder farmers, and how our multi-variable conflict engine delivers unified daily action."}
          </p>
        </div>

        {/* Tactile Toggle Switch */}
        <div className="inline-flex p-1 bg-zinc-100 border border-zinc-300 rounded-md shrink-0 select-none">
          <button
            onClick={() => {
              setActiveTab("broken");
              setSelectedNode(null);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
              activeTab === "broken"
                ? "bg-red-700 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>The Broken Transmission Chain</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("solution");
              setSelectedNode(null);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
              activeTab === "solution"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Our Autonomous Pipeline</span>
          </button>
        </div>
      </div>

      {/* Interactive Horizontal Flowchart Visualization */}
      <div className="space-y-4">
        <div className="text-[11px] font-mono text-zinc-500 uppercase flex items-center justify-between">
          <span>Click any stage in the pipeline to inspect data payload &amp; failure/mitigation:</span>
          <span>
            Mode:{" "}
            <strong className={activeTab === "broken" ? "text-red-700" : "text-emerald-700"}>
              {activeTab === "broken" ? "STATUS QUO FAILURE" : "PRODUCTION AGENTIC PIPELINE"}
            </strong>
          </span>
        </div>

        {/* Node Flow Graphic */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {currentNodes.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            const isBroken = activeTab === "broken";

            return (
              <div key={node.id} className="relative flex flex-col">
                <div
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between h-full select-none ${
                    isBroken
                      ? isSelected
                        ? "bg-red-50 border-red-500 shadow-md ring-1 ring-red-400"
                        : "bg-zinc-50 border-zinc-300 hover:border-red-300 hover:bg-red-50/40"
                      : isSelected
                      ? "bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-400"
                      : "bg-zinc-50 border-zinc-300 hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                        0{node.id}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isBroken
                            ? node.status === "CRITICAL"
                              ? "bg-red-600 text-white border-red-700"
                              : "bg-red-100 text-red-800 border-red-300"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}
                      >
                        {node.metric}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <div
                        className={`p-1.5 rounded shrink-0 border ${
                          isBroken
                            ? "bg-red-100/80 border-red-200 text-red-700"
                            : "bg-emerald-100/80 border-emerald-200 text-emerald-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-zinc-900 leading-tight">
                          {node.title}
                        </h4>
                        <div className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                          {node.payload}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-200 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">
                      {isSelected ? "Inspecting" : "Click to view"}
                    </span>
                    <ChevronRight
                      className={`w-3 h-3 text-zinc-400 transition-transform ${
                        isSelected ? "rotate-90 text-zinc-800" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Connector Arrow for Desktop */}
                {index < 4 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Diagnostic Deep Dive Drawer */}
      {selectedNode !== null && (
        <div
          className={`p-4 rounded-md border text-xs animate-in fade-in duration-150 ${
            activeTab === "broken"
              ? "bg-red-50/80 border-red-300 text-zinc-900"
              : "bg-emerald-50/80 border-emerald-300 text-zinc-900"
          }`}
        >
          {(() => {
            const node = currentNodes.find((n) => n.id === selectedNode);
            if (!node) return null;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] text-zinc-600">
                      {node.badge}
                    </span>
                    <span className="font-bold text-sm text-zinc-900">&bull; {node.title}</span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-zinc-500 hover:text-zinc-800 p-0.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">
                      {activeTab === "broken" ? "Root Cause Bottleneck" : "Engineering Implementation"}
                    </span>
                    <p className="text-zinc-700 leading-relaxed text-xs">
                      {activeTab === "broken" ? (node as any).issue : (node as any).tech}
                    </p>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded border border-zinc-200 font-mono text-[11px] space-y-1">
                    <div className="text-zinc-500 text-[10px] uppercase font-bold">
                      Data Payload &amp; Benchmark:
                    </div>
                    <div className="text-zinc-800 font-semibold">{node.payload}</div>
                    <div
                      className={`text-xs font-bold ${
                        activeTab === "broken" ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      Measured Impact: {node.metric}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4-Quadrant Bottlenecks Matrix from Research Doc 2 Page 18 */}
      <div className="border-t border-zinc-200 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-700" />
            <h4 className="font-bold text-xs text-zinc-900 uppercase font-mono tracking-wide">
              {isWeather
                ? "4 Systemic Bottlenecks in the Current Weather Ecosystem (Research Doc 2, P. 18)"
                : "The 4 Structural Breakdowns of Existing Agri Apps (Research Doc 1, P. 1-2)"}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">SIH 2026 Innovation Summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(isWeather
            ? [
                {
                  title: "1. Data Pipeline Bloat",
                  points: ["Gigabyte GRIB2/NetCDF binary files", "Institutional data silos (IMD, CWC, ISRO)", "Legacy WMO WIS 1.0 protocols"],
                  solution: "Cloud-optimized Kerchunk byte-range streaming (<300ms)",
                },
                {
                  title: "2. Processing & Spatial Lag",
                  points: ["High-cost spatial polygon joins", "Delayed emergency alerts during cyclones", "Sparse micro-observation networks"],
                  solution: "PostGIS + Uber H3 spatial hexagon geofencing in sub-ms",
                },
                {
                  title: "3. Interface & Language Gap",
                  points: ["12-page dense English/Hindi PDFs", "Text-heavy navigation menus", "Zero dialect coverage for rural India"],
                  solution: "Bhashini Conformer ASR/TTS in 14 Indic dialects via WhatsApp",
                },
                {
                  title: "4. Actionability & Context Deficit",
                  points: ["Pushes raw scientific metrics ('35mm rain')", "No practical operational farm steps", "Single false alarms destroy public trust"],
                  solution: "Agentic RAG synthesizing weather + ICAR crop rules",
                },
              ]
            : [
                {
                  title: "1. Conversational Data Dumping",
                  points: ["Basic LLMs act like agricultural Wikipedia", "Dumps long text answers instead of 1 plan", "Forces low-literacy farmers to read paragraphs"],
                  solution: "Action Engine: 1 automated daily instruction per day",
                },
                {
                  title: "2. Uncalibrated Hallucinations",
                  points: ["Probabilistic AI guesses fertilizer dosages", "Risk of toxic crop burnout or soil death", "Unconstrained generative text generation"],
                  solution: "100% Python Math code locked to ICAR formulas",
                },
                {
                  title: "3. No Conflict Resolution",
                  points: ["Only handles single-topic queries", "Breaks on competing real-world constraints", "Rain in 24h + high mandi price + labor crunch"],
                  solution: "Multi-Variable Second Brain reconciling all trade-offs",
                },
                {
                  title: "4. E-Commerce Conflict of Interest",
                  points: ["AgroStar/DeHaat profit from selling inputs", "Incentive bias to push chemical pesticides", "Recommends spraying when rain will wash it off"],
                  solution: "Vendor-Neutral optimization: tells farmers NOT to spray",
                },
              ]
          ).map((quad, idx) => (
            <div
              key={idx}
              className="p-3 rounded border border-zinc-200 bg-zinc-50/60 space-y-2 flex flex-col justify-between text-xs"
            >
              <div className="space-y-1.5">
                <div className="font-bold text-zinc-900 text-xs flex items-center justify-between">
                  <span>{quad.title}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                </div>
                <ul className="space-y-1 text-[11px] text-zinc-600 font-sans">
                  {quad.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold shrink-0">&bull;</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-zinc-200">
                <div className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{quad.solution}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
