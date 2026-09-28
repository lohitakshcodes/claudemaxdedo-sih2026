import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SIH26080: Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts — Team ClaudeMaxDedo",
  description:
    "Official high-performance project portal for Team ClaudeMaxDedo at SIH 2026: Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts (Ministry of Earth Sciences / NCMRWF & IMD PS ID SIH26080).",
  robots: {
    index: false, // Internal evaluator submission
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-white text-zinc-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
