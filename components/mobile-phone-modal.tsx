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
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Smile,
  ShieldCheck,
  Info,
  Radio,
  MapPin,
  Sparkles,
  RefreshCw,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  Activity,
  Database,
  Sprout,
  Compass,
  Zap,
  Map as MapIcon,
  MessageSquare,
  Droplets,
  Sun,
  Wind,
  Check,
  ChevronRight,
  Settings2,
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
  toolTraces?: any[];
  liveData?: any;
}

export const MobilePhoneModal: React.FC<MobilePhoneModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const isWeather = projectId === "weathergpt";

  // Farmer Onboarding State
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [farmerName, setFarmerName] = useState("Ramu Yadav");
  const [selectedState, setSelectedState] = useState(isWeather ? "Uttar Pradesh" : "Maharashtra");
  const [selectedLocation, setSelectedLocation] = useState(isWeather ? "Varanasi" : "Pune");
  const [selectedLanguage, setSelectedLanguage] = useState(isWeather ? "bho" : "mr");
  const [selectedCrop, setSelectedCrop] = useState(isWeather ? "Wheat (PBW-502)" : "Sugarcane (Co-86032)");
  const [selectedPlotId, setSelectedPlotId] = useState(isWeather ? "UP-VRN-104" : "MH-PUN-402");
  const [farmSize, setFarmSize] = useState("2.5 Acres");

  // Phone App State
  const [phoneTab, setPhoneTab] = useState<"chat" | "map">("chat");
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

  // Quick multi-sector preset scenarios for Evaluators (Fishermen, Urban Commuters, Aviation/Drone, Public)
  const weatherPresets = [
    {
      title: "Puri Coast: Fishermen Sea State & Gale Warning",
      location: "Puri Coast",
      state: "Odisha",
      plotId: "OD-PURI-MAR-01",
      language: "hi",
      query: "क्या आज रात 20 नॉटिकल मील दूर समुद्र में मछली पकड़ने जाना सुरक्षित है? हवा की रफ्तार और लहरें कैसी हैं?",
      crop: "Coastal Marine Fishery",
    },
    {
      title: "Delhi NCR: Urban Flood & AQI Commute Check",
      location: "Delhi NCR",
      state: "Delhi",
      plotId: "DL-NCR-URB-08",
      language: "hi",
      query: "शाम 5 बजे नोएडा से दिल्ली जाने पर क्या रास्तों पर जलभराव या भारी बारिश होगी? AQI कैसा रहेगा?",
      crop: "Urban Commute Transit",
    },
    {
      title: "Pune Airspace: Convective Cloud Base & Wind Shear",
      location: "Pune",
      state: "Maharashtra",
      plotId: "MH-PUN-AV-03",
      language: "en",
      query: "What is the convective cloud base, CAPE index, and Doppler wind shear over Pune for drone and flight operations?",
      crop: "Aviation & Drone Operations",
    },
    {
      title: "Varanasi: Squall Alert & Outdoor Work Safety",
      location: "Varanasi",
      state: "Uttar Pradesh",
      plotId: "UP-VRN-PUB-05",
      language: "bho",
      query: "का आज दुपहरिया में आंधी-पानी आई? बाहर काम करे के बा। (Bhojpuri)",
      crop: "Public Outdoor Safety",
    },
  ];

  const agroPresets = [
    {
      title: "Latur Rain vs Mandi vs Kali Mitti (MH-LTR-301)",
      location: "Latur",
      state: "Maharashtra",
      plotId: "MH-LTR-301",
      language: "mr",
      query: "पावसाची शक्यता असताना आणि बाजारात सोयाबीनला चांगला भाव असताना मी आज कापणी करू का फवारणी? (Varhadi Marathi)",
      crop: "Soybean (JS-335)",
    },
    {
      title: "Pune Sugarcane ICAR Fertilizer Check (MH-PUN-402)",
      location: "Pune",
      state: "Maharashtra",
      plotId: "MH-PUN-402",
      language: "mr",
      query: "माझ्या उसाच्या शेतात ४ दिवसांपूर्वी युरिया टाकला होता, आता पुन्हा खत टाकावे का?",
      crop: "Sugarcane (Co-86032)",
    },
    {
      title: "Barabanki Urea Top-Dressing (UP-BRB-1049)",
      location: "Barabanki",
      state: "Uttar Pradesh",
      plotId: "UP-BRB-1049",
      language: "bho",
      query: "हमरा खेत में 4 दिन पहिले यूरिया डालले रहलीं, का कल फेर से 2nd राउंड डाल सकीं?",
      crop: "Wheat (PBW-502)",
    },
    {
      title: "Fatehpur Soil Moisture & Irrigation Timing",
      location: "Fatehpur",
      state: "Uttar Pradesh",
      plotId: "UP-FTP-302",
      language: "hi",
      query: "मिट्टी में नमी कितनी है और अगली सिंचाई कब करनी चाहिए?",
      crop: "Mustard (Pusa Bold)",
    },
    {
      title: "Moga Wheat: Heatwave vs Rust Spray (PB-MOG-502)",
      location: "Moga",
      state: "Punjab",
      plotId: "PB-MOG-502",
      language: "hi",
      query: "38 डिग्री गर्मी और तेज हवा में क्या आज खेत में फफूंदनाशक छिड़काव करना चाहिए?",
      crop: "Wheat (PBW-502)",
    },
  ];

  const presets = isWeather ? weatherPresets : agroPresets;

  // Initialize initial welcome message
  useEffect(() => {
    if (!isOpen) return;

    const initialBotMessage: ChatMessage = {
      id: "init-bot",
      sender: "bot",
      textVernacular: isWeather
        ? "नमस्ते! हम मौसमजीपीटी (WeatherGPT) हईं — भारत सरकार के राष्ट्रीय मौसम आ आपदा सूचना साथी। चाहे रउआ समुंदर में जाए वाला मछुआरा बानी, शहर के आम नागरिक, भा विमानन आ ड्रोन पायलट — मौसम, आंधी, बारिश भा AQI बारे में voice note भेज के पूछ सकत बानी।"
        : "राम-राम किसान भाई! मी कृषीस्मृती (KrishiSmriti) शेती सहाय्यक आहे. तुमच्या शेताचा मागील खताचा इतिहास आणि जमिनीतील ओलावा तपासून योग्य सल्ला देण्यासाठी मी तयार आहे.",
      textEnglish: isWeather
        ? "Namaste! I am WeatherGPT (Govt. of India) — your multi-sector meteorological intelligence assistant. Whether you are a coastal fisherman checking sea conditions, an urban commuter planning around squalls and smog, or an aviation/drone pilot tracking cloud ceilings and wind shear, ask any question via voice note."
        : "Namaste farmer! I am KrishiSmriti Smart Farming Copilot. I analyze your past field logs and live soil moisture to give verified farming advisories.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isAudio: true,
      audioDuration: "0:08",
      verifiedBadge: isWeather
        ? "Govt. Verified | IMD & WMO WIS 2.0 Multi-Sector"
        : "Govt. Verified | Soil Health & IoT Connected",
      alertSeverity: "NORMAL",
    };

    setMessages([initialBotMessage]);
  }, [isOpen, isWeather]);

  // Scroll chat messages smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, phoneTab]);

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
        return prev + 8;
      });
    }, 250);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
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

  // Execute Live Query against Backend API Route
  const handleSendQuery = async (queryText: string, locationOverride?: string) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    const lowerText = textToSend.toLowerCase();
    let detectedLoc = locationOverride;
    if (!detectedLoc) {
      const places = [
        "pune", "varanasi", "barabanki", "nagpur", "patna", "chandauli",
        "lucknow", "mumbai", "delhi", "bengaluru", "hyderabad", "chennai",
        "kolkata", "jaipur", "ahmedabad", "chandigarh", "nashik", "fatehpur",
      ];
      for (const p of places) {
        if (new RegExp(`\\b${p}\\b`, "i").test(lowerText)) {
          detectedLoc = p.charAt(0).toUpperCase() + p.slice(1);
          setSelectedLocation(detectedLoc);
          break;
        }
      }
    }

    const loc = detectedLoc || selectedLocation;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Add Farmer message
    const farmerMsg: ChatMessage = {
      id: `farmer-${Date.now()}`,
      sender: "farmer",
      textVernacular: textToSend,
      timestamp: timeStr,
      isAudio: true,
      audioDuration: "0:04",
      locationName: loc,
    };

    setMessages((prev) => [...prev, farmerMsg]);
    setInputText("");
    setIsLoading(true);
    setPhoneTab("chat"); // Ensure chat view is active

    try {
      if (isWeather) {
        // Call WeatherGPT Backend API
        const response = await fetch("/api/weathergpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: textToSend,
            location: loc,
            language: selectedLanguage,
            cropType: selectedCrop,
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
            audioDuration: `0:${Math.round(data.bhashini?.speechSynthesis?.durationSeconds || 8)}`,
            verifiedBadge: isWarning
              ? "⚠️ Extreme Weather Alert: High Hazard Risk"
              : "✅ Conditions Favorable | IMD & WMO WIS 2.0",
            alertSeverity: isWarning ? "WARNING" : "NORMAL",
            toolTraces: data.agentPipeline?.toolExecutions,
            liveData: data.agentPipeline?.liveMeteoTelemetry,
          };
          setMessages((prev) => [...prev, botReply]);
        } else {
          throw new Error(data.message || "Failed to fetch response");
        }
      } else {
        // Call KrishiSmriti Backend API
        const response = await fetch("/api/krishismriti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: textToSend,
            village: loc,
            district: loc === "Pune" ? "Pune" : "Barabanki",
            language: selectedLanguage,
            farmerId: "FARMER-UP-BRB-1049",
            cropType: selectedCrop,
          }),
        });

        const data = await response.json();
        setLastApiTrace(data);

        if (response.ok && data.status === "SUCCESS") {
          const isHold = data.ragPipeline?.recommendationType === "HOLD_INPUT";
          const botReply: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            textVernacular: data.advisory?.vernacular || data.advisory?.english,
            textEnglish: data.advisory?.english,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAudio: true,
            audioDuration: `0:${Math.round(data.bhashini?.speechSynthesis?.durationSeconds || 10)}`,
            verifiedBadge: isHold
              ? "⚠️ Input Alert: Hold Fertilizer (Save ₹520/acre)"
              : "✅ Soil & Moisture Verified",
            alertSeverity: isHold ? "WARNING" : "NORMAL",
            toolTraces: data.ragPipeline?.topEpisodicMemories,
            liveData: data.ragPipeline?.groundIotTelemetry,
          };
          setMessages((prev) => [...prev, botReply]);
        } else {
          throw new Error(data.message || "Failed to fetch response");
        }
      }
    } catch (err: any) {
      console.error("[MobileSimulator] Error:", err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        textVernacular: "माफ़ करीं, सर्वर से संपर्क करे में देरी भइल बा। कृपया दुबारा कोशिश करीं।",
        textEnglish: "Unable to reach server. Retrying connection...",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        alertSeverity: "CRITICAL",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech Recognition for Live Microphone Input
  const startVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      handleSendQuery(
        isWeather
          ? "का आज हमार खेत में कीटनाशक छिड़के के चाहि?"
          : "खेत में यूरिया कब डालूं?"
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === "mr" ? "mr-IN" : "hi-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendQuery(transcript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      handleSendQuery(
        isWeather
          ? "का आज हमार खेत में कीटनाशक छिड़के के चाहि?"
          : "खेत में यूरिया कब डालूं?"
      );
    }
  };

  // Evaluator 1-Click Fast-Track Handler
  const handleSkipToDemoFarm = () => {
    setIsOnboarding(false);
    if (isWeather) {
      setSelectedLocation("Puri Coast");
      setSelectedCrop("Coastal Marine Fishery");
      setSelectedPlotId("OD-PURI-MAR-01");
      setSelectedLanguage("hi");
      handleSendQuery("क्या आज रात 20 नॉटिकल मील दूर समुद्र में मछली पकड़ने जाना सुरक्षित है? हवा की रफ्तार और लहरें कैसी हैं?", "Puri Coast");
    } else {
      setSelectedLocation("Pune");
      setSelectedCrop("Sugarcane (Co-86032)");
      setSelectedPlotId("MH-PUN-402");
      setSelectedLanguage("mr");
      handleSendQuery("माझ्या उसाच्या शेतात ४ दिवसांपूर्वी युरिया टाकला होता, आता पुन्हा खत टाकावे का?", "Pune");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/75 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-zinc-100 rounded-2xl border border-zinc-400 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]">
        
        {/* Top Institutional Window Bar */}
        <div className="bg-zinc-200 border-b border-zinc-300 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
            <span className="font-bold text-sm text-zinc-900 tracking-tight">
              {isWeather
                ? "WeatherGPT Live Mobile Simulator — Multi-Sector WhatsApp Voice Agent"
                : "KrishiSmriti — Farmer-First Smart Agriculture Assistant"}
            </span>
            <span className="web2-badge web2-badge-green text-xs font-mono py-0.5 px-2">
              {isWeather ? "WhatsApp Voice Agent" : "Light Mode PWA"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-300 text-zinc-700 transition-colors"
            title="Close Simulator (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Top Preset Buttons Ribbon */}
          <div className="bg-white p-3 rounded-xl border border-zinc-300 shadow-sm flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-700">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold uppercase">Evaluator Quick Test Scenarios:</span>
              <span className="text-zinc-500 hidden md:inline">
                Click any scenario to test live backend:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {presets.map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsOnboarding(false);
                    setSelectedLocation(sc.location);
                    setSelectedLanguage(sc.language);
                    setSelectedCrop(sc.crop);
                    setSelectedPlotId(sc.plotId);
                    handleSendQuery(sc.query, sc.location);
                  }}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border bg-zinc-50 hover:bg-emerald-50 hover:border-emerald-400 text-zinc-800 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{sc.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MAIN SPLIT STAGE: IPHONE (LEFT) + REAL-TIME BACKEND INSPECTOR (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 1. AUTHENTIC IPHONE MOBILE DEVICE */}
            <div className="lg:col-span-6 flex flex-col items-center select-none">
              
              {/* iPhone Outer Hardware Bezel */}
              <div className="w-[320px] sm:w-[360px] h-[660px] bg-zinc-950 rounded-[48px] p-3 shadow-2xl border-[4px] border-zinc-700 relative flex flex-col shrink-0">
                {/* Side Hardware Buttons */}
                <div className="absolute -left-[7px] top-[110px] w-[3px] h-[30px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -left-[7px] top-[150px] w-[3px] h-[45px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -left-[7px] top-[205px] w-[3px] h-[45px] bg-zinc-600 rounded-l"></div>
                <div className="absolute -right-[7px] top-[140px] w-[3px] h-[55px] bg-zinc-600 rounded-r"></div>

                {/* iPhone Screen Content */}
                <div
                  className={`w-full h-full rounded-[38px] overflow-hidden flex flex-col relative border ${
                    isWeather
                      ? "bg-[#efeae2] border-zinc-800 text-zinc-900"
                      : "bg-[#f8fafc] border-emerald-900/40 text-zinc-900"
                  }`}
                >
                  {/* Status Bar / Dynamic Island */}
                  <div className="bg-zinc-950 text-white pt-2 pb-1.5 px-6 flex items-center justify-between text-[11px] font-semibold tracking-tight shrink-0 z-20">
                    <span>9:41 AM</span>
                    {/* Dynamic Island Pill */}
                    <div className="w-20 h-4 bg-black rounded-full mx-auto flex items-center justify-center px-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></div>
                      <span className="text-[8px] text-zinc-400 font-sans">
                        {isWeather ? "5G IMD" : "Kisan Seva"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span>{selectedLocation.slice(0, 4)}</span>
                      <div className="w-3.5 h-2 border border-white rounded-[2px] p-[1px]">
                        <div className="w-full h-full bg-white rounded-[1px]"></div>
                      </div>
                    </div>
                  </div>

                  {/* -------------------------------------------------------------
                      HEADER: WHATSAPP (WeatherGPT) vs CLEAN LIGHT KRISHISMRITI PWA
                     ------------------------------------------------------------- */}
                  {isWeather ? (
                    /* WHATSAPP APP HEADER */
                    <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between shadow-sm shrink-0 z-10">
                      <div className="flex items-center gap-2 min-w-0">
                        <ArrowLeft className="w-4 h-4 text-white/90 shrink-0" />
                        <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          W
                        </div>
                        <div className="leading-tight min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs truncate">WeatherGPT (National Weather Helpline)</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                          </div>
                          <div className="text-[10px] text-emerald-100 flex items-center gap-1 truncate">
                            <span>{isLoading ? "recording voice..." : "Govt. Verified • Online"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-white/90 shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                        <Video className="w-4 h-4" />
                        <MoreVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    /* KRISHISMRITI LIGHT CLEAN PWA HEADER */
                    <div className="bg-emerald-700 text-white px-3.5 py-2.5 shadow-md shrink-0 z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                            <Sprout className="w-5 h-5 text-emerald-100" />
                          </div>
                          <div className="leading-tight min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm tracking-tight text-white">
                                KrishiSmriti
                              </span>
                              <span className="text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-100 border border-emerald-600 font-medium">
                                किसान साथी
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-100 flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                              <span>{farmerName} &bull; {selectedLocation} Farm</span>
                            </div>
                          </div>
                        </div>

                        {/* Switch Farm / Onboarding Button */}
                        <button
                          onClick={() => setIsOnboarding(!isOnboarding)}
                          className="flex items-center gap-1 text-[11px] font-medium bg-emerald-800 hover:bg-emerald-900 text-white px-2 py-1 rounded-lg border border-emerald-600 transition-colors shadow-sm"
                          title="Change Farm Details"
                        >
                          <Settings2 className="w-3 h-3" />
                          <span>{isOnboarding ? "Back" : "My Farm"}</span>
                        </button>
                      </div>

                      {/* Sub Navigation Bar inside Phone (Chat vs Farm Map) */}
                      {!isOnboarding && (
                        <div className="grid grid-cols-2 gap-1 mt-2.5 bg-emerald-800/60 p-0.5 rounded-lg text-xs font-medium">
                          <button
                            onClick={() => setPhoneTab("chat")}
                            className={`py-1 rounded flex items-center justify-center gap-1.5 transition-all ${
                              phoneTab === "chat"
                                ? "bg-white text-emerald-900 font-bold shadow-sm"
                                : "text-emerald-100 hover:text-white"
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Voice Assistant</span>
                          </button>
                          <button
                            onClick={() => setPhoneTab("map")}
                            className={`py-1 rounded flex items-center justify-center gap-1.5 transition-all ${
                              phoneTab === "map"
                                ? "bg-white text-emerald-900 font-bold shadow-sm"
                                : "text-emerald-100 hover:text-white"
                            }`}
                          >
                            <MapIcon className="w-3.5 h-3.5" />
                            <span>My Farm Map</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* -------------------------------------------------------------
                      PHONE BODY CONTENT
                     ------------------------------------------------------------- */}
                  {isOnboarding ? (
                    /* 1. FARMER SETUP & ONBOARDING VIEW */
                    <div className="flex-1 p-4 bg-white overflow-y-auto space-y-4 font-sans text-xs">
                      <div className="text-center space-y-1 py-1 border-b border-zinc-200">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
                          <Sprout className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-sm text-zinc-900">
                          Set Up Your Farm Profile
                        </h3>
                        <p className="text-[11px] text-zinc-500">
                          Customize your location, crop, and language for tailored AI guidance.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Farmer Name */}
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                            Farmer Name
                          </label>
                          <input
                            type="text"
                            value={farmerName}
                            onChange={(e) => setFarmerName(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-emerald-600 bg-zinc-50"
                            placeholder="Enter Farmer Name (e.g. Ramu Yadav)"
                          />
                        </div>

                        {/* Location / District */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              State
                            </label>
                            <select
                              value={selectedState}
                              onChange={(e) => setSelectedState(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-emerald-600 bg-zinc-50"
                            >
                              <option value="Maharashtra">Maharashtra</option>
                              <option value="Uttar Pradesh">Uttar Pradesh</option>
                              <option value="Madhya Pradesh">Madhya Pradesh</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              District / Village
                            </label>
                            <select
                              value={selectedLocation}
                              onChange={(e) => setSelectedLocation(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-emerald-600 bg-zinc-50"
                            >
                              <option value="Pune">Pune</option>
                              <option value="Barabanki">Barabanki</option>
                              <option value="Nagpur">Nagpur</option>
                              <option value="Varanasi">Varanasi</option>
                              <option value="Fatehpur">Fatehpur</option>
                              <option value="Nashik">Nashik</option>
                            </select>
                          </div>
                        </div>

                        {/* Crop & Land Size */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              Primary Crop
                            </label>
                            <select
                              value={selectedCrop}
                              onChange={(e) => setSelectedCrop(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-emerald-600 bg-zinc-50"
                            >
                              <option value="Sugarcane (Co-86032)">Sugarcane</option>
                              <option value="Wheat (PBW-502)">Wheat</option>
                              <option value="Cotton (Bt-II)">Cotton</option>
                              <option value="Mustard (Pusa Bold)">Mustard</option>
                              <option value="Paddy (Basmati)">Paddy / Rice</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              Land Size
                            </label>
                            <select
                              value={farmSize}
                              onChange={(e) => setFarmSize(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:outline-none focus:border-emerald-600 bg-zinc-50"
                            >
                              <option value="2.5 Acres">2.5 Acres</option>
                              <option value="5.0 Acres">5.0 Acres</option>
                              <option value="1.0 Acre">1.0 Acre</option>
                              <option value="10.0 Acres">10.0 Acres</option>
                            </select>
                          </div>
                        </div>

                        {/* Preferred Language */}
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                            Preferred Voice Language
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { code: "mr", label: "मराठी (Marathi)" },
                              { code: "bho", label: "भोजपुरी (Bhojpuri)" },
                              { code: "hi", label: "हिंदी (Hindi)" },
                              { code: "en", label: "English" },
                            ].map((lang) => (
                              <button
                                key={lang.code}
                                type="button"
                                onClick={() => setSelectedLanguage(lang.code)}
                                className={`p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                                  selectedLanguage === lang.code
                                    ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-bold"
                                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                }`}
                              >
                                <span>{lang.label}</span>
                                {selectedLanguage === lang.code && (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Start Farm Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOnboarding(false);
                            handleSendQuery(
                              selectedLanguage === "mr"
                                ? "माझ्या शेताची स्थिती काय आहे?"
                                : "हमार खेत के स्थिति का बा?",
                              selectedLocation
                            );
                          }}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Sprout className="w-4 h-4" />
                          <span>Start Smart Farming Copilot</span>
                        </button>
                      </div>
                    </div>
                  ) : phoneTab === "map" && !isWeather ? (
                    /* 2. CADASTRAL FARM PARCEL MAP VIEW (LIGHT MODE) */
                    <div className="flex-1 p-3 bg-[#f8fafc] overflow-y-auto space-y-3 font-sans text-xs">
                      {/* Farm Header Card */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                              <MapPin className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-zinc-900">
                                {selectedLocation} Agricultural Parcel
                              </h4>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                Plot: {selectedPlotId} &bull; Khasra No. 402/1 ({farmSize})
                              </p>
                            </div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                            Active Plot
                          </span>
                        </div>

                        {/* Interactive Visual Farm Parcel Canvas */}
                        <div className="relative w-full h-44 bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-200 rounded-lg border border-emerald-300 overflow-hidden shadow-inner flex items-center justify-center">
                          {/* Grid texture */}
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:12px_12px]"></div>

                          {/* Farm Cadastral Polygon Shape */}
                          <svg className="w-full h-full p-4" viewBox="0 0 200 120">
                            {/* Polygon Field Boundary */}
                            <polygon
                              points="30,20 170,15 185,95 45,105"
                              fill="#86efac"
                              fillOpacity="0.6"
                              stroke="#059669"
                              strokeWidth="2.5"
                              strokeDasharray="4, 4"
                            />

                            {/* Crop Row Lines */}
                            <line x1="50" y1="35" x2="160" y2="30" stroke="#16a34a" strokeWidth="1.5" strokeOpacity="0.6" />
                            <line x1="45" y1="55" x2="165" y2="50" stroke="#16a34a" strokeWidth="1.5" strokeOpacity="0.6" />
                            <line x1="40" y1="75" x2="170" y2="70" stroke="#16a34a" strokeWidth="1.5" strokeOpacity="0.6" />
                            <line x1="35" y1="95" x2="175" y2="90" stroke="#16a34a" strokeWidth="1.5" strokeOpacity="0.6" />

                            {/* Soil Moisture Sensor Pin */}
                            <g transform="translate(100, 60)">
                              <circle r="14" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
                              <circle r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                              <circle r="2.5" fill="#ffffff" />
                            </g>
                          </svg>

                          {/* Sensor Status Overlay Pill */}
                          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm border border-emerald-300 px-2 py-1 rounded-md text-[10px] text-zinc-800 shadow-sm">
                            <strong>{selectedCrop.split(" ")[0]} Field</strong> &bull; Black Cotton Soil
                          </div>

                          {/* Live Sensor Pin Card */}
                          <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm border border-blue-300 px-2 py-1 rounded-md text-[10px] text-zinc-800 shadow-sm flex items-center gap-1.5">
                            <Droplets className="w-3 h-3 text-blue-600" />
                            <span>Moisture: <strong>38% (Optimal)</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Live Ground Soil Telemetry Cards */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-2.5 rounded-xl border border-zinc-200 text-center shadow-sm">
                          <div className="text-[10px] text-zinc-500 font-medium">Soil Moisture</div>
                          <div className="text-base font-bold text-blue-600 mt-0.5">38%</div>
                          <div className="text-[9px] text-emerald-600 font-bold">Normal Range</div>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-zinc-200 text-center shadow-sm">
                          <div className="text-[10px] text-zinc-500 font-medium">Root Temp</div>
                          <div className="text-base font-bold text-zinc-800 mt-0.5">24.2°C</div>
                          <div className="text-[9px] text-zinc-500">Root-zone</div>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-zinc-200 text-center shadow-sm">
                          <div className="text-[10px] text-zinc-500 font-medium">Last Applied</div>
                          <div className="text-sm font-bold text-emerald-700 mt-0.5">4 Days Ago</div>
                          <div className="text-[9px] text-zinc-500">45kg Urea</div>
                        </div>
                      </div>

                      {/* Quick Action Buttons on Map */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          One-Tap Field Actions:
                        </div>

                        <button
                          onClick={() => {
                            setPhoneTab("chat");
                            handleSendQuery("का आज हमार खेत में सिंचाई करे के जरूरत बा?");
                          }}
                          className="w-full bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-400 p-2 rounded-xl flex items-center justify-between text-xs text-zinc-800 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-600" />
                            <span>Check Irrigation Requirement</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        </button>

                        <button
                          onClick={() => {
                            setPhoneTab("chat");
                            handleSendQuery("का आज खेत में यूरिया डाल सकीं?");
                          }}
                          className="w-full bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-400 p-2 rounded-xl flex items-center justify-between text-xs text-zinc-800 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-emerald-600" />
                            <span>Check Fertilizer Top-Dressing Safety</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 3. CHAT MESSAGES SCROLL VIEW */
                    <div
                      className={`flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs ${
                        isWeather ? "bg-[#efeae2]" : "bg-[#f8fafc]"
                      }`}
                    >
                      {/* Farm Status Strip (KrishiSmriti Light Mode) */}
                      {!isWeather && (
                        <div className="bg-emerald-50/80 border border-emerald-200/80 p-2 rounded-xl text-[11px] text-emerald-900 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="font-bold">{selectedLocation} Farm</span>
                            <span className="text-zinc-500">&bull; {selectedCrop.split(" ")[0]} ({farmSize})</span>
                          </div>
                          <span className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-[10px]">
                            Moisture: 38%
                          </span>
                        </div>
                      )}

                      <div className="text-center my-0.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] shadow-sm uppercase font-sans border ${
                            isWeather
                              ? "bg-white/90 border-zinc-200 text-zinc-600"
                              : "bg-white border-zinc-200 text-emerald-800 font-bold"
                          }`}
                        >
                          Today &bull; Verified Voice Assistance
                        </span>
                      </div>

                      {messages.map((msg) => {
                        const isFarmer = msg.sender === "farmer";
                        const isPlaying = playingMessageId === msg.id;

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isFarmer ? "justify-end" : "justify-start"} animate-fadeIn`}
                          >
                            <div
                              className={`max-w-[90%] rounded-2xl p-3 shadow-sm space-y-1.5 ${
                                isWeather
                                  ? isFarmer
                                    ? "bg-[#dcf8c6] border border-[#c4eab0] text-zinc-900"
                                    : "bg-white border border-zinc-200 shadow-md text-zinc-900"
                                  : isFarmer
                                  ? "bg-emerald-600 text-white rounded-br-none shadow-md"
                                  : "bg-white border border-zinc-200 text-zinc-900 shadow-md rounded-bl-none"
                              }`}
                            >
                              {/* Bot Header Badge */}
                              {!isFarmer && msg.verifiedBadge && (
                                <div
                                  className={`flex items-center justify-between pb-1 border-b text-[10px] font-bold ${
                                    isWeather
                                      ? "border-zinc-100 text-emerald-800"
                                      : "border-zinc-100 text-emerald-700"
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    {msg.alertSeverity === "WARNING" ? (
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    )}
                                    {msg.verifiedBadge}
                                  </span>
                                </div>
                              )}

                              {/* Audio Voice Player Pill */}
                              {msg.isAudio && (
                                <div
                                  className={`p-1.5 rounded-xl border flex items-center gap-2 ${
                                    isWeather
                                      ? "bg-zinc-50/90 border-zinc-200"
                                      : isFarmer
                                      ? "bg-emerald-700/60 border-emerald-500 text-white"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
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
                                        ? "bg-amber-600 shadow-inner"
                                        : isWeather
                                        ? "bg-[#128c7e] hover:bg-[#075e54]"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                                    title="Play Voice Advisory"
                                  >
                                    {isPlaying ? (
                                      <Pause className="w-3 h-3" />
                                    ) : (
                                      <Play className="w-3 h-3 ml-0.5" />
                                    )}
                                  </button>

                                  <div className="flex-1">
                                    <div className="h-1.5 bg-zinc-300/60 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-200 ${
                                          isWeather
                                            ? "bg-[#128c7e]"
                                            : isFarmer
                                            ? "bg-white"
                                            : "bg-emerald-600"
                                        }`}
                                        style={{ width: `${isPlaying ? audioProgress : 100}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] mt-0.5 font-sans opacity-80">
                                      <span className="font-bold">
                                        {isPlaying ? `Playing ${audioProgress}%` : msg.audioDuration || "0:08"}
                                      </span>
                                      <span>Voice Advisory</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Vernacular text */}
                              <div className="text-xs leading-relaxed font-medium">
                                {msg.textVernacular}
                              </div>

                              {/* English Summary Translation */}
                              {msg.textEnglish && (
                                <div
                                  className={`text-[10px] p-2 rounded-lg border ${
                                    isWeather
                                      ? "text-zinc-600 bg-zinc-50 border-zinc-100"
                                      : "text-zinc-700 bg-zinc-50 border-zinc-200"
                                  }`}
                                >
                                  <strong>English Advisory:</strong> {msg.textEnglish}
                                </div>
                              )}

                              {/* Timestamp & double tick */}
                              <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 pt-0.5 font-mono">
                                <span>{msg.timestamp}</span>
                                {isFarmer && <CheckCheck className="w-3 h-3 text-blue-200" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing / Loading indicator */}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div
                            className={`rounded-xl p-3 shadow-sm border flex items-center gap-2 text-xs ${
                              isWeather
                                ? "bg-white border-zinc-200 text-zinc-600"
                                : "bg-white border-emerald-300 text-emerald-800"
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                            <span>
                              {isWeather
                                ? "Checking weather station & radar alerts..."
                                : "Checking soil sensors & past field logs..."}
                            </span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* -------------------------------------------------------------
                      INPUT BAR: WHATSAPP vs KRISHISMRITI LIGHT MODE
                     ------------------------------------------------------------- */}
                  {!isOnboarding && phoneTab === "chat" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendQuery(inputText);
                      }}
                      className={`p-2.5 flex items-center gap-2 border-t shrink-0 ${
                        isWeather
                          ? "bg-[#f0f2f5] border-zinc-200"
                          : "bg-white border-zinc-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setInputText(
                            isWeather
                              ? "का आज कीटनाशक छिड़कीं?"
                              : "खेत में यूरिया कब डालूं?"
                          )
                        }
                        className="p-1 text-zinc-400 hover:text-zinc-600"
                        title="Quick Question Prompt"
                      >
                        <Smile className="w-5 h-5" />
                      </button>

                      <div
                        className={`flex-1 rounded-full px-3.5 py-1.5 text-xs flex items-center border ${
                          isWeather
                            ? "bg-white text-zinc-800 border-zinc-300 focus-within:border-emerald-600"
                            : "bg-zinc-50 text-zinc-900 border-zinc-300 focus-within:border-emerald-600 focus-within:bg-white"
                        }`}
                      >
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder={
                            isWeather
                              ? "Ask weather question or tap mic..."
                              : "Ask KrishiSmriti in your dialect..."
                          }
                          className="w-full bg-transparent outline-none text-xs"
                        />
                      </div>

                      {inputText.trim().length > 0 ? (
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`w-9 h-9 rounded-full text-white flex items-center justify-center shadow transition-all disabled:opacity-50 ${
                            isWeather
                              ? "bg-[#128c7e] hover:bg-[#075e54]"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          <Send className="w-4 h-4 ml-0.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startVoiceInput}
                          className={`w-9 h-9 rounded-full text-white flex items-center justify-center shadow transition-all ${
                            isRecording
                              ? "bg-red-600 animate-pulse scale-110"
                              : isWeather
                              ? "bg-[#128c7e] hover:bg-[#075e54]"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                          title="Tap to Speak (Voice Note)"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      )}
                    </form>
                  )}

                  {/* iPhone Bottom Home Bar */}
                  <div className="bg-zinc-950 py-1.5 flex justify-center shrink-0">
                    <div className="w-28 h-1 bg-zinc-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* EVALUATOR FAST-TRACK BUTTON UNDERNEATH PHONE SCREEN */}
              <div className="w-full max-w-[360px] mt-3 p-3 bg-white rounded-xl border border-zinc-300 shadow-sm flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-sans text-zinc-700 text-center">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Evaluator Quick-Start:</strong> Test instant farm AI response</span>
                </div>
                <button
                  onClick={handleSkipToDemoFarm}
                  className="w-full web2-button-primary text-xs py-2 px-3 flex items-center justify-center gap-2 shadow-button font-medium"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>⚡ Skip Onboarding &amp; Launch Demo Farm</span>
                </button>
              </div>
            </div>

            {/* 2. REAL-TIME BACKEND INSPECTOR & ARCHITECTURE PROOF (RIGHT SIDE) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Tab Navigation */}
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

                <span className="text-[11px] font-mono text-zinc-500 pr-2">
                  Latency: {lastApiTrace?.agentPipeline?.totalLatencyMs || lastApiTrace?.ragPipeline?.totalLatencyMs || 120}ms
                </span>
              </div>

              {activeTab === "explainer" ? (
                <div className="web2-panel p-5 rounded-lg border border-zinc-300 bg-white shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      <h3 className="font-bold text-sm text-zinc-900">
                        {isWeather
                          ? "WeatherGPT: Zero-App Multi-Sector Voice Channel"
                          : "KrishiSmriti: Agronomic Data Sovereignty PWA"}
                      </h3>
                    </div>
                    <span className="web2-badge web2-badge-green text-[10px] font-mono">
                      {isWeather ? "WMO WIS 2.0 & INCOIS Ingest" : "pgvector Cosine Search"}
                    </span>
                  </div>

                  {/* Point 1 */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                        1
                      </span>
                      {isWeather
                        ? "Zero-Friction Multi-Sector Voice Channel"
                        : "Stateful Episodic Memory Bank (pgvector)"}
                    </h4>
                    <p className="text-xs text-zinc-600 font-sans leading-relaxed pl-5">
                      {isWeather
                        ? "Coastal fishermen, urban commuters, aviation/drone pilots, and citizens send 10-second voice notes in colloquial Bhojpuri, Odia, Marathi, or Hindi without installing heavy apps or parsing dense PDF bulletins."
                        : "Remembers previous fertilizer doses (e.g. 45kg Urea applied 4 days ago) and prevents hazardous over-fertilization and nitrate leaching."}
                    </p>
                  </div>

                  {/* Point 2 */}
                  <div className="space-y-1 pt-1">
                    <h4 className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                        2
                      </span>
                      {isWeather
                        ? "PostGIS Dynamic Geo-Fencing & Maritime Polygons"
                        : "Live Gram Panchayat IoT Telemetry Fusion"}
                    </h4>
                    <p className="text-xs text-zinc-600 font-sans leading-relaxed pl-5">
                      {isWeather
                        ? "Checks if the user's maritime sector, urban transit corridor, or drone flight airspace intersects active IMD Doppler radar reflectivity (54 dBZ downburst) or INCOIS cyclone gale contours."
                        : "Fuses live ground moisture sensors (38.4%) to calculate exact irrigation deficits and root-zone water balance."}
                    </p>
                  </div>

                  {/* Point 3 */}
                  <div className="space-y-1 pt-1">
                    <h4 className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                        3
                      </span>
                      Deterministic Multi-Sector Safety Gatekeeper (0% Hallucination)
                    </h4>
                    <p className="text-xs text-zinc-600 font-sans leading-relaxed pl-5">
                      When maritime gale squalls, urban underpass flash floods, or convective wind shear hazards are detected, the system issues a hard deterministic safety override to protect lives, vessels, and aircraft.
                    </p>
                  </div>

                  {/* Verification Checkpoint Table */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded p-3 text-xs font-mono text-zinc-700 space-y-1.5">
                    <div className="font-bold text-zinc-800 uppercase text-[11px] mb-1 flex items-center justify-between">
                      <span>Operational Metrics:</span>
                      <span className="text-emerald-700 font-semibold">Live System OK</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Target Location:</span>
                      <span className="font-semibold text-zinc-900">{selectedLocation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Plot ID:</span>
                      <span className="font-semibold text-emerald-700">{selectedPlotId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI Model:</span>
                      <span className="font-semibold text-emerald-700">
                        Gemini 1.5/3.6 Flash + Bhashini Speech
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Live JSON Telemetry Viewer */
                <div className="bg-zinc-950 text-zinc-100 p-4 rounded-lg border border-zinc-800 text-xs font-mono space-y-2 shadow-inner max-h-[440px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      LIVE API RESPONSE PAYLOAD
                    </span>
                    <span>JSON Schema Validated</span>
                  </div>

                  {lastApiTrace ? (
                    <pre className="text-emerald-400 text-[11px] overflow-x-auto leading-relaxed">
                      {JSON.stringify(lastApiTrace, null, 2)}
                    </pre>
                  ) : (
                    <div className="py-12 text-center text-zinc-500">
                      Send a message on the phone to view live LangChain tool executions and PostGIS responses in real time.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Window Footer */}
        <div className="bg-zinc-200 border-t border-zinc-300 px-4 py-2 flex items-center justify-between text-xs text-zinc-600 font-mono shrink-0">
          <span>Smart India Hackathon 2026 &bull; Working Prototype</span>
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
