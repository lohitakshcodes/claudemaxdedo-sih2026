import type { Metadata } from "next";
import { PortalTemplate } from "@/components/portal-template";
import { krishiSmritiConfig } from "@/data/krishismriti-config";

export const metadata: Metadata = {
  title: "KrishiSmriti | Ministry of Agriculture Official Evaluator Portal (SIH26193) — Team ClaudeMaxDedo",
  description:
    "Autonomous Multimodal Agro-Advisory & Mandi Arbitrage Engine Powered by Sentinel-1 SAR & Dialect Voice AI. Evaluator portal for Smart India Hackathon 2026 PS ID SIH26193.",
  keywords: [
    "KrishiSmriti",
    "Ministry of Agriculture",
    "SIH26193",
    "Smart India Hackathon 2026",
    "ClaudeMaxDedo",
    "Sentinel-1 SAR",
    "Agmarknet",
    "LoRaWAN",
    "Mandi Arbitrage",
  ],
};

export default function KrishiSmritiPage() {
  return <PortalTemplate config={krishiSmritiConfig} />;
}
