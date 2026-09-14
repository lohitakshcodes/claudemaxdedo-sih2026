"use client";

import React, { useState } from "react";
import { ParallelApiItem } from "@/types/portal";
import {
  MapPin,
  Radio,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  Volume2,
  FileCode,
  ShieldCheck,
  Terminal,
  Activity,
  Compass,
  ArrowDown,
} from "lucide-react";

interface AgriArchitectureVisualizerProps {
  parallelApis?: ParallelApiItem[];
}

export const AgriArchitectureVisualizer: React.FC<AgriArchitectureVisualizerProps> = ({
  parallelApis = [],
}) => {
  const [selectedParcel, setSelectedParcel] = useState({
    id: "PARCEL-MH-PUN-402",
    location: "Pune, Maharashtra",
    coordinates: "18.5204° N, 73.8567° E",
    soil: "Kali Mitti (Heavy Black Vertisol)",
    crop: "Sugarcane & Soybean",
  });

  const [activeApi, setActiveApi] = useState<number>(0);
  const [activeCodeTab, setActiveCodeTab] = useState<"nutrient" | "profit" | "labor">("nutrient");

  const parcels = [
    {
      id: "PARCEL-MH-PUN-402",
      location: "Pune, Maharashtra",
      coordinates: "18.5204° N, 73.8567° E",
      soil: "Kali Mitti (Heavy Black Vertisol)",
      crop: "Sugarcane & Soybean",
    },
    {
      id: "PARCEL-PB-LUD-781",
      location: "Ludhiana, Punjab",
      coordinates: "30.9010° N, 75.8573° E",
      soil: "Alluvial Sandy Loam",
      crop: "Wheat (PBW-502)",
    },
    {
      id: "PARCEL-UP-BRB-104",
      location: "Barabanki, Uttar Pradesh",
      coordinates: "26.9272° N, 81.1834° E",
      soil: "Gangetic Alluvial Silt",
      crop: "Paddy (Basmati)",
    },
  ];

  const pythonMathCode = {
    nutrient: `# -------------------------------------------------------------
# DETERMINISTIC MATH GUARDRAIL: ICAR NUTRIENT BALANCE FORMULA
# (Separated from LLM to eliminate hallucination of dosages)
# -------------------------------------------------------------
def calculate_icar_fertilizer(crop_target_npk, soil_health_card_npk, plot_acres):
    # Crop targets based on official ICAR Package of Practices
    deficit_n = max(0, crop_target_npk['N'] - soil_health_card_npk['N'])
    deficit_p = max(0, crop_target_npk['P'] - soil_health_card_npk['P'])
    deficit_k = max(0, crop_target_npk['K'] - soil_health_card_npk['K'])

    # Standard bag sizes (45kg Urea @ 46% N, 50kg DAP @ 18% N & 46% P)
    dap_bags = round((deficit_p / 0.46) / 50.0 * (plot_acres / 2.47), 1)
    n_from_dap = dap_bags * 50.0 * 0.18
    remaining_n = max(0, deficit_n - n_from_dap)
    urea_bags = round((remaining_n / 0.46) / 45.0 * (plot_acres / 2.47), 1)
    mop_bags = round((deficit_k / 0.60) / 50.0 * (plot_acres / 2.47), 1)

    return {
        "status": "VERIFIED_SAFE_CALCULATIONS",
        "urea_bags": urea_bags,       # Output: 2.1 bags Urea
        "dap_bags": dap_bags,         # Output: 1.2 bags DAP
        "mop_bags": mop_bags,         # Output: 0.0 bags Potash (Soil already rich in K)
        "advisory": "Do not apply Potash; soil already saturated at 184 mg/kg"
    }`,
    profit: `# -------------------------------------------------------------
# DETERMINISTIC LOGISTICS & NET FARM-GATE PROFIT ENGINE
# Net Revenue = Mandi Market Rate - (Distance * Transport Freight)
# -------------------------------------------------------------
def calculate_mandi_arbitrage(apmc_candidates, farmer_lat_long, crop_volume_quintals):
    results = []
    DIESEL_FREIGHT_PER_KM_QTL = 2.35  # INR / km / quintal

    for apmc in apmc_candidates:
        dist_km = osrm_road_distance(farmer_lat_long, apmc['coordinates'])
        transit_cost = dist_km * DIESEL_FREIGHT_PER_KM_QTL
        net_revenue_per_qtl = apmc['modal_price'] - transit_cost
        total_net_payout = net_revenue_per_qtl * crop_volume_quintals

        results.append({
            "mandi": apmc['name'],
            "distance_km": dist_km,
            "modal_price": apmc['modal_price'],
            "freight_cost": transit_cost,
            "net_per_qtl": net_revenue_per_qtl,
            "total_net": total_net_payout
        })

    best_market = max(results, key=lambda x: x['total_net'])
    return best_market  # Directed to Pimpalgaon (+Rs 4,950 net gain after freight)`,
    labor: `# -------------------------------------------------------------
# PREDICTIVE VILLAGE LABOR STAGGERING & CHC MACHINERY SCHEDULER
# Solves peak harvesting bottleneck and MGNREGA migration spikes
# -------------------------------------------------------------
def schedule_village_harvest_clusters(village_plots, local_chc_machinery):
    # Optimize combined harvester queue across adjacent smallholders
    # Prevents simultaneous wage spikes by staggering dispatch by 36 hours
    solver = pywraplp.Solver.CreateSolver('SCIP')
    harvest_queue = []
    
    for plot in village_plots:
        # Match plot soil moisture with Custom Hiring Centre combine slots
        if plot.soil_moisture < 22.0 and plot.crop_stage == "MATURE":
            harvest_queue.append({
                "plot_id": plot.id,
                "chc_tractor_slot": "CHC-SLOT-09:00",
                "shared_freight_pool": "TRUCK-POOL-B"
            })
            
    return harvest_queue  # Cuts harvest machinery rental cost by 38%`,
  };

  return (
    <div className="space-y-8">
      {/* Header and Parcel Selector */}
      <div className="web2-panel p-4 rounded-lg border border-zinc-300 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-zinc-900"></span>
            <h3 className="font-bold text-sm text-zinc-900">
              Interactive System Architecture: Parallel Telemetry to Deterministic Math
            </h3>
            <span className="web2-badge text-[10px] font-mono py-0.5 px-2 bg-emerald-50 text-emerald-800 border-emerald-300">
              Live Diagram (Images 2 &amp; 3)
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-sans mt-0.5">
            Test how a farmer&apos;s mobile GPS pin triggers 5 parallel data feeds before passing into an isolated ICAR math engine.
          </p>
        </div>

        {/* Parcel selector pill tabs */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-zinc-500 text-[11px] mr-1 hidden sm:inline">Test Plot:</span>
          {parcels.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedParcel(p)}
              className={`px-2.5 py-1 rounded border text-xs transition-colors ${
                selectedParcel.id === p.id
                  ? "bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm"
                  : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              {p.location.split(",")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DIAGRAM SECTION 1: PARALLEL API TELEMETRY LAYER (IMAGE 2)     */}
      {/* ------------------------------------------------------------- */}
      <div className="web2-panel rounded-lg border border-zinc-300 bg-zinc-50 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-zinc-500">STAGE 01</span>
            <span className="text-sm font-bold text-zinc-900">
              Data Ingestion &amp; Parallel API Telemetry Layer
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
            Sub-400ms Parallel Execution
          </span>
        </div>

        {/* The Fan-Out Visualizer: GPS PIN fanning out to 5 parallel APIs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Origin Node: GPS Pin Box */}
          <div className="lg:col-span-4 p-4 rounded-lg border-2 border-zinc-900 bg-white shadow-tactile space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>[ GPS Pin: Lat, Long ]</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            </div>

            <div className="text-xs font-mono space-y-1 pt-1 border-t border-zinc-200">
              <div className="text-zinc-800 font-bold">{selectedParcel.coordinates}</div>
              <div className="text-zinc-600">{selectedParcel.location}</div>
              <div className="text-[11px] text-zinc-500">Soil: {selectedParcel.soil}</div>
              <div className="text-[11px] text-zinc-500">Crop: {selectedParcel.crop}</div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
              <span>Concurrent Fan-Out:</span>
              <strong>5 APIs Parallel</strong>
            </div>
          </div>

          {/* Fan-Out Arrow indicator */}
          <div className="lg:col-span-1 flex lg:flex-col items-center justify-center text-zinc-400 py-1">
            <ArrowRight className="w-6 h-6 text-zinc-800 hidden lg:block" />
            <ArrowDown className="w-6 h-6 text-zinc-800 lg:hidden" />
          </div>

          {/* 5 Parallel API Target Nodes (Image 2 Direct Representation) */}
          <div className="lg:col-span-7 space-y-2">
            {parallelApis.map((api, idx) => {
              const isSelected = activeApi === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveApi(idx)}
                  className={`cursor-pointer p-2.5 rounded border transition-all text-xs font-mono flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-white border-zinc-800 shadow-sm"
                      : "bg-zinc-100 border-zinc-300 hover:bg-white hover:border-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                    <strong className="text-zinc-900 truncate">{api.name}</strong>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[11px]">
                    <span className="text-zinc-500 hidden sm:inline">{api.source.split(" ")[0]}</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px]">
                      {api.protocol.split(" ")[0]}
                    </span>
                    <span className="text-emerald-700 font-bold">&lt; 38ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Drawer for Selected Parallel API Data Payload */}
        {parallelApis[activeApi] && (
          <div className="bg-zinc-900 text-zinc-100 p-3.5 rounded-md font-mono text-xs space-y-1.5 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] border-b border-zinc-800 pb-1">
              <span>
                ACTIVE TELEMETRY PAYLOAD: {parallelApis[activeApi].name}
              </span>
              <span className="text-emerald-400">STATUS: 200 OK (CACHED TILE)</span>
            </div>
            <p className="text-zinc-300 text-xs font-sans">
              <strong>Purpose:</strong> {parallelApis[activeApi].purpose}
            </p>
            <div className="bg-zinc-950 p-2 rounded text-emerald-400 text-[11px] overflow-x-auto">
              <code>{parallelApis[activeApi].sampleOutput}</code>
            </div>
          </div>
        )}
      </div>

      {/* Downward Transition Arrow */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 bg-zinc-200 px-3 py-1 rounded-full text-xs font-mono text-zinc-700 border border-zinc-300">
          <ArrowDown className="w-4 h-4 text-zinc-900" />
          <span>Ingested Telemetry Passed to Isolated Code Guardrails</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DIAGRAM SECTION 2: DETERMINISTIC MATH ENGINE (IMAGE 3 TOP)   */}
      {/* ------------------------------------------------------------- */}
      <div className="web2-panel rounded-lg border border-zinc-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-zinc-500">STAGE 02</span>
            <span className="text-sm font-bold text-zinc-900">
              Deterministic Math Engine Guardrails (Zero Hallucinations)
            </span>
          </div>
          <span className="text-xs font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-700" />
            <span>LLM Barred From Math</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Code Box and Logic Tabs */}
          <div className="lg:col-span-8 space-y-3">
            {/* Math Code Selector Tabs */}
            <div className="flex items-center gap-2 text-xs font-mono border-b border-zinc-200 pb-2">
              <button
                onClick={() => setActiveCodeTab("nutrient")}
                className={`px-3 py-1 rounded border transition-colors ${
                  activeCodeTab === "nutrient"
                    ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                    : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
                }`}
              >
                1. ICAR Nutrient Balance
              </button>
              <button
                onClick={() => setActiveCodeTab("profit")}
                className={`px-3 py-1 rounded border transition-colors ${
                  activeCodeTab === "profit"
                    ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                    : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
                }`}
              >
                2. Net Farm-Gate Profit
              </button>
              <button
                onClick={() => setActiveCodeTab("labor")}
                className={`px-3 py-1 rounded border transition-colors ${
                  activeCodeTab === "labor"
                    ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                    : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
                }`}
              >
                3. Labor &amp; CHC Scheduler
              </button>
            </div>

            {/* Python Code Display */}
            <div className="bg-zinc-950 text-zinc-200 p-3.5 rounded-lg font-mono text-xs overflow-x-auto border border-zinc-800 shadow-inner">
              <div className="flex items-center justify-between text-zinc-500 text-[10px] border-b border-zinc-800 pb-1 mb-2">
                <span>FILE: /guardrails/engine_{activeCodeTab}.py</span>
                <span className="text-emerald-400">PYTHON 3.12 DETERMINISTIC LAYER</span>
              </div>
              <pre className="text-zinc-200 leading-relaxed font-mono">
                {pythonMathCode[activeCodeTab]}
              </pre>
            </div>
          </div>

          {/* Right: The Verified Safe Output Box (Image 3 Representation) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-lg border-2 border-emerald-600 bg-emerald-50/70 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>VERIFIED SAFE CALCULATIONS</span>
                </span>
                <span className="web2-badge web2-badge-green text-[10px] py-0 px-2">PASS</span>
              </div>

              <div className="bg-white p-3 rounded border border-emerald-300 space-y-2 font-mono text-xs">
                <div className="text-zinc-500 text-[10px] uppercase">Deterministic Output:</div>
                <div className="text-emerald-950 font-bold text-sm">
                  &quot;Apply exactly 2.1 bags Urea&quot;
                </div>
                <div className="text-zinc-700 text-xs font-sans">
                  • 1.2 bags DAP for basal root stage
                  <br />
                  • 0.0 bags Potash (saves ₹1,840/acre)
                  <br />• Spray restricted until Friday 6:00 AM
                </div>
              </div>

              <p className="text-[11px] text-emerald-900 font-sans leading-relaxed">
                By decoupling mathematics from the generative LLM, AgriGPT guarantees <strong>zero chemical dosage hallucinations</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Downward Transition Arrow */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 bg-zinc-200 px-3 py-1 rounded-full text-xs font-mono text-zinc-700 border border-zinc-300">
          <ArrowDown className="w-4 h-4 text-zinc-900" />
          <span>Calculations &amp; Filtered RAG Chunks Fed into Reasoning Pipeline</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DIAGRAM SECTION 3: SYNTHESIS & LOCALIZATION (IMAGE 3 BOTTOM) */}
      {/* ------------------------------------------------------------- */}
      <div className="web2-panel rounded-lg border border-zinc-300 bg-zinc-900 text-white p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-zinc-400">STAGE 03</span>
            <span className="text-sm font-bold text-white">
              Synthesis, Reasoning &amp; Vernacular Localization Engine
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded">
            Bhashini Indic Voice Note Output
          </span>
        </div>

        {/* Pipeline Strip directly reflecting Image 3 bottom */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono text-center">
          {/* Step 1 */}
          <div className="bg-zinc-800/80 p-3 rounded border border-zinc-700 space-y-1">
            <span className="text-[10px] text-zinc-400 block uppercase">1. Input Context</span>
            <div className="text-white font-bold text-xs">[ Aggregated Context + Math Results + RAG Chunks ]</div>
          </div>

          {/* Step 2 */}
          <div className="bg-zinc-800/80 p-3 rounded border border-zinc-700 space-y-1">
            <span className="text-[10px] text-zinc-400 block uppercase">2. LLM Reasoning</span>
            <div className="text-white font-bold text-xs">[ LLM Prompt Pipeline (Strict JSON) ]</div>
          </div>

          {/* Step 3 */}
          <div className="bg-zinc-800/80 p-3 rounded border border-zinc-700 space-y-1">
            <span className="text-[10px] text-zinc-400 block uppercase">3. Translation</span>
            <div className="text-white font-bold text-xs">[ Regional Text (Varhadi / Bhojpuri) ]</div>
          </div>

          {/* Step 4 */}
          <div className="bg-emerald-950/70 p-3 rounded border border-emerald-600 text-emerald-200 space-y-1">
            <span className="text-[10px] text-emerald-400 block uppercase">4. Speech Synthesis</span>
            <div className="text-white font-bold text-xs flex items-center justify-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>[ Native Audio (Bhashini) ]</span>
            </div>
          </div>
        </div>

        {/* Final Voice Note Output Card */}
        <div className="bg-zinc-950 p-4 rounded border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 font-sans">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs text-emerald-400 font-bold">
                GENERATED ACTIONABLE AUDIO NOTE (WhatsApp Audio):
              </span>
            </div>
            <p className="text-xs text-zinc-300 italic">
              &quot;राम-राम पाटील भाऊ! उद्या दुपारी मोठा पाऊस येणार आहे, त्यामुळे आज युरिया खत टाकू नका. कालच्या तपासणीनुसार जमिनीत पोटॅश भरपूर आहे, फक्त २.१ गोणी युरिया शुक्रवार सकाळी द्या.&quot;
            </p>
            <p className="text-[11px] text-zinc-400">
              English Translation: &quot;Namaste farmer Patil! Heavy rain is arriving tomorrow afternoon, so do NOT spray or top-dress urea today. Your soil already has high potash; apply exactly 2.1 bags of Urea on Friday morning.&quot;
            </p>
          </div>

          <div className="shrink-0 font-mono text-[11px] text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
            Latency: 164ms &bull; Opus 38KB
          </div>
        </div>
      </div>
    </div>
  );
};
