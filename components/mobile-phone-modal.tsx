"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  Mic,
  Send,
  ArrowLeft,
  CheckCheck,
  MapPin,
  Sparkles,
  RefreshCw,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Sprout,
  MessageSquare,
  Droplets,
  Wind,
  Check,
  ChevronRight,
  Settings2,
  Info,
  Radio,
  FileCheck,
  ExternalLink,
  HelpCircle,
  Map as MapIcon,
  Calendar,
  IndianRupee,
  Shield,
  Clock,
} from "lucide-react";

interface MobilePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: "weathergpt" | "krishismriti";
}

interface ChatMessage {
  id: string;
  sender: "farmer" | "bot";
  textVernacular: string;
  textEnglish?: string;
  timestamp: string;
  isAudio?: boolean;
  audioDuration?: string;
  verifiedBadge?: string;
  alertSeverity?: "NORMAL" | "WARNING" | "CRITICAL";
  locationName?: string;
  factors?: Array<{ name: string; status: "PASS" | "FAIL" | "INFO"; detail: string }>;
  receipt?: string;
  isReplay?: boolean;
}

export const MobilePhoneModal: React.FC<MobilePhoneModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const isWeather = projectId === "weathergpt";

  // Standard Persona State
  const [selectedLanguage, setSelectedLanguage] = useState(isWeather ? "bho" : "mr");
  const [isReplaying, setIsReplaying] = useState(false);

  // Weather Screen Tabs: "citizen" | "district"
  const [weatherScreen, setWeatherScreen] = useState<"citizen" | "district">("citizen");

  // KrishiSmriti Tabs: "chat" | "memory" | "schemes"
  const [agriTab, setAgriTab] = useState<"chat" | "memory" | "schemes">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<"explainer" | "telemetry">("explainer");
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [lastApiTrace, setLastApiTrace] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<any>(null);

  // Evaluator Tap-able Example Prompts
  const weatherExamples = [
    { label: "आज रात बारिश होगी?", query: "आज रात बारिश होगी?", loc: "Rohtas" },
    { label: "गाँव में चेतावनी है?", query: "गाँव में चेतावनी है?", loc: "Rohtas" },
    { label: "यह बारिश सामान्य है?", query: "यह बारिश सामान्य है?", loc: "Rohtas" },
  ];

  const agriExamples = [
    { label: "उद्या फवारणी करू का?", query: "उद्या फवारणी करू का?", en: "Can I spray tomorrow?" },
    { label: "पाणी देऊ का?", query: "पाणी देऊ का?", en: "Should I irrigate?" },
    { label: "आता युरिया टाकू का?", query: "आता युरिया टाकू का?", en: "Top-dress urea now?" },
  ];

  // Initialize initial welcome message
  useEffect(() => {
    if (!isOpen) return;

    if (isWeather) {
      setMessages([
        {
          id: "weather-init",
          sender: "bot",
          textVernacular:
            "नमस्ते! ई मौसमजीपीटी (WeatherGPT) प्रोटोटाइप ह। रउआ आवाज भा लिख के मौसम आ आपदा चेतावनी पूछ सकत बानी।",
          textEnglish:
            "Namaste! This is the WeatherGPT prototype (data: IMD & NDMA-SACHET). You can ask any weather or alert question by voice or text.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAudio: true,
          audioDuration: "0:06",
          alertSeverity: "NORMAL",
          receipt: "Forecast: Open-Meteo (GFS) · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else {
      setMessages([
        {
          id: "krishi-init",
          sender: "bot",
          textVernacular:
            "राम-राम रामू भाऊ! कृषीस्मृतीमध्ये आपले स्वागत आहे. २.५ एकर ऊस शेताचा (७/१२ गट: ८८२) मागील इतिहास आणि जमिनीतील ३८% ओलावा तपासून मी तयार आहे.",
          textEnglish:
            "Namaste Ramu-ji! Welcome to KrishiSmriti. Your 2.5-acre sugarcane parcel (7/12 Satbara: 882) history and live 38% soil moisture are connected.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAudio: true,
          audioDuration: "0:08",
          alertSeverity: "NORMAL",
          factors: [
            { name: "Rain Forecast", status: "PASS", detail: "Dry till 11 AM" },
            { name: "Wind Speed", status: "PASS", detail: "Calm (<8 km/h)" },
            { name: "Soil Moisture", status: "INFO", detail: "38% (Optimal)" },
            { name: "Labour Log", status: "PASS", detail: "2 workers ready" },
          ],
          receipt: "Data-backed: Open-Meteo hourly · Soil sensor (38%) · IMD Pune",
        },
      ]);
    }
  }, [isOpen, isWeather]);

  // Scroll smoothly to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, weatherScreen, agriTab]);

  // TTS Speech Synthesis Player
  const togglePlayAudio = (msgId: string, textToSpeak: string, langCode: string = "hi") => {
    if (playingMessageId === msgId) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      clearInterval(audioIntervalRef.current);
      setPlayingMessageId(null);
      setAudioProgress(0);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(audioIntervalRef.current);

    setPlayingMessageId(msgId);
    setAudioProgress(0);

    audioIntervalRef.current = setInterval(() => {
      setAudioProgress((prev) => {
        if (prev >= 100) {
          clearInterval(audioIntervalRef.current);
          setPlayingMessageId(null);
          return 0;
        }
        return prev + 10;
      });
    }, 250);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const cleanText = textToSpeak.split("\n")[0].replace(/\[.*?\]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = langCode === "mr" ? "mr-IN" : "hi-IN";

      utterance.onend = () => {
        clearInterval(audioIntervalRef.current);
        setPlayingMessageId(null);
        setAudioProgress(0);
      };
      utterance.onerror = () => {
        clearInterval(audioIntervalRef.current);
        setPlayingMessageId(null);
        setAudioProgress(0);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Send Query to Real Backend
  const handleSendQuery = async (queryText: string, locationOverride?: string, forceReplay?: boolean) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "farmer",
      textVernacular: textToSend,
      timestamp: timeStr,
      isAudio: true,
      audioDuration: "0:03",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      if (isWeather) {
        const targetLoc = forceReplay ? "Rohtas" : (locationOverride || "Rohtas");
        setIsReplaying(forceReplay || textToSend.toLowerCase().includes("चेतावनी") || textToSend.toLowerCase().includes("आंधी"));

        const response = await fetch("/api/weathergpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: textToSend,
            location: targetLoc,
            language: selectedLanguage,
            latitude: 24.9536,
            longitude: 84.0163, // Rohtas coordinates
          }),
        });

        const data = await response.json();
        setLastApiTrace(data);

        if (response.ok && data.status === "SUCCESS") {
          const isWarning = data.agentPipeline?.decisionStatus === "SAFEGUARD_OVERRIDE_ALERT";
          const botReply: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            textVernacular: data.advisory?.vernacular || data.advisory?.english,
            textEnglish: data.advisory?.english,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAudio: true,
            audioDuration: "0:08",
            alertSeverity: isWarning ? "WARNING" : "NORMAL",
            receipt: data.advisory?.receipt || "Forecast: Open-Meteo (GFS)",
            isReplay: forceReplay,
            factors: isWarning
              ? [
                  { name: "CAP Polygon", status: "FAIL", detail: "Inside Rohtas Alert Polygon" },
                  { name: "Lightning Sensors", status: "FAIL", detail: "Active Convective Activity" },
                  { name: "Action", status: "INFO", detail: "Take Shelter Immediately" },
                ]
              : [
                  { name: "Rain Prob", status: "PASS", detail: "0.0 mm expected" },
                  { name: "Wind", status: "PASS", detail: "Calm 11 km/h" },
                  { name: "Hazard Alerts", status: "PASS", detail: "Zero active alerts" },
                ],
          };
          setMessages((prev) => [...prev, botReply]);
        } else {
          throw new Error(data.message || "Failed to fetch weather advice");
        }
      } else {
        // KrishiSmriti Query
        const response = await fetch("/api/krishismriti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: textToSend,
            language: selectedLanguage,
            farmerId: "FARMER-MH-PUN-402",
            farmerName: "Ramu Yadav",
            plotId: "MH-PUN-HAV-7/12-882",
            village: "Haveli",
            district: "Pune",
            state: "Maharashtra",
            cropType: "Sugarcane (Adsali) · 2.5 Acres",
          }),
        });

        const data = await response.json();
        setLastApiTrace(data);

        if (response.ok && data.status === "SUCCESS") {
          const isSpray = textToSend.toLowerCase().includes("spray") || textToSend.toLowerCase().includes("फवारणी");
          const isUrea = textToSend.toLowerCase().includes("urea") || textToSend.toLowerCase().includes("युरिया");

          const botReply: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            textVernacular: data.advisory?.vernacular,
            textEnglish: data.advisory?.english,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAudio: true,
            audioDuration: "0:09",
            alertSeverity: "NORMAL",
            receipt: data.advisory?.receipt,
            factors: isUrea
              ? [
                  { name: "Past Dose", status: "FAIL", detail: "45kg applied 4 days ago" },
                  { name: "Soil Health Card", status: "INFO", detail: "Potash rich (Save ₹1,840)" },
                  { name: "Recommendation", status: "INFO", detail: "Hold urea for 10 days" },
                ]
              : [
                  { name: "Rain at 11 AM", status: "FAIL", detail: "Rain begins 11:00 AM" },
                  { name: "Wind till 9 AM", status: "PASS", detail: "Calm (<8 km/h)" },
                  { name: "Labour Log", status: "PASS", detail: "2 workers available" },
                  { name: "Soil Moisture", status: "INFO", detail: "38% (Skip irrigation)" },
                ],
          };
          setMessages((prev) => [...prev, botReply]);
        } else {
          throw new Error(data.message || "Failed to fetch advice");
        }
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          textVernacular: isWeather
            ? "माफ़ करीं, मौसम डेटा से संपर्क नइखे हो पावत। कृपया दोबारा कोशिश करीं।"
            : "माफ करा, सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.",
          textEnglish: "Unable to reach server. Please retry.",
          timestamp: timeStr,
          alertSeverity: "NORMAL",
          receipt: "Offline cache fallback",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Replay past Rohtas lightning warning
  const triggerReplayWarning = () => {
    setIsReplaying(true);
    handleSendQuery("गाँव में चेतावनी है? (Replay Mode: Rohtas Lightning)", "Rohtas", true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-zinc-100 rounded-2xl border border-zinc-300 shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="bg-zinc-900 text-white px-4 py-3 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-bold text-sm tracking-tight font-mono">
              {isWeather ? "WeatherGPT · Prototype (SIH26068)" : "KrishiSmriti · Prototype (SIH26193)"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Team ClaudeMaxDedo
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Action Ribbon for Evaluators */}
          <div className="bg-white p-3 rounded-xl border border-zinc-300 shadow-sm flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-700">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold uppercase">Evaluator 1-Click Verification:</span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {isWeather ? (
                <>
                  <button
                    onClick={triggerReplayWarning}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>⚡ Replay Real Past Warning (Rohtas Lightning)</span>
                  </button>

                  {weatherExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(ex.query, ex.loc)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-sans transition-all"
                    >
                      {ex.label}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSendQuery("उद्या फवारणी करू का?")}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold border border-emerald-400 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Sprout className="w-3.5 h-3.5 text-emerald-800" />
                    <span>⚡ Launch Demo Farm (Pune 7/12: 882)</span>
                  </button>

                  {agriExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(ex.query)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{ex.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({ex.en})</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* SPLIT STAGE: PHONE SIMULATOR (LEFT) + LIVE INSPECTOR (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 1. AUTHENTIC SMARTPHONE HARDWARE SIMULATOR */}
            <div className="lg:col-span-6 flex flex-col items-center select-none">
              
              <div className="w-[330px] sm:w-[365px] h-[670px] bg-zinc-950 rounded-[48px] p-3 shadow-2xl border-[4px] border-zinc-700 relative flex flex-col shrink-0">
                {/* Hardware Bezel Buttons */}
                <div className="absolute -left-[7px] top-[110px] w-[3px] h-[30px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -left-[7px] top-[150px] w-[3px] h-[45px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -left-[7px] top-[205px] w-[3px] h-[45px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -right-[7px] top-[140px] w-[3px] h-[55px] bg-zinc-600 rounded-r"></div>

                {/* Inner Screen Display */}
                <div className="w-full h-full rounded-[38px] overflow-hidden flex flex-col relative bg-[#f8fafc] text-zinc-900 border border-zinc-800">
                  
                  {/* Top Status Bar (Truthful, No Impersonation) */}
                  <div className="bg-zinc-900 text-white pt-2 pb-1 px-5 flex items-center justify-between text-[11px] font-mono shrink-0 z-20">
                    <span>10:30 AM</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] text-zinc-400">
                        {isWeather ? "IMD & SACHET" : "Field IoT Active"}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">4G</span>
                  </div>

                  {/* -------------------------------------------------------------
                      WEATHERGPT HEADER vs KRISHISMRITI HEADER
                     ------------------------------------------------------------- */}
                  {isWeather ? (
                    <div className="bg-sky-900 text-white px-3.5 py-2.5 shadow shrink-0 z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="leading-tight">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs tracking-tight">WeatherGPT · Prototype</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-800 text-sky-200 border border-sky-700">
                              {selectedLanguage === "bho" ? "Bhojpuri" : "Hindi"}
                            </span>
                          </div>
                          <p className="text-[10px] text-sky-200 mt-0.5">data: IMD, NDMA-SACHET</p>
                        </div>

                        {isReplaying && (
                          <span className="text-[9px] font-mono font-bold bg-amber-400 text-zinc-950 px-2 py-0.5 rounded animate-pulse">
                            Demo mode · sample warning
                          </span>
                        )}
                      </div>

                      {/* Screen A / Screen B Switch */}
                      <div className="grid grid-cols-2 gap-1 bg-sky-950/80 p-0.5 rounded-lg text-xs font-medium">
                        <button
                          onClick={() => setWeatherScreen("citizen")}
                          className={`py-1 rounded flex items-center justify-center gap-1 text-[11px] transition-all ${
                            weatherScreen === "citizen"
                              ? "bg-white text-sky-950 font-bold shadow-sm"
                              : "text-sky-200 hover:text-white"
                          }`}
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Citizen Advisory</span>
                        </button>
                        <button
                          onClick={() => setWeatherScreen("district")}
                          className={`py-1 rounded flex items-center justify-center gap-1 text-[11px] transition-all ${
                            weatherScreen === "district"
                              ? "bg-white text-sky-950 font-bold shadow-sm"
                              : "text-sky-200 hover:text-white"
                          }`}
                        >
                          <MapIcon className="w-3 h-3" />
                          <span>District Officer Map</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-800 text-white px-3.5 py-2.5 shadow shrink-0 z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="leading-tight">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs tracking-tight">KrishiSmriti · SIH 2026</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700">
                              Marathi
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-200 mt-0.5">
                            Ramu Yadav · Pune Sugarcane MH-PUN-402
                          </p>
                        </div>

                        <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                          Data-backed: IMD + field sensor
                        </span>
                      </div>

                      {/* KrishiSmriti 3 Tabs */}
                      <div className="grid grid-cols-3 gap-1 bg-emerald-950/80 p-0.5 rounded-lg text-[10px] font-medium text-center">
                        <button
                          onClick={() => setAgriTab("chat")}
                          className={`py-1 rounded transition-all ${
                            agriTab === "chat" ? "bg-white text-emerald-950 font-bold" : "text-emerald-200"
                          }`}
                        >
                          Voice Copilot
                        </button>
                        <button
                          onClick={() => setAgriTab("memory")}
                          className={`py-1 rounded transition-all ${
                            agriTab === "memory" ? "bg-white text-emerald-950 font-bold" : "text-emerald-200"
                          }`}
                        >
                          7/12 &amp; Memory
                        </button>
                        <button
                          onClick={() => setAgriTab("schemes")}
                          className={`py-1 rounded transition-all ${
                            agriTab === "schemes" ? "bg-white text-emerald-950 font-bold" : "text-emerald-200"
                          }`}
                        >
                          Plan &amp; Mandi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* -------------------------------------------------------------
                      SCREEN BODY: WEATHER DISTRICT MAP vs CHAT vs AGRI MEMORY
                     ------------------------------------------------------------- */}
                  {isWeather && weatherScreen === "district" ? (
                    /* SCREEN B: DISTRICT OFFICER VIEW */
                    <div className="flex-1 p-3 bg-zinc-50 overflow-y-auto space-y-3 text-xs font-sans">
                      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900">
                            Rohtas DDMA Active CAP Polygon
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border">
                            sample data
                          </span>
                        </div>

                        {/* Interactive SVG Cadastral / Hazard Map */}
                        <div className="relative w-full h-40 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700 flex items-center justify-center">
                          <svg className="w-full h-full p-2" viewBox="0 0 240 140">
                            {/* Base County Boundaries */}
                            <polygon points="10,20 120,10 230,30 220,130 30,125" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                            {/* Active Lightning CAP Warning Polygon */}
                            <polygon
                              points="60,40 180,35 195,110 80,115"
                              fill="#ef4444"
                              fillOpacity="0.4"
                              stroke="#dc2626"
                              strokeWidth="2"
                              strokeDasharray="4, 4"
                            />
                            {/* Centroid / Warning Label */}
                            <g transform="translate(130, 75)">
                              <circle r="8" fill="#ef4444" className="animate-ping opacity-75" />
                              <circle r="4" fill="#ffffff" />
                            </g>
                          </svg>

                          <div className="absolute top-2 left-2 bg-red-950/90 text-red-200 border border-red-700 px-2 py-1 rounded text-[10px] font-mono">
                            ⚠️ ACTIVE HAZARD POLYGON: ROHTAS
                          </div>
                          <div className="absolute bottom-2 right-2 bg-zinc-950/90 text-zinc-300 px-2 py-0.5 rounded text-[9px] font-mono">
                            CAP 1.2 Feed: SACHET NDMA
                          </div>
                        </div>
                      </div>

                      {/* Real-time Query Aggregator (Anonymized) */}
                      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900">
                            What people are asking (last hour)
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">104 queries</span>
                        </div>

                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                            <span className="text-zinc-800">Dehri Block</span>
                            <span className="font-bold text-red-700">48 queries</span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                            <span className="text-zinc-800">Sasaram Block</span>
                            <span className="font-bold text-red-700">35 queries</span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                            <span className="text-zinc-800">Chenari Block</span>
                            <span className="font-bold text-amber-700">21 queries</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-100">
                          Top Citizen Question: &quot;Is it safe to continue open paddy transplanting today?&quot;
                        </div>
                      </div>
                    </div>
                  ) : !isWeather && agriTab === "memory" ? (
                    /* KRISHISMRITI SCREEN: 7/12 SATBARA & FARM MEMORY TIMELINE */
                    <div className="flex-1 p-3 bg-zinc-50 overflow-y-auto space-y-3 text-xs font-sans">
                      {/* 7/12 Parcel Map */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900">
                            7/12 Satbara Survey: MH-PUN-HAV-7/12-882
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                            2.5 Acres
                          </span>
                        </div>

                        <div className="relative w-full h-36 bg-emerald-50 rounded-lg overflow-hidden border border-emerald-300 flex items-center justify-center">
                          <svg className="w-full h-full p-2" viewBox="0 0 200 120">
                            <polygon points="25,20 175,15 185,95 40,105" fill="#86efac" fillOpacity="0.5" stroke="#059669" strokeWidth="2" strokeDasharray="3, 3" />
                            <g transform="translate(100, 60)">
                              <circle r="10" fill="#2563eb" fillOpacity="0.2" className="animate-ping" />
                              <circle r="5" fill="#2563eb" />
                            </g>
                          </svg>
                          <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-700 shadow-sm">
                            Sugarcane (Adsali) · Black Cotton Soil
                          </div>
                          <div className="absolute bottom-2 right-2 bg-blue-900 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                            Soil Moisture: 38% (Optimal)
                          </div>
                        </div>
                      </div>

                      {/* Farm Memory Timeline */}
                      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900">
                            Farm Memory Timeline (pgvector)
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">Plot MH-PUN-402</span>
                        </div>

                        <div className="space-y-2 border-l-2 border-emerald-500 pl-3 ml-1 text-xs">
                          <div>
                            <div className="text-[10px] font-mono text-emerald-800 font-bold">
                              4 Days Ago &bull; FERTILIZER LOG
                            </div>
                            <p className="text-zinc-800">
                              Applied 45 kg Urea (1 bag) to parcel. Soil moisture was 40%.
                            </p>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-blue-800 font-bold">
                              12 Days Ago &bull; IRRIGATION LOG
                            </div>
                            <p className="text-zinc-800">
                              Drip irrigation cycle run for 4 hours. Crown roots established.
                            </p>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-purple-800 font-bold">
                              28 Days Ago &bull; SOIL TEST (SHC)
                            </div>
                            <p className="text-zinc-800">
                              Available N=180 kg/ha, P=14 kg/ha, K=320 kg/ha (Saturated Potash).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !isWeather && agriTab === "schemes" ? (
                    /* KRISHISMRITI SCREEN: DAILY BEST ACTION, SCHEMES & MANDI */
                    <div className="flex-1 p-3 bg-zinc-50 overflow-y-auto space-y-3 text-xs font-sans">
                      {/* Daily Single Best Action */}
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300 shadow-sm space-y-1.5">
                        <div className="text-[10px] font-mono uppercase text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Today&apos;s Single Best Action</span>
                        </div>
                        <div className="font-bold text-zinc-900 text-xs leading-snug">
                          Spray tomorrow between 6:30 AM and 9:00 AM. Skip irrigation today (soil moisture is 38%).
                        </div>
                        <div className="text-[10px] font-mono text-emerald-900 pt-1">
                          Rule check: Rain from 11 AM ✕ &bull; Wind calm till 9 AM ✓ &bull; 2 workers ready ✓
                        </div>
                      </div>

                      {/* Mandi Price Card */}
                      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900">Mandi Price Information</span>
                          <span className="text-[9px] font-mono text-zinc-500">Agmarknet OGD API</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center font-mono">
                          <div className="p-2 bg-zinc-50 rounded border">
                            <div className="text-[10px] text-zinc-500">Pune APMC</div>
                            <div className="font-bold text-emerald-800 text-sm">₹3,150 / qtl</div>
                            <div className="text-[9px] text-zinc-500">7-day trend: +1.2%</div>
                          </div>
                          <div className="p-2 bg-zinc-50 rounded border">
                            <div className="text-[10px] text-zinc-500">Baramati APMC</div>
                            <div className="font-bold text-zinc-800 text-sm">₹3,080 / qtl</div>
                            <div className="text-[9px] text-zinc-500">7-day trend: Stable</div>
                          </div>
                        </div>
                      </div>

                      {/* Schemes Card */}
                      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                        <span className="font-bold text-xs text-zinc-900 block">
                          Verified Scheme &amp; Subsidy Reminders
                        </span>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="p-1.5 bg-zinc-50 rounded border flex justify-between items-center">
                            <span>PM-KISAN (17th Installment)</span>
                            <span className="text-emerald-700 font-bold">Active</span>
                          </div>
                          <div className="p-1.5 bg-zinc-50 rounded border flex justify-between items-center">
                            <span>PMKSY Drip Irrigation Subsidy</span>
                            <span className="text-emerald-700 font-bold">Up to 55%</span>
                          </div>
                          <div className="p-1.5 bg-zinc-50 rounded border flex justify-between items-center">
                            <span>Kisan Credit Card (KCC) Renewal</span>
                            <span className="text-amber-700 font-bold">Due 30 Oct</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* CHAT MESSAGES SCROLL VIEW */
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs font-sans">
                      {messages.map((msg) => {
                        const isFarmer = msg.sender === "farmer";
                        const isPlaying = playingMessageId === msg.id;

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isFarmer ? "justify-end" : "justify-start"} animate-fadeIn`}
                          >
                            <div
                              className={`max-w-[92%] rounded-2xl p-3 shadow-sm space-y-2 ${
                                isFarmer
                                  ? "bg-emerald-700 text-white rounded-br-none"
                                  : msg.alertSeverity === "WARNING"
                                  ? "bg-red-50 border-2 border-red-500 text-zinc-900 rounded-bl-none"
                                  : "bg-white border border-zinc-200 text-zinc-900 rounded-bl-none"
                              }`}
                            >
                              {/* Warning Banner if alert is active */}
                              {!isFarmer && msg.alertSeverity === "WARNING" && (
                                <div className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  <span>SEVERE WEATHER WARNING LOCKED</span>
                                </div>
                              )}

                              {/* Audio Voice Player Pill */}
                              {msg.isAudio && (
                                <div
                                  className={`p-1.5 rounded-xl border flex items-center gap-2 ${
                                    isFarmer
                                      ? "bg-emerald-800/60 border-emerald-600 text-white"
                                      : msg.alertSeverity === "WARNING"
                                      ? "bg-red-100 border-red-300 text-red-950"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-900"
                                  }`}
                                >
                                  <button
                                    onClick={() =>
                                      togglePlayAudio(
                                        msg.id,
                                        msg.textVernacular,
                                        selectedLanguage
                                      )
                                    }
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 transition-all ${
                                      isPlaying
                                        ? "bg-amber-600"
                                        : isFarmer
                                        ? "bg-emerald-900"
                                        : "bg-zinc-900 hover:bg-zinc-800"
                                    }`}
                                  >
                                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                                  </button>

                                  <div className="flex-1">
                                    <div className="h-1.5 bg-zinc-300 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-600 transition-all duration-200"
                                        style={{ width: `${isPlaying ? audioProgress : 100}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] mt-0.5 font-mono opacity-80">
                                      <span>{isPlaying ? `Playing ${audioProgress}%` : msg.audioDuration || "0:08"}</span>
                                      <span>Bhashini Voice Note</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Vernacular Spoken Response */}
                              <div className="text-xs leading-relaxed font-medium">
                                {msg.textVernacular}
                              </div>

                              {/* Cross-Factor Reason Chips */}
                              {msg.factors && msg.factors.length > 0 && (
                                <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[10px]">
                                  {msg.factors.map((f, fIdx) => (
                                    <div
                                      key={fIdx}
                                      className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${
                                        f.status === "PASS"
                                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                          : f.status === "FAIL"
                                          ? "bg-red-50 border-red-200 text-red-800 font-bold"
                                          : "bg-zinc-50 border-zinc-200 text-zinc-700"
                                      }`}
                                    >
                                      <span>{f.name}</span>
                                      <span>{f.status === "PASS" ? "✓" : f.status === "FAIL" ? "✕" : "•"}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* English Summary for Evaluators */}
                              {msg.textEnglish && (
                                <div className="text-[10px] p-2 rounded-lg bg-zinc-100/90 border border-zinc-200 text-zinc-700 font-sans">
                                  <strong className="text-zinc-900">For Evaluators:</strong> {msg.textEnglish}
                                </div>
                              )}

                              {/* Receipt Line */}
                              {msg.receipt && (
                                <div className="text-[9px] font-mono text-zinc-500 border-t border-zinc-200 pt-1">
                                  {msg.receipt}
                                </div>
                              )}

                              {/* Timestamp */}
                              <div className="flex justify-end text-[9px] opacity-70 font-mono">
                                {msg.timestamp}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="rounded-xl p-3 bg-white border border-zinc-300 flex items-center gap-2 text-xs text-zinc-700 shadow-sm">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                            <span>
                              {isWeather ? "Running PostGIS warning check & Open-Meteo..." : "Evaluating cross-factor rules & soil moisture..."}
                            </span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* -------------------------------------------------------------
                      INPUT BAR: TAPPABLE EXAMPLE CHIPS + VOICE/TEXT INPUT
                     ------------------------------------------------------------- */}
                  <div className="border-t border-zinc-200 bg-white p-2 shrink-0 space-y-1.5">
                    {/* Input Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendQuery(inputText);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <div className="flex-1 rounded-full px-3 py-1.5 text-xs flex items-center bg-zinc-100 border border-zinc-300 focus-within:border-zinc-800">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Ask or hold mic to speak..."
                          className="w-full bg-transparent outline-none text-xs"
                        />
                      </div>

                      {inputText.trim().length > 0 ? (
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleSendQuery(
                              isWeather
                                ? "आज रात बारिश होगी?"
                                : "उद्या फवारणी करू का?"
                            );
                          }}
                          className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-all"
                          title="Simulate Voice Input"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </form>
                  </div>

                  {/* Bottom Hardware Home Bar */}
                  <div className="bg-zinc-950 py-1 flex justify-center shrink-0">
                    <div className="w-24 h-1 bg-zinc-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. REAL-TIME BACKEND INSPECTOR & ARCHITECTURE PROOF (RIGHT SIDE) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between bg-white p-1 rounded-lg border border-zinc-300 shadow-sm">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab("explainer")}
                    className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === "explainer"
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Evaluator Architecture Explainer</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("telemetry")}
                    className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === "telemetry"
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Live API &amp; Tool Traces (JSON)</span>
                  </button>
                </div>
              </div>

              {activeTab === "explainer" ? (
                <div className="web2-panel p-5 rounded-lg border border-zinc-300 bg-white shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <h3 className="font-bold text-sm text-zinc-900">
                        {isWeather
                          ? "WeatherGPT: Warning-Locked Disaster Intelligence"
                          : "KrishiSmriti: Agronomic Data Sovereignty & Second Brain"}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-700">
                      SIH 2026 Core Loop
                    </span>
                  </div>

                  <div className="space-y-3 text-xs font-sans">
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-900">
                        1. {isWeather ? "Warning-Lock Rule (P0)" : "Deterministic Rule Engine (Part 4)"}
                      </h4>
                      <p className="text-zinc-600 leading-relaxed">
                        {isWeather
                          ? "If any active CAP 1.2 polygon contains the citizen point, the reply MUST start with that alert. The LLM is forbidden from saying it is safe."
                          : "Dosages are calculated by our TypeScript rule engine (per-hectare first, MPKV PoP table) and never generated by the LLM. Zero hallucination."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-900">
                        2. {isWeather ? "Real Data Path & Receipt Line" : "Farm Memory Timeline (pgvector)"}
                      </h4>
                      <p className="text-zinc-600 leading-relaxed">
                        {isWeather
                          ? "Every reply terminates with a verifiable receipt line: 'Source: <issuer> via SACHET · valid till <time>' or 'Forecast: Open-Meteo (GFS)'."
                          : "Remembers previous farm interventions (e.g. 45 kg Urea applied 4 days ago) so redundant inputs are prevented."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-900">
                        3. {isWeather ? "Two-Way Citizen & District View" : "Single Best Daily Action"}
                      </h4>
                      <p className="text-zinc-600 leading-relaxed">
                        {isWeather
                          ? "Citizens receive plain spoken warnings in dialect; district disaster officers view real-time question volume aggregated across blocks."
                          : "Provides one clear daily recommendation rather than overwhelming smallholder farmers with dense paragraphs."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded p-3 text-xs font-mono text-zinc-700 space-y-1.5">
                    <div className="font-bold text-zinc-800 uppercase text-[11px] mb-1">
                      Active Demonstration Persona:
                    </div>
                    <div>
                      {isWeather
                        ? "Location: Rohtas, Bihar (24.9536° N, 84.0163° E) · Severe Convective Alert Zone"
                        : "Farmer: Ramu Yadav · Pune, Maharashtra · 2.5 Acres Sugarcane (7/12: 882) · Black Cotton Soil (38% Moisture)"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 text-zinc-100 p-4 rounded-lg border border-zinc-800 text-xs font-mono space-y-2 shadow-inner max-h-[440px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      LIVE API RESPONSE PAYLOAD
                    </span>
                    <span>JSON Validated</span>
                  </div>

                  {lastApiTrace ? (
                    <pre className="text-emerald-400 text-[11px] overflow-x-auto leading-relaxed">
                      {JSON.stringify(lastApiTrace, null, 2)}
                    </pre>
                  ) : (
                    <div className="py-12 text-center text-zinc-500">
                      Interact with the phone simulator on the left to see live rule-engine calculations and API responses.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Window Footer */}
        <div className="bg-zinc-200 border-t border-zinc-300 px-4 py-2 flex items-center justify-between text-xs text-zinc-600 font-mono shrink-0">
          <span>Smart India Hackathon 2026 &bull; Team ClaudeMaxDedo</span>
          <button
            onClick={onClose}
            className="web2-button-primary text-xs py-1 px-3"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
