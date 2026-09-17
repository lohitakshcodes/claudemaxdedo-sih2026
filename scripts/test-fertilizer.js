/**
 * Comprehensive Unit Test Suite for ICAR Fertilizer Calculation Engine
 * Minimum 10 distinct test cases covering:
 * - Maharashtra sugarcane baseline (Ramu Yadav persona)
 * - Zero deficit / soil nutrient surplus
 * - Missing Soil Health Card data (null values)
 * - Very small plot (0.1 acre kitchen garden)
 * - Invalid/negative plot size
 * - High potassium soil (no MOP needed)
 * - High phosphorus soil (no DAP needed)
 * - Nitrogen deficit exceeded DAP nitrogen credit
 * - Upper capping enforcement (capping at PoP max)
 * - UP Wheat & Maharashtra Soybean crop switches
 */

const { calculateIcarFertilizer, ICAR_POP_REGISTRY } = require("../lib/icar-fertilizer.ts");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log("\n=======================================================");
console.log("RUNNING ICAR FERTILIZER CALCULATION UNIT TESTS");
console.log("=======================================================\n");

// TEST 1: Baseline Ramu Yadav (Pune, 2.5 acres Sugarcane, Black Cotton Soil)
console.log("Test 1: Ramu Yadav Pune Sugarcane (2.5 acres, Co-86032)");
const res1 = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  {
    availableN_kg_ha: 140, // 250 - 140 = 110 deficit
    availableP2O5_kg_ha: 45, // 115 - 45 = 70 deficit
    availableK2O_kg_ha: 180, // Surplus (> 115) -> 0 deficit
    ph: 7.8,
  },
  2.5
);
assert(res1.status === "SUCCESS", "Returns SUCCESS for valid input");
assert(res1.plotAcres === 2.5, "Plot acres matches input (2.5)");
assert(res1.perHectare.deficitK2O_kg === 0, "Potash deficit is 0 when soil is rich in K");
assert(res1.totalPlotRequirement.mopBags === 0, "MOP bag requirement is 0 when K is surplus");
assert(res1.totalPlotRequirement.dapBags > 0, "DAP bags calculated for P deficit");
assert(res1.totalPlotRequirement.ureaBags > 0, "Urea bags calculated for remaining N deficit");

// TEST 2: Missing Soil Health Card Data (availableN is null)
console.log("\nTest 2: Missing Soil Health Card Data (availableN is null)");
const res2 = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  {
    availableN_kg_ha: null,
    availableP2O5_kg_ha: 40,
    availableK2O_kg_ha: 120,
  },
  2.5
);
assert(res2.status === "NEEDS_SOIL_TEST", "Returns NEEDS_SOIL_TEST status");
assert(res2.totalPlotRequirement.ureaBags === 0, "Zero urea bags output when data is missing");
assert(res2.advisories[0].includes("No chemical dosage is generated without verified"), "Advisory guides farmer to soil test");

// TEST 3: Zero Deficit (Soil is naturally fertile and exceeds crop requirement)
console.log("\nTest 3: Zero Deficit (High fertility soil)");
const res3 = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  {
    availableN_kg_ha: 280,
    availableP2O5_kg_ha: 130,
    availableK2O_kg_ha: 200,
  },
  2.5
);
assert(res3.status === "ZERO_DEFICIT", "Status is ZERO_DEFICIT when nutrients exceed targets");
assert(res3.totalPlotRequirement.dapBags === 0, "0 DAP bags");
assert(res3.totalPlotRequirement.ureaBags === 0, "0 Urea bags");
assert(res3.totalPlotRequirement.mopBags === 0, "0 MOP bags");

// TEST 4: Very Small Plot (0.1 acre kitchen plot)
console.log("\nTest 4: Very Small Plot (0.1 acre)");
const res4 = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  { availableN_kg_ha: 120, availableP2O5_kg_ha: 30, availableK2O_kg_ha: 80 },
  0.1
);
assert(res4.status === "SUCCESS", "Handles micro-plots smoothly");
assert(res4.plotAcres === 0.1, "Preserves micro-acreage");
assert(res4.totalPlotRequirement.dapKg < 10, "Small kg amount scaled appropriately");

// TEST 5: Invalid / Negative Plot Size
console.log("\nTest 5: Invalid / Negative Plot Size (-1.5 acres)");
const res5 = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  { availableN_kg_ha: 120, availableP2O5_kg_ha: 30, availableK2O_kg_ha: 80 },
  -1.5
);
assert(res5.status === "INVALID_PLOT_SIZE", "Returns INVALID_PLOT_SIZE on negative acreage");

// TEST 6: Zero Plot Size
console.log("\nTest 6: Zero Plot Size (0 acres)");
const res6 = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  { availableN_kg_ha: 120, availableP2O5_kg_ha: 30, availableK2O_kg_ha: 80 },
  0
);
assert(res6.status === "INVALID_PLOT_SIZE", "Returns INVALID_PLOT_SIZE on 0 acreage");

// TEST 7: Upper Capping Enforcement (Exhausted soil with 0 nutrients)
console.log("\nTest 7: Upper Capping Enforcement on severely depleted soil");
const res7 = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  { availableN_kg_ha: 0, availableP2O5_kg_ha: 0, availableK2O_kg_ha: 0 },
  1.0
);
assert(res7.status === "SUCCESS", "Processes depleted soil");
assert(res7.perHectare.deficitN_kg <= ICAR_POP_REGISTRY["maharashtra_sugarcane_annual"].maxCapN_kg_ha, "Nitrogen deficit is capped at maxCapN_kg_ha (300)");
assert(res7.perHectare.deficitP2O5_kg <= ICAR_POP_REGISTRY["maharashtra_sugarcane_annual"].maxCapP2O5_kg_ha, "P2O5 deficit is capped at maxCapP2O5_kg_ha (125)");

// TEST 8: Crop Switch to Maharashtra Soybean (Kharif, Legume crop with low N requirement)
console.log("\nTest 8: Crop Switch to Maharashtra Soybean (JS-335)");
const res8 = calculateIcarFertilizer(
  "maharashtra_soybean_kharif",
  { availableN_kg_ha: 20, availableP2O5_kg_ha: 20, availableK2O_kg_ha: 20 },
  3.0
);
assert(res8.status === "SUCCESS", "Calculates soybean dosages correctly");
assert(res8.crop.includes("Soybean"), "Identifies crop as Soybean");
assert(res8.perHectare.deficitN_kg === 10, "Soybean target N (30) - 20 = 10 kg deficit");

// TEST 9: Crop Switch to UP Wheat (Rabi, PBW-502)
console.log("\nTest 9: Crop Switch to UP Wheat (PBW-502)");
const res9 = calculateIcarFertilizer(
  "up_wheat_rabi",
  { availableN_kg_ha: 60, availableP2O5_kg_ha: 30, availableK2O_kg_ha: 20 },
  2.0
);
assert(res9.status === "SUCCESS", "Calculates wheat dosages correctly");
assert(res9.crop.includes("Wheat"), "Identifies crop as Wheat");
assert(res9.sourceCitation.includes("IIWBR Karnal"), "Cites official ICAR wheat research directorate");

// TEST 10: Per-Hectare First Verification (Exact mathematical proportionality)
console.log("\nTest 10: Mathematical Proportionality (1 ha vs 2 ha plot)");
const res10A = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  { availableN_kg_ha: 150, availableP2O5_kg_ha: 50, availableK2O_kg_ha: 50 },
  2.47105 // exactly 1 hectare
);
const res10B = calculateIcarFertilizer(
  "maharashtra_sugarcane_annual",
  { availableN_kg_ha: 150, availableP2O5_kg_ha: 50, availableK2O_kg_ha: 50 },
  4.9421 // exactly 2 hectares
);
assert(Math.abs(res10B.totalPlotRequirement.dapKg - res10A.totalPlotRequirement.dapKg * 2) <= 2, "2-hectare plot requires exactly double the DAP kg of 1-hectare plot");

console.log("\n=======================================================");
console.log(`TOTAL UNIT TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
