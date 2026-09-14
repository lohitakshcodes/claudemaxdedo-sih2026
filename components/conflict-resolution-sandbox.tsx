"use client";

import React, { useState } from "react";
import { ConflictScenario } from "@/types/portal";
import {
  CloudRain,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  IndianRupee,
  Layers,
  Activity,
  Flame,
} from "lucide-react";

interface ConflictResolutionSandboxProps {
  scenarios: ConflictScenario[];
}

export const ConflictResolutionSandbox: React.FC<ConflictResolutionSandboxProps> = ({
  scenarios,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);

  // Dynamic interactive variables
  const [rainRisk, setRainRisk] = useState<"low" | "medium" | "high">("high");
  const [mandiPrice, setMandiPrice] = useState<"peak" | "steady" | "crashed">("peak");
  const [soilType, setSoilType] = useState<"kali" | "laal">("kali");
  const [laborAvail, setLaborAvail] = useState<"scarce" | "normal">("scarce");

  const currentScenario = scenarios[selectedScenarioIndex] || scenarios[0];

  // Calculate dynamic trade-off based on current toggles
  const calculateDecision = () => {
    if (rainRisk === "high" && soilType === "kali") {
      return {
        naiveMistake:
          "Farmer fixates solely on high mandi price (+₹340/qtl) or attempts a routine pesticide spray. Rain in 18 hours turns Kali Mitti (Heavy Black Soil) into impassable mud for 6 days, washing off ₹2,100 in chemicals and rotting unharvested pods in the field.",
        singleBestAction:
          "HALT SPRAYING IMMEDIATELY. Dispatch shared Custom Hiring Centre (CHC) combine harvester to pick 1.5 acres of mature crop before 4:00 PM today. Route directly to Mandi B (18km away) to lock in peak prices before rain affects transport.",
        financialImpact: "₹18,400 crop protected + ₹2,100 chemical waste saved",
        urgency: "CRITICAL (Act within 4 hours)",
      };
    } else if (rainRisk === "high" && soilType === "laal") {
      return {
        naiveMistake:
          "Spraying pesticide right before storm. Red sandy loam drains quickly, but rainfall >25mm washes foliar chemicals directly into runoff without absorbing.",
        singleBestAction:
          "Delay pesticide application by 48 hours until storm passes. Reinforce perimeter furrows to prevent sandy topsoil erosion.",
        financialImpact: "₹1,600 pesticide saved + soil erosion prevented",
        urgency: "MODERATE",
      };
    } else if (rainRisk === "low" && mandiPrice === "peak") {
      return {
        naiveMistake:
          "Harvesting prematurely or waiting for local middlemen at village gate who buy at a 30% discount.",
        singleBestAction:
          "Clear weather confirmed for 5 days. Coordinate village truckpooling with 4 neighboring farmers to haul 40 quintals to regional APMC yard for maximum net margin.",
        financialImpact: "+₹310/quintal net profit after freight sharing",
        urgency: "OPPORTUNITY",
      };
    } else {
      return {
        naiveMistake:
          "Over-applying Urea as an anxiety hedge against low market prices, burning soil organic carbon.",
        singleBestAction:
          "Apply exactly 1.8 bags Urea based on Soil Health Card baseline. Hold off field harvest for 3 days until regional mandi arrivals subside and prices recover.",
        financialImpact: "₹920 fertilizer saved + ₹1,400 price recovery",
        urgency: "ADVISORY",
      };
    }
  };

  const decision = calculateDecision();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
            <h3 className="font-bold text-base text-zinc-900">
              Interactive Multi-Variable Conflict Resolution Engine
            </h3>
            <span className="web2-badge text-[10px] font-mono py-0.5 px-2 bg-emerald-100 text-emerald-900 border-emerald-300">
              The &quot;Second Brain&quot; In Action
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-sans mt-0.5">
            Smallholder farmers suffer from single-variable thinking. Adjust real-world farm constraints below to see how AgriGPT computes the single mathematically optimal daily action.
          </p>
        </div>

        {/* Preset Real-World Scenarios */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-zinc-500 text-[11px] hidden sm:inline">Preset:</span>
          {scenarios.map((scn, idx) => (
            <button
              key={scn.id}
              onClick={() => {
                setSelectedScenarioIndex(idx);
                if (idx === 0) {
                  setRainRisk("high");
                  setMandiPrice("peak");
                  setSoilType("kali");
                  setLaborAvail("scarce");
                } else if (idx === 1) {
                  setRainRisk("low");
                  setMandiPrice("steady");
                  setSoilType("laal");
                  setLaborAvail("scarce");
                } else {
                  setRainRisk("low");
                  setMandiPrice("peak");
                  setSoilType("kali");
                  setLaborAvail("normal");
                }
              }}
              className={`px-2 py-1 rounded border transition-colors ${
                selectedScenarioIndex === idx
                  ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                  : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              Case 0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Variable Toggles */}
        <div className="lg:col-span-5 space-y-4">
          <div className="web2-panel p-4 rounded-lg border border-zinc-300 bg-white shadow-sm space-y-3.5">
            <div className="text-xs font-mono font-bold uppercase text-zinc-700 flex items-center justify-between border-b border-zinc-200 pb-2">
              <span>Adjust Live Farm Variables:</span>
              <span className="text-[10px] text-zinc-500 font-normal">4 Competing Constraints</span>
            </div>

            {/* Variable 1: Weather Risk */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <strong>1. Weather Risk (24h Forecast)</strong>
                </span>
                <span className="text-[11px] text-zinc-500">Open-Meteo GFS</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setRainRisk("low")}
                  className={`p-2 rounded border text-center transition-all ${
                    rainRisk === "low"
                      ? "bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Dry / Sunny
                </button>
                <button
                  onClick={() => setRainRisk("medium")}
                  className={`p-2 rounded border text-center transition-all ${
                    rainRisk === "medium"
                      ? "bg-amber-100 border-amber-500 text-amber-950 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Light Showers
                </button>
                <button
                  onClick={() => setRainRisk("high")}
                  className={`p-2 rounded border text-center transition-all ${
                    rainRisk === "high"
                      ? "bg-rose-100 border-rose-500 text-rose-950 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Heavy Rain (85%)
                </button>
              </div>
            </div>

            {/* Variable 2: Mandi Market Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>2. APMC Mandi Price Dynamics</strong>
                </span>
                <span className="text-[11px] text-zinc-500">Agmarknet Live</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setMandiPrice("peak")}
                  className={`p-2 rounded border text-center transition-all ${
                    mandiPrice === "peak"
                      ? "bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Peak (+₹340/qtl)
                </button>
                <button
                  onClick={() => setMandiPrice("steady")}
                  className={`p-2 rounded border text-center transition-all ${
                    mandiPrice === "steady"
                      ? "bg-zinc-200 border-zinc-400 text-zinc-900 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  MSP Baseline
                </button>
                <button
                  onClick={() => setMandiPrice("crashed")}
                  className={`p-2 rounded border text-center transition-all ${
                    mandiPrice === "crashed"
                      ? "bg-amber-100 border-amber-500 text-amber-950 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Arrival Glut
                </button>
              </div>
            </div>

            {/* Variable 3: Soil Physics Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  <strong>3. Field Soil Type (Drainage)</strong>
                </span>
                <span className="text-[11px] text-zinc-500">SoilGrids ISRIC</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => setSoilType("kali")}
                  className={`p-2 rounded border text-left transition-all ${
                    soilType === "kali"
                      ? "bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <div className="text-[11px]">Kali Mitti (Vertisol)</div>
                  <div className="text-[10px] text-zinc-400 font-normal">Heavy clay, holds water 6d</div>
                </button>
                <button
                  onClick={() => setSoilType("laal")}
                  className={`p-2 rounded border text-left transition-all ${
                    soilType === "laal"
                      ? "bg-amber-900 text-white border-amber-900 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <div className="text-[11px]">Laal Mitti (Alfisol)</div>
                  <div className="text-[10px] text-zinc-400 font-normal">Sandy loam, drains rapidly</div>
                </button>
              </div>
            </div>

            {/* Variable 4: Labor Availability */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <strong>4. Village Labor Availability</strong>
                </span>
                <span className="text-[11px] text-zinc-500">CHC Machinery Pool</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => setLaborAvail("scarce")}
                  className={`p-2 rounded border text-center transition-all ${
                    laborAvail === "scarce"
                      ? "bg-rose-100 border-rose-400 text-rose-950 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Peak Crunch (Migrated)
                </button>
                <button
                  onClick={() => setLaborAvail("normal")}
                  className={`p-2 rounded border text-center transition-all ${
                    laborAvail === "normal"
                      ? "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Standard Labor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Variable Trade-off Resolution Output */}
        <div className="lg:col-span-7 space-y-4">
          {/* Comparison Card: The Naive Human Mistake vs Second Brain Optimal Action */}
          <div className="web2-panel p-5 rounded-lg border border-zinc-300 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-zinc-500 uppercase">
                  CONFLICT ENGINE OUTPUT:
                </div>
                <h4 className="font-bold text-sm text-zinc-900">{currentScenario.title}</h4>
              </div>
              <span className="web2-badge text-[10px] font-mono py-0.5 px-2 bg-emerald-600 text-white border-emerald-700 font-bold">
                Mathematically Optimal
              </span>
            </div>

            {/* Sub-Card 1: Why Traditional Single-Variable Advice Fails */}
            <div className="p-3.5 rounded bg-rose-50/70 border border-rose-200 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-rose-900 font-mono font-bold">
                <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Single-Variable Bias Trap (How Farmers Lose Money):</span>
              </div>
              <p className="text-zinc-800 leading-relaxed font-sans">{decision.naiveMistake}</p>
            </div>

            {/* Sub-Card 2: The Second Brain Optimal Directive */}
            <div className="p-4 rounded-lg bg-emerald-50 border-2 border-emerald-600 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-950 font-mono font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>THE SINGLE BEST ACTION TO TAKE RIGHT NOW:</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                  {decision.urgency}
                </span>
              </div>

              <div className="text-zinc-950 font-bold text-sm leading-snug font-sans bg-white p-3 rounded border border-emerald-300 shadow-sm">
                &quot;{decision.singleBestAction}&quot;
              </div>

              <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-emerald-950">
                <span>
                  <strong>Estimated Value Protected:</strong> {decision.financialImpact}
                </span>
                <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-900 text-[11px] font-bold">
                  0% AI Hallucination
                </span>
              </div>
            </div>

            {/* Spoken Voice Note Preview */}
            <div className="bg-zinc-100 p-3 rounded border border-zinc-200 text-xs text-zinc-700 flex items-center justify-between gap-3">
              <div className="font-mono text-[11px] text-zinc-600">
                <strong>Audio Dispatch Dialect:</strong> {currentScenario.audioDialect}
              </div>
              <span className="text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1">
                <span>WhatsApp Audio Note Streamed</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
