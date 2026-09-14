import type { Metadata } from "next";
import { PortalTemplate } from "@/components/portal-template";
import { weatherGptConfig } from "@/data/weathergpt-config";

export const metadata: Metadata = {
  title: "WeatherGPT | MoES & IMD Official Evaluator Portal (SIH26068) — Team ClaudeMaxDedo",
  description:
    "Autonomous Multi-Sector Weather & Maritime Voice Intelligence via WMO WIS 2.0 and Bhashini Speech Models for coastal fishermen, urban commuters, aviation, and public safety. Evaluator portal for Smart India Hackathon 2026 PS ID SIH26068.",
  keywords: [
    "WeatherGPT",
    "MoES",
    "IMD",
    "SIH26068",
    "Smart India Hackathon 2026",
    "ClaudeMaxDedo",
    "WIS 2.0",
    "Bhashini",
    "CAP 1.2",
    "Maritime",
    "Fishermen",
    "Aviation",
    "Urban Flood",
  ],
};

export default function WeatherGPTPage() {
  return <PortalTemplate config={weatherGptConfig} />;
}
