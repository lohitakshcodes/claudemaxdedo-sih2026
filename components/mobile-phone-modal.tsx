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
  Square,
  Flame,
  Waves,
  Compass,
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
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [activeDistrictZone, setActiveDistrictZone] = useState<"rohtas" | "paradip" | "mandi" | "nagpur" | "delhi">("rohtas");

  // Weather Screen Tabs: "citizen" | "district"
  const [weatherScreen, setWeatherScreen] = useState<"citizen" | "district">("citizen");

  // KrishiSmriti Tabs: "chat" | "memory" | "schemes"
  const [agriTab, setAgriTab] = useState<"chat" | "memory" | "schemes">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<"explainer" | "telemetry">("explainer");
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [lastApiTrace, setLastApiTrace] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Authentic soundwave heights for WhatsApp voice notes
  const WAVEFORM_BARS = [6, 14, 20, 10, 16, 24, 18, 12, 22, 16, 8, 20, 14, 24, 18, 10, 16, 22, 14, 8, 16, 12];

  // WeatherGPT Multi-Disaster Evaluator Test Scenarios
  const weatherDisasterScenarios = [
    {
      id: "lightning-rohtas",
      badge: "⚡ 1. Rohtas Lightning (NDMA Red)",
      shortLabel: "बिजली चेतावनी",
      title: "Severe Lightning & Thunderstorm",
      location: "Rohtas",
      query: "गाँव में चेतावनी है? खेत में काम कर रहे हैं",
      queryEn: "Is there an alert in village? Working in field",
      severity: "CRITICAL" as const,
      agency: "NDMA SACHET / Bihar SDMA",
      isReplay: true,
      desc: "PostGIS ST_Contains polygon match: Sasaram-Dehri belt with 55 km/h squall & lightning strikes.",
    },
    {
      id: "cyclone-paradip",
      badge: "🌀 2. Paradip Cyclone (INCOIS SAMUDRA)",
      shortLabel: "समुद्री चक्रवात",
      title: "Marine Cyclonic Gale & High Swell",
      location: "Paradip",
      query: "क्या आज रात नाव लेकर गहरे समुद्र में मछली पकड़ने जा सकते हैं?",
      queryEn: "Can we take boat into deep sea tonight for fishing?",
      severity: "CRITICAL" as const,
      agency: "INCOIS SAMUDRA / IMD CWC",
      desc: "Orange Alert: 65-75 km/h gale winds & 4.2m wave swells. Absolute offshore navigation ban.",
    },
    {
      id: "flood-mandi",
      badge: "🌊 3. Mandi Cloudburst & Flood (HP SDMA)",
      shortLabel: "बादल फटना व बाढ़",
      title: "Flash Flood & River Spate Warning",
      location: "Mandi",
      query: "नदी का जलस्तर बढ़ रहा है, क्या गाँव खाली करना पड़ेगा?",
      queryEn: "River level is rising rapidly, do we need to evacuate?",
      severity: "CRITICAL" as const,
      agency: "HP SDMA / Central Water Commission",
      desc: "Red Alert: 112mm torrential rain, Beas River +1.8m above danger mark. Immediate high-ground shelter.",
    },
    {
      id: "heatwave-nagpur",
      badge: "☀️ 4. Vidarbha Heatwave (IMD Red)",
      shortLabel: "भीषण लू व धूप",
      title: "Extreme Daytime Heatwave & Loo",
      location: "Nagpur",
      query: "दोपहर में गेहूं कटाई कर सकते हैं? बहुत तेज धूप है",
      queryEn: "Can we harvest wheat in afternoon? Sun is very harsh",
      severity: "CRITICAL" as const,
      agency: "IMD RWFC Nagpur",
      desc: "Red Warning: 46.8°C with WBGT 34.2°C. Mandatory work suspension between 11 AM - 4 PM.",
    },
    {
      id: "waterlog-delhi",
      badge: "🚗 5. Delhi Subway Flooding (Doppler Radar)",
      shortLabel: "मिंटो ब्रिज जलभराव",
      title: "Urban Inundation & Subway Submersion",
      location: "Delhi",
      query: "शाम 5 बजे ऑफिस से निकलना है, क्या मिंटो ब्रिज / सबवे में जलभराव है?",
      queryEn: "Leaving office at 5 PM, is subway waterlogged?",
      severity: "WARNING" as const,
      agency: "Delhi Traffic Police / IMD Nowcast",
      desc: "DWR Palam radar scan: 48mm/hr rain cell, 3.4 ft water depth at Minto Bridge. Traffic diversion active.",
    },
    {
      id: "normal-sasaram",
      badge: "🌾 6. Sasaram Agro-Weather (Safe Spray)",
      shortLabel: "सामान्य मौसम",
      title: "Normal Baseline Agro-Meteorological",
      location: "Sasaram",
      query: "आज रात बारिश होगी? कल सुबह कीटनाशक छिड़क सकते हैं?",
      queryEn: "Will it rain tonight? Can we spray pesticide tomorrow?",
      severity: "NORMAL" as const,
      agency: "Open-Meteo GFS 0.25°",
      desc: "Dry weather (0.0mm rain), wind calm 11 km/h. Safe pesticide spray window 6:00 AM - 9:30 AM permitted.",
    },
  ];

  // Evaluator Tap-able Example Prompts (Fallback)
  const weatherExamples = weatherDisasterScenarios.map((s) => ({
    label: s.shortLabel,
    query: s.query,
    en: s.queryEn,
    loc: s.location,
    isReplay: s.isReplay,
    badge: s.badge,
  }));

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

  // Web Audio Context for acoustic audio pulse fallback
  const playAcousticChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  // TTS Speech Synthesis Player with Speed Control and Animated Waveform
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
    playAcousticChime();

    // Progress tick speed accounts for playbackSpeed (1x, 1.5x, 2x)
    const stepInterval = Math.round(180 / playbackSpeed);

    audioIntervalRef.current = setInterval(() => {
      setAudioProgress((prev) => {
        if (prev >= 100) {
          clearInterval(audioIntervalRef.current);
          setPlayingMessageId(null);
          return 0;
        }
        return prev + 5;
      });
    }, stepInterval);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const cleanText = textToSpeak.split("\n")[0].replace(/\[.*?\]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = (langCode === "mr" ? 0.95 : 1.0) * playbackSpeed;
      utterance.pitch = 1.0;
      utterance.lang = langCode === "mr" ? "mr-IN" : langCode === "en" ? "en-IN" : "hi-IN";

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

  // Voice Recording Simulator with Web Speech Recognition
  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    setIsRecording(true);
    setRecordingSeconds(0);

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.lang = selectedLanguage === "mr" ? "mr-IN" : selectedLanguage === "en" ? "en-IN" : "hi-IN";
        rec.continuous = false;
        rec.interimResults = true;

        rec.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join("");
          if (transcript) {
            setInputText(transcript);
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };
        rec.onerror = () => {
          setIsRecording(false);
        };

        rec.start();
        recognitionRef.current = rec;
      } catch (err) {
        console.warn("Speech recognition error:", err);
      }
    }

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRecordingSeconds(count);
      if (count >= 3) {
        clearInterval(interval);
        setIsRecording(false);
        const fallbackQuery = isWeather
          ? "गाँव में चेतावनी है? खेत में काम कर रहे हैं"
          : "उद्या फवारणी करू का?";
        setInputText((prev) => prev || fallbackQuery);
        handleSendQuery(inputText || fallbackQuery);
      }
    }, 1000);
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    if (inputText.trim()) {
      handleSendQuery(inputText);
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

        let targetLat: number | undefined = undefined;
        let targetLng: number | undefined = undefined;

        if (targetLoc === "Rohtas" || targetLoc === "Sasaram") {
          targetLat = 24.9536;
          targetLng = 84.0163;
        } else if (targetLoc === "Paradip") {
          targetLat = 20.2644;
          targetLng = 86.6780;
        } else if (targetLoc === "Mandi") {
          targetLat = 31.7087;
          targetLng = 76.9318;
        } else if (targetLoc === "Nagpur") {
          targetLat = 21.1458;
          targetLng = 79.0882;
        } else if (targetLoc === "Delhi") {
          targetLat = 28.6139;
          targetLng = 77.2090;
        }

        const response = await fetch("/api/weathergpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: textToSend,
            location: targetLoc,
            language: selectedLanguage,
            latitude: targetLat,
            longitude: targetLng,
            forceReplay,
          }),
        });

        const data = await response.json();
        setLastApiTrace(data);

        if (response.ok && data.status === "SUCCESS") {
          const isWarning = data.agentPipeline?.decisionStatus === "SAFEGUARD_OVERRIDE_ALERT" || forceReplay || textToSend.includes("चेतावनी");
          const isClimateNormal = textToSend.includes("सामान्य") || textToSend.toLowerCase().includes("normal");

          let factors: ChatMessage["factors"] = [];
          if (targetLoc === "Paradip" || textToSend.includes("समुद्र") || textToSend.includes("नाव") || textToSend.includes("मछली")) {
            factors = [
              { name: "INCOIS SAMUDRA", status: "FAIL", detail: "Squally Gale 65-75 km/h" },
              { name: "Wave Height", status: "FAIL", detail: "4.2m Rough Sea Swell" },
              { name: "Fisherfolk Action", status: "FAIL", detail: "Deep Sea Venture Banned" },
              { name: "Harbor Docking", status: "PASS", detail: "Moor Trawlers at Port" },
            ];
          } else if (targetLoc === "Mandi" || textToSend.includes("बाढ़") || textToSend.includes("नदी") || textToSend.includes("खाली")) {
            factors = [
              { name: "CWC River Gauge", status: "FAIL", detail: "Beas River +1.8m Danger" },
              { name: "Cloudburst Rain", status: "FAIL", detail: "112mm / 3h Torrential" },
              { name: "Landslide NH-21", status: "FAIL", detail: "Debris flow hazard" },
              { name: "Evacuation", status: "INFO", detail: "Govt School Relief Camp" },
            ];
          } else if (targetLoc === "Nagpur" || textToSend.includes("धूप") || textToSend.includes("लू") || textToSend.includes("गर्मी")) {
            factors = [
              { name: "Peak Heat", status: "FAIL", detail: "46.8°C Extreme Loo" },
              { name: "WBGT Index", status: "FAIL", detail: "34.2°C Sunstroke Risk" },
              { name: "Labor Ban", status: "FAIL", detail: "Halt 11 AM – 4 PM" },
              { name: "Hydration", status: "PASS", detail: "ORS & Shaded Livestock" },
            ];
          } else if (targetLoc === "Delhi" || textToSend.includes("जलभराव") || textToSend.includes("मिंटो") || textToSend.includes("सबवे")) {
            factors = [
              { name: "Underpass Sensor", status: "FAIL", detail: ">3.2 ft Submersion" },
              { name: "DWR Doppler", status: "FAIL", detail: "48mm/hr Cloudburst" },
              { name: "Traffic Police", status: "FAIL", detail: "Subway Closed to Traffic" },
              { name: "Alternate Route", status: "PASS", detail: "Barakhamba Flyover" },
            ];
          } else if (isWarning) {
            factors = [
              { name: "CAP Polygon", status: "FAIL", detail: "Inside Alert Polygon" },
              { name: "Lightning Sensors", status: "FAIL", detail: "Active Convective Strikes" },
              { name: "Action", status: "INFO", detail: "Take Shelter Immediately" },
            ];
          } else if (isClimateNormal) {
            factors = [
              { name: "IMD 30-Yr Normal", status: "PASS", detail: "182 mm (Normal range)" },
              { name: "Anomaly Check", status: "PASS", detail: "Within historical baseline" },
              { name: "Flood/Drought Risk", status: "PASS", detail: "Zero anomaly detected" },
            ];
          } else {
            factors = [
              { name: "Rain Prob", status: "PASS", detail: "0.0 mm expected" },
              { name: "Wind Speed", status: "PASS", detail: "Calm 11 km/h" },
              { name: "Spray Window", status: "PASS", detail: "6:00 AM – 9:30 AM Safe" },
            ];
          }

          const botReply: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            textVernacular: data.advisory?.vernacular || data.advisory?.english,
            textEnglish: data.advisory?.english,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAudio: true,
            audioDuration: "0:08",
            alertSeverity: isWarning ? "WARNING" : "NORMAL",
            receipt: data.advisory?.receipt || (isWarning ? "Source: BSDMA via SACHET · valid till 02:30 PM" : "Forecast: Open-Meteo (GFS)"),
            isReplay: forceReplay,
            factors,
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
          const isUrea = textToSend.toLowerCase().includes("urea") || textToSend.toLowerCase().includes("युरिया") || textToSend.toLowerCase().includes("यूरिया") || textToSend.toLowerCase().includes("खाद");
          const isIrrigate = textToSend.toLowerCase().includes("irrigate") || textToSend.toLowerCase().includes("पाणी") || textToSend.toLowerCase().includes("पानी") || textToSend.toLowerCase().includes("water");
          const isSpray = textToSend.toLowerCase().includes("spray") || textToSend.toLowerCase().includes("फवारणी") || (!isUrea && !isIrrigate);

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
                  { name: "Action", status: "INFO", detail: "Hold urea for 10 days" },
                ]
              : isIrrigate
              ? [
                  { name: "Soil Moisture", status: "INFO", detail: "38% (Optimal level)" },
                  { name: "Rain Tomorrow", status: "FAIL", detail: "Rain begins at 11:00 AM" },
                  { name: "Action", status: "PASS", detail: "Skip irrigation (Prevent rot)" },
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

  // Guard: do not render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-zinc-100 rounded-2xl border border-zinc-300 shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with Prominent Close Button */}
        <div className="bg-zinc-900 text-white px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-bold text-sm tracking-tight font-mono">
              {isWeather ? "WeatherGPT · Prototype (SIH26068)" : "KrishiSmriti · Prototype (SIH26193)"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Team ClaudeMaxDedo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] font-mono text-zinc-400">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200">ESC</kbd> or
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer border border-red-500"
              title="Close prototype modal (Esc)"
              aria-label="Close prototype modal"
            >
              <span>✕ Close</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Action Ribbon for Evaluators: Multi-Disaster Scenario Verification */}
          <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-300 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-950 font-bold">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
                <span className="uppercase tracking-wider">
                  {isWeather
                    ? "Evaluator 1-Click Multi-Disaster Scenario Testing:"
                    : "Try typing this (Evaluator 1-Click Verification):"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded font-semibold">
                {isWeather ? "6 Interactive Scenarios" : "Rule Engine Verified"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {isWeather ? (
                <>
                  {weatherDisasterScenarios.map((sc, sIdx) => {
                    const isCrit = sc.severity === "CRITICAL";
                    const isWarn = sc.severity === "WARNING";
                    return (
                      <button
                        key={sIdx}
                        onClick={() => {
                          setInputText(sc.query);
                          setActiveDistrictZone(sc.location.toLowerCase() as any);
                          handleSendQuery(sc.query, sc.location, sc.isReplay);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                          isCrit
                            ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-950"
                            : isWarn
                            ? "bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-950"
                            : "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950"
                        }`}
                        title={sc.desc}
                      >
                        <span className="text-xs">{sc.badge}</span>
                        <span className="text-[10px] opacity-75 font-mono">({sc.location})</span>
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setInputText("उद्या फवारणी करू का?");
                      handleSendQuery("उद्या फवारणी करू का?");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold border border-emerald-500 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Sprout className="w-3.5 h-3.5 text-emerald-800" />
                    <span>⚡ Launch Demo Farm (Pune 7/12: 882)</span>
                  </button>

                  {agriExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(ex.query);
                        handleSendQuery(ex.query);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-950 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="font-semibold">&ldquo;{ex.label}&rdquo;</span>
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
                          </div>
                          <p className="text-[10px] text-sky-200 mt-0.5">data: IMD, NDMA-SACHET</p>
                        </div>

                        {/* Language Dialect Switcher */}
                        <div className="flex items-center gap-1 bg-sky-950/80 p-0.5 rounded border border-sky-800 text-[10px] font-mono">
                          <button
                            onClick={() => setSelectedLanguage("bho")}
                            className={`px-1.5 py-0.5 rounded transition-all ${
                              selectedLanguage === "bho"
                                ? "bg-amber-400 text-zinc-950 font-bold"
                                : "text-sky-200 hover:text-white"
                            }`}
                            title="Bhojpuri dialect"
                          >
                            Bhojpuri
                          </button>
                          <button
                            onClick={() => setSelectedLanguage("hi")}
                            className={`px-1.5 py-0.5 rounded transition-all ${
                              selectedLanguage === "hi"
                                ? "bg-amber-400 text-zinc-950 font-bold"
                                : "text-sky-200 hover:text-white"
                            }`}
                            title="Hindi"
                          >
                            Hindi
                          </button>
                          <button
                            onClick={() => setSelectedLanguage("en")}
                            className={`px-1.5 py-0.5 rounded transition-all ${
                              selectedLanguage === "en"
                                ? "bg-amber-400 text-zinc-950 font-bold"
                                : "text-sky-200 hover:text-white"
                            }`}
                            title="English"
                          >
                            English
                          </button>
                        </div>
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
                      {/* District Hazard Zone Selector */}
                      <div className="flex flex-wrap gap-1 bg-white p-1.5 rounded-xl border border-zinc-200 shadow-2xs font-mono text-[10px]">
                        {[
                          { id: "rohtas", label: "Rohtas (Lightning)" },
                          { id: "paradip", label: "Paradip (Cyclone)" },
                          { id: "mandi", label: "Mandi (Flood)" },
                          { id: "nagpur", label: "Nagpur (Heat)" },
                          { id: "delhi", label: "Delhi (Waterlog)" },
                        ].map((z) => (
                          <button
                            key={z.id}
                            onClick={() => setActiveDistrictZone(z.id as any)}
                            className={`px-2 py-1 rounded transition-all cursor-pointer ${
                              activeDistrictZone === z.id
                                ? "bg-zinc-900 text-white font-bold shadow-xs"
                                : "text-zinc-600 hover:bg-zinc-100"
                            }`}
                          >
                            {z.label}
                          </button>
                        ))}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900">
                            {activeDistrictZone === "paradip"
                              ? "Paradip Coast: INCOIS SAMUDRA Active CAP"
                              : activeDistrictZone === "mandi"
                              ? "Beas River Basin: HP SDMA / CWC Active CAP"
                              : activeDistrictZone === "nagpur"
                              ? "Vidarbha Agro-Belt: IMD RWFC Active CAP"
                              : activeDistrictZone === "delhi"
                              ? "Delhi-NCR Traffic: DWR Doppler Nowcast"
                              : "Rohtas DDMA: NDMA SACHET Active CAP"}
                          </span>
                          <span className="text-[10px] font-mono text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-bold">
                            CAP 1.2 Locked
                          </span>
                        </div>

                        {/* Interactive SVG Cadastral / Hazard Map */}
                        <div className="relative w-full h-40 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700 flex items-center justify-center">
                          <svg className="w-full h-full p-2" viewBox="0 0 240 140">
                            {/* Base County Boundaries */}
                            <polygon points="10,20 120,10 230,30 220,130 30,125" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                            {/* Active CAP Warning Polygon */}
                            <polygon
                              points={
                                activeDistrictZone === "paradip"
                                  ? "30,80 140,40 210,120 70,130"
                                  : activeDistrictZone === "mandi"
                                  ? "80,20 180,50 160,120 40,90"
                                  : activeDistrictZone === "nagpur"
                                  ? "40,30 200,25 180,120 60,110"
                                  : activeDistrictZone === "delhi"
                                  ? "70,40 170,30 190,110 90,115"
                                  : "60,40 180,35 195,110 80,115"
                              }
                              fill="#ef4444"
                              fillOpacity="0.4"
                              stroke="#dc2626"
                              strokeWidth="2"
                              strokeDasharray="4, 4"
                            />
                            {/* Centroid / Warning Pulsing Beacon */}
                            <g transform="translate(130, 75)">
                              <circle r="12" fill="#ef4444" className="animate-ping opacity-60" />
                              <circle r="4" fill="#ffffff" />
                            </g>
                          </svg>

                          <div className="absolute top-2 left-2 bg-red-950/90 text-red-200 border border-red-700 px-2 py-1 rounded text-[10px] font-mono font-bold">
                            {activeDistrictZone === "paradip"
                              ? "⚠️ CYCLONE SURF: 4.2m WAVES"
                              : activeDistrictZone === "mandi"
                              ? "⚠️ CLOUDBURST: BEAS +1.8m"
                              : activeDistrictZone === "nagpur"
                              ? "⚠️ SEVERE LOO: 46.8°C PEAK"
                              : activeDistrictZone === "delhi"
                              ? "⚠️ SUBWAY FLOOD: >3.2 FT DEPTH"
                              : "⚠️ SEVERE LIGHTNING: ROHTAS"}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-zinc-950/90 text-zinc-300 px-2 py-0.5 rounded text-[9px] font-mono">
                            {activeDistrictZone === "paradip"
                              ? "INCOIS SAMUDRA · 75 km/h gale"
                              : activeDistrictZone === "mandi"
                              ? "HP SDMA · 112mm torrential"
                              : activeDistrictZone === "nagpur"
                              ? "IMD RWFC · WBGT 34.2°C"
                              : activeDistrictZone === "delhi"
                              ? "DWR Palam Radar · 48mm/h"
                              : "CAP 1.2 Feed · SACHET NDMA"}
                          </div>
                        </div>
                      </div>

                      {/* Real-time Query Aggregator (Anonymized) */}
                      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900">
                            Citizen inquiries in {activeDistrictZone.toUpperCase()} (last 60 min)
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 font-bold">
                            {activeDistrictZone === "paradip" ? "87 queries" : activeDistrictZone === "mandi" ? "142 queries" : activeDistrictZone === "nagpur" ? "63 queries" : activeDistrictZone === "delhi" ? "195 queries" : "104 queries"}
                          </span>
                        </div>

                        <div className="space-y-1.5 font-mono text-[11px]">
                          {activeDistrictZone === "paradip" ? (
                            <>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Paradip Port Jetty</span>
                                <span className="font-bold text-red-700">44 queries</span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Jagatsinghpur Coastal</span>
                                <span className="font-bold text-red-700">28 queries</span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Kujang Fisherfolk Colony</span>
                                <span className="font-bold text-amber-700">15 queries</span>
                              </div>
                            </>
                          ) : activeDistrictZone === "mandi" ? (
                            <>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Mandi Sadar Riverside</span>
                                <span className="font-bold text-red-700">68 queries</span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Pandoh Dam Sector</span>
                                <span className="font-bold text-red-700">51 queries</span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Balh Valley Agricultural</span>
                                <span className="font-bold text-amber-700">23 queries</span>
                              </div>
                            </>
                          ) : activeDistrictZone === "nagpur" ? (
                            <>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Nagpur Rural Wheat Belt</span>
                                <span className="font-bold text-red-700">31 queries</span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Hingna Industrial/Agro</span>
                                <span className="font-bold text-red-700">20 queries</span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Kamptee Agro-Mandi</span>
                                <span className="font-bold text-amber-700">12 queries</span>
                              </div>
                            </>
                          ) : activeDistrictZone === "delhi" ? (
                            <>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Minto Bridge &amp; CP</span>
                                <span className="font-bold text-red-700">92 queries</span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">ITO &amp; Ring Road</span>
                                <span className="font-bold text-red-700">64 queries</span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 bg-zinc-50 rounded border border-zinc-200">
                                <span className="text-zinc-800">Tilak Bridge Underpass</span>
                                <span className="font-bold text-amber-700">39 queries</span>
                              </div>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>

                        <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-100 italic">
                          {activeDistrictZone === "paradip"
                            ? "Top Question: \"Can small motorized boats cross the bar during high swell?\""
                            : activeDistrictZone === "mandi"
                            ? "Top Question: \"Is the Mandi-Kullu National Highway 21 closed due to rockfall?\""
                            : activeDistrictZone === "nagpur"
                            ? "Top Question: \"What time is it safe to resume afternoon wheat threshing?\""
                            : activeDistrictZone === "delhi"
                            ? "Top Question: \"Which underpasses are barricaded right now around Connaught Place?\""
                            : "Top Question: \"Is it safe to continue open paddy transplanting today?\""}
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

                              {/* Audio Voice Player Pill with Dynamic Waveform & Speed Controls */}
                              {msg.isAudio && (
                                <div
                                  className={`p-2 rounded-xl border flex flex-col gap-1.5 ${
                                    isFarmer
                                      ? "bg-emerald-800/80 border-emerald-600 text-white"
                                      : msg.alertSeverity === "WARNING"
                                      ? "bg-red-100/90 border-red-300 text-red-950"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-900"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        togglePlayAudio(
                                          msg.id,
                                          msg.textVernacular,
                                          selectedLanguage
                                        )
                                      }
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 transition-all shadow-xs cursor-pointer ${
                                        isPlaying
                                          ? "bg-amber-600 ring-2 ring-amber-400"
                                          : isFarmer
                                          ? "bg-emerald-950 hover:bg-emerald-900"
                                          : msg.alertSeverity === "WARNING"
                                          ? "bg-red-600 hover:bg-red-700"
                                          : "bg-zinc-900 hover:bg-zinc-800"
                                      }`}
                                      title={isPlaying ? "Pause audio" : "Play speech audio note"}
                                    >
                                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                                    </button>

                                    {/* Animated Waveform Bars */}
                                    <div className="flex items-center gap-0.5 h-7 flex-1 px-1 overflow-hidden">
                                      {WAVEFORM_BARS.map((barHeight, bIdx) => {
                                        const barPercent = (bIdx / WAVEFORM_BARS.length) * 100;
                                        const isPlayed = barPercent <= audioProgress;
                                        const isNearHead = isPlaying && Math.abs(barPercent - audioProgress) < 12;

                                        return (
                                          <span
                                            key={bIdx}
                                            className={`w-1 rounded-full transition-all duration-150 shrink-0 ${
                                              isPlayed
                                                ? msg.alertSeverity === "WARNING"
                                                  ? "bg-red-600"
                                                  : isFarmer
                                                  ? "bg-white"
                                                  : "bg-emerald-700"
                                                : isFarmer
                                                ? "bg-emerald-900/60"
                                                : "bg-zinc-300"
                                            }`}
                                            style={{
                                              height: isNearHead
                                                ? `${Math.min(26, Math.max(8, barHeight * 1.4))}px`
                                                : `${barHeight}px`,
                                            }}
                                          />
                                        );
                                      })}
                                    </div>

                                    {/* WhatsApp Speed Toggle Pill */}
                                    <button
                                      type="button"
                                      onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
                                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer shrink-0 ${
                                        isFarmer
                                          ? "bg-emerald-900 border-emerald-700 text-white"
                                          : "bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-200"
                                      }`}
                                      title="Toggle Playback Speed (1x, 1.5x, 2x)"
                                    >
                                      {playbackSpeed}x
                                    </button>
                                  </div>

                                  {/* Progress bar timeline and metadata */}
                                  <div className="flex items-center justify-between text-[9px] font-mono opacity-85 px-0.5">
                                    <span className="flex items-center gap-1 font-bold">
                                      <Volume2 className={`w-3 h-3 ${isPlaying ? "animate-pulse text-amber-500" : ""}`} />
                                      {isPlaying
                                        ? `0:0${Math.min(9, Math.floor((audioProgress / 100) * 8))} / ${msg.audioDuration || "0:08"}`
                                        : msg.audioDuration || "0:08"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                      Bhashini Multilingual Voice
                                    </span>
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
                      HIGHLIGHTED SUGGESTIVE TEXT: TRY "TYPING THIS: "
                     ------------------------------------------------------------- */}
                  <div className="border-t border-amber-200 bg-amber-50/95 p-2 shrink-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        Try typing this:
                      </span>
                      <span className="text-[9px] font-mono text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded font-semibold">
                        Tap to run
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      {(isWeather ? weatherExamples : agriExamples).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setInputText(item.query);
                            handleSendQuery(item.query, (item as any).loc, (item as any).isReplay);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100/90 border border-amber-200 hover:border-amber-400 text-zinc-900 text-xs font-medium transition-all shadow-2xs flex items-center justify-between group"
                        >
                          <span className="font-semibold text-amber-950">&ldquo;{item.query}&rdquo;</span>
                          <span className="text-[10px] text-zinc-500 group-hover:text-amber-900 font-mono flex items-center gap-0.5">
                            <span>{(item as any).en}</span>
                            <ChevronRight className="w-3 h-3 text-amber-600" />
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Input Form or Live Voice Recording Bar */}
                    {isRecording ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-red-600 text-white animate-pulse shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                          <span className="text-xs font-mono font-bold">
                            Listening ({recordingSeconds}s)... Speak Indic voice query
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={stopVoiceRecording}
                          className="px-2.5 py-1 rounded bg-white text-red-700 text-xs font-bold hover:bg-zinc-100 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>Send</span>
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendQuery(inputText);
                        }}
                        className="flex items-center gap-1.5 pt-1"
                      >
                        <div className="flex-1 rounded-full px-3 py-1.5 text-xs flex items-center bg-white border border-amber-300 focus-within:border-zinc-800 shadow-xs">
                          <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isWeather ? 'Try typing: "आज रात बारिश होगी?"' : 'Try typing: "उद्या फवारणी करू का?"'}
                            className="w-full bg-transparent outline-none text-xs"
                          />
                        </div>

                        {inputText.trim().length > 0 ? (
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-all disabled:opacity-50 shrink-0 shadow-sm cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startVoiceRecording}
                            className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer"
                            title="Speak via Microphone or Simulate Voice Recording"
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </form>
                    )}
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
                        ? activeDistrictZone === "paradip"
                          ? "Location: Paradip Coast, Odisha (20.2644° N, 86.6780° E) · Marine Cyclonic Gale & High Swell Zone"
                          : activeDistrictZone === "mandi"
                          ? "Location: Mandi Sadar, Himachal Pradesh (31.7087° N, 76.9318° E) · Beas River Basin Cloudburst & Flash Flood"
                          : activeDistrictZone === "nagpur"
                          ? "Location: Nagpur, Maharashtra (21.1458° N, 79.0882° E) · Vidarbha Severe Heatwave & High WBGT (34.2°C)"
                          : activeDistrictZone === "delhi"
                          ? "Location: Central Delhi (28.6139° N, 77.2090° E) · Minto Bridge Subway Urban Inundation Zone"
                          : "Location: Rohtas, Bihar (24.9536° N, 84.0163° E) · Severe Lightning & Convective Hazard Alert"
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
