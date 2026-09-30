import React, { useState } from 'react'
import {
  AlertTriangle,
  CloudRain,
  Layers,
  Zap,
  Users,
  Mic,
  SlidersHorizontal,
  History,
  Camera,
  ShieldCheck,
  Landmark,
  Sparkles,
  ChevronRight,
  Check,
  MapPin,
  Satellite,
  Leaf,
  MessageCircle,
  Package,
  TrendingUp,
  Clock,
  Info,
  X,
  CheckCircle2,
  Activity,
  Share2,
  Grid,
  Radio,
  Compass,
  ArrowRight,
  Maximize2
} from 'lucide-react'
import './index.css'

export default function App() {
  // Navigation & View Mode State
  const [viewMode, setViewMode] = useState('graph') // 'dashboard' | 'graph'
  const [lang, setLang] = useState('en') // 'en' | 'hi' | 'mr'

  // Application Feature States
  const [explainAlert, setExplainAlert] = useState(false)
  const [alertAcked, setAlertAcked] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [selectedModule, setSelectedModule] = useState(null)
  const [showFullTimeline, setShowFullTimeline] = useState(false)
  const [transportBooked, setTransportBooked] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // Obsidian Graph Selected Node State
  const [selectedGraphNode, setSelectedGraphNode] = useState('center_field')

  // Translations
  const t = {
    en: {
      plot: "Plot 4B",
      village: "Vadgaon Shinde",
      area: "1.2 ha",
      crop: "Soybean",
      stage: "Day 44 (Pod Formation)",
      sync: "Sentinel-2 Synced 2h ago",
      secondBrainTitle: "SECOND BRAIN ADVISORY",
      secondBrainText: "Micro-rain predicted tonight (03:00 AM) + Fungicide logged 24h ago. Delay scheduled morning irrigation to prevent root leaching.",
      ackBtn: "Acknowledge",
      explainBtn: "Explain Logic",
      constraintsTitle: "REAL-TIME OPERATIONAL CONSTRAINTS",
      memoryTitle: "EPISODIC FARM MEMORY",
      mandiTitle: "MARKET REALIZATION & ARBITRAGE",
      capabilitiesTitle: "FUTURE SCOPE & SAFETY-NETS",
      holdToTalk: "Hold to log farm action in your dialect...",
      listeningText: "Listening in Marathi / Hindi / English...",
      lockedSlot: "Transport Slot Locked for APMC Shirur",
      lockBtn: "Lock Transport Slot",
      auditTrailBtn: "View full season audit trail (14 entries)",
      graphTitle: "OBSIDIAN FARM GRAPH & DIGITAL TWIN",
      graphSubtitle: "Interactive connected view of Plot 4B with real-time data flows",
    },
    hi: {
      plot: "प्लॉट 4B",
      village: "वडगांव शिंदे",
      area: "1.2 हे०",
      crop: "सोयाबीन",
      stage: "दिन 44 (फली निर्माण)",
      sync: "Sentinel-2 सिंक 2h पूर्व",
      secondBrainTitle: "द्वितीय मस्तिष्क परामर्श",
      secondBrainText: "आज रात (03:00 AM) हल्की वर्षा का पूर्वानुमान + 24 घंटे पहले कवकनाशी दर्ज। जड़ों के निक्षालन को रोकने के लिए सुबह की सिंचाई स्थगित करें।",
      ackBtn: "स्वीकार करें",
      explainBtn: "तर्क समझें",
      constraintsTitle: "वास्तविक समय परिचालन सीमाएं",
      memoryTitle: "प्रासंगिक खेत स्मृति",
      mandiTitle: "मंडी मूल्य और मध्यस्थता विश्लेषण",
      capabilitiesTitle: "भविष्य की क्षमताएं एवं सुरक्षा",
      holdToTalk: "अपनी बोली में कृषि कार्य दर्ज करने के लिए दबाएं...",
      listeningText: "सुन रहा है... मराठी / हिंदी / अंग्रेजी में बोलें...",
      lockedSlot: "APMC शिरूर के लिए परिवहन स्लॉट बुक किया गया",
      lockBtn: "परिवहन स्लॉट लॉक करें",
      auditTrailBtn: "पूरा सीज़न ऑडिट ट्रेल देखें (14 प्रविष्टियां)",
      graphTitle: "ऑब्सीडियन खेत ग्राफ और डिजिटल जुड़वां",
      graphSubtitle: "वास्तविक समय डेटा प्रवाह के साथ प्लॉट 4B का इंटरैक्टिव जुड़ा हुआ दृश्य",
    },
    mr: {
      plot: "प्लॉट 4B",
      village: "वडगाव शिंदे",
      area: "1.2 हे०",
      crop: "सोयाबीन",
      stage: "दिवस 44 (शेंग निर्मिती)",
      sync: "Sentinel-2 सिंक 2 तास पूर्वी",
      secondBrainTitle: "सेकंड ब्रेन सल्ला",
      secondBrainText: "आज रात्री (03:00 AM) हलक्या पावसाचा अंदाज + 24 तासांपूर्वी बुरशीनाशक फवारले. मुळांचे नुकसान टाळण्यासाठी सकाळचे सिंचन पुढे ढकलून द्या.",
      ackBtn: "स्वीकारले",
      explainBtn: "तर्क स्पष्ट करा",
      constraintsTitle: "रिअल-टाईम शेती मर्यादा",
      memoryTitle: "शेती स्मृती नोंदी",
      mandiTitle: "बाजारभाव व नफा तुलना",
      capabilitiesTitle: "भविष्यातील क्षमता व सुरक्षा",
      holdToTalk: "तुमच्या भाषेत शेतीची कृती नोंदवण्यासाठी दाबा...",
      listeningText: "ऐकत आहे... मराठी / हिंदी / इंग्रजीत बोला...",
      lockedSlot: "APMC शिरूर साठी वाहतूक स्लॉट निश्चित केला",
      lockBtn: "वाहतूक स्लॉट आरक्षित करा",
      auditTrailBtn: "पूर्ण हंगाम ऑडिट ट्रेल पहा (14 नोंदी)",
      graphTitle: "ऑब्सीडियन शेती ग्राफ व डिजिटल ट्विन",
      graphSubtitle: "प्लॉट 4B ची रिअल-टाईम डेटा कनेक्शन जोडलेली एकच स्क्रीन",
    }
  }[lang]

  // Simulated mic voice hold
  const handleMicStart = () => {
    setIsListening(true)
    setTranscription('')
    const phrases = [
      "आज सकाळी उत्तरेकडील क्षेत्रात २५० मिली मैंकोझेब फवारले...",
      "Sprayed 250ml Mancozeb in North Quadrant...",
      "50 किलो डीएपी खत शेतात टाकले..."
    ]
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]
    let currentText = ''
    let idx = 0
    const interval = setInterval(() => {
      if (idx < randomPhrase.length) {
        currentText += randomPhrase[idx]
        setTranscription(currentText)
        idx++
      } else {
        clearInterval(interval)
      }
    }, 40)
  }

  const handleMicEnd = () => {
    setIsListening(false)
  }

  // Obsidian Graph Node Data Definitions
  const graphNodes = [
    {
      id: 'center_field',
      type: 'hub',
      title: 'Plot 4B Field Map Twin',
      subtitle: 'Vadgaon Shinde • 1.2 ha',
      icon: MapPin,
      badge: 'Central Twin',
      badgeColor: 'emerald',
      detail: 'Cadastral Survey #4B. Crop: Soybean (Day 44 Pod Formation). Sub-surface LoRa Grid Active.',
      metrics: [
        { label: 'Soil Health', val: 'Optimal (pH 6.8)' },
        { label: 'NDVI Index', val: '0.78 (Healthy Crop)' }
      ]
    },
    {
      id: 'weather',
      title: 'Micro-Climate Engine',
      subtitle: '1x1 km IMD Model',
      icon: CloudRain,
      badge: 'Rain Alert',
      badgeColor: 'sky',
      detail: 'Predicts 2.4mm micro-rain tonight at 03:00 AM within 1km radius (+88% probability).',
      metrics: [
        { label: 'Temp', val: '28°C' },
        { label: 'Humidity', val: '84%' }
      ]
    },
    {
      id: 'soil_lora',
      title: 'Sub-Surface LoRa Sensor',
      subtitle: 'Panchayat Node #04',
      icon: Layers,
      badge: '41% Moisture',
      badgeColor: 'emerald',
      detail: 'Calibrated root-zone sensor placed at 15cm depth. Soil moisture optimal for pod growth.',
      metrics: [
        { label: 'Battery', val: '94%' },
        { label: 'Signal', val: '-82 dBm' }
      ]
    },
    {
      id: 'power_grid',
      title: '3-Phase Power Feeder',
      subtitle: 'MSEDCL Rural Feeder',
      icon: Zap,
      badge: 'Active (6h left)',
      badgeColor: 'amber',
      detail: 'Power active until 01:30 PM. 6 hours window remaining for automated pump scheduling.',
      metrics: [
        { label: 'Voltage', val: '415V' },
        { label: 'Frequency', val: '50.1 Hz' }
      ]
    },
    {
      id: 'labor_pool',
      title: 'Labor Availability',
      subtitle: 'MGNREGA Cycle',
      icon: Users,
      badge: '25% Capacity',
      badgeColor: 'rose',
      detail: 'Local labor constrained due to active MGNREGA canal work until Thursday.',
      metrics: [
        { label: 'Workers Avail.', val: '3 workers' },
        { label: 'Daily Wage', val: '₹380/day' }
      ]
    },
    {
      id: 'ai_advisory',
      title: 'Second Brain AI Advisory',
      subtitle: 'Multi-Factor Engine',
      icon: Sparkles,
      badge: 'High Confidence',
      badgeColor: 'amber',
      detail: 'Advises postponing morning irrigation by 18 hours to avoid fungicide wash-off & save ~14 kWh electricity.',
      metrics: [
        { label: 'Decision Rule', val: 'Rule #149' },
        { label: 'Water Saved', val: '12,000 Liters' }
      ]
    },
    {
      id: 'farm_memory',
      title: 'Episodic Farm Memory',
      subtitle: 'Dialect Voice Logs',
      icon: MessageCircle,
      badge: '2 Logs Active',
      badgeColor: 'emerald',
      detail: 'Logged: 250ml Mancozeb spray yesterday in Marathi & 50kg DAP fertilizer application 3 days ago in Hindi.',
      metrics: [
        { label: 'Voice Mode', val: 'WhatsApp' },
        { label: 'Audit Trail', val: '14 Entries' }
      ]
    },
    {
      id: 'mandi_arbitrage',
      title: 'Mandi Arbitrage Engine',
      subtitle: 'APMC Shirur vs Pune',
      icon: TrendingUp,
      badge: '+₹250/q Gain',
      badgeColor: 'emerald',
      detail: 'Net realization at APMC Shirur is ₹2,260/q (Freight ₹120) vs APMC Pune ₹2,010/q (Freight ₹140).',
      metrics: [
        { label: 'Gross Shirur', val: '₹2,380/q' },
        { label: 'Net Difference', val: '+₹250/q' }
      ]
    },
    {
      id: 'safety_net',
      title: 'Safety Net & Beta Modules',
      subtitle: 'PMFBY & Leaf Pest Scan',
      icon: ShieldCheck,
      badge: 'Beta Active',
      badgeColor: 'violet',
      detail: 'Auto-intimation insurance claim pre-filled if rain > 65mm. Visual leaf pest scan ready.',
      metrics: [
        { label: 'PMFBY Claim', val: 'Pre-filled' },
        { label: 'SHC Soil NPK', val: 'Synced' }
      ]
    }
  ]

  const activeNodeData = graphNodes.find(n => n.id === selectedGraphNode) || graphNodes[0]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 cadastral-grid selection:bg-emerald-500 selection:text-zinc-950 pb-36">
      {/* Outer Container (Mobile-first with sleek max width) */}
      <div className="max-w-md mx-auto min-h-screen px-4 pt-4 pb-12 flex flex-col gap-4">
        
        {/* ── TOP NAVIGATION & VIEW MODE SWITCHER HEADER ── */}
        <header className="glass-card rounded-3xl p-4 flex flex-col gap-3 border border-white/10">
          {/* Top Bar: Plot identifier & View Switcher */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                {t.plot}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/90 text-zinc-300 border border-white/10">
                <MapPin className="w-3 h-3 text-emerald-400" />
                {t.village}
              </span>
            </div>

            {/* Language Switcher Pill */}
            <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-full border border-white/10 text-[11px] font-semibold">
              {[
                { key: 'en', label: 'EN' },
                { key: 'hi', label: 'हिं' },
                { key: 'mr', label: 'मरा' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setLang(item.key)}
                  className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
                    lang === item.key
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle Bar: [ Dashboard View | Field Graph View ] */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center bg-zinc-950 p-1 rounded-2xl border border-white/10 w-full">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  viewMode === 'dashboard'
                    ? 'bg-zinc-800 text-emerald-400 border border-white/10 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Dashboard View
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  viewMode === 'graph'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                Field Graph View
              </button>
            </div>
          </div>
        </header>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MODE A: OBSIDIAN-STYLE FARM GRAPH VIEW (ONE-VIEW FIELD MAP)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {viewMode === 'graph' && (
          <section className="flex flex-col gap-3 animate-fadeIn">
            {/* Graph Header Label */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xs font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  {t.graphTitle}
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">{t.graphSubtitle}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                8 CONNECTIONS
              </span>
            </div>

            {/* Canvas Container with Obsidian Graph View */}
            <div className="glass-card rounded-3xl p-4 border border-white/15 relative overflow-hidden min-h-[520px] flex flex-col justify-between">
              {/* Topographic Satellite Canvas Layer */}
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-900/60 to-zinc-950/90 pointer-events-none" />

              {/* Dynamic Connecting SVG Lines with Animated Flow Arrows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
                  </marker>
                  <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
                  </marker>
                  <marker id="arrow-sky" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                  </marker>
                  <marker id="arrow-violet" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa" />
                  </marker>
                </defs>

                {/* Flow lines from Satellite Nodes to Central Field Map */}
                <g strokeWidth="1.5" opacity="0.65">
                  {/* Weather -> Central Field */}
                  <line x1="20%" y1="12%" x2="50%" y2="40%" stroke="#38bdf8" className="animate-flow-line" markerEnd="url(#arrow-sky)" />
                  {/* AI Advisory -> Central Field */}
                  <line x1="80%" y1="12%" x2="50%" y2="40%" stroke="#fbbf24" className="animate-flow-line" markerEnd="url(#arrow-amber)" />
                  {/* Root Soil Moisture -> Central Field */}
                  <line x1="88%" y1="38%" x2="50%" y2="40%" stroke="#34d399" className="animate-flow-line" markerEnd="url(#arrow-emerald)" />
                  {/* Power Grid -> Central Field */}
                  <line x1="82%" y1="68%" x2="50%" y2="40%" stroke="#fbbf24" className="animate-flow-line" markerEnd="url(#arrow-amber)" />
                  {/* Mandi Arbitrage -> Central Field */}
                  <line x1="50%" y1="88%" x2="50%" y2="40%" stroke="#34d399" className="animate-flow-line" markerEnd="url(#arrow-emerald)" />
                  {/* Farm Memory -> Central Field */}
                  <line x1="18%" y1="68%" x2="50%" y2="40%" stroke="#34d399" className="animate-flow-line" markerEnd="url(#arrow-emerald)" />
                  {/* Labor Pool -> Central Field */}
                  <line x1="12%" y1="38%" x2="50%" y2="40%" stroke="#fb7185" strokeDasharray="4 4" markerEnd="url(#arrow-amber)" />
                  {/* Safety Net -> Central Field */}
                  <line x1="50%" y1="8%" x2="50%" y2="40%" stroke="#a78bfa" className="animate-flow-line" markerEnd="url(#arrow-violet)" />
                </g>
              </svg>

              {/* ── GRAPH NODES LAYOUT ── */}
              <div className="relative z-10 grid grid-cols-3 gap-2 h-full min-h-[460px] items-center">
                
                {/* TOP ROW NODES */}
                {/* Node 1: Micro Climate */}
                <button
                  onClick={() => setSelectedGraphNode('weather')}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedGraphNode === 'weather'
                      ? 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-500/20 scale-105 ring-2 ring-sky-400/50'
                      : 'bg-zinc-900/90 border-white/10 hover:border-sky-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CloudRain className="w-4 h-4 text-sky-400" />
                    <span className="text-[9px] font-bold text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded-full">Rain</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-100 truncate">Weather IMD</div>
                    <div className="text-[10px] text-zinc-300">2.4mm @ 03 AM</div>
                  </div>
                </button>

                {/* Node 8: Safety Nets (Top Center) */}
                <button
                  onClick={() => setSelectedGraphNode('safety_net')}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedGraphNode === 'safety_net'
                      ? 'bg-violet-500/20 border-violet-400 shadow-lg shadow-violet-500/20 scale-105 ring-2 ring-violet-400/50'
                      : 'bg-zinc-900/90 border-white/10 hover:border-violet-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span className="text-[9px] font-bold text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded-full">Beta</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-100 truncate">PMFBY & Pest</div>
                    <div className="text-[10px] text-zinc-300">Auto-Claim Trigger</div>
                  </div>
                </button>

                {/* Node 5: Second Brain AI Advisory */}
                <button
                  onClick={() => setSelectedGraphNode('ai_advisory')}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedGraphNode === 'ai_advisory'
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400/50'
                      : 'bg-zinc-900/90 border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full">AI Alert</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-100 truncate">Second Brain</div>
                    <div className="text-[10px] text-amber-300 font-medium">Delay Irrigation</div>
                  </div>
                </button>

                {/* MIDDLE ROW NODES */}
                {/* Node 4: Labor Pool */}
                <button
                  onClick={() => setSelectedGraphNode('labor_pool')}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedGraphNode === 'labor_pool'
                      ? 'bg-rose-500/20 border-rose-400 shadow-lg shadow-rose-500/20 scale-105 ring-2 ring-rose-400/50'
                      : 'bg-zinc-900/90 border-white/10 hover:border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Users className="w-4 h-4 text-rose-400" />
                    <span className="text-[9px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-full">25%</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-100 truncate">Labor Pool</div>
                    <div className="text-[10px] text-zinc-300">MGNREGA Constraint</div>
                  </div>
                </button>

                {/* 🌟 CENTER HUB NODE: FIELD MAP DIGITAL TWIN 🌟 */}
                <button
                  onClick={() => setSelectedGraphNode('center_field')}
                  className={`col-span-1 p-3 rounded-3xl text-center border transition-all flex flex-col items-center justify-center gap-2 h-32 relative overflow-hidden ${
                    selectedGraphNode === 'center_field'
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-2xl shadow-emerald-500/40 scale-105 ring-4 ring-emerald-500/30'
                      : 'bg-zinc-900/95 border-emerald-500/40 hover:border-emerald-400'
                  }`}
                >
                  {/* Pulse Dot Indicator */}
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>

                  <div className="p-2 rounded-2xl bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30">
                    <MapPin className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  <div>
                    <div className="text-xs font-extrabold text-white tracking-tight">FIELD MAP TWIN</div>
                    <div className="text-[10px] font-semibold text-emerald-400 mt-0.5">Plot 4B (1.2 ha)</div>
                  </div>

                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Day 44 Soybean
                  </span>
                </button>

                {/* Node 2: Soil Moisture */}
                <button
                  onClick={() => setSelectedGraphNode('soil_lora')}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedGraphNode === 'soil_lora'
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-emerald-400/50'
                      : 'bg-zinc-900/90 border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">41%</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-100 truncate">Root Soil LoRa</div>
                    <div className="text-[10px] text-zinc-300">Optimal Moisture</div>
                  </div>
                </button>

                {/* BOTTOM ROW NODES */}
                {/* Node 6: Farm Memory */}
                <button
                  onClick={() => setSelectedGraphNode('farm_memory')}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedGraphNode === 'farm_memory'
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-emerald-400/50'
                      : 'bg-zinc-900/90 border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">Memory</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-100 truncate">Farm Memory</div>
                    <div className="text-[10px] text-zinc-300">Mancozeb Sprayed</div>
                  </div>
                </button>

                {/* Node 7: Mandi Arbitrage (Bottom Center) */}
                <button
                  onClick={() => setSelectedGraphNode('mandi_arbitrage')}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedGraphNode === 'mandi_arbitrage'
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-emerald-400/50'
                      : 'bg-zinc-900/90 border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">+₹250</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-100 truncate">Mandi Arbitrage</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">APMC Shirur Best</div>
                  </div>
                </button>

                {/* Node 3: Power Feeder */}
                <button
                  onClick={() => setSelectedGraphNode('power_grid')}
                  className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedGraphNode === 'power_grid'
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400/50'
                      : 'bg-zinc-900/90 border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full">6h left</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-zinc-100 truncate">3-Phase Power</div>
                    <div className="text-[10px] text-amber-300 font-medium">Off @ 01:30 PM</div>
                  </div>
                </button>
              </div>

              {/* ── INSPECTOR HUD SIDE/BOTTOM CARD FOR SELECTED GRAPH NODE ── */}
              <div className="relative z-20 mt-3 p-3.5 rounded-2xl bg-zinc-950/95 border border-white/15 backdrop-blur-xl animate-fadeIn space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <activeNodeData.icon className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="text-xs font-bold text-zinc-100">{activeNodeData.title}</h3>
                      <p className="text-[10px] text-zinc-400">{activeNodeData.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeNodeData.badge}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                  {activeNodeData.detail}
                </p>

                {/* Node Metrics Row */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {activeNodeData.metrics.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">{m.label}:</span>
                      <span className="font-bold text-zinc-100">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MODE B: STANDARD DASHBOARD LIST VIEW
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {viewMode === 'dashboard' && (
          <>
            {/* ── 2. THE SECOND BRAIN CONTEXTUAL DECISION BANNER ── */}
            {!alertAcked && (
              <section className="glass-card rounded-3xl p-4.5 border border-amber-500/30 bg-amber-500/5 relative overflow-hidden transition-all duration-300">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 shrink-0 text-amber-400 mt-0.5">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                        {t.secondBrainTitle}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        High Confidence AI
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                      {t.secondBrainText}
                    </p>

                    {/* Expanded Explain Logic Panel */}
                    {explainAlert && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-zinc-950/80 border border-amber-500/20 text-xs text-zinc-300 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between font-semibold text-amber-300 pb-1.5 border-b border-white/5">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Multi-Factor Reasoning Engine
                          </span>
                          <span className="text-[10px] text-zinc-400 font-normal">Model v4.2</span>
                        </div>

                        <ul className="space-y-1.5 text-[11px] leading-relaxed text-zinc-300 pt-0.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span><strong className="text-zinc-100">Weather Telemetry:</strong> IMD 1x1km grid models 2.4mm rain at 03:00 AM (+88% probability).</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span><strong className="text-zinc-100">Chemical Log:</strong> Mancozeb (250ml) sprayed yesterday requires 48h absorption window.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span><strong className="text-zinc-100">Soil Moisture:</strong> Sub-surface LoRa sensor reports 41% root moisture (optimal).</span>
                          </li>
                          <li className="flex items-start gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span><strong>Recommendation:</strong> Postpone 06:00 AM pump cycle by 18 hours to prevent fungicide run-off and save ~14 kWh electricity.</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-1">
                      <button
                        onClick={() => setAlertAcked(true)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {t.ackBtn}
                      </button>

                      <button
                        onClick={() => setExplainAlert(!explainAlert)}
                        className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                        {explainAlert ? 'Hide Logic' : t.explainBtn}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── 3. REAL-TIME OPERATIONAL CONSTRAINTS (4-GRID TELEMETRY) ── */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  {t.constraintsTitle}
                </h2>
                <span className="text-[10px] text-zinc-400 font-mono">LIVE EDGE MESH</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Tile 1: Weather */}
                <div className="glass-card glass-card-hover rounded-2xl p-3.5 flex flex-col justify-between gap-2 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <CloudRain className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      1x1km IMD
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Downscaled Forecast</div>
                    <div className="text-sm font-bold text-zinc-100 tracking-tight mt-0.5">
                      2.4mm <span className="text-xs font-normal text-zinc-400">at 03:00 AM</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Temp: <span className="text-zinc-200 font-medium">28°C</span> &bull; Humidity: <span className="text-zinc-200 font-medium">84%</span>
                    </div>
                  </div>
                </div>

                {/* Tile 2: Soil Moisture */}
                <div className="glass-card glass-card-hover rounded-2xl p-3.5 flex flex-col justify-between gap-2 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Optimal
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Root-Zone Moisture</div>
                    <div className="text-sm font-bold text-zinc-100 tracking-tight mt-0.5">
                      41% <span className="text-xs font-normal text-emerald-400">(Sub-surface)</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 truncate">
                      Panchayat LoRa Node #04
                    </div>
                  </div>
                </div>

                {/* Tile 3: Power Feeder */}
                <div className="glass-card glass-card-hover rounded-2xl p-3.5 flex flex-col justify-between gap-2 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Now
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">3-Phase Power Grid</div>
                    <div className="text-sm font-bold text-zinc-100 tracking-tight mt-0.5">
                      Cuts off 01:30 PM
                    </div>
                    <div className="text-[11px] text-amber-400 mt-1 font-medium">
                      6h window remaining
                    </div>
                  </div>
                </div>

                {/* Tile 4: Labor Availability */}
                <div className="glass-card glass-card-hover rounded-2xl p-3.5 flex flex-col justify-between gap-2 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Constrained
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Labor Availability Index</div>
                    <div className="text-sm font-bold text-zinc-100 tracking-tight mt-0.5">
                      25% Capacity
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 truncate">
                      MGNREGA active till Thu
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 4. EPISODIC FARM MEMORY TIMELINE ── */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-emerald-400" />
                  {t.memoryTitle}
                </h2>
                <span className="text-[10px] text-zinc-400 font-mono">VOICE PARSED LOGS</span>
              </div>

              <div className="glass-card rounded-3xl p-4 border border-white/10 flex flex-col gap-3">
                {/* Timeline Item 1 */}
                <div className="relative pl-6 pb-3 border-l-2 border-emerald-500/40 space-y-1">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
                    <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300">Yesterday, 04:15 PM</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] border border-white/5 font-mono">
                      <MessageCircle className="w-2.5 h-2.5 text-emerald-400" />
                      WhatsApp Voice
                    </span>
                  </div>

                  <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                    Action: <span className="text-emerald-300 font-semibold">Sprayed 250ml Mancozeb (North Quadrant)</span>
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>Logged in Marathi (मराठी)</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified by Twin
                    </span>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative pl-6 space-y-1 border-l-2 border-zinc-800">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center">
                    <Package className="w-2.5 h-2.5 text-zinc-300" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">3 Days Ago</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] border border-white/5 font-mono">
                      Voice Note
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                    Action: <span className="text-zinc-100 font-semibold">50kg DAP Fertilizer applied</span>
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>Soil moisture was 38%</span>
                    <span>&bull;</span>
                    <span>Logged in Hindi (हिंदी)</span>
                  </div>
                </div>

                {/* Full Audit Trail Link */}
                <button
                  onClick={() => setShowFullTimeline(true)}
                  className="mt-1 pt-2 border-t border-white/5 text-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1 transition-colors"
                >
                  {t.auditTrailBtn}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* ── 5. MARKET REALIZATION & MANDI ARBITRAGE CARD ── */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  {t.mandiTitle}
                </h2>
                <span className="text-[10px] text-emerald-400 font-mono">REAL-TIME NET GAIN</span>
              </div>

              <div className="glass-card rounded-3xl p-4 border border-white/10 flex flex-col gap-3">
                {/* APMC Pune Option */}
                <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-zinc-300">APMC Pune (42 km)</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Gross: ₹2,150/q &bull; Freight: ₹140/q</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Net Realization</div>
                    <div className="text-sm font-bold text-zinc-200">₹2,010/q</div>
                  </div>
                </div>

                {/* APMC Shirur Recommended Option */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl bg-emerald-500 text-zinc-950 font-bold text-[9px] uppercase">
                    Recommended
                  </div>

                  <div>
                    <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                      APMC Shirur (28 km)
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        +₹250/q gain
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Gross: ₹2,380/q &bull; Freight: ₹120/q</div>
                  </div>

                  <div className="text-right pt-2">
                    <div className="text-xs text-zinc-400">Net Realization</div>
                    <div className="text-base font-extrabold text-emerald-400">₹2,260/q</div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setTransportBooked(true)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    transportBooked
                      ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {transportBooked ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      {t.lockedSlot}
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      {t.lockBtn}
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* ── 6. FUTURE SCOPE & SAFETY-NET CAPABILITIES ── */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  {t.capabilitiesTitle}
                </h2>
                <span className="text-[10px] text-violet-400 font-mono">BETA MODULES</span>
              </div>

              {/* Horizontal Pill Row / Cards */}
              <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                {/* Module A */}
                <button
                  onClick={() => setSelectedModule('pest')}
                  className="glass-card glass-card-hover min-w-[160px] max-w-[170px] p-3 rounded-2xl border border-white/10 flex flex-col justify-between text-left gap-3 shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                      Beta
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-100 leading-snug">Visual Leaf Pest Scan</div>
                    <div className="text-[10px] text-zinc-400 mt-1">Tap to diagnose via camera</div>
                  </div>
                </button>

                {/* Module B */}
                <button
                  onClick={() => setSelectedModule('pmfby')}
                  className="glass-card glass-card-hover min-w-[160px] max-w-[170px] p-3 rounded-2xl border border-white/10 flex flex-col justify-between text-left gap-3 shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                      Auto-Claim
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-100 leading-snug">PMFBY Auto-Intimation</div>
                    <div className="text-[10px] text-zinc-400 mt-1">Triggered if rain &gt; 65mm</div>
                  </div>
                </button>

                {/* Module C */}
                <button
                  onClick={() => setSelectedModule('wdra')}
                  className="glass-card glass-card-hover min-w-[160px] max-w-[170px] p-3 rounded-2xl border border-white/10 flex flex-col justify-between text-left gap-3 shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      Credit
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-100 leading-snug">WDRA Warehouse Credit</div>
                    <div className="text-[10px] text-zinc-400 mt-1">e-NWR receipt financing</div>
                  </div>
                </button>

                {/* Module D */}
                <button
                  onClick={() => setSelectedModule('shc')}
                  className="glass-card glass-card-hover min-w-[160px] max-w-[170px] p-3 rounded-2xl border border-white/10 flex flex-col justify-between text-left gap-3 shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      SHC API
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-100 leading-snug">Soil Health Card Sync</div>
                    <div className="text-[10px] text-zinc-400 mt-1">NPK: N:High, P:Norm, Zn:Low</div>
                  </div>
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* ── 7. THE ZERO-UI FLOATING VOICE DOCK (BOTTOM FIXED) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
        <div className="max-w-md w-full pointer-events-auto backdrop-blur-2xl bg-zinc-900/90 border border-white/15 rounded-full px-5 py-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-3">
          
          {/* Left Flanking Icon: Filters */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="p-2.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
            title="Telemetry Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Centerpiece Audio Waveform & Text */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0 px-1">
            {/* Waveform Animation */}
            <div className="flex items-center gap-[3px] h-6 shrink-0">
              <span className={`w-0.5 rounded-full ${isListening ? 'bg-emerald-400 wave-1' : 'bg-zinc-600 h-2'}`} />
              <span className={`w-0.5 rounded-full ${isListening ? 'bg-emerald-400 wave-2' : 'bg-zinc-600 h-3.5'}`} />
              <span className={`w-0.5 rounded-full ${isListening ? 'bg-emerald-400 wave-3' : 'bg-zinc-600 h-1.5'}`} />
              <span className={`w-0.5 rounded-full ${isListening ? 'bg-emerald-400 wave-4' : 'bg-zinc-600 h-4'}`} />
              <span className={`w-0.5 rounded-full ${isListening ? 'bg-emerald-400 wave-5' : 'bg-zinc-600 h-2.5'}`} />
            </div>

            <div className="text-[11px] truncate">
              {isListening ? (
                <span className="text-emerald-400 font-semibold animate-pulse">
                  {transcription || t.listeningText}
                </span>
              ) : (
                <span className="text-zinc-400 font-medium">
                  {t.holdToTalk}
                </span>
              )}
            </div>
          </div>

          {/* Radiant Apple Siri-style Mic Orb Button */}
          <button
            onMouseDown={handleMicStart}
            onMouseUp={handleMicEnd}
            onMouseLeave={handleMicEnd}
            onTouchStart={handleMicStart}
            onTouchEnd={handleMicEnd}
            className={`p-3.5 rounded-full text-zinc-950 font-bold transition-all duration-200 select-none ${
              isListening
                ? 'bg-emerald-400 animate-siri-orb scale-110'
                : 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 active:scale-95'
            }`}
            title="Hold to speak"
          >
            <Mic className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Right Flanking Icon: History */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
            title="Query History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MODALS & DRAWERS ── */}

      {/* Beta Module Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-5 border border-white/15 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-zinc-100">
                  {selectedModule === 'pest' && 'Visual Leaf Pest Scan'}
                  {selectedModule === 'pmfby' && 'PMFBY Auto-Intimation Engine'}
                  {selectedModule === 'wdra' && 'WDRA Warehouse Credit'}
                  {selectedModule === 'shc' && 'Soil Health Card API Sync'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-300 leading-relaxed space-y-2">
              {selectedModule === 'pest' && (
                <>
                  <p>Point smartphone camera at soybean leaf symptoms to run local edge-ML pest diagnosis (40+ crop diseases calibrated).</p>
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px]">
                    Status: Models loaded on device. Zero internet required for inference.
                  </div>
                </>
              )}

              {selectedModule === 'pmfby' && (
                <>
                  <p>Automated pre-filled crop insurance claim. Triggers instantly if satellite rainfall telemetry exceeds 65mm in 24h.</p>
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px]">
                    Policy ID: PMFBY-2026-MH-49201 Linked to Cadastral Survey #4B.
                  </div>
                </>
              )}

              {selectedModule === 'wdra' && (
                <>
                  <p>Store harvested produce in accredited WDRA warehouses and receive instant electronic Negotiable Warehouse Receipts (e-NWR) for collateral credit.</p>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                    Interest Rate: 7.5% p.a. vs 18% distress loan rates.
                  </div>
                </>
              )}

              {selectedModule === 'shc' && (
                <>
                  <p>Direct API synchronization with Ministry of Agriculture Soil Health Card database for Plot 4B cadastral survey.</p>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                    NPK Status: Nitrogen (High), Phosphorus (Normal), Zinc (Low - Supplement recommended).
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setSelectedModule(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
            >
              Close Capability Details
            </button>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showFullTimeline && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-5 border border-white/15 animate-fadeIn space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-100">Season 2026 Full Audit Trail</h3>
              </div>
              <button
                onClick={() => setShowFullTimeline(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 text-xs">
              {[
                { time: "Yesterday 04:15 PM", act: "250ml Mancozeb Spray", via: "WhatsApp Voice (Marathi)" },
                { time: "3 Days Ago", act: "50kg DAP Fertilizer Applied", via: "Voice Note (Hindi)" },
                { time: "7 Days Ago", act: "Morning Irrigation 4 Hours", via: "Automated Switch Log" },
                { time: "12 Days Ago", act: "Sowing & Seed Treatment (JS 335)", via: "Voice Entry (Marathi)" },
                { time: "18 Days Ago", act: "Basal Dose Single Super Phosphate", via: "Voice Entry (Hindi)" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-zinc-200">{item.act}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.time} &bull; {item.via}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowFullTimeline(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold shrink-0"
            >
              Close Audit Log
            </button>
          </div>
        </div>
      )}

      {/* History Query Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-5 border border-white/15 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-100">Recent Voice Queries</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                <div className="text-zinc-200 font-medium font-mono">"काय फवारणी करू?" (What spray to use?)</div>
                <div className="text-[10px] text-zinc-400 mt-1">Answered: Mancozeb 2g/L recommended for early leaf spot prevention.</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                <div className="text-zinc-200 font-medium font-mono">"शिरूर बाजारभाव काय आहे?" (Shirur market rate?)</div>
                <div className="text-[10px] text-zinc-400 mt-1">Answered: ₹2,380/q (+₹250 higher than Pune).</div>
              </div>
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-5 border border-white/15 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-100">Telemetry & Model Filters</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer">
                <span className="text-zinc-200 font-medium">Show Satellite Sentinel-2 Layer</span>
                <input type="checkbox" defaultChecked className="accent-emerald-500" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer">
                <span className="text-zinc-200 font-medium">Auto-Sync Panchayat LoRa Mesh</span>
                <input type="checkbox" defaultChecked className="accent-emerald-500" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer">
                <span className="text-zinc-200 font-medium">Dialect Voice Parser (Marathi/Hindi)</span>
                <input type="checkbox" defaultChecked className="accent-emerald-500" />
              </label>
            </div>

            <button
              onClick={() => setShowFilterModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold"
            >
              Apply Preferences
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
