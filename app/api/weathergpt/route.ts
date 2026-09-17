/**
 * =============================================================================
 * WEATHERGPT AGENTIC ROUTER (Next.js 14+ App Router API Route)
 * PS ID: SIH26068 (Ministry of Earth Sciences / IMD)
 * =============================================================================
 * 
 * Production Pipeline Architecture:
 * 1. Bhashini ASR/NMT: Ingests Indic voice query (Bhojpuri/Hindi/Marathi/etc.) -> translates to canonical English.
 * 2. LangChain Tool Calling Agent (Gemini 1.5 Flash):
 *    - Tool A: `geocode_location` (Nominatim OpenStreetMap Lat/Lng resolver)
 *    - Tool B: `fetch_open_meteo_gfs` (Open-Meteo GFS Numerical Weather Prediction)
 *    - Tool C: `query_postgis_cap_disaster_polygon` (PostGIS ST_Contains on CAP_Alerts)
 * 3. Deterministic CAP 1.2 Safety Gatekeeper: Hard safety override if user is within a disaster polygon.
 * 4. Bhashini NMT & TTS: Synthesizes dialect response & audio speech payload for smallholders.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runWeatherAgent } from "@/lib/agent/weather-agent";
import { bhashiniTranslate, bhashiniTextToSpeech } from "@/lib/bhashini";
import { extractLocationFromQuery } from "@/lib/geocoding";

// Input Validation Schema using Zod
const WeatherGptRequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  location: z.string().optional(), // e.g. "Puri Coast", "Delhi NCR", "Pune", "Varanasi"
  language: z.string().default("bho"), // "bho", "hi", "mr", "en", "te", "ta", "bn", "or"
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  farmerId: z.string().optional().default("USR-SECTOR-901"),
  farmerName: z.string().optional().default("National Weather Subscriber"),
  cropType: z.string().optional().default("Multi-Sector Operations"),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const rawBody = await req.json();
    const validatedData = WeatherGptRequestSchema.parse(rawBody);

    const {
      query,
      location,
      language,
      latitude,
      longitude,
      farmerId,
      farmerName,
      cropType,
    } = validatedData;

    // -------------------------------------------------------------------------
    // STEP 1: BHASHINI MULTILINGUAL ASR / NMT TRANSLATION
    // -------------------------------------------------------------------------
    let canonicalEnglishQuery = query;
    const originalLanguage = language;

    if (language !== "en") {
      const translation = await bhashiniTranslate({
        sourceText: query,
        sourceLanguage: language,
        targetLanguage: "en",
      });
      canonicalEnglishQuery = translation.translatedText;
    }

    // -------------------------------------------------------------------------
    // STEP 2: LANGCHAIN AGENTIC TOOL EXECUTION & ORCHESTRATION
    // -------------------------------------------------------------------------
    const resolvedLocationQuery = location || (latitude && longitude ? undefined : extractLocationFromQuery(canonicalEnglishQuery, location));

    const agentResult = await runWeatherAgent({
      query: canonicalEnglishQuery,
      location: resolvedLocationQuery,
      latitude,
      longitude,
      cropType,
      language: originalLanguage,
    });

    // -------------------------------------------------------------------------
    // STEP 3: BHASHINI VERNACULAR LOCALIZATION & TTS SYNTHESIS
    // -------------------------------------------------------------------------
    let vernacularAdvisory = agentResult.englishAdvisory;
    if (originalLanguage !== "en") {
      const vernacularTranslation = await bhashiniTranslate({
        sourceText: agentResult.englishAdvisory,
        sourceLanguage: "en",
        targetLanguage: originalLanguage,
      });
      vernacularAdvisory = vernacularTranslation.translatedText;
    }

    // Synthesize dialect audio speech payload
    const speechPayload = await bhashiniTextToSpeech(
      vernacularAdvisory,
      originalLanguage,
      "female"
    );

    const totalLatencyMs = Date.now() - startTime;

    // -------------------------------------------------------------------------
    // STEP 4: STRUCTURED PRODUCTION RESPONSE
    // -------------------------------------------------------------------------
    return NextResponse.json({
      status: "SUCCESS",
      projectId: "weathergpt",
      psId: "SIH26068",
      timestamp: new Date().toISOString(),
      userContext: {
        userId: farmerId,
        userName: farmerName,
        sector: cropType,
        location: {
          queryName: location || agentResult.resolvedLocation.displayName,
          displayName: agentResult.resolvedLocation.displayName,
          latitude: agentResult.resolvedLocation.latitude,
          longitude: agentResult.resolvedLocation.longitude,
          source: agentResult.resolvedLocation.source,
        },
      },
      farmerContext: {
        farmerId,
        farmerName,
        cropType,
        location: {
          queryName: location || agentResult.resolvedLocation.displayName,
          displayName: agentResult.resolvedLocation.displayName,
          latitude: agentResult.resolvedLocation.latitude,
          longitude: agentResult.resolvedLocation.longitude,
          source: agentResult.resolvedLocation.source,
        },
      },
      bhashini: {
        inputQueryRaw: query,
        inputLanguage: originalLanguage,
        canonicalEnglishQuery,
        speechSynthesis: {
          audioBase64: speechPayload.audioBase64,
          durationSeconds: speechPayload.durationSeconds,
          samplingRateHz: speechPayload.samplingRateHz,
        },
      },
      agentPipeline: {
        decisionStatus: agentResult.decisionGate,
        isInDisasterZone: agentResult.activeAlerts.length > 0,
        modelUsed: agentResult.modelUsed,
        postgisAlerts: agentResult.activeAlerts,
        liveMeteoTelemetry: agentResult.weatherData,
        toolExecutions: agentResult.toolCallTraces,
        totalLatencyMs,
      },
      advisory: {
        english: agentResult.englishAdvisory,
        vernacular: vernacularAdvisory,
        language: originalLanguage,
        receipt: agentResult.receipt,
      },
    });
  } catch (error: any) {
    console.error("[WeatherGPT API] Error processing request:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        projectId: "weathergpt",
        message: error?.message || "Internal server error in WeatherGPT Agentic Router",
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "WeatherGPT Agentic Router",
    psId: "SIH26068",
    status: "HEALTHY",
    capabilities: [
      "WMO WIS 2.0 MQTT 5.0 Live Ingestion",
      "PostGIS ST_Contains Polygon Geo-Fencing",
      "Nominatim OpenStreetMap Geocoding Engine",
      "Open-Meteo GFS 0.25° Real-Time NWP Integration",
      "LangChain Tool-Calling Agent (Gemini 1.5 Flash)",
      "Bhashini Multilingual ASR/NMT/TTS (14+ Indic Dialects)",
      "Deterministic CAP 1.2 Safety Gatekeeper",
    ],
    timestamp: new Date().toISOString(),
  });
}
