"use client";

import React, { useState } from "react";
import { PortalConfig } from "@/types/portal";
import { TelemetryStream } from "@/components/telemetry-stream";
import { ModalDialog } from "@/components/modal-dialog";
import { MobilePhoneModal } from "@/components/mobile-phone-modal";
import { RadarMapVisualizer } from "@/components/radar-map-visualizer";
import { CompetitiveBenchmarkMatrix } from "@/components/competitive-benchmark-matrix";
import { AgriArchitectureVisualizer } from "@/components/agri-architecture-visualizer";
import { ConflictResolutionSandbox } from "@/components/conflict-resolution-sandbox";
import { PersonalizationLayersVisualizer } from "@/components/personalization-layers-visualizer";
import { ApiEcosystemVisualizer } from "@/components/api-ecosystem-visualizer";
import { BrokenChainFlowchart } from "@/components/broken-chain-flowchart";
import { PersonaSynthesisFlowchart } from "@/components/persona-synthesis-flowchart";
import { HallucinationGuardrailFlowchart } from "@/components/hallucination-guardrail-flowchart";
import { MacroLossFlowchart } from "@/components/macro-loss-flowchart";
import { B2gDeploymentFlowchart } from "@/components/b2g-deployment-flowchart";
import {
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  Layers,
  FileText,
  Activity,
  Github,
  Linkedin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Server,
  Cpu,
  Mic,
  ArrowUpRight,
  Play,
  FileCheck,
  Radio,
  Sparkles,
  Info,
  IndianRupee,
  Flame,
  TrendingDown,
  BookOpen,
  Code,
  Database,
  Volume2,
} from "lucide-react";

interface PortalTemplateProps {
  config: PortalConfig;
}

export const PortalTemplate: React.FC<PortalTemplateProps> = ({ config }) => {
  const [modalType, setModalType] = useState<"swagger" | "dataset" | "audio" | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [activeArchCol, setActiveArchCol] = useState<number>(0);
  const [showEconomicLossModal, setShowEconomicLossModal] = useState<boolean>(false);

  const openModal = (type: "swagger" | "dataset" | "audio" | "deployed") => {
    if (type === "deployed") {
      setIsMobileModalOpen(true);
    } else {
      setModalType(type);
    }
  };

  const closeModal = () => {
    setModalType(null);
  };

  // Robust smooth scrolling that accounts for sticky navbar offset
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 76;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const isWeather = config.id === "weathergpt";

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-zinc-200 selection:text-zinc-900">
      {/* 1. TOP INSTITUTIONAL THIN ALERT BAR */}
      <aside aria-label="Hackathon Submission Notice" className="bg-zinc-100 border-b border-zinc-300 py-1.5 px-4 text-xs font-mono text-zinc-700 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-zinc-600"></span>
            <span>
              {isWeather ? "WeatherGPT · SIH 2026 · Team ClaudeMaxDedo" : "KrishiSmriti · SIH 2026 · Team ClaudeMaxDedo"} | PS ID:{" "}
              <strong className="text-zinc-900">{config.psId}</strong> | THEME:{" "}
              <strong className="text-zinc-900">{config.theme}</strong> | TEAM ID:{" "}
              <strong className="text-zinc-900">SIH079</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-zinc-600">
            <span>Problem statement by {isWeather ? "MoES / IMD" : "MoA&FW"}</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
              {config.trlStatus}
            </span>
          </div>
        </div>
      </aside>

      {/* 2. STICKY INSTITUTIONAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-none border-b border-zinc-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Left Brand + Status Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-bold text-lg tracking-tight text-zinc-900 hover:text-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded bg-zinc-900"></span>
              <span>{config.brandName}</span>
            </button>
            <span className="web2-badge web2-badge-green font-mono text-[11px] py-0.5 px-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>{config.trlStatus}</span>
            </span>
          </div>

          {/* Right Anchor Navigation */}
          <nav aria-label="Portal Sections" className="hidden lg:flex items-center space-x-1 text-xs font-medium text-zinc-600">
            <button
              onClick={() => scrollToSection("problem")}
              className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium"
            >
              {isWeather ? "Problem & Diagnostic" : "Problem & Loss"}
            </button>

            {!isWeather && config.competitiveMatrix && (
              <button
                onClick={() => scrollToSection("benchmark")}
                className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium text-zinc-800"
              >
                Benchmark
              </button>
            )}

            {isWeather && config.apiDirectoryTiers && (
              <button
                onClick={() => scrollToSection("api-directory")}
                className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium text-zinc-800"
              >
                APIs &amp; Shifts
              </button>
            )}

            <button
              onClick={() => scrollToSection("architecture")}
              className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium"
            >
              Architecture
            </button>

            {!isWeather && config.conflictScenarios && (
              <button
                onClick={() => scrollToSection("conflict-engine")}
                className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium text-emerald-800"
              >
                Conflict Engine
              </button>
            )}

            {!isWeather && config.personalizationLayers && (
              <button
                onClick={() => scrollToSection("personalization")}
                className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium"
              >
                Personalization
              </button>
            )}

            <button
              onClick={() => scrollToSection("live-telemetry")}
              className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Live Feed
            </button>
            <button
              onClick={() => scrollToSection("feasibility")}
              className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium"
            >
              Safeguards
            </button>
            <button
              onClick={() => scrollToSection("impact")}
              className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium"
            >
              Impact
            </button>
            <button
              onClick={() => scrollToSection("code-demo")}
              className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium"
            >
              Code &amp; Demos
            </button>
            <button
              onClick={() => scrollToSection("team")}
              className="px-2.5 py-1.5 rounded hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium"
            >
              Team
            </button>
          </nav>

          {/* Sticky Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToSection("live-telemetry")}
              className="web2-button text-xs py-1 px-2.5 hidden sm:inline-flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Live Feed</span>
            </button>

            {/* Prominent Button to Open Deployed Solution */}
            <button
              onClick={() => openModal("deployed")}
              className="web2-button-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
              title="Open the live interactive deployment interface"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{config.deployedSolution?.label || "Open Deployed Solution"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        {/* 3. HERO SECTION (SPLIT SCREEN) */}
        <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Title, Thesis, CTAs, Stats */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-600 uppercase tracking-wide bg-zinc-200/80 px-2.5 py-1 rounded border border-zinc-300 mb-3">
                    <span>{config.ministry}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-zinc-900 tracking-tight leading-[1.15]">
                    {config.brandName}: {config.brandTagline}
                  </h1>
                </div>

                <p className="text-base text-zinc-600 leading-relaxed font-sans">
                  {config.thesis}
                </p>

                {/* Tactile Web 2.0 Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => openModal("deployed")}
                    className="web2-button-primary flex items-center gap-2 text-sm shadow-button"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{config.deployedSolution?.label || "Open Deployed Solution"}</span>
                  </button>

                  <button
                    onClick={() => scrollToSection("architecture")}
                    className="web2-button flex items-center gap-2 text-sm"
                  >
                    <Layers className="w-4 h-4" />
                    <span>View Architecture</span>
                  </button>

                  <button
                    onClick={() => scrollToSection("demo-video-container")}
                    className="web2-button flex items-center gap-2 text-sm"
                  >
                    <Play className="w-4 h-4 text-zinc-700" />
                    <span>Demo Video</span>
                  </button>
                </div>

                {/* Hero High-Density Metric Strip */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200">
                  {config.quickStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="web2-panel-gray p-3 rounded border border-zinc-200 bg-white flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs text-zinc-500 font-mono uppercase">{stat.label}</span>
                          {stat.tag && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                                stat.tag.type === "Source"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : stat.tag.type === "Measured"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                              title={stat.tag.detail}
                            >
                              {stat.tag.type}
                            </span>
                          )}
                        </div>
                        <div className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mt-0.5">
                          {stat.value}
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                        {stat.sublabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: 16:9 Video / Interactive Demo Preview Container */}
              <div id="demo-video-container" className="lg:col-span-6 scroll-mt-24">
                <div className="web2-panel rounded-lg border border-zinc-300 p-2 bg-zinc-100 shadow-md">
                  <div className="flex items-center justify-between px-2 py-1.5 text-xs font-mono text-zinc-600 border-b border-zinc-200 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                      <span className="font-semibold text-zinc-800">
                        INTERACTIVE DEMO &amp; EVALUATOR WALKTHROUGH
                      </span>
                    </div>
                    <span className="text-[11px] bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 font-medium">
                      SIH 2026 Prototype
                    </span>
                  </div>

                  {/* Clean Interactive Video / Demo Container */}
                  <div className="relative w-full overflow-hidden rounded border border-zinc-300 bg-zinc-900 pt-[56.25%]">
                    {config.heroVideoId && config.heroVideoId !== "dQw4w9WgXcQ" ? (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${config.heroVideoId}?rel=0&modestbranding=1`}
                        title={`${config.brandName} Prototype Walkthrough`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-6 text-center text-white">
                        <Play className="w-12 h-12 text-emerald-400 mb-3 animate-pulse" />
                        <h4 className="text-base font-bold text-white mb-1">
                          {config.brandName} Live Interactive Prototype
                        </h4>
                        <p className="text-xs text-zinc-300 max-w-md mb-4">
                          Click below to launch the live mobile simulator and test real queries, rule checks, and voice notes.
                        </p>
                        <button
                          onClick={() => openModal("deployed")}
                          className="web2-button-primary text-xs py-2 px-4 shadow-lg flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Launch Interactive Prototype</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-2 pt-2 pb-1 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>Source: Public GitHub Repository</span>
                    <span>Team: ClaudeMaxDedo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SLIDE: #problem (QUANTIFIED DAMAGE & DECISION BLINDNESS) */}
        <section id="problem" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                {config.problem.sectionTitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {config.problem.headline}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-sans">
                {config.problem.summary}
              </p>
            </div>

            {/* Visual Research Diagnostic: Broken Transmission Chain vs. Autonomous System */}
            <BrokenChainFlowchart projectId={config.id} />

            {/* High-Density Metric Cards with Verified Citations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.problem.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="web2-panel p-4 rounded-md border border-zinc-300 bg-zinc-50 hover:bg-white transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-mono text-zinc-500 uppercase tracking-wide">
                        {m.label}
                      </span>
                      {m.tag && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                            m.tag.type === "Source"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : m.tag.type === "Measured"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                          title={m.tag.detail}
                        >
                          {m.tag.type}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight my-1.5">
                      {m.value}
                    </div>
                    <p className="text-xs text-zinc-600 leading-normal">{m.subtext}</p>
                  </div>

                  {m.trend && (
                    <div className="mt-3 pt-2 border-t border-zinc-200 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                      {m.citationUrl ? (
                        <a
                          href={m.citationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate max-w-[95%] text-zinc-600 hover:text-emerald-700 underline underline-offset-2 flex items-center gap-1 font-medium"
                          title={`Open source citation: ${m.trend}`}
                        >
                          <span className="truncate">Source: {m.trend}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                        </a>
                      ) : (
                        <span className="truncate max-w-[95%]">Source: {m.trend}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Visual Sectoral Macro-Economic Loss Analysis Flowchart */}
            <MacroLossFlowchart projectId={config.id} />

            {/* Detailed Economic Loss Breakdown with Official Research Citations */}
            {config.problem.economicLossDetails && (
              <div className="web2-panel rounded-lg border border-zinc-300 bg-zinc-50/50 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-zinc-800" />
                    <h3 className="font-bold text-sm text-zinc-900">
                      {isWeather
                        ? "Quantified Economic Losses Across Marine, Urban & Aviation Sectors (Official Reports & Citations)"
                        : "Quantified Financial Losses in Indian Agriculture (Official Reports & Citations)"}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {isWeather ? "Validated Across 5 Multi-Sector Vulnerabilities" : "Validated Across 5 Failure Modes"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {config.problem.economicLossDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded border border-zinc-200 bg-white space-y-2 flex flex-col justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-zinc-900 text-xs">{item.category}</div>
                        <div className="text-sm font-bold text-red-700 font-mono">
                          {item.annualLoss}
                        </div>
                        <p className="text-zinc-600 text-[11px] leading-relaxed pt-1">
                          {item.rootCause}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span className="truncate max-w-[85%]">{item.citation.source}</span>
                        <a
                          href={item.citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 font-bold"
                          title={item.citation.title}
                        >
                          <span>Ref</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehension Gap Comparison: Legacy Single-Variable vs KrishiSmriti Second Brain */}
            <div className="web2-panel rounded-lg border border-zinc-300 overflow-hidden shadow-sm">
              <div className="bg-zinc-100 border-b border-zinc-300 px-5 py-3 flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-900">
                  Diagnostic: Single-Variable Bias vs. Autonomous Second Brain
                </h3>
                <span className="text-xs font-mono text-zinc-500">
                  Operational Paradigm Shift
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                {/* Legacy Status Quo */}
                <div className="p-5 bg-zinc-50 space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <h4 className="font-bold text-sm text-zinc-900">
                      {config.problem.gapComparison.legacyTitle}
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-700">
                    {config.problem.gapComparison.legacyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500 font-bold shrink-0">&times;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Our Solution */}
                <div className="p-5 bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-sm text-zinc-900">
                      {config.problem.gapComparison.solutionTitle}
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-700">
                    {config.problem.gapComparison.solutionPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">&#10003;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SLIDE: #benchmark (COMPETITIVE ECOSYSTEM & RESEARCH GAPS - IMAGE 1) */}
        {!isWeather && config.competitiveMatrix && (
          <section id="benchmark" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-zinc-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                  {config.competitiveMatrix.sectionTitle}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                  {config.competitiveMatrix.headline}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-sans">
                  {config.competitiveMatrix.summary}
                </p>
              </div>

              {/* Interactive Competitive Benchmark Matrix */}
              <CompetitiveBenchmarkMatrix platforms={config.competitiveMatrix.platforms} />
            </div>
          </section>
        )}

        {/* 5B. SLIDE: #api-directory (5-TIER API DIRECTORY & PARADIGM SHIFTS - WEATHERGPT) */}
        {isWeather && config.apiDirectoryTiers && (
          <section id="api-directory" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
              {/* Interactive API Ecosystem Visualizer */}
              <ApiEcosystemVisualizer
                apiTiers={config.apiDirectoryTiers}
                paradigmShifts={config.paradigmShifts || []}
              />
            </div>
          </section>
        )}

        {/* 6. SLIDE: #architecture (INTERACTIVE PIPELINE + 3-COLUMN STRUCTURE) */}
        <section id="architecture" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-zinc-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                {config.architecture.sectionTitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {config.architecture.headline}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-sans">
                {config.architecture.summary}
              </p>
            </div>

            {/* Interactive Architecture Flow Diagram for KrishiSmriti (Images 2 & 3) */}
            {!isWeather && (
              <AgriArchitectureVisualizer parallelApis={config.architecture.parallelApis || []} />
            )}

            {/* WeatherGPT 5-Step Persona Adaptation Flowchart */}
            {isWeather && (
              <PersonaSynthesisFlowchart />
            )}

            {/* 3-Column Structured Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {config.architecture.columns.map((col, idx) => (
                <div
                  key={idx}
                  className={`web2-panel rounded-lg border bg-white overflow-hidden shadow-sm flex flex-col ${
                    activeArchCol === idx ? "border-zinc-500" : "border-zinc-300"
                  }`}
                  onClick={() => setActiveArchCol(idx)}
                >
                  {/* Column Header */}
                  <div className="bg-zinc-100 border-b border-zinc-300 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold uppercase text-zinc-500">
                        Layer 0{col.layerNumber}
                      </span>
                      <span className="web2-badge text-[10px] font-mono py-0 px-2 bg-zinc-200 border-zinc-300">
                        {col.throughput}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-zinc-900 tracking-tight">
                      {col.title}
                    </h3>
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">{col.subtitle}</p>
                  </div>

                  {/* Components Inside Column */}
                  <div className="p-4 space-y-4 flex-1 divide-y divide-zinc-100">
                    {col.items.map((item, itemIdx) => (
                      <div key={itemIdx} className={itemIdx > 0 ? "pt-3" : ""}>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="font-bold text-xs text-zinc-900">{item.name}</h4>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 mb-1.5">
                          Tech: <span className="text-zinc-800 font-medium">{item.tech}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mb-2 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.specs.map((sp, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-mono bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-700"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Column Footer Status */}
                  <div className="bg-zinc-50 border-t border-zinc-200 px-4 py-2 text-[11px] font-mono text-zinc-500 flex justify-between">
                    <span>Status: Integrated</span>
                    <span>P99 SLA &lt; 50ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. SLIDE: #conflict-engine (MULTI-VARIABLE CONFLICT RESOLUTION SANDBOX) */}
        {!isWeather && config.conflictScenarios && (
          <section id="conflict-engine" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
              <ConflictResolutionSandbox scenarios={config.conflictScenarios} />
            </div>
          </section>
        )}

        {/* 8. SLIDE: #personalization (5 LAYERS OF DEEP HYPER-PERSONALIZATION) */}
        {!isWeather && config.personalizationLayers && (
          <section id="personalization" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-zinc-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
              <PersonalizationLayersVisualizer layers={config.personalizationLayers} />
            </div>
          </section>
        )}

        {/* 9. LIVE INGESTION TELEMETRY ENGINE WITH CLEAR EXPLAINER */}
        <section id="live-telemetry" className="scroll-mt-24 py-12 border-b border-zinc-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
            {/* Natural Language Explainer Card */}
            <div className="web2-panel p-4 rounded-md border border-zinc-300 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0 mt-0.5">
                  <Radio className="w-5 h-5 text-emerald-700 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-zinc-900">
                      What is this Live Telemetry Feed?
                    </h3>
                    <span className="web2-badge web2-badge-green text-[10px] py-0 px-2">
                      Real-Time Ingestion Pipeline
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                    {isWeather
                      ? "Before WeatherGPT generates voice advisories for citizens and farmers, it listens to meteorological and disaster alert streams from national agencies (such as IMD forecasts, WMO WIS 2.0 MQTT notifications, and NDMA SACHET CAP 1.2 disaster bulletins). This console demonstrates our live ingestion pipeline in action: incoming weather packets and alert polygons are ingested and indexed continuously."
                      : "Before KrishiSmriti advises a farmer on irrigation or mandi realization, it ingests physical and agricultural data streams (such as Open-Meteo hourly weather, SoilGrids/SHC soil chemistry, Agmarknet live market arrivals, and Panchayat sensor feeds). This console demonstrates our live ingestion pipeline in action: incoming telemetry is validated and indexed continuously."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openModal("swagger")}
                  className="web2-button text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect API Schemas</span>
                </button>
              </div>
            </div>

            {/* Visual Proof-of-Work: Interactive Geospatial Radar & PostGIS Map */}
            <RadarMapVisualizer projectId={config.id} />

            {/* Live Streaming Console */}
            <TelemetryStream
              title={config.telemetry.title}
              description={config.telemetry.description}
              brokerUrl={config.telemetry.brokerUrl}
              topics={config.telemetry.topics}
              packetPool={config.telemetry.packetPool}
              projectId={config.id}
            />
          </div>
        </section>

        {/* 10. SLIDE: #feasibility (RISK VS ENGINEERING SAFEGUARD TABLE) */}
        <section id="feasibility" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                {config.feasibility.sectionTitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {config.feasibility.headline}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-sans">
                {config.feasibility.summary}
              </p>
            </div>

            {/* Visual Hallucination Control & Decoupled Truth Assertion Flowchart */}
            <HallucinationGuardrailFlowchart />

            {/* Visual B2G DPI Government Deployment Architecture Flowchart (KrishiSmriti) */}
            {!isWeather && (
              <B2gDeploymentFlowchart />
            )}

            {/* 2-Column Risk vs Safeguard Structured Table */}
            <div className="web2-panel rounded-lg border border-zinc-300 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-700 font-mono">
                      <th className="py-3 px-4 w-1/12">ID</th>
                      <th className="py-3 px-4 w-5/12">Identified Operational Risk &amp; Hazard</th>
                      <th className="py-3 px-4 w-6/12">Verifiable Engineering Safeguard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-sans">
                    {config.feasibility.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-zinc-500 align-top">
                          <div className="space-y-1">
                            <div>{row.id}</div>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                row.severity === "CRITICAL"
                                  ? "bg-red-100 text-red-800 border border-red-300"
                                  : row.severity === "HIGH"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-zinc-100 text-zinc-800 border border-zinc-300"
                              }`}
                            >
                              {row.severity}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top space-y-1">
                          <div className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                            <AlertOctagon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{row.riskTitle}</span>
                          </div>
                          <div className="text-zinc-500 font-mono text-[11px]">
                            Category: {row.riskCategory}
                          </div>
                          <p className="text-zinc-600 leading-relaxed pt-1">
                            {row.riskDescription}
                          </p>
                        </td>

                        <td className="py-4 px-4 align-top space-y-1">
                          <div className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{row.safeguardTitle}</span>
                          </div>
                          <p className="text-zinc-700 leading-relaxed">
                            {row.safeguardDescription}
                          </p>
                          <div className="bg-zinc-50 border border-zinc-200 p-2 rounded text-[11px] font-mono text-zinc-700 mt-2">
                            <strong>Implementation Proof:</strong> {row.engineeringImplementation}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 11. SLIDE: #impact (HIGH-CONTRAST COMPARISON TABLE) */}
        <section id="impact" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                {config.impact.sectionTitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {config.impact.headline}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-sans">
                {config.impact.summary}
              </p>
            </div>

            {/* High-Contrast Impact Table */}
            <div className="web2-panel rounded-lg border border-zinc-300 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-800 font-mono">
                      <th className="py-3 px-4 w-3/12">Evaluation Dimension</th>
                      <th className="py-3 px-4 w-4/12">Status Quo Legacy Portals</th>
                      <th className="py-3 px-4 w-4/12 bg-zinc-200/50">
                        Our Solution ({config.brandName})
                      </th>
                      <th className="py-3 px-4 w-1/12 text-right">Quantified Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-sans">
                    {config.impact.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-100/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-900 align-middle">
                          {row.dimension}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 align-middle">
                          <span className="line-through decoration-zinc-400 text-zinc-500 mr-1.5">&bull;</span>
                          {row.statusQuo}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-900 bg-zinc-50/50 align-middle">
                          <span className="text-emerald-700 font-bold mr-1.5">&#10003;</span>
                          {row.ourSolution}
                        </td>
                        <td className="py-3.5 px-4 text-right align-middle font-mono">
                          <div className="font-bold text-emerald-800">{row.metricGain}</div>
                          {row.tag && (
                            <div className="mt-1 flex justify-end">
                              {row.tag.url ? (
                                <a
                                  href={row.tag.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={row.tag.detail || "Source citation"}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                                >
                                  <span>Source</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span
                                  title={row.tag.detail}
                                  className={`inline-flex items-center text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                    row.tag.type === "Measured"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                      : "border-amber-200 bg-amber-50 text-amber-800"
                                  }`}
                                >
                                  {row.tag.type}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 12. PROOF OF WORK HUB: #code-demo */}
        <section id="code-demo" className="scroll-mt-24 py-14 border-b border-zinc-200 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                {config.proofOfWork.sectionTitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {config.proofOfWork.headline}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-sans">
                {config.proofOfWork.summary}
              </p>
            </div>

            {/* Proof Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {config.proofOfWork.items.map((item, idx) => (
                <div
                  key={idx}
                  className="web2-panel rounded-lg border border-zinc-300 p-5 bg-white flex flex-col justify-between hover:border-zinc-400 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded border border-zinc-300 bg-zinc-100 flex items-center justify-center text-zinc-700">
                        {item.icon === "code" && <Code className="w-4 h-4" />}
                        {item.icon === "database" && <Database className="w-4 h-4" />}
                        {item.icon === "mic" && <Volume2 className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 uppercase">
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                        {item.title}
                      </h3>
                      <p className="text-xs font-mono text-zinc-500 mt-0.5">{item.subtitle}</p>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-200">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="web2-button text-xs w-full flex items-center justify-center gap-1.5"
                      >
                        <span>{item.actionText}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => openModal(item.modalType || "swagger")}
                        className="web2-button text-xs w-full flex items-center justify-center gap-1.5"
                      >
                        <span>{item.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 13. TEAM EXECUTION CAPABILITY: #team */}
        <section id="team" className="scroll-mt-24 py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                {config.team.sectionTitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {config.team.headline}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-sans">
                {config.team.summary}
              </p>
            </div>

            {/* Clean 2x3 Grid Displaying All 6 Members */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {config.team.members.map((member, idx) => (
                <div
                  key={idx}
                  className="web2-panel rounded-lg border border-zinc-300 p-5 bg-white hover:border-zinc-400 transition-all flex flex-col justify-between shadow-tactile"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {/* Monogram Badge */}
                      <div className="w-10 h-10 rounded border border-zinc-300 bg-zinc-100 flex items-center justify-center font-bold text-sm text-zinc-800 shrink-0 font-mono shadow-inner">
                        {member.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-zinc-900">{member.name}</h3>
                        <p className="text-xs font-medium text-emerald-800 mt-0.5">
                          {member.operationalRole}
                        </p>
                        <p className="text-[11px] font-mono text-zinc-500">{member.coreDiscipline}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                      <div className="text-[11px] font-mono text-zinc-400 uppercase">
                        Core System Contributions:
                      </div>
                      <ul className="space-y-1 text-xs text-zinc-600 font-sans">
                        {member.keyContributions.map((contrib, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1.5">
                            <span className="text-zinc-400 font-bold">&bull;</span>
                            <span>{contrib}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-200 flex items-center gap-2">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="web2-button text-xs py-1 px-2.5 flex items-center gap-1.5 flex-1"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="web2-button text-xs py-1 px-2.5 flex items-center gap-1.5 flex-1"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 14. INSTITUTIONAL FOOTER */}
      <footer className="border-t border-zinc-300 bg-zinc-100 py-8 px-4 sm:px-6 text-xs text-zinc-600 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-zinc-800">
              SMART INDIA HACKATHON 2026 | Team ClaudeMaxDedo
            </div>
            <div className="text-zinc-500 mt-0.5">
              {config.id === "weathergpt"
                ? "SIH 2026 prototype by Team ClaudeMaxDedo · not affiliated with MoES, IMD or NDMA."
                : "SIH 2026 prototype by Team ClaudeMaxDedo · not affiliated with MoA&FW or ICAR."}
            </div>
          </div>

          <div className="text-right">
            <div>Team ClaudeMaxDedo &bull; Problem Statement ID: {config.psId}</div>
            <div className="text-zinc-500 mt-0.5">
              Build: Prototype &bull; Status: {config.trlStatus}
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Verification Modal (Swagger, Dataset, Audio) */}
      <ModalDialog
        isOpen={modalType !== null}
        onClose={closeModal}
        type={modalType}
        projectId={config.id}
        deployedInfo={config.deployedSolution}
      />

      {/* Realistic iPhone Mobile Simulator Modal with Underneath Explainer */}
      <MobilePhoneModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        projectId={config.id}
      />
    </div>
  );
};
