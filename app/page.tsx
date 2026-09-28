import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Award, Terminal, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "SIH 2026 Portfolio Index — Team ClaudeMaxDedo | Official Evaluator Gateway",
  description:
    "Official Smart India Hackathon 2026 portfolio gateway for Team ClaudeMaxDedo. Designated portals for MoES / IMD (SIH26068) and Ministry of Agriculture (SIH26193).",
};

export default function RootIndexPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* Top Banner */}
      <header className="bg-zinc-100 border-b border-zinc-300 py-1.5 px-4 text-xs font-mono text-zinc-700">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span>SMART INDIA HACKATHON 2026 &bull; TEAM: ClaudeMaxDedo</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Live Working Prototype
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 sm:py-16 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-300 text-xs font-mono text-zinc-700 shadow-sm">
            <Award className="w-3.5 h-3.5 text-zinc-900" />
            <span>Ministry of Education &amp; AICTE &bull; SIH 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Team ClaudeMaxDedo Evaluator Gateway
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto font-sans">
            Please proceed to your designated ministry evaluation portal below. Each portal operates as a fully isolated, production-grade system.
          </p>
        </div>

        {/* Portals Cards */}
        <div className="space-y-6 pt-2">
          {/* Flagship Active Build Card: SIH26080 */}
          <div className="web2-panel rounded-lg border-2 border-emerald-600 bg-white p-6 shadow-tactile flex flex-col justify-between relative">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-mono font-bold tracking-wide shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              ACTIVE HACKATHON FOCUS &bull; JJAS 2024 BENCHMARK
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="web2-badge web2-badge-blue text-xs font-mono font-bold">
                  PS ID: SIH26080
                </span>
                <span className="text-xs font-mono text-zinc-600 font-semibold">
                  MoES / NCMRWF &amp; IMD (Software)
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                  Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts
                </h2>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">
                  Numerical Weather Prediction &bull; Quantile Mapping &bull; Spatial Orography Learning
                </p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                Post-processing pipeline addressing systematic displacement and under-prediction of Indian monsoon extremes. Leverages antecedent Core Monsoon Zone dynamics, synoptic regime classification (Active, Break, Coastal Trough), and Regime-Conditioned Quantile Mapping (RQDM) evaluated against IMD 0.25° gridded observations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-zinc-50 border border-zinc-200 p-3 rounded text-xs font-mono text-zinc-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Domain RMSE: 17.2 &rarr; 15.2 mm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Heavy Rain ETS: 0.12 &rarr; 0.17</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero Data Leakage Boundary</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/sih26080"
                className="web2-button-primary w-full text-xs py-3 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold rounded shadow-sm"
              >
                <span>Enter SIH26080 Evaluator Portal &amp; Interactive Benchmarks</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Secondary Agro-Intelligence Portal Card */}
          <div className="web2-panel rounded-lg border border-zinc-300 bg-white p-6 shadow-tactile flex flex-col justify-between hover:border-zinc-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="web2-badge web2-badge-green text-xs font-mono">
                  PS ID: SIH26193
                </span>
                <span className="text-xs font-mono text-zinc-500">Ministry of Agriculture</span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                  KrishiSmriti
                </h2>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">
                  The Farm&apos;s Second Brain &bull; 12-Factor Deterministic Decision Engine
                </p>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Deterministic Cross-Factor Advisory Engine evaluating weather windows, Panchayat soil moisture (38%), Soil Health Card chemistry, pgvector episodic memory, and Agmarknet APMC mandi arbitrage.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-zinc-50 border border-zinc-200 p-2.5 rounded text-xs font-mono text-zinc-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>12-Factor Matrix Pass</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Agmarknet Arbitrage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>SHA-256 Advisory Hash</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/krishismriti"
                className="web2-button-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <span>Enter KrishiSmriti Evaluator Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Verification Summary Card */}
        <div className="web2-panel p-4 rounded border border-zinc-300 bg-white text-xs font-mono text-zinc-600 space-y-1">
          <div className="font-bold text-zinc-800">
            Institutional Verification Status:
          </div>
          <div>&bull; Portals strictly isolated with zero cross-navigation.</div>
          <div>&bull; JJAS 2024 empirical verification: ECMWF IFS, GFS, and IMD 0.25° gridded ground truth.</div>
          <div>&bull; Compliant with Web 2.0 light-mode minimalist standard (no dark mode, no neon gradients).</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-300 bg-zinc-100 py-4 px-4 text-xs font-mono text-zinc-500 text-center">
        Smart India Hackathon 2026 &bull; Team ClaudeMaxDedo &bull; All Rights Reserved
      </footer>
    </div>
  );
}
