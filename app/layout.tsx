import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Smart India Hackathon 2026 Portfolio — Team ClaudeMaxDedo",
  description:
    "Official high-performance project portals for Team ClaudeMaxDedo at SIH 2026: WeatherGPT (MoES/IMD SIH26068) and KrishiSmriti (Ministry of Agriculture SIH26193).",
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
