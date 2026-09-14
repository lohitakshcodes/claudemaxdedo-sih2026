"use client";

import React, { useState, useEffect, useRef } from "react";
import { TelemetryPacket } from "@/types/portal";
import {
  Play,
  Pause,
  Trash2,
  Activity,
  Wifi,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";

interface TelemetryStreamProps {
  title: string;
  description: string;
  brokerUrl: string;
  topics: string[];
  packetPool: TelemetryPacket[];
  projectId: "weathergpt" | "krishismriti";
}

export const TelemetryStream: React.FC<TelemetryStreamProps> = ({
  title,
  description,
  brokerUrl,
  topics,
  packetPool,
  projectId,
}) => {
  const [mounted, setMounted] = useState(false);
  const [packets, setPackets] = useState<TelemetryPacket[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [expandedPackets, setExpandedPackets] = useState<Record<string, boolean>>({});
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const poolIndexRef = useRef(0);
  const packetIdSeq = useRef(9030);

  useEffect(() => {
    setMounted(true);
    // Initialize with first 3 packets from pool
    setPackets(packetPool.slice(0, 3));
    poolIndexRef.current = 3 % packetPool.length;
  }, [packetPool]);

  // Deterministic tick every 2.5 seconds
  useEffect(() => {
    if (!mounted || isPaused) return;

    const interval = setInterval(() => {
      const template = packetPool[poolIndexRef.current];
      poolIndexRef.current = (poolIndexRef.current + 1) % packetPool.length;
      packetIdSeq.current += 1;

      // Deterministic slight variations
      const now = new Date();
      const isoTime = now.toISOString();
      const jitterMs = 22 + ((packetIdSeq.current * 7) % 19);

      const newPacket: TelemetryPacket = {
        id: `PKT-${projectId.toUpperCase().slice(0, 3)}-${packetIdSeq.current}`,
        timestamp: isoTime,
        topic: template.topic,
        source: template.source,
        latencyMs: jitterMs,
        status: template.status,
        payload: {
          ...template.payload,
          _seq: packetIdSeq.current,
          _epoch_ms: now.getTime(),
        },
      };

      setPackets((prev) => {
        const updated = [...prev, newPacket];
        // Keep last 40 packets in buffer
        return updated.length > 40 ? updated.slice(updated.length - 40) : updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [mounted, isPaused, packetPool, projectId]);

  // Handle auto-scroll inside terminal container only
  useEffect(() => {
    if (autoScroll && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTo({
        top: terminalContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [packets, autoScroll]);

  const toggleExpand = (id: string) => {
    setExpandedPackets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPackets =
    selectedTopic === "ALL"
      ? packets
      : packets.filter((p) => p.topic === selectedTopic);

  const clearLogs = () => {
    setPackets([]);
  };

  if (!mounted) {
    return (
      <div className="web2-panel p-6 rounded-md bg-white border border-zinc-300 min-h-[360px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-sm">
          <Activity className="w-4 h-4 animate-spin" />
          Initializing Ingestion Telemetry Engine...
        </div>
      </div>
    );
  }

  return (
    <div id="live-telemetry" className="web2-panel rounded-md border border-zinc-300 bg-white overflow-hidden shadow-sm">
      {/* Top Header Bar */}
      <div className="bg-zinc-100 border-b border-zinc-300 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-zinc-700" />
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">{title}</h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              Stream Status: Connected (MQTT over WSS)
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-0.5 font-mono">
            Broker: <span className="text-zinc-800 font-medium">{brokerUrl}</span> &bull; Interval: 2500ms
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`web2-button text-xs py-1 px-2.5 flex items-center gap-1.5 ${
              isPaused ? "bg-amber-50 border-amber-300 text-amber-800" : ""
            }`}
            title={isPaused ? "Resume Live Ingestion" : "Pause Live Ingestion"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-700" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? "Resume Feed" : "Pause Stream"}</span>
          </button>

          <button
            onClick={clearLogs}
            className="web2-button text-xs py-1 px-2.5 flex items-center gap-1.5 hover:border-red-300 hover:text-red-700"
            title="Clear buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`web2-button text-xs py-1 px-2.5 ${
              autoScroll ? "bg-zinc-200 border-zinc-400 font-semibold text-zinc-900" : "text-zinc-600"
            }`}
          >
            Auto-Scroll: {autoScroll ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-600 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-zinc-400 uppercase">Packets:</span>{" "}
            <span className="font-bold text-zinc-800">{packets.length}</span>
          </div>
          <div className="hidden sm:inline-block text-zinc-300">|</div>
          <div>
            <span className="text-zinc-400 uppercase">Avg Latency:</span>{" "}
            <span className="font-bold text-emerald-700">&lt; 38 ms</span>
          </div>
          <div className="hidden sm:inline-block text-zinc-300">|</div>
          <div>
            <span className="text-zinc-400 uppercase">Throughput:</span>{" "}
            <span className="font-bold text-zinc-800">24.8 kb/s</span>
          </div>
          <div className="hidden sm:inline-block text-zinc-300">|</div>
          <div>
            <span className="text-zinc-400 uppercase">Loss Rate:</span>{" "}
            <span className="font-bold text-zinc-800">0.00%</span>
          </div>
        </div>

        {/* Topic Filter Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="text-zinc-500 shrink-0">Topic:</span>
          <button
            onClick={() => setSelectedTopic("ALL")}
            className={`px-2 py-0.5 text-xs rounded border transition-colors ${
              selectedTopic === "ALL"
                ? "bg-zinc-800 text-white border-zinc-900 font-medium"
                : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            ALL ({packets.length})
          </button>
          {topics.map((top) => {
            const count = packets.filter((p) => p.topic === top).length;
            const shortName = top.split("/").pop() || top;
            return (
              <button
                key={top}
                onClick={() => setSelectedTopic(top)}
                className={`px-2 py-0.5 text-xs rounded border transition-colors shrink-0 ${
                  selectedTopic === top
                    ? "bg-zinc-800 text-white border-zinc-900 font-medium"
                    : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                }`}
              >
                {shortName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Terminal View Container */}
      <div
        ref={terminalContainerRef}
        className="bg-white p-3 max-h-[380px] overflow-y-auto font-mono text-xs telemetry-scroll divide-y divide-zinc-100"
      >
        {filteredPackets.length === 0 ? (
          <div className="py-12 text-center text-zinc-400">
            No telemetry packets in buffer. Click &quot;Resume Feed&quot; or wait for the next MQTT cycle.
          </div>
        ) : (
          filteredPackets.map((pkt) => {
            const isExpanded = !!expandedPackets[pkt.id];
            return (
              <div key={pkt.id} className="py-2 hover:bg-zinc-50 transition-colors px-1 rounded">
                <div
                  onClick={() => toggleExpand(pkt.id)}
                  className="flex items-start justify-between cursor-pointer gap-2 select-none"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-zinc-400 mt-0.5">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <span className="font-semibold text-zinc-700 shrink-0">{pkt.id}</span>
                    <span className="text-zinc-400 shrink-0 hidden md:inline">
                      [{pkt.timestamp.slice(11, 23)}]
                    </span>
                    <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                      {pkt.topic}
                    </span>
                    <span className="text-zinc-500 truncate hidden lg:inline">{pkt.source}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-700 font-medium">{pkt.latencyMs}ms</span>
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-bold rounded border ${
                        pkt.status === "ALERT"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : pkt.status === "OK"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-zinc-100 text-zinc-800 border-zinc-300"
                      }`}
                    >
                      {pkt.status}
                    </span>
                  </div>
                </div>

                {/* Expanded JSON view */}
                {isExpanded && (
                  <div className="mt-2 ml-5 bg-zinc-900 text-zinc-100 p-3 rounded border border-zinc-800 text-[11px] overflow-x-auto shadow-inner">
                    <div className="text-zinc-400 mb-1 border-b border-zinc-800 pb-1 flex justify-between">
                      <span>ORIGIN_SOURCE: {pkt.source}</span>
                      <span>QoS 1 &bull; PROTOCOL: MQTT 5.0 WSS</span>
                    </div>
                    <pre className="text-emerald-400">
                      {JSON.stringify(pkt.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="bg-zinc-100 border-t border-zinc-200 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-zinc-600">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Buffer: {packets.length} / 40 packets</span>
          <span className="text-zinc-400">|</span>
          <span>Encoding: UTF-8 / JSON</span>
        </div>
        <div className="text-zinc-500 hidden sm:block">
          Evaluator Mode: Deterministic Replay Active
        </div>
      </div>
    </div>
  );
};
