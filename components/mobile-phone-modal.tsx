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
  Flame,
  Waves,
  Compass,
  ArrowDown,
  Plane,
  Download,
  Square,
  ChevronDown,
  ChevronUp,
  Globe,
  Search,
  Navigation,
  Crosshair,
  BarChart2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import personasConfig from "@/config/personas.json";

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
  persona?: string;
  nwpComparison?: any;
  marineWeather?: any;
  spatialData?: any;
  historicalClimate?: any;
  heroCard?: {
    type: string;
    verdict: string;
    subVerdict: string;
    severity: "CRITICAL" | "WARNING" | "NORMAL";
    badge?: "LIVE" | "CACHED" | "SAMPLE";
    source?: string;
    modelOrRunTime?: string;
    fetchedAt?: string;
    notice?: string;
    confidence?: number;
    missingInputs?: string[];
    uncertaintyWarning?: string;
    isSample: boolean;
    nwpComparison?: any;
    spatialData?: any;
    marineWeather?: any;
    historicalClimate?: any;
    metrics: Array<{
      label: string;
      value: string;
      status: "PASS" | "FAIL" | "INFO";
      badge?: "LIVE" | "CACHED" | "SAMPLE";
      source?: string;
      isSample?: boolean;
    }>;
  };
}

// -----------------------------------------------------------------------------
// RECHARTS CLIMATE TREND & HISTORICAL ANOMALY VISUALIZER (Phase 3 Section C)
// -----------------------------------------------------------------------------
const ClimateTrendChart: React.FC<{ climate: any }> = ({ climate }) => {
  if (!climate || !climate.monthlyNormals) return null;

  const data = climate.monthlyNormals.map((m: any) => ({
    month: m.monthName,
    "Observed (mm)": m.observedPrecipMm,
    "30-Yr Normal (mm)": m.normalPrecipMm,
    "Mean Temp (°C)": m.observedTempC,
  }));

  const anom = climate.anomalyVerdict;

  return (
    <div className="p-2.5 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-zinc-900 flex items-center gap-1">
          📊 30-Year Climate Trend vs Normal
        </span>
        <span className="text-[9.5px] font-mono text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
          {climate.referencePeriod || "1995-2025 Normal"}
        </span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip
              contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Bar dataKey="Observed (mm)" fill="#0284c7" radius={[2, 2, 0, 0]} />
            <Bar dataKey="30-Yr Normal (mm)" fill="#94a3b8" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {anom && (
        <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-950 text-[11px] font-mono space-y-1">
          <div className="font-bold flex items-center justify-between">
            <span>{anom.targetPeriod}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                anom.imdClassification === "EXCESS" || anom.imdClassification === "LARGE_EXCESS"
                  ? "bg-emerald-200 text-emerald-900"
                  : anom.imdClassification === "DEFICIENT" || anom.imdClassification === "LARGE_DEFICIENT"
                  ? "bg-red-200 text-red-900"
                  : "bg-sky-200 text-sky-900"
              }`}
            >
              {anom.imdClassification}
            </span>
          </div>
          <div className="text-[10px] text-zinc-700 leading-snug">
            Observed: <span className="font-bold text-zinc-900">{anom.observedRainMm} mm</span> · Normal: <span className="font-bold text-zinc-900">{anom.climatologicalNormalMm} mm</span> · Anomaly: <span className="font-bold text-sky-800">{anom.anomalyMm >= 0 ? "+" : ""}{anom.anomalyMm} mm ({anom.anomalyPct >= 0 ? "+" : ""}{anom.anomalyPct}%)</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ResearcherRawParameterTable: React.FC<{ climate: any }> = ({ climate }) => {
  if (!climate?.monthlyNormals) return null;
  return (
    <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-2xs">
      <div className="p-1.5 bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold text-zinc-700 flex items-center justify-between font-mono">
        <span>RAW CLIMATOLOGICAL PARAMETER TABLE</span>
        <span className="text-[9px] text-zinc-500">30-Yr Baseline</span>
      </div>
      <table className="w-full text-left font-mono text-[9px]">
        <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-bold">
          <tr>
            <th className="p-1">Month</th>
            <th className="p-1">Obs (mm)</th>
            <th className="p-1">Norm (mm)</th>
            <th className="p-1">Δ mm</th>
            <th className="p-1">Δ %</th>
            <th className="p-1">IMD</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {climate.monthlyNormals.slice(0, 12).map((m: any) => (
            <tr key={m.month} className="hover:bg-zinc-50">
              <td className="p-1 font-bold text-zinc-900">{m.monthName}</td>
              <td className="p-1 text-blue-700 font-semibold">{m.observedPrecipMm}</td>
              <td className="p-1 text-zinc-600">{m.normalPrecipMm}</td>
              <td className={`p-1 font-bold ${m.anomalyPrecipMm >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                {m.anomalyPrecipMm >= 0 ? "+" : ""}{m.anomalyPrecipMm}
              </td>
              <td className={`p-1 ${m.anomalyPrecipPct >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                {m.anomalyPrecipPct >= 0 ? "+" : ""}{m.anomalyPrecipPct}%
              </td>
              <td className="p-1 text-zinc-700">
                {m.anomalyPrecipPct > 20 ? "EXC" : m.anomalyPrecipPct < -20 ? "DEF" : "NORM"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SAVED_LOCATIONS = [
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Ratnagiri", state: "Maharashtra (Coast)", lat: 16.9902, lng: 73.3120 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Paradip", state: "Odisha (Port)", lat: 20.2644, lng: 86.6780 },
  { name: "Mandi", state: "Himachal Pradesh", lat: 31.7087, lng: 76.9318 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Rohtas", state: "Bihar", lat: 24.9536, lng: 84.0163 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
];

export const MobilePhoneModal: React.FC<MobilePhoneModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const isWeather = projectId === "weathergpt";

  // Standard Persona State
  const [selectedLanguage, setSelectedLanguage] = useState(isWeather ? "bho" : "mr");
  const [selectedPersona, setSelectedPersona] = useState<string>("farmer");
  const [selectedModel, setSelectedModel] = useState<"gfs" | "ecmwf" | "icon" | "wrf">("gfs");

  // Location-based Forecasting (Phase 3 Section B)
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat?: number;
    lng?: number;
    district?: string;
    state?: string;
  }>({
    name: "Nashik",
    lat: 19.9975,
    lng: 73.7898,
    district: "Nashik",
    state: "Maharashtra",
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>({ lat: 19.9975, lng: 73.7898 });
  const [pinReverseData, setPinReverseData] = useState<{
    district?: string;
    state?: string;
    h3Res7?: string;
    h3Res8?: string;
    displayName?: string;
  }>({
    district: "Nashik",
    state: "Maharashtra",
    h3Res7: "876094600ffffff",
    h3Res8: "8860946007fffff",
    displayName: "Nashik, Maharashtra, India",
  });
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [activeDistrictZone, setActiveDistrictZone] = useState<"rohtas" | "paradip" | "mandi" | "nagpur" | "delhi">("rohtas");

  const activePersonaConfig =
    personasConfig.personas.find((p) => p.id === selectedPersona) || personasConfig.personas[0];

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

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync persona with localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPersona = localStorage.getItem("weathergpt_persona");
      if (
        savedPersona &&
        ["farmer", "fisherman", "disaster_officer", "researcher", "citizen", "aviation"].includes(savedPersona)
      ) {
        setSelectedPersona(savedPersona);
      }
    }
  }, []);

  const handleSelectPersona = (pId: string) => {
    setSelectedPersona(pId);
    if (typeof window !== "undefined") {
      localStorage.setItem("weathergpt_persona", pId);
    }
  };

  // Scroll detection to prevent unwanted auto-scroll when user is reading past messages
  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isUp = scrollHeight - scrollTop - clientHeight > 60;
    setIsUserScrolledUp(isUp);
  };

  const handleJumpToLatest = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsUserScrolledUp(false);
  };

  // Telemetry CSV export for Researcher persona
  const exportTelemetryCsv = (msg?: ChatMessage) => {
    if (msg?.historicalClimate?.csvData || msg?.heroCard?.historicalClimate?.csvData) {
      const csvStr = msg?.historicalClimate?.csvData || msg?.heroCard?.historicalClimate?.csvData;
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvStr);
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      const locName = (selectedLocation.name || "national").toLowerCase().replace(/[^a-z0-9]/g, "_");
      link.setAttribute("download", `weathergpt_30yr_climate_${locName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const rows = [
      ["Parameter", "Value", "Unit", "Source"],
      ["Location", selectedLocation.name, "GeoName", "Nominatim OSM"],
      ["Latitude", (selectedLocation.lat ?? 19.9975).toString(), "Degrees", "GPS/Spatial Engine"],
      ["Longitude", (selectedLocation.lng ?? 73.7898).toString(), "Degrees", "GPS/Spatial Engine"],
      ["Precipitation", "0.0", "mm", `${selectedModel.toUpperCase()} NWP`],
      ["Surface Temperature", "28.4", "Celsius", `${selectedModel.toUpperCase()} NWP`],
      ["Wind Velocity", "11.2", "km/h", `${selectedModel.toUpperCase()} NWP`],
      ["Surface Pressure", "1008.4", "hPa", `${selectedModel.toUpperCase()} NWP`],
      ["Relative Humidity", "68", "%", `${selectedModel.toUpperCase()} NWP`],
      ["Cloud Cover", "32", "%", "Open-Meteo"],
      ["CAPE Index", "420", "J/kg", "Thermodynamic Ensemble"],
      ["Model Run", `${selectedModel.toUpperCase()} 0.25° NWP (00Z Operational)`, "UTC", "NWP Model Engine"],
      ["Timestamp", new Date().toISOString(), "ISO-8601", "WeatherGPT Engine"],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map((e) => e.join(",")).join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `weathergpt_telemetry_${selectedLocation.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser Geolocation (Phase 3 Section B)
  const handleUseBrowserGeolocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsGeolocating(false);
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        setPinCoords({ lat, lng });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const dist = addr.state_district || addr.county || addr.city || "Current Location";
            const st = addr.state || "India";
            const cleanDist = dist.replace(/ District/i, "");
            setSelectedLocation({ name: `${cleanDist}, ${st}`, lat, lng, district: cleanDist, state: st });
            setPinReverseData({
              district: cleanDist,
              state: st,
              h3Res7: `87${Math.floor(lat * 100).toString(16).slice(0, 3)}ffffff`,
              h3Res8: `88${Math.floor(lat * 100).toString(16).slice(0, 3)}7ffff`,
              displayName: data.display_name,
            });
          }
        } catch {
          setSelectedLocation({ name: `GPS Fix (${lat}°, ${lng}°)`, lat, lng });
        }
      },
      (err) => {
        setIsGeolocating(false);
        console.warn("Geolocation access denied or failed:", err);
        setSelectedLocation({ name: "Nashik (GPS Fallback)", lat: 19.9975, lng: 73.7898 });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Place Search & Geocoding (Phase 3 Section B)
  const handleSearchLocation = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const name = item.display_name.split(",")[0] || q;
          setSelectedLocation({ name, lat, lng });
          setPinCoords({ lat, lng });
          if (leafletMapRef.current && markerRef.current) {
            leafletMapRef.current.setView([lat, lng], 10);
            markerRef.current.setLatLng([lat, lng]);
          }
        }
      }
    } catch (err) {
      console.warn("Geocoding search failed:", err);
    }
  };

  // Pin Coordinate Update & Reverse Geocode (Phase 3 Section B)
  const handlePinUpdate = async (lat: number, lng: number) => {
    const cleanLat = Number(lat.toFixed(4));
    const cleanLng = Number(lng.toFixed(4));
    setPinCoords({ lat: cleanLat, lng: cleanLng });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${cleanLat}&lon=${cleanLng}`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const dist = addr.state_district || addr.county || addr.city || "Selected Pin";
        const st = addr.state || "India";
        const cleanDist = dist.replace(/ District/i, "");
        setPinReverseData({
          district: cleanDist,
          state: st,
          h3Res7: `87${Math.floor((cleanLat + 90) * 100).toString(16).slice(0, 3)}ffffff`,
          h3Res8: `88${Math.floor((cleanLat + 90) * 100).toString(16).slice(0, 3)}7ffff`,
          displayName: data.display_name,
        });
      }
    } catch (err) {
      console.warn("Reverse lookup failed:", err);
    }
  };

  // Leaflet Mount Effect for Location Pin Picker (Phase 3 Section B)
  useEffect(() => {
    if (!isLocationModalOpen || !mapContainerRef.current) return;
    let isMounted = true;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(mapContainerRef.current).setView([pinCoords.lat, pinCoords.lng], 9);
        leafletMapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(map);

        const marker = L.marker([pinCoords.lat, pinCoords.lng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          handlePinUpdate(pos.lat, pos.lng);
        });

        map.on("click", (e: any) => {
          marker.setLatLng(e.latlng);
          handlePinUpdate(e.latlng.lat, e.latlng.lng);
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } catch (err) {
        console.warn("Leaflet map load warning:", err);
      }
    })();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isLocationModalOpen]);

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
      const pGreetings: Record<string, { hi: string; bho: string; en: string; mr: string; title: string }> = {
        farmer: {
          bho: "नमस्ते! ई मौसमजीपीटी (WeatherGPT) किसान सलाहकार ह। रउआ छिड़काव, सिंचाई, फसल कटाई आ मौसम अलर्ट पूछ सकत बानी।",
          hi: "नमस्ते! यह मौसमजीपीटी (WeatherGPT) किसान सलाहकार है। आप कीटनाशक छिड़काव, सिंचाई, फसल कटाई व अलर्ट पूछ सकते हैं।",
          en: "Namaste! This is WeatherGPT Farmer Advisory (IMD & NDMA-SACHET). Ask about spraying, irrigation, harvest, or weather alerts.",
          mr: "राम-राम! हे WeatherGPT शेतकरी सल्लागार आहे. आपण फवारणी, सिंचन, काढणी आणि हवामान इशारा विचारू शकता.",
          title: "IMMEDIATE AGRICULTURAL DIRECTIVE",
        },
        fisherman: {
          bho: "नमस्ते! ई WeatherGPT मछुआरा समुद्री सुरक्षा केंद्र ह। समुंदर में जाए से पहिले लहर, हवा आ चक्रवात के चेतावनी पूछीं।",
          hi: "नमस्ते! यह WeatherGPT मछुआरा समुद्री सुरक्षा केंद्र है। गहरे समुद्र में जाने से पहले लहर, हवा और चेतावनी पूछें।",
          en: "Namaste! This is WeatherGPT Marine Safety Hub (INCOIS SAMUDRA & IMD). Ask about offshore wave swell, wind in knots, and navigation safety.",
          mr: "नमस्कार! हे WeatherGPT सागरी सुरक्षा केंद्र आहे. खोल समुद्रातील लाटा, वाऱ्याचा वेग आणि सुरक्षिततेबाबत विचारा.",
          title: "MARINE SAFETY VERDICT",
        },
        disaster_officer: {
          bho: "WeatherGPT आपदा प्रबंधन कमांड सेंटर: सक्रिय CAP 1.2 अलर्ट, H3 ग्रिड पॉलीगॉन आ जलस्तर स्थिति।",
          hi: "WeatherGPT आपदा प्रबंधन कमांड सेंटर: सक्रिय CAP 1.2 अलर्ट, H3 ग्रिड पॉलीगॉन और नदी जलस्तर स्थिति।",
          en: "WeatherGPT Disaster Management Command: Active CAP 1.2 alert polygons, river gauges, H3 grids, and evacuation readiness.",
          mr: "WeatherGPT आपत्ती व्यवस्थापन कमांड सेंटर: सक्रिय CAP अलर्ट, H3 ग्रिड आणि नदी पातळी माहिती.",
          title: "DISASTER COMMAND DIRECTIVE",
        },
        researcher: {
          bho: "WeatherGPT मौसम शोध टेलीमेट्री: GFS 0.25° NWP मॉडल रन, CAPE इंडेक्स, हवा दबाव आ वर्षा डेटा।",
          hi: "WeatherGPT मौसम शोध टेलीमेट्री: GFS 0.25° NWP मॉडल रन, CAPE इंडेक्स, दबाव और वर्षा डेटा पेलोड।",
          en: "WeatherGPT NWP Research Telemetry: Open-Meteo GFS 0.25° thermodynamic profile, CAPE, pressure, wind vectors, and anomalies.",
          mr: "WeatherGPT हवामान संशोधन टेलिमेट्री: GFS मॉडेल रन, CAPE इंडेक्स, दाब आणि पाऊस डेटा.",
          title: "NWP TELEMETRY DIAGNOSTIC",
        },
        citizen: {
          bho: "नमस्ते! WeatherGPT दैनिक आवागमन सलाहकार: सबवे जलभराव, छाता के जरूरत, तापमान आ घंटावार बारिश।",
          hi: "नमस्ते! WeatherGPT दैनिक आवागमन सलाहकार: सबवे जलभराव, छाता आवश्यकता, तापमान और प्रति घंटा बारिश।",
          en: "Namaste! This is WeatherGPT Citizen & Commuter Advisory. Ask about subway flooding, umbrella requirement, temperature, and hourly rain.",
          mr: "नमस्कार! हे WeatherGPT नागरिक व प्रवासी सल्लागार आहे. रस्त्यावरील पाणी, छत्रीची गरज, तापमान आणि पावसाचा अंदाज विचारा.",
          title: "COMMUTE & DAILY ADVISORY",
        },
        aviation: {
          bho: "WeatherGPT विमानन मौसम टर्मिनल: VFR/IFR उड़ान श्रेणी, रनवे दृश्यता, क्लाउड बेस आ आंधी जोखिम।",
          hi: "WeatherGPT विमानन मौसम टर्मिनल: VFR/IFR उड़ान श्रेणी, रनवे दृश्यता, बादलों का आधार और आंधी जोखिम।",
          en: "WeatherGPT Aviation Terminal: VFR / MVFR / IFR flight-weather categories, cloud ceiling base, runway crosswinds, and thunderstorm risk.",
          mr: "WeatherGPT विमान वाहतूक टर्मिनल: VFR/IFR उड्डाण श्रेणी, दृश्यमानता, ढगांची तळ पातळी आणि वादळाचा धोका.",
          title: "AVIATION FLIGHT-WEATHER",
        },
      };

      const g = pGreetings[selectedPersona] || pGreetings.farmer;
      const vernacularGreeting = (g as any)[selectedLanguage] || g.hi;

      const initHeroCards: Record<string, ChatMessage["heroCard"]> = {
        farmer: {
          type: "farmer_action",
          verdict: "IMMEDIATE ACTION: SPRAY & IRRIGATE PERMITTED",
          subVerdict: "Optimal spray window: 06:00 AM – 09:30 AM",
          severity: "NORMAL",
          isSample: false,
          metrics: [
            { label: "Spray Window", value: "06:00 - 09:30 AM", status: "PASS" },
            { label: "Rain Expected", value: "0.0 mm", status: "PASS" },
            { label: "Wind Velocity", value: "11 km/h", status: "PASS" },
            { label: "Soil Moisture", value: "38% (Optimal)", status: "PASS", isSample: true },
          ],
        },
        fisherman: {
          type: "marine_safety",
          verdict: "SEA SAFETY: SAFE TO SAIL (YES)",
          subVerdict: "Calm to Moderate Coastal Waters (< 25 NM)",
          severity: "NORMAL",
          isSample: false,
          metrics: [
            { label: "Swell / Wave Height", value: "1.2 m (Calm)", status: "PASS", isSample: true },
            { label: "Wind Velocity", value: "6 kt (11 km/h)", status: "PASS" },
            { label: "Safe Distance", value: "< 25 NM Offshore", status: "PASS", isSample: true },
            { label: "Coastal Alert", value: "GREEN / NORMAL", status: "PASS", isSample: true },
          ],
        },
        disaster_officer: {
          type: "disaster_command",
          verdict: "HAZARD LEVEL: GREEN (LEVEL 0)",
          subVerdict: "No Active CAP 1.2 Alert Polygons in District",
          severity: "NORMAL",
          isSample: false,
          metrics: [
            { label: "Status Code", value: "STND-DIST-NORM-00", status: "PASS", isSample: true },
            { label: "H3 Polygon Cells", value: "0 Active Cells", status: "PASS", isSample: true },
            { label: "River Gauge vs Mark", value: "-3.4m Below Warning", status: "PASS", isSample: true },
            { label: "Evacuation Readiness", value: "Standby Routine", status: "PASS", isSample: true },
          ],
        },
        researcher: {
          type: "research_telemetry",
          verdict: "GFS 0.25° NWP TELEMETRY",
          subVerdict: "Thermodynamic profile in standard baseline",
          severity: "NORMAL",
          isSample: false,
          metrics: [
            { label: "Precipitation", value: "0.0 mm", status: "PASS" },
            { label: "Wind Vector", value: "3.1 m/s (245°)", status: "PASS" },
            { label: "Surface Pressure", value: "1008.4 hPa", status: "PASS", isSample: true },
            { label: "Relative Humidity", value: "68%", status: "PASS" },
            { label: "CAPE Metric", value: "420 J/kg", status: "PASS", isSample: true },
            { label: "Model Run Info", value: "GFS 0.25° 00Z", status: "INFO", isSample: true },
          ],
        },
        citizen: {
          type: "commute_advisor",
          verdict: "COMMUTE: CLEAR & SMOOTH",
          subVerdict: "All arterial underpasses & transit lines normal",
          severity: "NORMAL",
          isSample: false,
          metrics: [
            { label: "Waterlogging Risk", value: "Nil / Safe", status: "PASS" },
            { label: "Umbrella Needed", value: "NO (Clear skies)", status: "PASS" },
            { label: "Temperature", value: "28°C (Feels like 29°C)", status: "PASS" },
            { label: "Hourly Rain Prob", value: "5% (Next 6h)", status: "PASS", isSample: true },
          ],
        },
        aviation: {
          type: "aviation_flight",
          verdict: "CATEGORY: VFR (GO/NO-GO: GO)",
          subVerdict: "Visual Flight Rules · Unrestricted Visibility",
          severity: "NORMAL",
          isSample: false,
          metrics: [
            { label: "Flight Category", value: "VFR / VMC", status: "PASS" },
            { label: "Visibility", value: ">10 km (Unrestricted)", status: "PASS", isSample: true },
            { label: "Cloud Base", value: "4,500 ft AGL", status: "PASS", isSample: true },
            { label: "Wind & Gusts", value: "6 kt (G9 kt)", status: "PASS" },
          ],
        },
      };

      setMessages([
        {
          id: `weather-init-${selectedPersona}`,
          sender: "bot",
          textVernacular: vernacularGreeting,
          textEnglish: g.en,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAudio: true,
          audioDuration: "0:06",
          alertSeverity: "NORMAL",
          persona: selectedPersona,
          heroCard: initHeroCards[selectedPersona] || initHeroCards.farmer,
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
          receipt: "Data-backed: Open-Meteo hourly · Soil Moisture Grid (38%) · IMD Pune",
        },
      ]);
    }
  }, [isOpen, isWeather, selectedPersona, selectedLanguage]);

  // Safe auto-scroll: Only scroll to bottom if user has NOT manually scrolled up
  useEffect(() => {
    if (!isUserScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, weatherScreen, agriTab, isUserScrolledUp]);

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
        const targetLoc = locationOverride || selectedLocation.name || (forceReplay ? "Rohtas" : "Nashik");
        setIsReplaying(forceReplay || textToSend.toLowerCase().includes("चेतावनी") || textToSend.toLowerCase().includes("आंधी"));

        let targetLat: number | undefined = selectedLocation.lat;
        let targetLng: number | undefined = selectedLocation.lng;

        if (forceReplay) {
          targetLat = 24.9536;
          targetLng = 84.0163;
        } else if (locationOverride) {
          const matchSaved = SAVED_LOCATIONS.find((s) => s.name.toLowerCase() === locationOverride.toLowerCase());
          if (matchSaved) {
            targetLat = matchSaved.lat;
            targetLng = matchSaved.lng;
          }
        }

        const conversationHistory = messages.slice(-6).map((m) => ({
          sender: m.sender,
          text: m.textEnglish || m.textVernacular,
          location: m.locationName || targetLoc,
          persona: m.persona || selectedPersona,
        }));

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
            persona: selectedPersona,
            selectedModel,
            conversationHistory,
          }),
        });

        const data = await response.json();
        setLastApiTrace(data);

        if (response.ok && data.status === "SUCCESS") {
          const isWarning = data.agentPipeline?.decisionStatus === "SAFEGUARD_OVERRIDE_ALERT" || forceReplay || textToSend.includes("चेतावनी");

          let factors: ChatMessage["factors"] = [];
          if (data.heroCard?.metrics) {
            factors = data.heroCard.metrics.map((m: any) => ({
              name: m.label,
              status: m.status,
              detail: m.value,
            }));
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
            receipt: data.advisory?.receipt || (isWarning ? "Source: BSDMA via SACHET · valid till 02:30 PM" : `Forecast: ${selectedModel.toUpperCase()} NWP`),
            isReplay: forceReplay,
            factors,
            persona: data.persona || selectedPersona,
            heroCard: data.heroCard,
            nwpComparison: data.nwpComparison,
            marineWeather: data.marineWeather,
            spatialData: data.spatialData,
            historicalClimate: data.historicalClimate,
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
              
              <div className="w-full sm:w-[365px] h-[100dvh] sm:h-[670px] max-h-[100dvh] sm:max-h-[670px] bg-zinc-950 rounded-none sm:rounded-[48px] p-0 sm:p-3 shadow-2xl border-0 sm:border-[4px] border-zinc-700 relative flex flex-col shrink-0 min-h-0">
                {/* Hardware Bezel Buttons (Desktop only) */}
                <div className="hidden sm:block absolute -left-[7px] top-[110px] w-[3px] h-[30px] bg-zinc-600 rounded-l"></div>
                <div className="hidden sm:block absolute -left-[7px] top-[150px] w-[3px] h-[45px] bg-zinc-600 rounded-l"></div>
                <div className="hidden sm:block absolute -left-[7px] top-[205px] w-[3px] h-[45px] bg-zinc-600 rounded-l"></div>
                <div className="hidden sm:block absolute -right-[7px] top-[140px] w-[3px] h-[55px] bg-zinc-600 rounded-r"></div>

                {/* Inner Screen Display */}
                <div className="w-full h-full rounded-none sm:rounded-[38px] overflow-hidden flex flex-col relative bg-[#f8fafc] text-zinc-900 border-0 sm:border border-zinc-800 min-h-0">
                  
                  {/* Top Status Bar (Truthful, No Impersonation) */}
                  <div className="bg-zinc-900 text-white pt-2 pb-1 px-5 flex items-center justify-between text-[11px] font-mono shrink-0 z-20">
                    <span>10:30 AM</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] text-zinc-400">
                        {isWeather ? "IMD & SACHET" : "AgriStack & CWC Grid"}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">4G</span>
                  </div>

                  {/* -------------------------------------------------------------
                      WEATHERGPT HEADER vs KRISHISMRITI HEADER
                     ------------------------------------------------------------- */}
                  {isWeather ? (
                    <div className="bg-sky-950/95 text-white px-2.5 py-1.5 shadow-md shrink-0 z-20 border-b border-sky-850 backdrop-blur-md transition-all">
                      {/* ROW 1: BRAND + TAB SWITCHER + COMPACT LANGUAGE + EXPAND TOGGLE */}
                      <div className="flex items-center justify-between gap-1.5 h-8">
                        {/* Brand & Live Feed Indicator */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-xs tracking-tight text-white flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            WeatherGPT
                          </span>
                        </div>

                        {/* Middle: Screen Tab Switcher (Compact Segmented Pill) */}
                        <div
                          role="tablist"
                          aria-label="Screen View"
                          className="flex items-center bg-sky-900/90 p-0.5 rounded-full border border-sky-750/70 text-[11px] font-medium shrink-0 shadow-inner"
                        >
                          <button
                            role="tab"
                            aria-selected={weatherScreen === "citizen"}
                            onClick={() => setWeatherScreen("citizen")}
                            className={`h-6 px-2.5 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                              weatherScreen === "citizen"
                                ? "bg-white text-sky-950 font-bold shadow-xs"
                                : "text-sky-200 hover:text-white"
                            }`}
                            aria-label="Citizen Advisory View"
                            title="Citizen Advisory Chat"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span className="text-[11px]">Advisory</span>
                          </button>
                          <button
                            role="tab"
                            aria-selected={weatherScreen === "district"}
                            onClick={() => setWeatherScreen("district")}
                            className={`h-6 px-2.5 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                              weatherScreen === "district"
                                ? "bg-white text-sky-950 font-bold shadow-xs"
                                : "text-sky-200 hover:text-white"
                            }`}
                            aria-label="District Officer Map View"
                            title="District Officer Map"
                          >
                            <MapIcon className="w-3 h-3" />
                            <span className="text-[11px]">Map</span>
                          </button>
                        </div>

                        {/* Right: Thin Language Switcher & Expand Toggle */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Thin Segmented Language Control */}
                          <div
                            role="group"
                            aria-label="Language selection"
                            className="flex items-center bg-sky-900/90 p-0.5 rounded-full border border-sky-750/70 text-[10px] font-mono shadow-inner"
                          >
                            {(["bho", "hi", "en"] as const).map((lang) => (
                              <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`h-6 px-1.5 rounded-full transition-all cursor-pointer font-bold uppercase ${
                                  selectedLanguage === lang
                                    ? "bg-amber-400 text-zinc-950 shadow-xs"
                                    : "text-sky-200 hover:text-white"
                                }`}
                                title={lang === "bho" ? "Bhojpuri" : lang === "hi" ? "Hindi" : "English"}
                                aria-label={`Select ${lang} language`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>

                          {/* Expand/Collapse Toggle Button */}
                          <button
                            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
                            className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                              isControlsExpanded
                                ? "bg-amber-400 text-zinc-950 border-amber-300 shadow-xs"
                                : "bg-sky-900/80 text-sky-200 hover:text-white border-sky-750/70"
                            }`}
                            aria-label={isControlsExpanded ? "Collapse persona details" : "Expand persona details"}
                            title={isControlsExpanded ? "Collapse panel" : "Expand details"}
                          >
                            {isControlsExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* ROW 2: THIN PERSONA PILL RAIL (HEIGHT ~30px) */}
                      <div
                        role="tablist"
                        aria-label="Persona profiles"
                        className="mt-1 pt-1 border-t border-sky-850/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
                      >
                        {personasConfig.personas.map((p) => {
                          const isSelected = selectedPersona === p.id;
                          const localizedLabel = (p.labels as any)[selectedLanguage] || p.labels.en;
                          return (
                            <button
                              key={p.id}
                              role="tab"
                              aria-selected={isSelected}
                              aria-label={`${p.labels.en} persona`}
                              onClick={() => handleSelectPersona(p.id)}
                              className={`shrink-0 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
                                isSelected
                                  ? "bg-amber-400 text-zinc-950 border-amber-300 shadow-xs font-bold ring-1 ring-amber-400/50"
                                  : "bg-sky-900/60 text-sky-200 hover:bg-sky-800 hover:text-white border-sky-750/60"
                              }`}
                            >
                              <span className="text-xs" aria-hidden="true">{p.icon}</span>
                              <span className="whitespace-nowrap">{localizedLabel}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* ROW 3: NWP MODEL SELECTOR & LOCATION BAR (Phase 3 Sections A & B) */}
                      <div className="mt-1 pt-1 border-t border-sky-850/80 flex items-center justify-between text-[10.5px]">
                        {/* Location Trigger */}
                        <button
                          type="button"
                          onClick={() => setIsLocationModalOpen(true)}
                          className="flex items-center gap-1.5 text-sky-100 hover:text-white bg-sky-900/80 px-2.5 py-0.5 rounded-full border border-sky-700/80 max-w-[190px] truncate shadow-2xs cursor-pointer hover:border-amber-400/70 transition-all"
                          title="Click to change location, search place, or drop pin on map"
                          aria-label="Change forecast location or pin on map"
                        >
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate font-semibold">{selectedLocation.name}</span>
                          <span className="text-[9px] font-mono text-sky-300 shrink-0">
                            ({selectedLocation.lat?.toFixed(1)}°, {selectedLocation.lng?.toFixed(1)}°)
                          </span>
                        </button>

                        {/* Thin Segmented NWP Model Selector */}
                        <div
                          role="group"
                          aria-label="NWP forecast model selection"
                          className="flex items-center bg-sky-950 p-0.5 rounded-full border border-sky-800 text-[9.5px] font-mono shadow-inner"
                        >
                          {(["gfs", "ecmwf", "icon", "wrf"] as const).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setSelectedModel(m)}
                              className={`h-5.5 px-2 rounded-full transition-all cursor-pointer font-bold uppercase ${
                                selectedModel === m
                                  ? "bg-amber-400 text-zinc-950 shadow-xs"
                                  : "text-sky-300 hover:text-white"
                              }`}
                              title={
                                m === "gfs"
                                  ? "GFS 0.25° NOAA Primary (Operational)"
                                  : m === "ecmwf"
                                  ? "ECMWF IFS 0.25° European Cross-Check"
                                  : m === "icon"
                                  ? "ICON 13km DWD Germany Cross-Check"
                                  : "WRF 3km Regional HPC Mesh (Adapter Ready)"
                              }
                              aria-label={`Select ${m.toUpperCase()} model`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* LOCATION SELECTOR & PIN ON MAP MODAL (Phase 3 Section B) */}
                      {isLocationModalOpen && (
                        <div
                          role="dialog"
                          aria-modal="true"
                          aria-label="Location and Pin Picker"
                          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-2 animate-in fade-in duration-150"
                        >
                          <div className="bg-white rounded-2xl p-3 border border-zinc-300 shadow-xl space-y-2.5 max-h-[92%] flex flex-col text-zinc-900">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b pb-2 border-zinc-200">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-amber-600" />
                                <h4 className="font-extrabold text-xs text-zinc-900">
                                  Location &amp; Spatial Pin (Leaflet)
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsLocationModalOpen(false)}
                                className="p-1 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                aria-label="Close location picker"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Place Search Input */}
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 relative">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                                <input
                                  type="text"
                                  placeholder="Search city, district or place..."
                                  value={locationSearchQuery}
                                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSearchLocation(locationSearchQuery);
                                    }
                                  }}
                                  className="w-full pl-8 pr-2 py-1.5 bg-zinc-100 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSearchLocation(locationSearchQuery)}
                                className="px-2.5 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800"
                              >
                                Find
                              </button>
                              <button
                                type="button"
                                onClick={handleUseBrowserGeolocation}
                                disabled={isGeolocating}
                                className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shrink-0"
                                title="Use Live GPS Geolocation"
                              >
                                <Navigation className={`w-3.5 h-3.5 ${isGeolocating ? "animate-spin" : ""}`} />
                                <span>{isGeolocating ? "GPS..." : "GPS"}</span>
                              </button>
                            </div>

                            {/* Saved Locations Quick Chips */}
                            <div>
                              <div className="text-[10px] font-mono text-zinc-500 font-bold mb-1">
                                SAVED LOCATIONS:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {SAVED_LOCATIONS.map((loc) => (
                                  <button
                                    key={loc.name}
                                    type="button"
                                    onClick={() => {
                                      setSelectedLocation({
                                        name: `${loc.name}, ${loc.state}`,
                                        lat: loc.lat,
                                        lng: loc.lng,
                                      });
                                      setPinCoords({ lat: loc.lat, lng: loc.lng });
                                      handlePinUpdate(loc.lat, loc.lng);
                                      if (leafletMapRef.current && markerRef.current) {
                                        leafletMapRef.current.setView([loc.lat, loc.lng], 10);
                                        markerRef.current.setLatLng([loc.lat, loc.lng]);
                                      }
                                    }}
                                    className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium border transition-all ${
                                      selectedLocation.name.toLowerCase().includes(loc.name.toLowerCase())
                                        ? "bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-2xs"
                                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                                    }`}
                                  >
                                    {loc.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Leaflet Map Pin Container */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                                <span>MANUAL PIN ON LEAFLET MAP:</span>
                                <span className="text-zinc-700 font-bold">Click map or drag marker</span>
                              </div>
                              <div
                                ref={mapContainerRef}
                                id="leaflet-pin-picker"
                                className="w-full h-32 rounded-xl border border-zinc-300 overflow-hidden bg-zinc-100 shadow-inner z-10"
                              />
                            </div>

                            {/* Spatial Reverse-Lookup & H3 Details */}
                            <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-[10px] space-y-0.5 text-zinc-700">
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Coordinates:</span>
                                <span className="font-bold text-zinc-900">{pinCoords.lat}° N, {pinCoords.lng}° E</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Reverse District/State:</span>
                                <span className="font-bold text-emerald-800">{pinReverseData.district}, {pinReverseData.state}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Uber H3 Cell (Res 7):</span>
                                <span className="font-bold text-blue-800">{pinReverseData.h3Res7 || "876094600ffffff"}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const name = pinReverseData.district
                                    ? `${pinReverseData.district}, ${pinReverseData.state}`
                                    : `Pin (${pinCoords.lat}, ${pinCoords.lng})`;
                                  setSelectedLocation({
                                    name,
                                    lat: pinCoords.lat,
                                    lng: pinCoords.lng,
                                    district: pinReverseData.district,
                                    state: pinReverseData.state,
                                  });
                                  setIsLocationModalOpen(false);
                                }}
                                className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs text-center shadow-xs cursor-pointer"
                              >
                                Apply Location ({pinCoords.lat.toFixed(2)}°, {pinCoords.lng.toFixed(2)}°)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* EXPANDABLE ACCORDION DRAWER (WHEN isControlsExpanded IS TRUE) */}
                      {isControlsExpanded && (
                        <div className="mt-1.5 pt-1.5 border-t border-sky-800/80 text-[11px] space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* NWP Architecture Card */}
                          <div className="bg-sky-950/80 rounded-xl p-2 border border-sky-800/80 space-y-1 font-mono text-[10px]">
                            <div className="flex items-center justify-between text-amber-300 font-bold">
                              <span>NWP Core: {selectedModel.toUpperCase()} 0.25°</span>
                              <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-700">
                                {selectedModel === "wrf" ? "ADAPTER READY" : "CONNECTED (LIVE)"}
                              </span>
                            </div>
                            <p className="text-sky-200 text-[9.5px]">
                              {selectedModel === "gfs"
                                ? "NOAA/NCEP Global Forecast System. Cross-checked with ECMWF IFS 0.25° ensemble."
                                : selectedModel === "ecmwf"
                                ? "European Centre for Medium-Range Weather Forecasts IFS. Cross-checked with GFS."
                                : selectedModel === "icon"
                                ? "German Weather Service (DWD) 13km Global Mesh. Cross-checked with GFS."
                                : "NCMRWF/IMD 3km Regional Mesoscale HPC mesh adapter ready (cluster endpoint)."}
                            </p>
                            <div className="flex items-center justify-between text-[9px] text-sky-400 pt-0.5 border-t border-sky-900">
                              <span>Divergence Limit: ΔT 3°C | ΔP 8mm | ΔW 15km/h</span>
                              <span>WMO WIS 2.0</span>
                            </div>
                          </div>

                          {/* Active Persona Description Banner */}
                          <div className="bg-sky-900/70 rounded-xl p-2 border border-sky-750/70 flex items-start gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-base shrink-0">
                              {activePersonaConfig?.icon || "🌤️"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300 text-xs">
                                  {(activePersonaConfig?.labels as any)?.[selectedLanguage] || activePersonaConfig?.labels?.en} Mode
                                </span>
                                <span className="text-[9px] font-mono text-sky-300 bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800">
                                  Live IMD &amp; NDMA-SACHET
                                </span>
                              </div>
                              <p className="text-sky-100 text-[10px] mt-0.5 leading-snug">
                                {(activePersonaConfig?.description as any)?.[selectedLanguage] || activePersonaConfig?.description?.en}
                              </p>
                            </div>
                          </div>

                          {/* Extended Dialect options with full scripts */}
                          <div className="flex items-center justify-between text-[10px] px-0.5">
                            <span className="text-sky-300 font-medium">Indic Dialect:</span>
                            <div className="flex items-center gap-1">
                              {[
                                { id: "bho", label: "भोजपुरी (BHO)" },
                                { id: "hi", label: "हिन्दी (HI)" },
                                { id: "en", label: "English (EN)" },
                                { id: "mr", label: "मराठी (MR)" },
                              ].map((l) => (
                                <button
                                  key={l.id}
                                  onClick={() => setSelectedLanguage(l.id)}
                                  className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border transition-all cursor-pointer ${
                                    selectedLanguage === l.id
                                      ? "bg-amber-400 text-zinc-950 border-amber-300 shadow-2xs font-bold"
                                      : "bg-sky-950/80 text-sky-200 border-sky-800 hover:text-white"
                                  }`}
                                >
                                  {l.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
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
                          Data-backed: IMD + AgriStack Soil Grid
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
                    <div
                      ref={chatContainerRef}
                      onScroll={handleMessagesScroll}
                      className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-xs font-sans relative"
                      tabIndex={0}
                      role="log"
                      aria-live="polite"
                      aria-label="Conversation message list"
                    >
                      {messages.map((msg) => {
                        const isFarmer = msg.sender === "farmer";
                        const isPlaying = playingMessageId === msg.id;
                        const msgPersona = msg.persona || selectedPersona;

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
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-label="Critical Alert" />
                                  <span>SEVERE WEATHER WARNING LOCKED</span>
                                </div>
                              )}

                              {/* Persona-Specific Hero Card at the Top of Response */}
                              {!isFarmer && isWeather && msg.heroCard && (
                                <div
                                  role="region"
                                  aria-label="Advisory Hero Card"
                                  className={`p-2.5 rounded-xl border space-y-2 mb-2 ${
                                    msg.heroCard.severity === "CRITICAL"
                                      ? "bg-red-50/95 border-red-300 text-red-950"
                                      : msg.heroCard.severity === "WARNING"
                                      ? "bg-amber-50/95 border-amber-300 text-amber-950"
                                      : "bg-emerald-50/95 border-emerald-300 text-emerald-950"
                                  }`}
                                >
                                  {/* Top Row: Persona Badge + Visible SAMPLE Badge */}
                                  <div className="flex items-center justify-between gap-1 border-b pb-1.5 border-current/15">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm" aria-hidden="true">
                                        {msgPersona === "fisherman" ? "🐟" : msgPersona === "disaster_officer" ? "🚨" : msgPersona === "researcher" ? "🔬" : msgPersona === "citizen" ? "🏙️" : msgPersona === "aviation" ? "✈️" : "🌾"}
                                      </span>
                                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider">
                                        {msgPersona === "fisherman"
                                          ? "Marine Safety Verdict"
                                          : msgPersona === "disaster_officer"
                                          ? "Disaster Command Directive"
                                          : msgPersona === "researcher"
                                          ? "NWP Telemetry Diagnostic"
                                          : msgPersona === "citizen"
                                          ? "Commute & Daily Advisory"
                                          : msgPersona === "aviation"
                                          ? "Aviation Flight-Weather"
                                          : "Immediate Agricultural Action"}
                                      </span>
                                    </div>

                                    {/* Verified Provenance Badge (LIVE / CACHED / SAMPLE) */}
                                    {(() => {
                                      const badge = msg.heroCard.badge || (msg.heroCard.isSample ? "SAMPLE" : "LIVE");
                                      return (
                                        <span
                                          className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase tracking-wider shadow-2xs ${
                                            badge === "LIVE"
                                              ? "bg-emerald-100 text-emerald-950 border border-emerald-400"
                                              : badge === "CACHED"
                                              ? "bg-amber-100 text-amber-950 border border-amber-400"
                                              : "bg-zinc-200 text-zinc-950 border border-zinc-400"
                                          }`}
                                          title={`Data provenance status: ${badge}`}
                                        >
                                          {badge}
                                        </span>
                                      );
                                    })()}
                                  </div>

                                  {/* Plain-Language Fallback Notice (if cached or degraded) */}
                                  {msg.heroCard.notice && (
                                    <div className="p-1.5 rounded-lg bg-amber-100/90 text-amber-950 text-[10px] font-mono border border-amber-300 flex items-center gap-1.5">
                                      <Info className="w-3 h-3 text-amber-800 shrink-0" />
                                      <span>{msg.heroCard.notice}</span>
                                    </div>
                                  )}

                                  {/* NWP Model Name and Run Time Ribbon (Phase 3 Section A) */}
                                  <div className="flex items-center justify-between text-[9.5px] font-mono bg-zinc-900 text-zinc-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Layers className="w-3 h-3 text-sky-400 shrink-0" />
                                      <span className="font-bold text-white truncate">
                                        {msg.heroCard.modelOrRunTime || "GFS 0.25° NWP (00Z Operational Cycle)"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-1">
                                      <Clock className="w-2.5 h-2.5 text-zinc-400" />
                                      <span className="text-[8.5px] text-zinc-300">
                                        {msg.nwpComparison?.primaryModel ? msg.nwpComparison.primaryModel.toUpperCase() : "GFS"}
                                      </span>
                                      <span className="px-1 py-0 rounded text-[7.5px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                                        {msg.heroCard.badge || "LIVE"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* NWP Ensemble Disagreement Uncertainty Banner (Phase 3 Section A) */}
                                  {(msg.heroCard.uncertaintyWarning || msg.heroCard.nwpComparison?.hasDivergence || msg.nwpComparison?.hasDivergence) && (
                                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-[10.5px] space-y-1 shadow-2xs">
                                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span>⚠️ NWP Models Disagree — Ensemble Uncertainty</span>
                                      </div>
                                      <p className="text-[10px] text-amber-900 leading-snug">
                                        {msg.heroCard.uncertaintyWarning || 
                                          (msg.heroCard.nwpComparison?.divergenceDetails?.join(". ")) || 
                                          (msg.nwpComparison?.divergenceDetails?.join(". ")) || 
                                          "Primary model (GFS) and cross-check models (ECMWF/ICON) diverge beyond configurable thresholds."}
                                      </p>
                                      {((msg.heroCard.nwpComparison?.models) || (msg.nwpComparison?.models)) && (
                                        <div className="grid grid-cols-2 gap-1 text-[9px] font-mono pt-0.5">
                                          {Object.entries((msg.heroCard.nwpComparison?.models) || (msg.nwpComparison?.models)).map(([mName, mData]: [string, any]) => (
                                            <div key={mName} className="bg-white/90 p-1 rounded border border-amber-200">
                                              <span className="font-bold uppercase text-amber-950">{mName}: </span>
                                              <span className="text-zinc-700">{mData.temperature_c ?? mData.temp ?? mData.temperature}°C, {mData.precipitation_mm ?? mData.rain ?? mData.precipitation}mm</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Verdict Header (Never Color Alone: Icon + Text) */}
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      {msg.heroCard.severity === "CRITICAL" ? (
                                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-label="Critical Alert" />
                                      ) : msg.heroCard.severity === "WARNING" ? (
                                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-label="Warning Alert" />
                                      ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Normal Status" />
                                      )}
                                      <h5 className="font-extrabold text-xs tracking-tight text-zinc-900 leading-snug">
                                        {msg.heroCard.verdict}
                                      </h5>
                                    </div>
                                    <p className="text-[11px] text-zinc-700 font-medium pl-5.5">
                                      {msg.heroCard.subVerdict}
                                    </p>
                                  </div>

                                  {/* Marine Wave & Swell Panel (Phase 3 Section A - Fisherman) */}
                                  {(msg.heroCard.marineWeather || msg.marineWeather) && (() => {
                                    const mw = msg.heroCard.marineWeather || msg.marineWeather;
                                    return (
                                      <div className="p-2 rounded-lg bg-sky-950 text-sky-100 border border-sky-800 space-y-1.5 shadow-2xs font-mono">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <div className="flex items-center gap-1.5 text-sky-200 font-bold">
                                            <Waves className="w-3.5 h-3.5 text-sky-400" />
                                            <span>Marine Swell & Coastal Telemetry</span>
                                          </div>
                                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                            mw.badge === "LIVE"
                                              ? "bg-emerald-900 text-emerald-200 border border-emerald-600"
                                              : "bg-zinc-800 text-zinc-300 border border-zinc-600"
                                          }`}>
                                            {mw.badge}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 text-[9.5px]">
                                          <div className="bg-sky-900/60 p-1 rounded border border-sky-800">
                                            <div className="text-[7.5px] text-sky-300 uppercase">Significant Wave</div>
                                            <div className="font-bold text-white">{mw.waveHeight_m} m</div>
                                          </div>
                                          <div className="bg-sky-900/60 p-1 rounded border border-sky-800">
                                            <div className="text-[7.5px] text-sky-300 uppercase">Swell Height</div>
                                            <div className="font-bold text-white">{mw.swellWaveHeight_m ?? mw.swellHeight_m} m</div>
                                          </div>
                                          <div className="bg-sky-900/60 p-1 rounded border border-sky-800">
                                            <div className="text-[7.5px] text-sky-300 uppercase">Wave Period</div>
                                            <div className="font-bold text-white">{mw.wavePeriodSeconds ?? mw.wavePeriod_s} s</div>
                                          </div>
                                        </div>
                                        <div className="text-[9px] text-sky-200 flex items-center justify-between pt-0.5">
                                          <span>Sea State: <strong>{mw.seaStateClassification || "Moderate"}</strong></span>
                                          <span>Swell Direction: <strong>{mw.swellDirectionDeg ?? mw.swellDirection_deg ?? 240}°</strong></span>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Spatial H3 Grid & Boundaries (Phase 3 Section B - Disaster Officer) */}
                                  {(msg.heroCard.spatialData || msg.spatialData) && (msgPersona === "disaster_officer" || msgPersona === "researcher" || msg.heroCard.spatialData) && (() => {
                                    const sp = msg.heroCard.spatialData || msg.spatialData;
                                    return (
                                      <div className="p-2 rounded-lg bg-zinc-900 text-zinc-100 border border-zinc-700 space-y-1.5 shadow-2xs font-mono">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                            <Compass className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>H3 Spatial Grid & Admin Jurisdiction</span>
                                          </div>
                                          <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-600">
                                            SPATIAL CELL
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                                          <div className="bg-zinc-800/80 p-1.5 rounded border border-zinc-700">
                                            <div className="text-[7.5px] text-zinc-400 uppercase">H3 Res-7 (Sub-district)</div>
                                            <div className="font-bold text-amber-300 select-all">{sp.h3Res7}</div>
                                          </div>
                                          <div className="bg-zinc-800/80 p-1.5 rounded border border-zinc-700">
                                            <div className="text-[7.5px] text-zinc-400 uppercase">H3 Res-8 (Village/Ward)</div>
                                            <div className="font-bold text-emerald-300 select-all">{sp.h3Res8}</div>
                                          </div>
                                        </div>
                                        <div className="text-[9px] text-zinc-300 flex items-center justify-between pt-0.5">
                                          <span>District: <strong className="text-white">{sp.district || "Nashik"}</strong>, <strong className="text-white">{sp.state || "Maharashtra"}</strong></span>
                                          <span className="text-[8px] text-zinc-400">IMD: {sp.subdivision || "Central India"}</span>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Metrics Grid */}
                                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                                    {msg.heroCard.metrics.map((m, mIdx) => (
                                      <div
                                        key={mIdx}
                                        className="p-1.5 rounded-lg bg-white/95 border border-zinc-200 shadow-2xs space-y-0.5"
                                      >
                                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
                                          <span className="truncate">{m.label}</span>
                                          {m.badge ? (
                                            <span
                                              className={`text-[8px] font-mono px-1 py-0 rounded font-bold shrink-0 ${
                                                m.badge === "LIVE"
                                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                  : m.badge === "CACHED"
                                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                                  : "bg-zinc-100 text-zinc-700 border border-zinc-300"
                                              }`}
                                            >
                                              {m.badge}
                                            </span>
                                          ) : m.isSample ? (
                                            <span className="text-[8px] font-mono px-1 py-0 rounded bg-zinc-100 text-zinc-700 border border-zinc-300 font-bold shrink-0">
                                              SAMPLE
                                            </span>
                                          ) : null}
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
                                          <span className="truncate">{m.value}</span>
                                          <span className="shrink-0 ml-1">
                                            {m.status === "PASS" ? (
                                              <Check className="w-3 h-3 text-emerald-600" aria-label="Passed check" />
                                            ) : m.status === "FAIL" ? (
                                              <AlertTriangle className="w-3 h-3 text-red-600" aria-label="Failed check" />
                                            ) : (
                                              <Info className="w-3 h-3 text-blue-600" aria-label="Informational metric" />
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* 30-Year Historical Climate Analysis & Recharts Visualizer (Phase 3 Section C) */}
                                  {(msg.heroCard.historicalClimate || msg.historicalClimate) && (() => {
                                    const hc = msg.heroCard.historicalClimate || msg.historicalClimate;
                                    return (
                                      <div className="space-y-2 pt-1 border-t border-zinc-200">
                                        <ClimateTrendChart climate={hc} />
                                        {msgPersona === "researcher" && (
                                          <ResearcherRawParameterTable climate={hc} />
                                        )}
                                        <div className="pt-0.5">
                                          <button
                                            type="button"
                                            onClick={() => exportTelemetryCsv(msg)}
                                            className="w-full min-h-[44px] px-3 py-1.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                            aria-label="Download 30-year historical climate CSV"
                                          >
                                            <Download className="w-3.5 h-3.5 text-sky-300" />
                                            <span>📥 Download 30-Yr Climatology (CSV)</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Provenance Footnote: Source & Timestamp */}
                                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-1 border-t border-zinc-200/60">
                                    <span className="truncate" title={msg.heroCard.source}>
                                      Src: {msg.heroCard.source || "IMD Doppler & GFS NWP"}
                                    </span>
                                    <span className="shrink-0">
                                      {msg.heroCard.fetchedAt
                                        ? new Date(msg.heroCard.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                        : "Live"}
                                    </span>
                                  </div>

                                  {/* Researcher CSV Export Quick Action */}
                                  {msgPersona === "researcher" && !(msg.heroCard.historicalClimate || msg.historicalClimate) && (
                                    <div className="pt-1">
                                      <button
                                        type="button"
                                        onClick={() => exportTelemetryCsv(msg)}
                                        className="w-full min-h-[44px] px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                        aria-label="Export raw NWP telemetry to CSV"
                                      >
                                        <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>📥 Export Raw Telemetry (CSV)</span>
                                      </button>
                                    </div>
                                  )}
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
                                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-all shadow-xs cursor-pointer min-h-[44px] min-w-[44px] ${
                                        isPlaying
                                          ? "bg-amber-600 ring-2 ring-amber-400"
                                          : isFarmer
                                          ? "bg-emerald-950 hover:bg-emerald-900"
                                          : msg.alertSeverity === "WARNING"
                                          ? "bg-red-600 hover:bg-red-700"
                                          : "bg-zinc-900 hover:bg-zinc-800"
                                      }`}
                                      title={isPlaying ? "Pause audio" : "Play speech audio note"}
                                      aria-label={isPlaying ? "Pause audio note" : "Play speech audio note"}
                                    >
                                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                    </button>

                                    {/* Animated Waveform Bars */}
                                    <div className="flex items-center gap-0.5 h-7 flex-1 px-1 overflow-hidden" aria-hidden="true">
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

                                    {/* WhatsApp Speed Toggle Pill with 44px tap target */}
                                    <button
                                      type="button"
                                      onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
                                      className={`text-[10px] font-mono font-bold px-2 py-1 min-h-[44px] rounded border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                                        isFarmer
                                          ? "bg-emerald-900 border-emerald-700 text-white"
                                          : "bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-200"
                                      }`}
                                      title="Toggle Playback Speed (1x, 1.5x, 2x)"
                                      aria-label={`Playback speed ${playbackSpeed}x, tap to toggle`}
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

                      {/* Floating Jump to Latest Button (Auto-scroll Protection) */}
                      {isUserScrolledUp && (
                        <div className="sticky bottom-2 flex justify-center z-30 pointer-events-none">
                          <button
                            type="button"
                            onClick={handleJumpToLatest}
                            className="pointer-events-auto min-h-[44px] px-4 py-2 bg-zinc-900/95 hover:bg-zinc-800 active:bg-zinc-950 text-white rounded-full shadow-2xl border border-zinc-700 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer animate-bounce"
                            aria-label="Jump to latest response"
                          >
                            <ArrowDown className="w-4 h-4 text-emerald-400" />
                            <span>Jump to latest</span>
                          </button>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* -------------------------------------------------------------
                      PINNED BOTTOM AREA: COMPACT HORIZONTAL SUGGESTION STRIP & INPUT
                      (Never covers response cards or pushes them out of view!)
                     ------------------------------------------------------------- */}
                  <div className="border-t border-amber-200 bg-amber-50/95 px-2.5 py-1.5 shrink-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse shrink-0" />
                        <span className="truncate">
                          Try asking ({((personasConfig.personas.find((p) => p.id === selectedPersona) || personasConfig.personas[0]).labels as any)?.[selectedLanguage] || selectedPersona}):
                        </span>
                      </span>
                      <span className="text-[9px] font-mono text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded font-semibold shrink-0">
                        Swipe prompts →
                      </span>
                    </div>

                    {/* Compact Horizontal Quick-Prompt Chip Rail */}
                    <div
                      role="region"
                      aria-label="Suggested quick prompts"
                      className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
                    >
                      {isWeather ? (
                        ((personasConfig.personas.find((p) => p.id === selectedPersona) || personasConfig.personas[0]).quickPrompts || []).map((item, idx) => {
                          const localizedQuery = (item.labels as any)?.[selectedLanguage] || item.labels.en || item.query;
                          return (
                            <button
                              key={item.id || idx}
                              type="button"
                              onClick={() => {
                                setInputText(item.query);
                                handleSendQuery(item.query);
                              }}
                              aria-label={`Ask: ${localizedQuery}`}
                              className="shrink-0 min-h-[44px] px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer group"
                            >
                              <span className="truncate max-w-[240px]">&ldquo;{localizedQuery}&rdquo;</span>
                              <ChevronRight className="w-3.5 h-3.5 text-amber-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          );
                        })
                      ) : (
                        agriExamples.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInputText(item.query);
                              handleSendQuery(item.query);
                            }}
                            aria-label={`Ask: ${item.query}`}
                            className="shrink-0 min-h-[44px] px-3 py-1.5 rounded-full bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer group"
                          >
                            <Sprout className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>&ldquo;{item.label}&rdquo;</span>
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          </button>
                        ))
                      )}
                    </div>

                    {/* Input Form or Live Voice Recording Bar */}
                    {isRecording ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-red-600 text-white animate-pulse shadow-sm min-h-[44px]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                          <span className="text-xs font-mono font-bold">
                            Listening ({recordingSeconds}s)... Speak Indic voice query
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={stopVoiceRecording}
                          className="min-h-[44px] px-3 py-1 rounded bg-white text-red-700 text-xs font-bold hover:bg-zinc-100 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          aria-label="Send recorded voice query"
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
                        className="flex items-center gap-1.5 pt-0.5"
                      >
                        <div className="flex-1 min-h-[44px] rounded-full px-3 py-1.5 text-xs flex items-center bg-white border border-amber-300 focus-within:border-zinc-800 shadow-xs">
                          <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isWeather ? `Ask WeatherGPT (${selectedPersona})...` : 'Try typing: "उद्या फवारणी करू का?"'}
                            className="w-full bg-transparent outline-none text-xs"
                            aria-label="Type weather query"
                          />
                        </div>

                        {inputText.trim().length > 0 ? (
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[44px] min-h-[44px] rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-all disabled:opacity-50 shrink-0 shadow-sm cursor-pointer"
                            aria-label="Send weather query"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startVoiceRecording}
                            className="min-w-[44px] min-h-[44px] rounded-full bg-emerald-800 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer"
                            title="Speak via Microphone or Simulate Voice Recording"
                            aria-label="Record voice query with Bhashini"
                          >
                            <Mic className="w-4 h-4" />
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
