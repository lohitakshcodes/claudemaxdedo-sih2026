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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* WeatherGPT Card */}
          <div className="web2-panel rounded-lg border border-zinc-300 bg-white p-6 shadow-tactile flex flex-col justify-between hover:border-zinc-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="web2-badge web2-badge-blue text-xs font-mono">
                  PS ID: SIH26068
                </span>
                <span className="text-xs font-mono text-zinc-500">MoES / IMD</span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                  WeatherGPT
                </h2>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">
                  Disaster Management &amp; Climate Tech
                </p>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Autonomous Multi-Sector Weather &amp; Maritime Voice Intelligence via WMO WIS 2.0 MQTT edge brokers, S-Band Doppler radar indexing, and Bhashini multilingual speech agents for coastal fishermen, commuters, aviation, and public safety.
              </p>

              <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded text-xs font-mono text-zinc-700 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WMO WIS 2.0 MQTT Live Ingestion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Deterministic CAP 1.2 Gatekeeper</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>14 Indic Dialects Voice Pipeline</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/weathergpt"
                className="web2-button-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <span>Enter WeatherGPT Evaluator Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* KrishiSmriti Card */}
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
                  Agriculture, FoodTech &amp; Rural Development
                </p>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Multimodal Agro-Advisory &amp; Mandi Arbitrage Engine powered by Sentinel-1 Synthetic Aperture Radar (SAR), Agmarknet live price feeds, and ICAR dosage guardrails.
              </p>

              <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded text-xs font-mono text-zinc-700 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sentinel-1 SAR 10m Soil Moisture</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2,400+ APMC Mandi Arbitrage Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ICAR Package of Practices Locked</span>
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
          <div>&bull; Both portals strictly isolated with zero cross-navigation.</div>
          <div>&bull; Deterministic MQTT / WSS telemetry stream ticking every 2.5 seconds.</div>
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
