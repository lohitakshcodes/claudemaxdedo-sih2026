/**
 * =============================================================================
 * SIH 2026 BACKEND API & INTEGRATION TEST SUITE
 * =============================================================================
 */

async function runBackendTests() {
  console.log("=================================================================");
  console.log("  RUNNING SIH 2026 BACKEND INTEGRATION TEST SUITE");
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

  // 1. Health checks
  try {
    const wRes = await fetch(`${baseUrl}/api/weathergpt`);
    assert(wRes.status === 200, "WeatherGPT Health Check returns HTTP 200");
    const wHealth = await wRes.json();
    assert(wHealth.status === "HEALTHY", "WeatherGPT reports status HEALTHY");

    const kRes = await fetch(`${baseUrl}/api/krishismriti`);
    assert(kRes.status === 200, "KrishiSmriti Health Check returns HTTP 200");
    const kHealth = await kRes.json();
    assert(kHealth.status === "HEALTHY", "KrishiSmriti reports status HEALTHY");
  } catch (err) {
    assert(false, "API Health check connection", err.message);
  }

  // 2. WeatherGPT Agentic POST check
  try {
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
    assert(false, "WeatherGPT POST execution", err.message);
  }

  // 3. KrishiSmriti RAG Engine POST check
  try {
    const postK = await fetch(`${baseUrl}/api/krishismriti`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Can I apply 2nd round of Urea tomorrow?",
        language: "bho",
        farmerId: "FARMER-UP-BRB-1049",
        cropType: "Wheat (PBW-502)",
      }),
    });
    assert(postK.status === 200, "KrishiSmriti RAG Engine POST returns HTTP 200");
    const kData = await postK.json();
    assert(kData.status === "SUCCESS", "KrishiSmriti returns status SUCCESS");
    assert(!!kData.ragPipeline?.topEpisodicMemories, "KrishiSmriti includes pgvector episodic memories");
    assert(!!kData.ragPipeline?.groundIotTelemetry, "KrishiSmriti includes live Panchayat IoT telemetry");
    assert(kData.advisory?.english?.length > 10, "KrishiSmriti generates stateful RAG advisory");
  } catch (err) {
    assert(false, "KrishiSmriti POST execution", err.message);
  }

  console.log("\n=================================================================");
  console.log(`  BACKEND TEST RESULTS: ${passed} PASSED / ${failed} FAILED (Total: ${total})`);
  console.log("=================================================================\n");

  if (failed > 0) process.exit(1);
}

runBackendTests();
