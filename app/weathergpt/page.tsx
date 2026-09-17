import type { Metadata } from "next";
import { PortalTemplate } from "@/components/portal-template";
import { weatherGptConfig } from "@/data/weathergpt-config";

export const metadata: Metadata = {
  title: "WeatherGPT · SIH 2026 · Team ClaudeMaxDedo",
  description:
    "Warning-Locked, Action-First Meteorological & Disaster Voice Intelligence. Smart India Hackathon 2026 entry (PS ID SIH26068, Team ClaudeMaxDedo).",
  keywords: [
    "WeatherGPT",
    "SIH26068",
    "Smart India Hackathon 2026",
    "ClaudeMaxDedo",
    "Disaster Management",
    "SACHET CAP 1.2",
    "Open-Meteo GFS",
    "Bhashini",
  ],
};

export default function WeatherGPTPage() {
  return <PortalTemplate config={weatherGptConfig} />;
}
