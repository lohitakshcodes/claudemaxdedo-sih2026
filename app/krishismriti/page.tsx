import type { Metadata } from "next";
import { PortalTemplate } from "@/components/portal-template";
import { krishiSmritiConfig } from "@/data/krishismriti-config";

export const metadata: Metadata = {
  title: "KrishiSmriti · SIH 2026 · Team ClaudeMaxDedo",
  description:
    "The Farm's Second Brain: Cross-Factor Agro-Decision & Memory Engine. Smart India Hackathon 2026 entry (PS ID SIH26193, Team ClaudeMaxDedo).",
  keywords: [
    "KrishiSmriti",
    "SIH26193",
    "Smart India Hackathon 2026",
    "ClaudeMaxDedo",
    "Farm Second Brain",
    "ICAR Rule Engine",
    "Bhashini",
    "pgvector",
  ],
};

export default function KrishiSmritiPage() {
  return <PortalTemplate config={krishiSmritiConfig} />;
}
