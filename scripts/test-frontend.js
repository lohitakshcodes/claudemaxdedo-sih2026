/**
 * =============================================================================
 * SIH 2026 FRONTEND INTEGRITY & REGRESSION TEST SUITE
 * =============================================================================
 * 
 * Tests:
 * 1. Component Code Lint & Architecture Check (Guards against auto-scroll regressions)
 * 2. Static and Dynamic Page Rendering (/, /weathergpt, /krishismriti)
 * 3. Asset & Bundle Integrity (CSS Stylesheets, Tailwind utility classes, JS chunks)
 * 4. Critical UI Element & Anchor Navigation Verification
 */

const fs = require("fs");
const path = require("path");

async function runFrontendTests() {
  console.log("=================================================================");
  console.log("  RUNNING SIH 2026 FRONTEND INTEGRITY & REGRESSION TEST SUITE");
  console.log("=================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, testName, details = "") {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${testName}`);
    } else {
      failedTests++;
      console.error(`  [FAIL] ${testName}: ${details}`);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: COMPONENT CODE INTEGRITY (SCROLL REGRESSION GUARD)
  // ---------------------------------------------------------------------------
  console.log("--- TEST SUITE 1: Code Architecture & Auto-Scroll Guard ---");

  const telemetryPath = path.join(__dirname, "..", "components", "telemetry-stream.tsx");
  const telemetryContent = fs.readFileSync(telemetryPath, "utf-8");

  // Rule 1: Must NOT use global window-hijacking scrollIntoView
  const hasUnsafeScrollIntoView = telemetryContent.includes("terminalEndRef.current.scrollIntoView");
  assert(
    !hasUnsafeScrollIntoView,
    "TelemetryStream avoids global scrollIntoView()",
    "Found un-scoped scrollIntoView() which hijacks whole-page window scroll!"
  );

  // Rule 2: Must use container-scoped ref
  const hasContainerRef =
    telemetryContent.includes("terminalContainerRef") &&
    telemetryContent.includes("terminalContainerRef.current.scrollTo");
  assert(
    hasContainerRef,
    "TelemetryStream uses container-scoped scrollTo/scrollTop",
    "Missing container-scoped scrolling ref."
  );

  // Rule 3: RadarMapVisualizer component verification
  const radarMapPath = path.join(__dirname, "..", "components", "radar-map-visualizer.tsx");
  const radarMapExists = fs.existsSync(radarMapPath);
  assert(radarMapExists, "RadarMapVisualizer component exists on disk");
  if (radarMapExists) {
    const radarContent = fs.readFileSync(radarMapPath, "utf-8");
    assert(
      radarContent.includes("ST_Contains"),
      "RadarMapVisualizer implements PostGIS ST_Contains spatial query rendering"
    );
    assert(
      radarContent.includes("PRESET_LOCATIONS"),
      "RadarMapVisualizer provides interactive location presets (Pune, Varanasi, etc.)"
    );
  }

  // Rule 4: KrishiSmriti Farmer-First PWA Mode separation
  const mobileModalPath = path.join(__dirname, "..", "components", "mobile-phone-modal.tsx");
  const mobileModalContent = fs.readFileSync(mobileModalPath, "utf-8");
  assert(
    mobileModalContent.includes("KrishiSmriti") && mobileModalContent.includes("Data Sovereignty"),
    "MobilePhoneModal features standalone KrishiSmriti farmer-first theme and data sovereignty"
  );
  assert(
    mobileModalContent.includes("Skip Onboarding") || mobileModalContent.includes("Launch Demo Farm"),
    "MobilePhoneModal provides evaluator 1-click demo farm bypass button"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: SSR / LIVE HTTP PAGE RENDERING
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 2: Live Frontend Route & Asset Verification ---");

  const pagesToTest = [
    { route: "/", name: "Root Evaluator Gateway" },
    { route: "/weathergpt", name: "WeatherGPT Portal (MoES/IMD)" },
    { route: "/krishismriti", name: "KrishiSmriti Portal (Agri)" },
  ];

  const baseUrl = "http://localhost:3000";

  for (const page of pagesToTest) {
    try {
      const res = await fetch(`${baseUrl}${page.route}`);
      assert(res.status === 200, `Route ${page.route} (${page.name}) returns HTTP 200`);

      const html = await res.text();
      assert(html.length > 500, `Route ${page.route} renders full HTML payload (${html.length} bytes)`);

      // Verify Tailwind & CSS links
      const cssRegex = /href="(\/_next\/static\/[^"]+\.css[^"]*)"/g;
      const cssMatches = [...html.matchAll(cssRegex)].map((m) => m[1]);
      assert(cssMatches.length > 0, `Route ${page.route} links valid CSS stylesheet(s)`);

      for (const cssUrl of cssMatches) {
        const cssRes = await fetch(`${baseUrl}${cssUrl}`);
        assert(
          cssRes.status === 200,
          `CSS Asset (${cssUrl.split("?")[0]}) loads with HTTP 200`,
          `Status: ${cssRes.status}`
        );
      }

      // Verify JavaScript client bundles
      const jsRegex = /src="(\/_next\/static\/[^"]+\.js[^"]*)"/g;
      const jsMatches = [...html.matchAll(jsRegex)].map((m) => m[1]);
      assert(jsMatches.length >= 3, `Route ${page.route} links all client JS chunks (found ${jsMatches.length})`);

      for (const jsUrl of jsMatches.slice(0, 3)) {
        const jsRes = await fetch(`${baseUrl}${jsUrl}`);
        assert(
          jsRes.status === 200,
          `JS Chunk (${path.basename(jsUrl.split("?")[0])}) loads with HTTP 200`,
          `Status: ${jsRes.status}`
        );
      }

      // Verify essential UI anchors in portal pages
      if (page.route !== "/") {
        assert(html.includes('id="live-telemetry"'), `Route ${page.route} contains Live Telemetry section`);
        assert(html.includes('id="architecture"'), `Route ${page.route} contains Architecture section`);
        assert(html.includes('id="problem"'), `Route ${page.route} contains Problem Diagnostic section`);
      }
    } catch (err) {
      assert(false, `Route ${page.route} fetch connection`, err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`  TEST RESULTS: ${passedTests} PASSED / ${failedTests} FAILED (Total: ${totalTests})`);
  console.log("=================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFrontendTests();
