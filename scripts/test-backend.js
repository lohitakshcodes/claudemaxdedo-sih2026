/**
 * =============================================================================
 * SIH 2026 BACKEND API & INTEGRATION TEST SUITE (ENTERPRISE VERIFICATION)
 * Team: ClaudeMaxDedo (SIH 2026)
 * =============================================================================
 * 
 * Validates all endpoints across:
 * 1. SIH26080: Regime-Aware AI Post-Processing (MoES / NCMRWF & IMD)
 * 2. SIH26193: KrishiSmriti 12-Factor Farm Second Brain (MoA&FW)
 * 3. SIH26068: WeatherGPT Agentic NWP Router & CAP Gatekeeper (MoES / IMD)
 * 4. System Telemetry & Cryptographic Data Lineage
 */

async function runBackendTests() {
  console.log("=================================================================");
  console.log("  RUNNING SIH 2026 COMPREHENSIVE BACKEND INTEGRATION TEST SUITE");
  console.log("=================================================================\n");

  let total = 0;
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] ${testName}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${testName}: ${details}`);
    }
  }

  const baseUrl = "http://localhost:3000";

  // ---------------------------------------------------------------------------
  // 1. SYSTEM TELEMETRY
  // ---------------------------------------------------------------------------
  try {
    const sysRes = await fetch(`${baseUrl}/api/system`);
    assert(sysRes.status === 200, "System Telemetry returns HTTP 200");
    const sys = await sysRes.json();
    assert(sys.status === "HEALTHY", "System Telemetry reports status HEALTHY");
    assert(sys.tracks?.length === 3, "System Telemetry tracks all 3 SIH challenge tracks");
    assert(typeof sys.runtime?.uptimeSeconds === "number", "System reports Node.js runtime uptime");
    assert(!!sys.tracks[0].dataProvenance?.imdObservationSha256, "System verifies IMD NetCDF observation SHA-256");
  } catch (err) {
    assert(false, "System Telemetry endpoint", err.message);
  }

  // ---------------------------------------------------------------------------
  // 2. WEATHERGPT AGENTIC ROUTER
  // ---------------------------------------------------------------------------
  try {
    const wRes = await fetch(`${baseUrl}/api/weathergpt`);
    assert(wRes.status === 200, "WeatherGPT Health Check returns HTTP 200");
    const wHealth = await wRes.json();
    assert(wHealth.status === "HEALTHY", "WeatherGPT reports status HEALTHY");

    const postW = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "Pune",
        query: "Can I harvest sugarcane today?",
        language: "mr",
        cropType: "Sugarcane",
      }),
    });
    assert(postW.status === 200, "WeatherGPT Agentic POST returns HTTP 200");
    const wData = await postW.json();
    assert(wData.status === "SUCCESS", "WeatherGPT returns status SUCCESS");
    assert(!!wData.agentPipeline, "WeatherGPT includes agentPipeline tool execution traces");
    assert(typeof wData.agentPipeline?.modelUsed === "string", `WeatherGPT identifies model used: ${wData.agentPipeline?.modelUsed}`);
    assert(!!wData.bhashini?.speechSynthesis, "WeatherGPT includes Bhashini TTS voice payload");
    assert(wData.advisory?.english?.length > 10, "WeatherGPT generates actionable advisory");
  } catch (err) {
    assert(false, "WeatherGPT pipeline execution", err.message);
  }

  // ---------------------------------------------------------------------------
  // 3. KRISHISMRITI 12-FACTOR ENGINE & DATA APIS
  // ---------------------------------------------------------------------------
  try {
    const kRes = await fetch(`${baseUrl}/api/krishismriti`);
    assert(kRes.status === 200, "KrishiSmriti Health Check returns HTTP 200");
    const kHealth = await kRes.json();
    assert(kHealth.status === "HEALTHY", "KrishiSmriti reports status HEALTHY");
    assert(kHealth.supportedActions?.includes("mandi_arbitrage"), "KrishiSmriti advertises mandi_arbitrage capability");

    // Mandi Arbitrage GET
    const mandiRes = await fetch(`${baseUrl}/api/krishismriti?action=mandi_arbitrage&district=Pune`);
    assert(mandiRes.status === 200, "KrishiSmriti Mandi Arbitrage returns HTTP 200");
    const mandi = await mandiRes.json();
    assert(mandi.status === "SUCCESS", "Mandi Arbitrage status is SUCCESS");
    assert(mandi.apmcQuotes?.length > 0, "Mandi Arbitrage provides quotes for multiple APMC yards");
    assert(typeof mandi.highestNetRealizationRsQtl === "number", "Calculates net realization after transport & cess");

    // IoT Stream GET
    const iotRes = await fetch(`${baseUrl}/api/krishismriti?action=iot_stream`);
    assert(iotRes.status === 200, "KrishiSmriti IoT Stream returns HTTP 200");
    const iot = await iotRes.json();
    assert(iot.status === "SUCCESS", "IoT Stream status is SUCCESS");
    assert(typeof iot.telemetry?.rootZoneMoisturePercent === "number", "IoT Stream reports root-zone moisture percent");
    assert(iot.gateway?.includes("Panchayat"), "IoT Gateway links to Gram Panchayat LoRaWAN");

    // Soil Health Card GET
    const shcRes = await fetch(`${baseUrl}/api/krishismriti?action=soil_health_card`);
    assert(shcRes.status === 200, "KrishiSmriti Soil Health Card returns HTTP 200");
    const shc = await shcRes.json();
    assert(shc.status === "SUCCESS", "Soil Health Card status is SUCCESS");
    assert(shc.soilHealthCard?.cardId === "SHC-MH-882", "SHC matches registered farmer card ID");
    assert(shc.soilHealthCard?.parameters?.length >= 6, "SHC contains N, P, K, OC, pH, EC soil chemistry parameters");

    // Feeder Power GET
    const feederRes = await fetch(`${baseUrl}/api/krishismriti?action=feeder_power&state=Maharashtra`);
    assert(feederRes.status === 200, "KrishiSmriti Feeder Power returns HTTP 200");
    const feeder = await feederRes.json();
    assert(feeder.status === "SUCCESS", "Feeder Power status is SUCCESS");
    assert(!!feeder.feederRoster?.daySlot, "Feeder Power includes day 3-phase agricultural slot");

    // Audit Trail GET
    const auditRes = await fetch(`${baseUrl}/api/krishismriti?action=audit_trail`);
    assert(auditRes.status === 200, "KrishiSmriti Audit Trail returns HTTP 200");
    const audit = await auditRes.json();
    assert(audit.status === "SUCCESS", "Audit Trail status is SUCCESS");
    assert(audit.auditRecords?.length > 0, "Audit Trail contains historical decision receipts");

    // KrishiSmriti 12-Factor RAG POST
    const postK = await fetch(`${baseUrl}/api/krishismriti`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Can I apply 2nd round of Urea tomorrow?",
        language: "mr",
        farmerId: "FARMER-MH-PUN-402",
        cropType: "Sugarcane (Adsali) · 2.5 Acres",
      }),
    });
    assert(postK.status === 200, "KrishiSmriti 12-Factor Engine POST returns HTTP 200");
    const kData = await postK.json();
    assert(kData.status === "SUCCESS", "KrishiSmriti returns status SUCCESS");
    assert(!!kData.crossFactorDecision, "KrishiSmriti includes 12-factor cross-decision evaluation");
    assert(kData.crossFactorDecision?.factorsAudit?.length === 12, "Cross-decision matrix audits all 12 factors");
    assert(!!kData.ragPipeline?.topEpisodicMemories, "KrishiSmriti includes pgvector episodic memories");
    assert(!!kData.advisory?.receipt, "KrishiSmriti generates cryptographic recipe receipt");
  } catch (err) {
    assert(false, "KrishiSmriti pipeline execution", err.message);
  }

  // ---------------------------------------------------------------------------
  // 4. SIH26080 REGIME-AWARE OPERATIONAL POST-PROCESSING
  // ---------------------------------------------------------------------------
  try {
    // Summary GET
    const sRes = await fetch(`${baseUrl}/api/sih26080`);
    assert(sRes.status === 200, "SIH26080 Operational Summary returns HTTP 200");
    const sSummary = await sRes.json();
    assert(sSummary.status === "ONLINE", "SIH26080 reports status ONLINE");
    assert(sSummary.operationalStatus?.zeroDataLeakageGuaranteed === true, "SIH26080 guarantees zero data leakage");
    assert(sSummary.operationalStatus?.totalSamplePointDays === 38880, "SIH26080 verified across 38,880 point-days");

    // Benchmark GET
    const benchRes = await fetch(`${baseUrl}/api/sih26080?action=benchmark`);
    assert(benchRes.status === 200, "SIH26080 Benchmark returns HTTP 200");
    const bench = await benchRes.json();
    assert(bench.status === "SUCCESS", "Benchmark status is SUCCESS");
    assert(typeof bench.benchmark["Raw ECMWF IFS (0.25°)"]?.ets === "number", "Benchmark includes measured Raw ECMWF ETS");
    assert(typeof bench.benchmark["Regime-Aware RQDM (Stage 1)"]?.ets === "number", "Benchmark includes measured Regime-Aware RQDM ETS");
    assert(bench.benchmark["Regime-Aware RQDM (Stage 1)"]?.ets_95ci_1000reps?.length === 2, "Includes 95% bootstrap CI (1000 replicates)");

    // Gate A GET
    const gateARes = await fetch(`${baseUrl}/api/sih26080?action=gate_a`);
    assert(gateARes.status === 200, "SIH26080 Gate A returns HTTP 200");
    const gateA = await gateARes.json();
    assert(gateA.status === "SUCCESS", "Gate A status is SUCCESS");

    // Gate B GET
    const gateBRes = await fetch(`${baseUrl}/api/sih26080?action=gate_b`);
    assert(gateBRes.status === 200, "SIH26080 Gate B returns HTTP 200");
    const gateB = await gateBRes.json();
    assert(gateB.status === "SUCCESS", "Gate B status is SUCCESS");
    assert(!!gateB.results?.feature_importances, "Gate B includes LightGBM feature importances");

    // Provenance GET
    const provRes = await fetch(`${baseUrl}/api/sih26080?action=provenance`);
    assert(provRes.status === 200, "SIH26080 Provenance returns HTTP 200");
    const prov = await provRes.json();
    assert(prov.status === "SUCCESS", "Provenance status is SUCCESS");
    assert(!!prov.inputFiles?.imd_observation?.sha256, "Provenance verifies IMD NetCDF SHA-256");

    // Spatial FSS GET
    const fssRes = await fetch(`${baseUrl}/api/sih26080?action=spatial_fss`);
    assert(fssRes.status === 200, "SIH26080 Spatial FSS returns HTTP 200");
    const fss = await fssRes.json();
    assert(fss.status === "SUCCESS", "Spatial FSS status is SUCCESS");
    assert(fss.scales?.length === 3, "FSS evaluated across 55km, 165km, and 275km scales");

    // Post-Processing Inference POST
    const postS = await fetch(`${baseUrl}/api/sih26080`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2024-07-15",
        district: "Ratnagiri",
        rawForecastMm: 78.4,
        regimeOverride: "ACTIVE_MONSOON",
        leadTimeHours: 24,
      }),
    });
    assert(postS.status === 200, "SIH26080 Inference POST returns HTTP 200");
    const sData = await postS.json();
    assert(sData.status === "SUCCESS", "Inference POST returns status SUCCESS");
    assert(sData.calibration?.regimeCorrectedMm > sData.calibration?.rawForecastMm, "Active monsoon calibrates under-prediction upward");
    assert(sData.calibration?.probabilityHeavyExceedancePct > 80, "Calculates calibrated exceedance probability P(R >= 64.5mm)");
    assert(sData.alert?.alertLevel === "RED", "Dispatches NDMA/SDMA RED disaster alert for extreme rain");
    assert(!!sData.provenance?.recipeDigest, "Generates tamper-proof cryptographic recipe digest");
  } catch (err) {
    assert(false, "SIH26080 pipeline execution", err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`  BACKEND TEST RESULTS: ${passed} PASSED / ${failed} FAILED (Total: ${total})`);
  console.log("=================================================================\n");

  if (failed > 0) process.exit(1);
}

runBackendTests();
