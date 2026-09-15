"use client";

import React, { useState } from "react";
import {
  Building2,
  Database,
  Satellite,
  Mic,
  ArrowRight,
  Smartphone,
  Users,
  Radio,
  PhoneCall,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export const B2gDeploymentFlowchart: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<number>(0);

  const channels = [
    {
      id: 0,
      name: "1. State WhatsApp Channels",
      subtitle: "Official G2C Citizen Delivery",
      icon: Smartphone,
      reach: "140M+ Indian Farmers",
      details:
        "Integrated directly into state agriculture WhatsApp portals (e.g., MahaAgri, UP Kisan). The farmer receives proactive voice advisories and can reply with voice notes in their dialect without installing a separate app.",
      benefit: "Zero app install friction, 99.4% delivery rate, accessible to illiterate smallholders.",
    },
    {
      id: 1,
      name: "2. Krishi Sakhis & Extension Tablets",
      subtitle: "Field Officer AI Co-Pilot",
      icon: Users,
      reach: "1 Extension Worker : 1,500 Farmers",
      details:
        "India has roughly 1 ground officer for every 1,500 farmers. Deployed on field tablets given to Krishi Sakhis and Village Extension Officers, providing an instant scientific co-pilot during farm gate visits.",
      benefit: "Scales extension outreach by 10x while enforcing ICAR certified chemical package of practices.",
    },
    {
      id: 2,
      name: "3. Gram Panchayat Loudspeakers & CSCs",
      subtitle: "Community Disaster Broadcasts",
      icon: Radio,
      reach: "250,000+ Gram Panchayats",
      details:
        "Common Service Centre (CSC) kiosks and village public address systems automatically broadcast urgent cloudburst, cyclone, or mandi price alerts during community meetings.",
      benefit: "Covers non-smartphone owners and feature phone users during severe localized weather extremes.",
    },
    {
      id: 3,
      name: "4. Kisan Call Centres (KCC Co-Pilot)",
      subtitle: "Live Operator Telephony Support",
      icon: PhoneCall,
      reach: "1800-180-1551 Toll-Free Gateway",
      details:
        "Acts as a real-time advisory co-pilot for telephone operators handling incoming farmer calls. Instantly pulls the caller's soil health card and radar weather based on phone number.",
      benefit: "Cuts average call handling time from 12 minutes to 90 seconds while eliminating contradictory advice.",
    },
  ];

  return (
    <div className="web2-panel rounded-lg border border-zinc-300 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider">
              DPI Deployment Blueprint &bull; Research Doc 1 (P. 16–21)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            B2G (Business-to-Government) Digital Public Infrastructure Architecture
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
            We do not charge smallholder farmers. Instead, our platform plugs directly into India&apos;s AgriStack and Krishi-DSS as a public utility (G2C), funded through Digital Agriculture Mission &amp; NeGPA grants.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-md text-xs font-mono shrink-0">
          <div className="text-emerald-900 font-bold">Farmer Pricing Model:</div>
          <div className="text-sm font-extrabold text-emerald-700">100% Free Public Good</div>
        </div>
      </div>

      {/* Tripartite Ingestion Architecture Flowchart */}
      <div className="space-y-4 select-none">
        <div className="text-[11px] font-mono text-zinc-500 uppercase">
          Tripartite Government Digital Public Infrastructure (DPI) Ingestion:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pillar 1: AgriStack */}
          <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">DPI Pillar 1</span>
              <Database className="w-4 h-4 text-blue-700" />
            </div>
            <h4 className="font-bold text-xs text-zinc-900">AgriStack &amp; Farmer ID Registry</h4>
            <p className="text-[11px] text-zinc-600 font-sans leading-normal">
              Authenticates landholders via Farmer ID; auto-populates cadastral boundaries, land records, and crop survey history.
            </p>
            <div className="text-[10px] font-mono text-zinc-500 pt-1">Impact: Zero manual profile typing</div>
          </div>

          {/* Pillar 2: Krishi-DSS */}
          <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">DPI Pillar 2</span>
              <Satellite className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="font-bold text-xs text-zinc-900">Krishi-DSS Geospatial Grid</h4>
            <p className="text-[11px] text-zinc-600 font-sans leading-normal">
              Direct integration into Ministry&apos;s Krishi-DSS geospatial layer for national satellite imagery, soil mapping, and IMD radar.
            </p>
            <div className="text-[10px] font-mono text-zinc-500 pt-1">Impact: Official government-certified layers</div>
          </div>

          {/* Pillar 3: Bhashini */}
          <div className="p-3.5 rounded-lg border border-zinc-300 bg-zinc-50/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">DPI Pillar 3</span>
              <Mic className="w-4 h-4 text-purple-700" />
            </div>
            <h4 className="font-bold text-xs text-zinc-900">Bhashini Multilingual Speech</h4>
            <p className="text-[11px] text-zinc-600 font-sans leading-normal">
              Digital India Language Platform providing native speech recognition and audio synthesis across 22 official Indian languages.
            </p>
            <div className="text-[10px] font-mono text-zinc-500 pt-1">Impact: Universal vernacular accessibility</div>
          </div>
        </div>

        {/* Central Core Bar */}
        <div className="bg-zinc-900 text-white p-3 rounded-md text-center font-mono text-xs shadow-sm flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold tracking-wide">
            Autonomous Decision Core: Reconciles Live Feeds &bull; Enforces ICAR Math &bull; Synthesizes 1 Daily Action
          </span>
        </div>

        {/* Downward Connector Arrow */}
        <div className="flex justify-center -my-2 pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-600">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 4 High-Trust Delivery Channels Grid */}
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">
            Four High-Trust Public Deployment Touchpoints (Click to inspect):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {channels.map((ch) => {
              const CIcon = ch.icon;
              const isSel = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    isSel
                      ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-400"
                      : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <CIcon className={`w-4 h-4 ${isSel ? "text-emerald-700" : "text-zinc-600"}`} />
                      <span className="text-[10px] font-mono font-bold text-zinc-500">
                        {ch.reach.split(" ")[0]}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-zinc-900 leading-tight">
                      {ch.name.split(". ")[1]}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">{ch.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Channel Deep Dive Drawer */}
          <div className="p-3.5 rounded-md border border-zinc-200 bg-zinc-50 space-y-1.5 text-xs font-sans">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900">{channels[activeChannel].name}</span>
              <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                Target Reach: {channels[activeChannel].reach}
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed text-xs">
              {channels[activeChannel].details}
            </p>
            <div className="pt-1.5 border-t border-zinc-200 text-[11px] font-mono text-zinc-600">
              <strong>Govt ROI Benefit:</strong> {channels[activeChannel].benefit}
            </div>
          </div>
        </div>
      </div>

      {/* Why the Government Buys This (Summary Strip) */}
      <div className="border-t border-zinc-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200 space-y-1">
          <div className="font-bold text-zinc-900 font-mono text-[11px]">1. Scales Extension Capacity</div>
          <p className="text-zinc-600 text-[11px] font-sans">
            Supercharges India&apos;s 1:1,500 extension deficit by providing an automated 24/7 digital co-pilot to field officers.
          </p>
        </div>

        <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200 space-y-1">
          <div className="font-bold text-zinc-900 font-mono text-[11px]">2. Reduces Subsidy &amp; PMFBY Costs</div>
          <p className="text-zinc-600 text-[11px] font-sans">
            Curbs subsidized Urea over-application via strict ICAR math and lowers disaster compensation claims with pre-storm warnings.
          </p>
        </div>

        <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200 space-y-1">
          <div className="font-bold text-zinc-900 font-mono text-[11px]">3. Real-Time Crisis Telemetry</div>
          <p className="text-zinc-600 text-[11px] font-sans">
            Aggregated anonymous query signals alert district collectors early about pest outbreaks or localized crop failure.
          </p>
        </div>
      </div>
    </div>
  );
};
