"use client";

import React, { useState } from "react";
import { PersonalizationLayer } from "@/types/portal";
import {
  Compass,
  TestTube,
  IndianRupee,
  Tractor,
  Mic,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

interface PersonalizationLayersVisualizerProps {
  layers: PersonalizationLayer[];
}

export const PersonalizationLayersVisualizer: React.FC<PersonalizationLayersVisualizerProps> = ({
  layers,
}) => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);

  const currentLayer = layers[selectedLayerIndex] || layers[0];

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "spatial":
        return <Compass className="w-4 h-4 text-blue-600" />;
      case "soil":
        return <TestTube className="w-4 h-4 text-emerald-600" />;
      case "profit":
        return <IndianRupee className="w-4 h-4 text-amber-600" />;
      case "labor":
        return <Tractor className="w-4 h-4 text-purple-600" />;
      case "vernacular":
        return <Mic className="w-4 h-4 text-rose-600" />;
      default:
        return <Layers className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-zinc-900"></span>
            <h3 className="font-bold text-base text-zinc-900">
              5 Layers of Deep Hyper-Personalization
            </h3>
            <span className="web2-badge text-[10px] font-mono py-0.5 px-2 bg-zinc-100 text-zinc-800 border-zinc-300">
              Zero Generic Advice
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-sans mt-0.5">
            Generic agricultural apps broadcast identical district-wide text. AgriGPT tunes recommendations to field micro-topography, individual soil chemistry, and household logistics.
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-500">5 Operational Tiers</span>
      </div>

      {/* Main Tabbed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 5 Layer Vertical Navigation Strip */}
        <div className="lg:col-span-4 space-y-2">
          {layers.map((layer, idx) => {
            const isSelected = selectedLayerIndex === idx;
            return (
              <div
                key={layer.layerNumber}
                onClick={() => setSelectedLayerIndex(idx)}
                className={`cursor-pointer p-3.5 rounded-lg border transition-all text-xs font-mono flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-tactile"
                    : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded border shrink-0 ${
                      isSelected ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-100 border-zinc-200"
                    }`}
                  >
                    {getLayerIcon(layer.iconType)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">
                      Layer 0{layer.layerNumber}: {layer.title.split("&")[0]}
                    </div>
                    <div
                      className={`text-[11px] truncate font-sans ${
                        isSelected ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {layer.subtitle}
                    </div>
                  </div>
                </div>

                <ArrowRight
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? "text-emerald-400" : "text-zinc-400"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Right Column: Layer Detailed Breakdown Card */}
        <div className="lg:col-span-8 space-y-4">
          <div className="web2-panel p-5 rounded-lg border border-zinc-300 bg-white shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-zinc-500">
                  LAYER 0{currentLayer.layerNumber}
                </span>
                <h4 className="font-bold text-base text-zinc-900">{currentLayer.title}</h4>
              </div>
              <span className="text-xs font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                {currentLayer.subtitle}
              </span>
            </div>

            {/* Contrast: The Static Model vs Personalization Engine */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-sans">
              <div className="p-3.5 rounded bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="font-mono text-zinc-500 font-bold uppercase text-[10px]">
                  What Generic AI Models Know (Static Average):
                </div>
                <p className="text-zinc-700 leading-relaxed italic">{currentLayer.staticKnowledge}</p>
              </div>

              <div className="p-3.5 rounded bg-emerald-50/70 border border-emerald-300 space-y-1">
                <div className="font-mono text-emerald-900 font-bold uppercase text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>AgriGPT Deep Personalization Engine:</span>
                </div>
                <p className="text-zinc-900 leading-relaxed">{currentLayer.personalizationEngine}</p>
              </div>
            </div>

            {/* Mathematical Formula (if available) */}
            {currentLayer.mathematicalEquation && (
              <div className="bg-zinc-950 text-zinc-100 p-3.5 rounded border border-zinc-800 font-mono text-xs space-y-1">
                <div className="text-zinc-400 text-[10px] uppercase">
                  Deterministic Mathematical Formula Guardrail:
                </div>
                <div className="text-emerald-400 font-bold tracking-wide text-[11px] overflow-x-auto py-0.5">
                  <code>{currentLayer.mathematicalEquation}</code>
                </div>
              </div>
            )}

            {/* Practical Real-World Field Deployment Example */}
            <div className="p-3.5 rounded bg-zinc-100 border border-zinc-200 text-xs font-sans space-y-1">
              <div className="font-mono text-zinc-700 font-bold text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Verified Field Result:</span>
              </div>
              <p className="text-zinc-800 leading-relaxed font-medium">
                {currentLayer.practicalExample}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
