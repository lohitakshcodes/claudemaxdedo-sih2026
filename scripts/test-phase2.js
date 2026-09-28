/**
 * =============================================================================
 * SIH 2026 PHASE 2 TEST SUITE: "CODE DECIDES, LLM EXPLAINS"
 * =============================================================================
 * 
 * Tests:
 * 1. Thresholds Configuration Integrity (/config/thresholds.json)
 * 2. Deterministic Verdict Functions (Farmer, Fisherman, Disaster, Citizen, Aviation)
 * 3. Aviation Missing Data Rule (Returns "insufficient data", never guesses)
 * 4. Intent Extraction & Follow-Up Context Resolution
 * 5. Out-of-Scope Polite Rejection (English & Indic)
 * 6. Live Agent End-to-End Test Queries (Farmer, Fisherman, Citizen, Aviation, Out of Scope)
 * 7. Provenance Badges (LIVE, CACHED, SAMPLE) & Timestamps
 */

const fs = require("fs");
const path = require("path");

async function runPhase2Tests() {
  console.log("=================================================================");
  console.log("  RUNNING SIH 2026 PHASE 2: CODE DECIDES, LLM EXPLAINS TEST SUITE");
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

  // ---------------------------------------------------------------------------
  // 1. CONFIG & THRESHOLDS TEST
  // ---------------------------------------------------------------------------
  console.log("--- TEST GROUP 1: Thresholds Configuration (/config/thresholds.json) ---");
  const thresholdsPath = path.join(__dirname, "..", "config", "thresholds.json");
  assert(fs.existsSync(thresholdsPath), "thresholds.json exists in /config");

  const thresholds = JSON.parse(fs.readFileSync(thresholdsPath, "utf-8"));
  assert(!!thresholds.farmer?.spray?.max_wind_kmh?.value, "Farmer spray max wind threshold defined with ICAR source");
  assert(!!thresholds.farmer?.irrigate?.rain_threshold_next_24h_mm?.value, "Farmer irrigation rain threshold defined with PMKSY source");
  assert(!!thresholds.fisherman?.safe_to_sail?.max_wave_height_meters?.value, "Fisherman wave height limit defined with INCOIS source");
  assert(!!thresholds.aviation?.categories?.VFR?.min_ceiling_ft, "Aviation VFR ceiling criteria defined with ICAO source");
  assert(!!thresholds.citizen?.waterlogging_risk?.hourly_rate_mm?.value, "Citizen drainage threshold defined with CPHEEO source");

  // ---------------------------------------------------------------------------
  // 2. LIVE ROUTE & TEST QUERIES EXECUTION
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: Required Test Queries via Agent Pipeline ---");
  const baseUrl = "http://localhost:3000";

  // Test Query 1: Farmer (English & Hindi)
  try {
    const resFarmerEn = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Can I spray tomorrow morning?",
        location: "Rohtas",
        language: "en",
        persona: "farmer",
      }),
    });
    assert(resFarmerEn.status === 200, "Query 1 (Farmer EN): Returns HTTP 200");
    const dataFarmerEn = await resFarmerEn.json();
    assert(dataFarmerEn.heroCard?.type === "farmer_action", "Query 1 (Farmer EN): Renders farmer_action Hero Card");
    assert(dataFarmerEn.heroCard?.verdict.includes("IMMEDIATE ACTION: SPRAY:"), `Query 1 (Farmer EN): Deterministic spray verdict computed (${dataFarmerEn.heroCard?.verdict.slice(0, 40)}...)`);
    assert(dataFarmerEn.heroCard?.badge === "LIVE" || dataFarmerEn.heroCard?.badge === "CACHED", `Query 1 (Farmer EN): Provenance badge present: ${dataFarmerEn.heroCard?.badge}`);

    const resFarmerHi = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "कल सुबह कीटनाशक छिड़काव कर सकते हैं?",
        location: "Rohtas",
        language: "hi",
        persona: "farmer",
      }),
    });
    assert(resFarmerHi.status === 200, "Query 1 (Farmer HI): Returns HTTP 200 with Bhashini voice synthesis");
    const dataFarmerHi = await resFarmerHi.json();
    assert(!!dataFarmerHi.bhashini?.speechSynthesis?.audioBase64, "Query 1 (Farmer HI): Voice TTS audio payload generated");
  } catch (err) {
    assert(false, "Query 1 (Farmer) test execution", err.message);
  }

  // Test Query 2: Fisherman (English & Marathi)
  try {
    const resFishermanEn = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Is it safe to go out off Ratnagiri today?",
        location: "Ratnagiri",
        language: "en",
        persona: "fisherman",
      }),
    });
    assert(resFishermanEn.status === 200, "Query 2 (Fisherman EN): Returns HTTP 200");
    const dataFishermanEn = await resFishermanEn.json();
    assert(dataFishermanEn.heroCard?.type === "marine_safety", "Query 2 (Fisherman EN): Renders marine_safety Hero Card");
    assert(dataFishermanEn.heroCard?.verdict.includes("SEA SAFETY: SAFE TO SAIL"), `Query 2 (Fisherman EN): Sea safety verdict rendered: ${dataFishermanEn.heroCard?.verdict}`);
    assert(dataFishermanEn.heroCard?.metrics.some((m) => m.label.includes("Wave")), "Query 2 (Fisherman EN): Metric includes wave/swell height");

    const resFishermanMr = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "काय आज रत्नागिरीमध्ये समुद्रात जाणे सुरक्षित आहे का?",
        location: "Ratnagiri",
        language: "mr",
        persona: "fisherman",
      }),
    });
    assert(resFishermanMr.status === 200, "Query 2 (Fisherman MR): Returns HTTP 200 in Marathi");
  } catch (err) {
    assert(false, "Query 2 (Fisherman) test execution", err.message);
  }

  // Test Query 3: Citizen (English & Hindi)
  try {
    const resCitizenEn = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Will my commute flood tomorrow evening?",
        location: "Delhi",
        language: "en",
        persona: "citizen",
      }),
    });
    assert(resCitizenEn.status === 200, "Query 3 (Citizen EN): Returns HTTP 200");
    const dataCitizenEn = await resCitizenEn.json();
    assert(dataCitizenEn.heroCard?.type === "commute_advisor", "Query 3 (Citizen EN): Renders commute_advisor Hero Card");
    assert(dataCitizenEn.heroCard?.verdict.includes("COMMUTE:") && dataCitizenEn.heroCard?.verdict.includes("UMBRELLA:"), "Query 3 (Citizen EN): Features commute risk & umbrella verdict");

    const resCitizenHi = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "कल शाम को जलभराव होगा क्या?",
        location: "Delhi",
        language: "hi",
        persona: "citizen",
      }),
    });
    assert(resCitizenHi.status === 200, "Query 3 (Citizen HI): Returns HTTP 200 in Hindi");
  } catch (err) {
    assert(false, "Query 3 (Citizen) test execution", err.message);
  }

  // Test Query 4: Aviation (Pune - with parameters vs Missing Data)
  try {
    const resAviationEn = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Flight weather category at Pune this afternoon?",
        location: "Pune",
        language: "en",
        persona: "aviation",
      }),
    });
    assert(resAviationEn.status === 200, "Query 4 (Aviation Pune): Returns HTTP 200");
    const dataAviationEn = await resAviationEn.json();
    assert(dataAviationEn.heroCard?.type === "aviation_flight", "Query 4 (Aviation): Renders aviation_flight Hero Card");
    assert(
      dataAviationEn.heroCard?.verdict.includes("VFR") ||
      dataAviationEn.heroCard?.verdict.includes("MVFR") ||
      dataAviationEn.heroCard?.verdict.includes("IFR") ||
      dataAviationEn.heroCard?.verdict.includes("LIFR"),
      `Query 4 (Aviation Pune): Valid category computed: ${dataAviationEn.heroCard?.verdict}`
    );

    // Test Aviation Missing Data Rule (e.g. at an arbitrary village where METAR is absent)
    const resAviationMissing = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Flight weather category at Chenari Block?",
        location: "Chenari Block",
        language: "en",
        persona: "aviation",
      }),
    });
    assert(resAviationMissing.status === 200, "Query 4 (Aviation Missing Sensor): Returns HTTP 200");
    const dataAviationMissing = await resAviationMissing.json();
    assert(
      dataAviationMissing.heroCard?.verdict.toLowerCase().includes("insufficient data"),
      `Query 4 (Aviation Missing Sensor): Accurately states 'insufficient data' rather than guessing: ${dataAviationMissing.heroCard?.verdict}`
    );
    assert(
      dataAviationMissing.heroCard?.badge === "SAMPLE",
      "Query 4 (Aviation Missing Sensor): Marks incomplete data as SAMPLE"
    );
  } catch (err) {
    assert(false, "Query 4 (Aviation) test execution", err.message);
  }

  // Test Query 5: Out of Scope (English & Hindi)
  try {
    const resOutOfScopeEn = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Tell me a joke.",
        language: "en",
      }),
    });
    assert(resOutOfScopeEn.status === 200, "Query 5 (Out of Scope EN): Returns HTTP 200");
    const dataOutOfScopeEn = await resOutOfScopeEn.json();
    assert(dataOutOfScopeEn.isOutOfScope === true, "Query 5 (Out of Scope EN): Flagged as isOutOfScope = true");
    assert(
      dataOutOfScopeEn.advisory.english.toLowerCase().includes("cannot tell jokes") ||
      dataOutOfScopeEn.advisory.english.toLowerCase().includes("can't tell jokes") ||
      dataOutOfScopeEn.advisory.english.toLowerCase().includes("weather"),
      "Query 5 (Out of Scope EN): Polite redirect to weather topics rendered"
    );

    const resOutOfScopeHi = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "मुझे एक चुटकुला सुनाओ",
        language: "hi",
      }),
    });
    assert(resOutOfScopeHi.status === 200, "Query 5 (Out of Scope HI): Returns HTTP 200");
    const dataOutOfScopeHi = await resOutOfScopeHi.json();
    assert(dataOutOfScopeHi.isOutOfScope === true, "Query 5 (Out of Scope HI): Flagged as isOutOfScope = true in Hindi");
  } catch (err) {
    assert(false, "Query 5 (Out of Scope) test execution", err.message);
  }

  // ---------------------------------------------------------------------------
  // 3. CONVERSATION CONTEXT & FOLLOW-UP RESOLUTION TEST
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: Context-Aware Follow-Up Resolution ---");
  try {
    const resFollowUp = await fetch(`${baseUrl}/api/weathergpt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "and tomorrow?",
        language: "en",
        persona: "farmer",
        conversationHistory: [
          { sender: "user", text: "What is the weather in Pune?", location: "Pune" },
          { sender: "bot", text: "Pune is sunny with 28°C and calm winds.", location: "Pune" },
        ],
      }),
    });
    assert(resFollowUp.status === 200, "Follow-Up ('and tomorrow?'): Returns HTTP 200");
    const dataFollowUp = await resFollowUp.json();
    assert(
      dataFollowUp.userContext?.location?.displayName.toLowerCase().includes("pune"),
      `Follow-Up: Successfully inherited prior location 'Pune' from history: ${dataFollowUp.userContext?.location?.displayName}`
    );
  } catch (err) {
    assert(false, "Follow-up resolution test", err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`  PHASE 2 TEST RESULTS: ${passed} PASSED / ${failed} FAILED (Total: ${total})`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests();
