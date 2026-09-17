"use client";

import React, { useState } from "react";
import { CompetitivePlatform } from "@/types/portal";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  Bot,
  Building2,
  BookOpen,
  ShoppingBag,
  BrainCircuit,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface CompetitiveBenchmarkMatrixProps {
  platforms: CompetitivePlatform[];
}

export const CompetitiveBenchmarkMatrix: React.FC<CompetitiveBenchmarkMatrixProps> = ({
  platforms,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    platforms.find((p) => p.isOurSolution)?.name || platforms[0].name
  );
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const categories = ["All", "Chatbot", "Enterprise", "Extension", "E-Commerce", "Second Brain"];

  const filteredPlatforms =
    activeFilter === "All"
      ? platforms
      : platforms.filter((p) => p.category === activeFilter);

  const currentPlatform =
    platforms.find((p) => p.name === selectedPlatform) || platforms[0];

  const getPlatformIcon = (cat: string) => {
    switch (cat) {
      case "Chatbot":
        return <Bot className="w-4 h-4 text-amber-600" />;
      case "Enterprise":
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case "Extension":
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case "E-Commerce":
        return <ShoppingBag className="w-4 h-4 text-rose-600" />;
      case "Second Brain":
        return <BrainCircuit className="w-4 h-4 text-emerald-600" />;
      default:
        return <Layers className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar with Category Filter chips */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <div>
          <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
            <span>Competitive Ecosystem &amp; Structural Research Gaps</span>
            <span className="web2-badge text-[10px] font-mono py-0.5 px-2 bg-emerald-50 text-emerald-800 border-emerald-300">
              Evaluator Benchmark
            </span>
          </h3>
          <p className="text-xs text-zinc-600 font-sans mt-0.5">
            Click on any existing agricultural solution to inspect why it breaks down in rural smallholder operations.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-2.5 py-1 rounded border transition-colors ${
                activeFilter === cat
                  ? "bg-zinc-900 text-white border-zinc-900 font-bold shadow-sm"
                  : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid: Side-by-Side Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Platform Selector Cards */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-mono uppercase text-zinc-500 font-semibold px-1">
            Select Platform to Audit:
          </div>

          <div className="space-y-2">
            {filteredPlatforms.map((p) => {
              const isSelected = p.name === selectedPlatform;
              return (
                <div
                  key={p.name}
                  onClick={() => setSelectedPlatform(p.name)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all ${
                    p.isOurSolution
                      ? isSelected
                        ? "bg-emerald-50/80 border-emerald-600 shadow-tactile"
                        : "bg-emerald-50/40 border-emerald-400 hover:border-emerald-600"
                      : isSelected
                      ? "bg-zinc-100 border-zinc-600 shadow-tactile"
                      : "bg-white border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(p.category)}
                      <span
                        className={`font-bold text-xs tracking-tight ${
                          p.isOurSolution ? "text-emerald-950 font-mono" : "text-zinc-900"
                        }`}
                      >
                        {p.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        p.isOurSolution
                          ? "bg-emerald-600 text-white border-emerald-700 font-bold"
                          : "bg-zinc-200 text-zinc-700 border-zinc-300"
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1.5 font-sans leading-relaxed">
                    {p.whatTheyClaim}
                  </p>

                  <div className="mt-2 pt-2 border-t border-zinc-200/70 flex items-center justify-between text-[10px] font-mono">
                    <span className={p.isOurSolution ? "text-emerald-800 font-bold" : "text-zinc-500"}>
                      {p.isOurSolution ? "KrishiSmriti: Multi-Factor Action Engine" : "Focus: " + p.category}
                    </span>
                    <span className="text-zinc-400 group-hover:text-zinc-800 flex items-center gap-1">
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Audit & Solution Comparison */}
        <div className="lg:col-span-8 space-y-4">
          <div className="web2-panel p-5 rounded-lg border border-zinc-300 bg-white shadow-sm space-y-4">
            {/* Header with Title and Classification */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-zinc-900">{currentPlatform.name}</span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
                      currentPlatform.isOurSolution
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-amber-100 text-amber-900 border-amber-300"
                    }`}
                  >
                    Category: {currentPlatform.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-mono mt-1">
                  Claim: &quot;{currentPlatform.whatTheyClaim}&quot;
                </p>
              </div>

              {currentPlatform.isOurSolution && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded border border-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Proposed Second Brain</span>
                </div>
              )}
            </div>

            {/* Side-by-Side: The Failure Mechanism vs How Our Second Brain Solves It */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Failure Box */}
              <div
                className={`p-4 rounded border space-y-2 ${
                  currentPlatform.isOurSolution
                    ? "bg-zinc-50 border-zinc-200"
                    : "bg-rose-50/70 border-rose-200"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 font-mono">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>
                    {currentPlatform.isOurSolution
                      ? "Past System Flaws Solved"
                      : "Where They Still Fail (Root Failure Mode)"}
                  </span>
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed font-sans">
                  {currentPlatform.whereTheyFail}
                </p>
                <div className="text-[11px] font-mono text-zinc-600 pt-1 border-t border-rose-200/60">
                  <strong>Why it happens:</strong> {currentPlatform.failReason}
                </div>
              </div>

              {/* Resolution Box */}
              <div className="p-4 rounded border border-emerald-300 bg-emerald-50/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>How Our Second Brain Overcomes It</span>
                </div>
                <p className="text-xs text-zinc-900 leading-relaxed font-sans font-medium">
                  {currentPlatform.howWeOvercome}
                </p>
                <div className="text-[11px] font-mono text-emerald-800 pt-1 border-t border-emerald-200/60">
                  <strong>Key Advantage:</strong> 100% deterministic code + multi-variable trade-off resolution
                </div>
              </div>
            </div>

            {/* Architectural Capabilities Scorecard */}
            <div className="pt-2">
              <div className="text-xs font-mono uppercase text-zinc-500 font-semibold mb-2">
                Architecture &amp; Operational Capabilities Checklist:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div
                  className={`p-2.5 rounded border text-center ${
                    currentPlatform.scoreCard.conflictResolution
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-zinc-100 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <div className="text-[10px] uppercase text-zinc-500">Conflict Engine</div>
                  <div className="text-xs mt-1">
                    {currentPlatform.scoreCard.conflictResolution ? "✓ Solved" : "✗ None"}
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded border text-center ${
                    currentPlatform.scoreCard.deterministicMath
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-zinc-100 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <div className="text-[10px] uppercase text-zinc-500">Deterministic Math</div>
                  <div className="text-xs mt-1">
                    {currentPlatform.scoreCard.deterministicMath ? "✓ ICAR Code" : "✗ Guessing"}
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded border text-center ${
                    currentPlatform.scoreCard.vernacularVoice
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-zinc-100 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <div className="text-[10px] uppercase text-zinc-500">Vernacular Voice</div>
                  <div className="text-xs mt-1">
                    {currentPlatform.scoreCard.vernacularVoice ? "✓ Bhashini" : "✗ Complex UI"}
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded border text-center ${
                    currentPlatform.scoreCard.vendorNeutral
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-zinc-100 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <div className="text-[10px] uppercase text-zinc-500">Vendor Neutral</div>
                  <div className="text-xs mt-1">
                    {currentPlatform.scoreCard.vendorNeutral ? "✓ Unbiased" : "✗ Sells Inputs"}
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded border text-center ${
                    currentPlatform.scoreCard.smallholderOptimized
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-zinc-100 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <div className="text-[10px] uppercase text-zinc-500">Smallholder Fit</div>
                  <div className="text-xs mt-1">
                    {currentPlatform.scoreCard.smallholderOptimized ? "✓ Zero Barrier" : "✗ Enterprise"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full High-Contrast Comparative Table (Image 1 Representation) */}
          <div className="web2-panel rounded-lg border border-zinc-300 overflow-hidden shadow-sm">
            <div className="bg-zinc-100 border-b border-zinc-300 px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-800">
                MASTER COMPARISON MATRIX (Full Landscape Audit)
              </span>
              <span className="text-[11px] font-mono text-zinc-500">Ecosystem Comparison vs KrishiSmriti</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-300 text-zinc-700 font-mono">
                    <th className="py-2.5 px-3 w-2/12">Platform / Attempt</th>
                    <th className="py-2.5 px-3 w-3/12">What They Claim to Do</th>
                    <th className="py-2.5 px-3 w-3/12 text-rose-900 bg-rose-50/50">
                      Where They Still Fail
                    </th>
                    <th className="py-2.5 px-3 w-4/12 text-emerald-900 bg-emerald-50/50">
                      How Our Second Brain Overcomes It
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-sans">
                  {platforms.map((p, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-zinc-50 transition-colors ${
                        p.isOurSolution ? "bg-emerald-50/30 font-medium" : ""
                      }`}
                    >
                      <td className="py-3 px-3 align-top font-bold text-zinc-900">
                        <div className="flex items-center gap-1.5">
                          {p.isOurSolution ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                          )}
                          <span>{p.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                          {p.badge}
                        </span>
                      </td>
                      <td className="py-3 px-3 align-top text-zinc-600 leading-relaxed">
                        {p.whatTheyClaim}
                      </td>
                      <td className="py-3 px-3 align-top text-rose-950 bg-rose-50/20 leading-relaxed font-sans">
                        <strong>{p.whereTheyFail.split(":")[0]}:</strong>{" "}
                        {p.whereTheyFail.split(":").slice(1).join(":")}
                      </td>
                      <td className="py-3 px-3 align-top text-emerald-950 bg-emerald-50/20 leading-relaxed font-sans">
                        <span className="text-emerald-700 font-bold mr-1">✓</span>
                        <strong>{p.howWeOvercome.split(":")[0]}:</strong>{" "}
                        {p.howWeOvercome.split(":").slice(1).join(":")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
