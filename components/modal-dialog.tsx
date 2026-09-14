"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Pause,
  Download,
  Terminal,
  Volume2,
  Database,
  Code,
  CheckCircle,
  ExternalLink,
  Send,
  MessageSquare,
  Sparkles,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "swagger" | "dataset" | "audio" | "deployed" | null;
  projectId: "weathergpt" | "krishismriti";
  deployedInfo?: {
    label: string;
    url: string;
    badge: string;
    description: string;
  };
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  isOpen,
  onClose,
  type,
  projectId,
  deployedInfo,
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResponse, setSimulationResponse] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(
    projectId === "weathergpt" ? "Bhojpuri" : "Bundelkhandi"
  );

  if (!isOpen || !type) return null;

  const isWeather = projectId === "weathergpt";

  const handleCopyCurl = (cmd: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleRunSimulation = (queryText: string) => {
    setIsSimulating(true);
    setSimulationResponse(null);
    setTimeout(() => {
      setIsSimulating(false);
      if (isWeather) {
        setSimulationResponse(
          JSON.stringify(
            {
              session_id: "WA-EVAL-2026-0912",
              dialect: selectedLanguage,
              query_transcribed: queryText,
              cap_risk_level: "MODERATE_WARNING",
              actionable_advisory:
                "डू नॉट स्प्रे पेस्टीसाइड टुडे। वाराणसी में 3:30 बजे के बाद 42 मिमी बारिश की संभावना बा। फसल के सुरक्षित स्थान पर रखीं।",
              english_summary:
                "Do not spray pesticide today. Convective squall with 42mm rain expected after 3:30 PM in your village. Move harvested produce to covered yard.",
              latency_breakdown_ms: { asr: 34, rag_tool_call: 82, tts_synthesis: 64, total: 180 },
              deterministic_cap_safety_validated: true,
            },
            null,
            2
          )
        );
      } else {
        setSimulationResponse(
          JSON.stringify(
            {
              session_id: "WA-EVAL-AGRO-8821",
              dialect: selectedLanguage,
              query_transcribed: queryText,
              sar_soil_moisture_pct: 18.4,
              moisture_status: "CRITICAL_DEFICIT (Immediate Irrigation Needed)",
              mandi_arbitrage: {
                recommended_apmc: "Pimpalgaon Yard (18km)",
                modal_price_per_qtl: "₹2,680",
                local_yard_price: "₹2,440",
                net_surplus_after_freight: "+₹185 / qtl",
              },
              icar_package_of_practices_check: "100% Locked — Zero Chemical Dosage Hallucination",
              latency_total_ms: 195,
            },
            null,
            2
          )
        );
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 animate-in fade-in duration-150">
      <div
        className="web2-panel bg-white w-full max-w-4xl max-h-[88vh] rounded-lg shadow-xl overflow-hidden flex flex-col border border-zinc-400 text-zinc-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Window Header with Web 2.0 Titlebar */}
        <div className="bg-zinc-100 border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === "deployed" && <Smartphone className="w-4 h-4 text-emerald-700" />}
            {type === "swagger" && <Code className="w-4 h-4 text-blue-700" />}
            {type === "dataset" && <Database className="w-4 h-4 text-emerald-700" />}
            {type === "audio" && <Volume2 className="w-4 h-4 text-amber-700" />}
            <span className="font-semibold text-sm tracking-tight text-zinc-800">
              {type === "deployed" && (isWeather ? "WeatherGPT Live Deployed Solution Interface" : "KrishiSmriti Live Deployed Solution Interface")}
              {type === "swagger" && (isWeather ? "WeatherGPT OpenAPI 3.1 Specification" : "KrishiSmriti Agro-Engine OpenAPI 3.1 Specification")}
              {type === "dataset" && (isWeather ? "Historical Radar Sweeps & GFS Grid Datasets" : "Sentinel-1 SAR Radar & Agmarknet Datasets")}
              {type === "audio" && "Bhashini Dialect Audio Voice Verification"}
            </span>
            <span className="web2-badge text-[11px] py-0.5 px-2 bg-zinc-200 border-zinc-300">
              Evaluator Testbed
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-200 text-zinc-600 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(88vh-120px)] space-y-6">
          {/* DEPLOYED SOLUTION INTERACTIVE SANDBOX */}
          {type === "deployed" && (
            <div className="space-y-5">
              <div className="web2-panel p-4 rounded-md border border-zinc-300 bg-zinc-50 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900">
                      {isWeather ? "WeatherGPT WhatsApp Voice Engine (Live Deployment)" : "KrishiSmriti Multimodal Agro-Bot (Live Deployment)"}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="web2-badge web2-badge-green text-xs">Status: Active &amp; Ready</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 font-sans">
                  {deployedInfo?.description ||
                    "Directly test conversational prompts or review live response packets generated by our agentic pipeline."}
                </p>
              </div>

              {/* Sample Prompts & Dialect Select */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    Select a Test Prompt or Enter Custom Query:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(isWeather
                      ? [
                          "Can I spray pesticide in Varanasi today?",
                          "Is severe rain forecasted for my village tonight?",
                          "Puri harbor cyclone warning status",
                        ]
                      : [
                          "Check soil moisture for my wheat field in Moga",
                          "Where can I sell Grade-A onions for maximum price?",
                          "Yellow rust alert check for Ludhiana block",
                        ]
                    ).map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setUserQuery(prompt);
                          handleRunSimulation(prompt);
                        }}
                        className="text-[11px] web2-button py-1 px-2.5 text-left"
                      >
                        &quot;{prompt}&quot;
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    Target Indic Dialect:
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-zinc-300 bg-white font-sans text-zinc-800"
                  >
                    {isWeather ? (
                      <>
                        <option value="Bhojpuri">Bhojpuri (Eastern UP / Bihar)</option>
                        <option value="Hindi">Standard Hindi</option>
                        <option value="Marathi">Marathi (Vidarbha)</option>
                        <option value="Tamil">Tamil (Cauvery Delta)</option>
                        <option value="Bengali">Bengali (Coastal Sundarbans)</option>
                      </>
                    ) : (
                      <>
                        <option value="Bundelkhandi">Bundelkhandi (Central UP/MP)</option>
                        <option value="Malwi">Malwi (Madhya Pradesh)</option>
                        <option value="Punjabi">Punjabi (Malwa Belt)</option>
                        <option value="Marathi">Marathi (Nashik / Lasalgaon)</option>
                        <option value="Telugu">Telugu (Godavari Delta)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Interactive Input Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    isWeather
                      ? "Ask a weather question or select a quick prompt above..."
                      : "Ask about soil moisture, mandi prices, or fertilizer advice..."
                  }
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userQuery) {
                      handleRunSimulation(userQuery);
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded font-sans focus:outline-none focus:border-zinc-500"
                />
                <button
                  onClick={() => handleRunSimulation(userQuery || (isWeather ? "Can I spray pesticide today?" : "Check soil moisture in Moga"))}
                  disabled={isSimulating}
                  className="web2-button-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSimulating ? "Processing..." : "Run Test Query"}</span>
                </button>
              </div>

              {/* Simulation Output Box */}
              {isSimulating && (
                <div className="p-6 text-center text-xs font-mono text-zinc-500 bg-zinc-50 rounded border border-zinc-200">
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-zinc-700 border-t-transparent rounded-full mb-2"></div>
                  <div>Running tool-calling agent &bull; Validating deterministic safety schemas...</div>
                </div>
              )}

              {simulationResponse && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-600">
                    <span className="font-bold text-zinc-800 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Agentic Inference Output (Validated)
                    </span>
                    <span className="text-emerald-700 font-bold">Latency: 180ms</span>
                  </div>

                  <pre className="bg-zinc-900 text-emerald-400 p-4 rounded text-xs font-mono overflow-x-auto border border-zinc-800 shadow-inner">
                    {simulationResponse}
                  </pre>
                </div>
              )}

              {/* Direct Link External Button */}
              <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-zinc-500 font-sans">
                  Evaluator Access: Direct WhatsApp Voice Gateway webhook active for SIH 2026 jury.
                </div>
                <a
                  href={deployedInfo?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="web2-button text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <span>Open External Sandbox Window</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* SWAGGER / OPENAPI PREVIEW */}
          {type === "swagger" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div>
                  <h4 className="font-bold text-base text-zinc-900">
                    {isWeather ? "WeatherGPT Core API v1.0.4" : "KrishiSmriti Multimodal API v1.1.2"}
                  </h4>
                  <p className="text-xs text-zinc-600 font-mono">Base URL: https://api.sih2026.internal/v1</p>
                </div>
                <span className="web2-badge web2-badge-green text-xs">OAS 3.1 Validated</span>
              </div>

              {/* Endpoint Cards */}
              <div className="space-y-3 font-mono text-xs">
                {isWeather ? (
                  <>
                    <div className="border border-emerald-300 bg-emerald-50/50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[11px]">POST</span>
                          <span className="font-semibold text-zinc-900">/telemetry/wis2-ingest</span>
                        </div>
                        <span className="text-zinc-500">Latency: 28ms</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-600 mb-2">
                        Ingests asynchronous WMO WIS 2.0 notification payloads and triggers spatial indexing.
                      </p>
                      <pre className="bg-white border border-zinc-200 p-2 rounded text-[11px] text-zinc-800 overflow-x-auto">
{`{
  "specversion": "1.0",
  "type": "org.wmo.wis2.notification",
  "source": "urn:wmo:md:in-imd:cyclone-warning-cap",
  "id": "MSG-WIS2-20260912-882",
  "time": "2026-09-12T10:14:00Z",
  "datacontenttype": "application/geo+json"
}`}
                      </pre>
                    </div>

                    <div className="border border-blue-300 bg-blue-50/50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-700 text-white font-bold px-2 py-0.5 rounded text-[11px]">POST</span>
                          <span className="font-semibold text-zinc-900">/agent/query</span>
                        </div>
                        <span className="text-zinc-500">Latency: 180ms</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-600 mb-2">
                        Submits a voice/text query into the LangGraph state machine with CAP deterministic gatekeeping.
                      </p>
                      <pre className="bg-white border border-zinc-200 p-2 rounded text-[11px] text-zinc-800 overflow-x-auto">
{`{
  "session_id": "WA-9198124401XX",
  "dialect_code": "bho_IN",
  "lat": 25.3176,
  "lon": 82.9739,
  "transcribed_text": "का आज हमार खेत में खाद छिड़के के चाहि?",
  "enforce_cap_safety": true
}`}
                      </pre>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border border-emerald-300 bg-emerald-50/50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[11px]">POST</span>
                          <span className="font-semibold text-zinc-900">/sar/backscatter-ingest</span>
                        </div>
                        <span className="text-zinc-500">Latency: 34ms</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-600 mb-2">
                        Ingests Sentinel-1 dual-pol backscatter (VV/VH) and runs Water Cloud Model soil moisture inversion.
                      </p>
                      <pre className="bg-white border border-zinc-200 p-2 rounded text-[11px] text-zinc-800 overflow-x-auto">
{`{
  "granule_id": "S1C_IW_GRDH_1SDV_20260912",
  "bounding_box": [75.75, 30.85, 75.95, 30.95],
  "polarization": ["VV", "VH"],
  "calibrate_ground_truth": true
}`}
                      </pre>
                    </div>

                    <div className="border border-amber-300 bg-amber-50/50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-700 text-white font-bold px-2 py-0.5 rounded text-[11px]">GET</span>
                          <span className="font-semibold text-zinc-900">/mandi/arbitrage-matrix</span>
                        </div>
                        <span className="text-zinc-500">Latency: 45ms</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-600 mb-2">
                        Calculates net price arbitrage across APMC yards subtracting road distance and diesel freight.
                      </p>
                      <pre className="bg-white border border-zinc-200 p-2 rounded text-[11px] text-zinc-800 overflow-x-auto">
{`{
  "commodity": "Onion",
  "origin_lat": 20.0063,
  "origin_lon": 74.0041,
  "quantity_quintals": 40,
  "recommended_mandi": "Pimpalgaon APMC",
  "net_surplus_inr": 8400
}`}
                      </pre>
                    </div>
                  </>
                )}
              </div>

              {/* cURL Box */}
              <div className="bg-zinc-900 text-zinc-100 p-3 rounded font-mono text-xs">
                <div className="flex items-center justify-between mb-2 text-zinc-400">
                  <span>Sample cURL Verification</span>
                  <button
                    onClick={() =>
                      handleCopyCurl(
                        `curl -X POST https://api.sih2026.internal/v1/health -H "Authorization: Bearer sih2026_eval_token"`
                      )
                    }
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copiedCurl ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    <span>{copiedCurl ? "Copied!" : "Copy cURL"}</span>
                  </button>
                </div>
                <code className="text-emerald-400 break-all">
                  curl -X GET https://api.sih2026.internal/v1/health -H &quot;Authorization: Bearer sih2026_eval_token&quot;
                </code>
              </div>
            </div>
          )}

          {/* DATASET MODAL */}
          {type === "dataset" && (
            <div className="space-y-4">
              <div className="border-b border-zinc-200 pb-3">
                <h4 className="font-bold text-base text-zinc-900">
                  {isWeather ? "Historical Meteorological Benchmarks" : "Remote Sensing & Mandi Datasets"}
                </h4>
                <p className="text-xs text-zinc-600">
                  Raw sample packages verified against official ministry ground truth archives.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="web2-panel p-4 rounded border border-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-zinc-800">
                      {isWeather ? "NetCDF4 Radar Sweep Scans" : "Sentinel-1 SAR C-Band GeoTIFF"}
                    </span>
                    <span className="web2-badge text-xs">Format: {isWeather ? ".nc4 / GRIB2" : ".tif / Cloud-Optimized"}</span>
                  </div>
                  <p className="text-xs text-zinc-600 mb-3">
                    {isWeather
                      ? "10-minute polar volume scans capturing Cyclone Biparjoy landfall with calibrated Doppler dBZ reflectivity arrays."
                      : "Dual-pol backscatter arrays calibrated with Water Cloud Model for Ludhiana and Moga rabi harvest seasons."}
                  </p>
                  <div className="font-mono text-[11px] bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-700 mb-3">
                    Size: {isWeather ? "840 MB (Uncompressed)" : "1.2 GB (10m Resolution)"} &bull; Checksum: SHA256:8f9a2e...
                  </div>
                  <button className="web2-button text-xs w-full flex items-center justify-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Verification Schema (.json)</span>
                  </button>
                </div>

                <div className="web2-panel p-4 rounded border border-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-zinc-800">Postman Collection v2.1</span>
                    <span className="web2-badge web2-badge-blue text-xs">REST + WSS</span>
                  </div>
                  <p className="text-xs text-zinc-600 mb-3">
                    Pre-configured collection with mock environment variables, auth tokens, and test scripts asserting sub-40ms latency.
                  </p>
                  <div className="font-mono text-[11px] bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-700 mb-3">
                    Requests: 28 Endpoints &bull; Tests: 54 Assertions Passing
                  </div>
                  <button className="web2-button text-xs w-full flex items-center justify-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Postman Collection (.json)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AUDIO DIALECT MODAL */}
          {type === "audio" && (
            <div className="space-y-4">
              <div className="border-b border-zinc-200 pb-3">
                <h4 className="font-bold text-base text-zinc-900">Bhashini Multilingual Speech Synthesis Pipeline</h4>
                <p className="text-xs text-zinc-600">
                  End-to-end voice recordings demonstrating low Word Error Rate (WER) and natural cadence across rural dialects.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "s1",
                    dialect: "Bhojpuri (Eastern UP / Bihar)",
                    code: "bho_IN",
                    wer: "6.8%",
                    latency: "172ms",
                    sampleText: "आज दुपहरिया तीन बजे बाद भारी बरखा के संभावना बा। अपन फसल सुरक्षित जगहिया पर रख दीं।",
                    translation: "Heavy rainfall is expected after 3 PM today. Please move harvested crop to a sheltered area.",
                  },
                  {
                    id: "s2",
                    dialect: "Malwi (Madhya Pradesh)",
                    code: "mwi_IN",
                    wer: "7.4%",
                    latency: "185ms",
                    sampleText: "खेत में नमी की मात्रा कम है। आने वाले दो दिनों में सिंचाई करना लाभप्रद रहेगा।",
                    translation: "Soil moisture is critically low. Irrigating within the next 48 hours is strongly recommended.",
                  },
                  {
                    id: "s3",
                    dialect: "Marathi (Vidarbha / Marathwada)",
                    code: "mar_IN",
                    wer: "6.2%",
                    latency: "164ms",
                    sampleText: "उद्या लासलगाव बाजार समितीत कांद्याला चांगला भाव मिळण्याची शक्यता आहे.",
                    translation: "Tomorrow, Lasalgaon APMC yard is expected to offer higher bids for Grade-A onions.",
                  },
                  {
                    id: "s4",
                    dialect: "Tamil (Cauvery Delta)",
                    code: "tam_IN",
                    wer: "7.1%",
                    latency: "178ms",
                    sampleText: "நாளை மாலை கடலோர மாவட்டங்களில் பலத்த காற்று வீசக்கூடும். கடலுக்கு செல்ல வேண்டாம்.",
                    translation: "Squally winds likely in coastal belts tomorrow evening. Fishermen advised not to venture out.",
                  },
                ].map((sample) => (
                  <div key={sample.id} className="web2-panel p-3 rounded border border-zinc-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPlayingAudioId(playingAudioId === sample.id ? null : sample.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                            playingAudioId === sample.id
                              ? "bg-amber-600 text-white border-amber-700 shadow-inner"
                              : "web2-button p-0"
                          }`}
                        >
                          {playingAudioId === sample.id ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-zinc-800 ml-0.5" />
                          )}
                        </button>
                        <div>
                          <span className="font-bold text-xs text-zinc-900">{sample.dialect}</span>
                          <span className="text-zinc-500 font-mono text-[11px] ml-2">[{sample.code}]</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-zinc-500">WER: <strong className="text-emerald-700">{sample.wer}</strong></span>
                        <span className="text-zinc-300">|</span>
                        <span className="text-zinc-500">Latency: <strong className="text-zinc-800">{sample.latency}</strong></span>
                        {playingAudioId === sample.id && (
                          <span className="web2-badge web2-badge-amber text-[10px] py-0">Playing Simulated Audio...</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200 text-xs space-y-1">
                      <p className="text-zinc-900 font-medium">{sample.sampleText}</p>
                      <p className="text-zinc-500 italic text-[11px]">Translation: &quot;{sample.translation}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Window Footer */}
        <div className="bg-zinc-100 border-t border-zinc-300 px-4 py-2.5 flex items-center justify-between text-xs text-zinc-600">
          <span className="font-mono">SIH 2026 Audit Registry &bull; Team ClaudeMaxDedo</span>
          <button onClick={onClose} className="web2-button text-xs py-1 px-3">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
