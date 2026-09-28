/**
 * Phase 3 Integration Test Suite
 * Tests:
 * 1. NWP Model Layer (GFS, ECMWF, ICON, WRF adapter ready)
 * 2. NWP Model Divergence Detection (configurable thresholds in /config/thresholds.json)
 * 3. Marine Swell & Wave Telemetry (LIVE on coast, SAMPLE inland fallback)
 * 4. Spatial H3 Hex Generation & District/State Reverse Lookup
 * 5. 30-Year Historical Climate Analysis & Deterministic Anomaly Computation
 * 6. Full executeWeatherQueryPipeline with "Was last monsoon above normal for Nashik?"
 */

import { NWP_REGISTRY, detectNwpModelDivergence, GfsModelProvider, EcmwfModelProvider, IconModelProvider, WrfModelProvider, NwpForecastResult } from "../lib/nwp/model-provider";
import { fetchMarineWeather } from "../lib/marine/marine-service";
import { latLngToH3Index, reverseLookupDistrictAndState } from "../lib/spatial/h3-service";
import { analyzeClimateAndHistoricalTrends } from "../lib/climate/historical-service";
import { executeWeatherQueryPipeline } from "../lib/intent/query-engine";

async function runTests() {
  console.log("==================================================================");
  console.log("       WEATHERGPT PHASE 3 INTEGRATION TEST SUITE");
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // -------------------------------------------------------------------------
  // 1. NWP Model Layer Providers & Execution
  // -------------------------------------------------------------------------
  console.log("--- 1. NWP Model Providers & Execution ---");
  const gfsProvider = NWP_REGISTRY["gfs"];
  const ecmwfProvider = NWP_REGISTRY["ecmwf"];
  const iconProvider = NWP_REGISTRY["icon"];
  const wrfProvider = NWP_REGISTRY["wrf"];
  const ncumProvider = NWP_REGISTRY["ncum"];

  assert(gfsProvider.status === "CONNECTED", "GFS provider is marked CONNECTED");
  assert(ecmwfProvider.status === "CONNECTED", "ECMWF provider is marked CONNECTED");
  assert(iconProvider.status === "CONNECTED", "ICON provider is marked CONNECTED");
  assert(wrfProvider.status === "ADAPTER_READY", "WRF provider is marked ADAPTER_READY (not falsely claimed)");
  assert(ncumProvider.status === "ADAPTER_READY", "NCUM provider is marked ADAPTER_READY");

  const [gfsForecast, ecmwfForecast, iconForecast] = await Promise.all([
    gfsProvider.fetchForecast(19.9975, 73.7898),
    ecmwfProvider.fetchForecast(19.9975, 73.7898),
    iconProvider.fetchForecast(19.9975, 73.7898),
  ]);

  assert(typeof gfsForecast.temperature2m === "number", "GFS returns valid temperature");
  assert(typeof ecmwfForecast.temperature2m === "number", "ECMWF returns valid temperature");
  assert(typeof iconForecast.temperature2m === "number", "ICON returns valid temperature");
  assert(gfsForecast.runCycle.includes("UTC") || gfsForecast.runCycle.includes("Z"), "GFS includes run cycle");
  assert(ecmwfForecast.runCycle.includes("UTC") || ecmwfForecast.runCycle.includes("Z"), "ECMWF includes run cycle");
  console.log(`   GFS: Temp=${gfsForecast.temperature2m}°C, Rain=${gfsForecast.precipitation}mm, Run=${gfsForecast.runCycle}`);
  console.log(`   ECMWF: Temp=${ecmwfForecast.temperature2m}°C, Rain=${ecmwfForecast.precipitation}mm, Run=${ecmwfForecast.runCycle}`);
  console.log(`   ICON: Temp=${iconForecast.temperature2m}°C, Rain=${iconForecast.precipitation}mm, Run=${iconForecast.runCycle}`);

  // Test divergence detection logic with mock data
  const mockPrimary: NwpForecastResult = {
    modelId: "gfs",
    modelName: "GFS (NOAA)",
    agency: "NOAA/NCEP",
    resolution: "0.25° (~27 km)",
    runCycle: "00Z Operational",
    runTimestamp: new Date().toISOString(),
    temperature2m: 25.0,
    precipitation: 2.0,
    windSpeed10m: 12.0,
    windGusts10m: 18.0,
    surfacePressureHpa: 1008.0,
    relativeHumidity2m: 75,
    isAvailable: true,
    status: "CONNECTED",
    source: "NOAA GFS",
  };
  const mockDivergentSecondary: NwpForecastResult = {
    ...mockPrimary,
    modelId: "ecmwf",
    modelName: "ECMWF IFS",
    temperature2m: 29.5, // 4.5°C diff > 3.0°C limit
    precipitation: 14.0, // 12.0mm diff > 8.0mm limit
    windSpeed10m: 30.0,  // 18.0km/h diff > 15.0km/h limit
  };
  const divergenceTest = detectNwpModelDivergence(mockPrimary, [mockDivergentSecondary]);
  assert(divergenceTest.hasDivergence === true, "Model divergence detected when spread exceeds thresholds.json");
  assert(divergenceTest.divergenceDetails?.tempDivergence === true, "Temperature divergence detected");
  assert(divergenceTest.divergenceDetails?.precipDivergence === true, "Precipitation divergence detected");
  assert(divergenceTest.divergenceDetails?.windDivergence === true, "Wind speed divergence detected");
  console.log(`   Spread: ΔT=${divergenceTest.deltaTemperature}°C, ΔP=${divergenceTest.deltaPrecipitation}mm, ΔW=${divergenceTest.deltaWindSpeed}km/h`);

  // -------------------------------------------------------------------------
  // 2. Fisherman Marine Data (Waves & Swell)
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Marine Weather API (Waves & Swell) ---");
  // Coastal location: Paradip (Lat 20.26, Lng 86.67)
  const coastalMarine = await fetchMarineWeather(20.2644, 86.6780, "Paradip Coast");
  assert(typeof coastalMarine.waveHeight_m === "number", "Coastal wave height is a valid number");
  assert(typeof coastalMarine.swellWaveHeight_m === "number", "Coastal swell height is a valid number");
  assert(coastalMarine.badge === "LIVE" || coastalMarine.badge === "SAMPLE", "Coastal marine has valid badge");
  console.log(`   Paradip: Wave=${coastalMarine.waveHeight_m}m, Swell=${coastalMarine.swellWaveHeight_m}m, Period=${coastalMarine.wavePeriodSeconds}s, SeaState=${coastalMarine.seaStateClassification}, Badge=${coastalMarine.badge}`);

  // Inland location: Nashik (Lat 19.99, Lng 73.78) -> Expect graceful SAMPLE fallback
  const inlandMarine = await fetchMarineWeather(19.9975, 73.7898, "Nashik Inland");
  assert(inlandMarine.badge === "SAMPLE", "Inland coordinates gracefully fallback to SAMPLE badge");
  assert(/inland/i.test(inlandMarine.notice || ""), "Inland notice properly informs user");
  console.log(`   Inland fallback badge: ${inlandMarine.badge} (Notice: ${inlandMarine.notice})`);

  // -------------------------------------------------------------------------
  // 3. Location-Based Forecasting (H3 Cell IDs & Reverse Admin Geocoding)
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Spatial H3 Grid & Administrative Reverse Geocoding ---");
  const h7 = latLngToH3Index(19.9975, 73.7898, 7);
  const h8 = latLngToH3Index(19.9975, 73.7898, 8);
  assert(h7.length === 15 && h7.startsWith("87"), "H3 Res-7 hex index is 15-char string starting with 87");
  assert(h8.length === 15 && h8.startsWith("88"), "H3 Res-8 hex index is 15-char string starting with 88");
  console.log(`   Nashik H3 Res-7: ${h7}`);
  console.log(`   Nashik H3 Res-8: ${h8}`);

  const reverseGeo = await reverseLookupDistrictAndState(19.9975, 73.7898);
  assert(reverseGeo.district.toLowerCase().includes("nashik"), `Reverse lookup district is Nashik (got ${reverseGeo.district})`);
  assert(reverseGeo.state.toLowerCase().includes("maharashtra"), `Reverse lookup state is Maharashtra (got ${reverseGeo.state})`);
  assert(reverseGeo.provenance?.badge === "LIVE" || reverseGeo.provenance?.badge === "CACHED", "Reverse lookup has provenance badge");
  console.log(`   Admin Boundary: District=${reverseGeo.district}, State=${reverseGeo.state}`);

  // -------------------------------------------------------------------------
  // 4. Climate Trend and 30-Year Historical Analysis (Code Decides, LLM Explains)
  // -------------------------------------------------------------------------
  console.log("\n--- 4. 30-Year Climate Analysis & Anomaly Calculation ---");
  const climateResult = await analyzeClimateAndHistoricalTrends(19.9975, 73.7898, "Nashik", "monsoon");
  assert(climateResult.monthlyNormals.length === 12, "Monthly normals calculated for all 12 months");
  assert(climateResult.seasonalTrends.length === 4, "Seasonal trends calculated for all 4 IMD seasons");
  assert(climateResult.multiYearTrend.length > 0, "30-year multi-year trend points populated");
  assert(climateResult.csvData.includes("Period") && climateResult.csvData.includes("30Yr_Normal_Mean"), "Raw CSV data generated with proper headers");

  const anom = climateResult.anomalyVerdict;
  assert(typeof anom.observedRainMm === "number", "Observed rainfall is a number");
  assert(typeof anom.climatologicalNormalMm === "number", "Climatological normal rainfall is a number");
  assert(typeof anom.anomalyMm === "number", "Rainfall difference anomaly is computed in code");
  assert(typeof anom.anomalyPct === "number", "Rainfall percentage anomaly is computed in code");
  assert(["LARGE_EXCESS", "EXCESS", "NORMAL", "DEFICIENT", "LARGE_DEFICIENT"].includes(anom.imdClassification), "IMD classification computed in code");
  assert(/monsoon/i.test(anom.deterministicVerdict), "Deterministic verdict string constructed by code");
  console.log(`   Monsoon Analysis for Nashik:`);
  console.log(`     Observed: ${anom.observedRainMm} mm`);
  console.log(`     30-Yr Normal: ${anom.climatologicalNormalMm} mm`);
  console.log(`     Difference: ${anom.anomalyMm >= 0 ? "+" : ""}${anom.anomalyMm} mm (${anom.anomalyPct >= 0 ? "+" : ""}${anom.anomalyPct}%)`);
  console.log(`     IMD Classification: ${anom.imdClassification}`);
  console.log(`     Deterministic Verdict: ${anom.deterministicVerdict}`);

  // -------------------------------------------------------------------------
  // 5. Full End-to-End Pipeline Query
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Full Pipeline Query: 'Was last monsoon above normal for Nashik?' ---");
  const pipelineResult: any = await executeWeatherQueryPipeline({
    query: "Was last monsoon above normal for Nashik?",
    persona: "researcher",
    language: "en",
    selectedModel: "gfs",
  });

  assert(pipelineResult.intent.intent === "historical_compare", "Query intent extracted as historical_compare");
  assert(pipelineResult.historicalClimate !== undefined, "Historical climate payload attached");
  assert(pipelineResult.spatialData !== undefined, "Spatial H3 & district reverse lookup attached");
  assert(pipelineResult.nwpComparison !== undefined, "NWP comparison attached");
  console.log(`   Intent: ${pipelineResult.intent.intent}, Location: ${pipelineResult.intent.location}`);
  console.log(`   Spatial H3: ${pipelineResult.spatialData?.h3Res7}`);
  console.log(`   Historical Anomaly: ${pipelineResult.historicalClimate?.anomalyVerdict?.deterministicVerdict}`);

  console.log("\n==================================================================");
  console.log(`RESULT: All ${passed}/${total} test assertions passed successfully!`);
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
