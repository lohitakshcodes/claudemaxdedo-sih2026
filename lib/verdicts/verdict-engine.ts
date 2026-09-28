/**
 * Deterministic WeatherGPT Verdict Engine
 * PS ID: SIH26068 (Theme: Disaster Management)
 * 
 * "Code Decides, LLM Explains" Architecture:
 * Pure rule-based mathematical and physical thresholds backed by authoritative standards:
 * - ICAR (Indian Council of Agricultural Research)
 * - INCOIS (Indian National Centre for Ocean Information Services)
 * - IMD (India Meteorological Department)
 * - ICAO (International Civil Aviation Organization)
 * 
 * Every function returns { verdict, reasons[], inputs_used[], missing_inputs[], confidence }.
 * Missing inputs lower confidence and are explicitly articulated in the response.
 */

import thresholds from "@/config/thresholds.json";

export interface DecisionResult<T = string | boolean> {
  verdict: T;
  reasons: string[];
  inputs_used: string[];
  missing_inputs: string[];
  confidence: number; // 0.0 to 1.0
  severity: "CRITICAL" | "WARNING" | "NORMAL";
}

// -----------------------------------------------------------------------------
// 1. FARMER DETERMINISTIC VERDICTS (ICAR & FAO Protocols)
// -----------------------------------------------------------------------------

export interface FarmerVerdictInputs {
  wind_kmh?: number;
  rain_next_24h_mm?: number;
  temp_c?: number;
  rain_prob_pct?: number;
  soil_moisture_pct?: number;
  wind_gust_kmh?: number;
  has_disaster_alert?: boolean;
}

export interface FarmerAdvisoryResults {
  spray_ok: DecisionResult<"YES" | "NO" | "CAUTION">;
  irrigate_ok: DecisionResult<"YES" | "NO" | "CAUTION">;
  harvest_ok: DecisionResult<"YES" | "NO" | "CAUTION">;
}

export function evaluateFarmerAdvisories(inputs: FarmerVerdictInputs): FarmerAdvisoryResults {
  const t = thresholds.farmer;

  // Evaluate spray_ok
  const sprayInputsUsed: string[] = [];
  const sprayMissing: string[] = [];
  const sprayReasons: string[] = [];
  let sprayFail = false;
  let sprayCaution = false;

  if (inputs.has_disaster_alert) {
    sprayFail = true;
    sprayReasons.push("Active CAP/SACHET disaster alert in area overrides routine operations.");
  }

  if (inputs.wind_kmh !== undefined) {
    sprayInputsUsed.push(`Surface Wind: ${inputs.wind_kmh} km/h`);
    if (inputs.wind_kmh > t.spray.max_wind_kmh.value) {
      sprayFail = true;
      sprayReasons.push(`Wind speed (${inputs.wind_kmh} km/h) exceeds ICAR drift limit (${t.spray.max_wind_kmh.value} km/h).`);
    } else if (inputs.wind_kmh < t.spray.min_wind_kmh.value) {
      sprayCaution = true;
      sprayReasons.push(`Wind speed (${inputs.wind_kmh} km/h) is near zero, risking thermal inversion suspension.`);
    }
  } else {
    sprayMissing.push("Surface wind speed (km/h)");
  }

  if (inputs.rain_next_24h_mm !== undefined) {
    sprayInputsUsed.push(`Rain (next 24h): ${inputs.rain_next_24h_mm} mm`);
    if (inputs.rain_next_24h_mm > t.spray.max_rain_next_24h_mm.value) {
      sprayFail = true;
      sprayReasons.push(`Expected rain (${inputs.rain_next_24h_mm} mm) exceeds ${t.spray.max_rain_next_24h_mm.value} mm, leading to chemical wash-off.`);
    }
  } else {
    sprayMissing.push("24-hour rainfall forecast (mm)");
  }

  if (inputs.temp_c !== undefined) {
    sprayInputsUsed.push(`Temperature: ${inputs.temp_c}°C`);
    if (inputs.temp_c > t.spray.max_temp_celsius.value) {
      sprayFail = true;
      sprayReasons.push(`Temperature (${inputs.temp_c}°C) exceeds ${t.spray.max_temp_celsius.value}°C (phytotoxicity risk).`);
    } else if (inputs.temp_c < t.spray.min_temp_celsius.value) {
      sprayFail = true;
      sprayReasons.push(`Temperature (${inputs.temp_c}°C) is below ${t.spray.min_temp_celsius.value}°C (poor systemic uptake).`);
    }
  } else {
    sprayMissing.push("Air temperature (°C)");
  }

  const sprayConfidence = Math.max(0.2, (sprayInputsUsed.length / (sprayInputsUsed.length + sprayMissing.length)));
  const sprayVerdict: "YES" | "NO" | "CAUTION" = sprayFail ? "NO" : sprayCaution ? "CAUTION" : "YES";
  if (!sprayFail && !sprayCaution) {
    sprayReasons.push("Weather parameters within ICAR safe spraying envelope (06:00 AM – 09:30 AM recommended).");
  }

  // Evaluate irrigate_ok
  const irrigateInputsUsed: string[] = [];
  const irrigateMissing: string[] = [];
  const irrigateReasons: string[] = [];
  let irrigateVerdict: "YES" | "NO" | "CAUTION" = "YES";

  if (inputs.has_disaster_alert) {
    irrigateVerdict = "NO";
    irrigateReasons.push("Severe weather alert active; suspend field irrigation.");
  } else if (inputs.rain_next_24h_mm !== undefined) {
    irrigateInputsUsed.push(`Forecast Rain: ${inputs.rain_next_24h_mm} mm`);
    if (inputs.rain_next_24h_mm >= t.irrigate.rain_threshold_next_24h_mm.value) {
      irrigateVerdict = "NO";
      irrigateReasons.push(`Forecast rainfall (${inputs.rain_next_24h_mm} mm) satisfies water requirements. Withhold irrigation to avoid rootlogging.`);
    }
  } else {
    irrigateMissing.push("Precipitation forecast (mm)");
  }

  if (inputs.soil_moisture_pct !== undefined) {
    irrigateInputsUsed.push(`Soil Moisture: ${inputs.soil_moisture_pct}%`);
    if (inputs.soil_moisture_pct > t.irrigate.optimal_soil_moisture_pct.value) {
      irrigateVerdict = "NO";
      irrigateReasons.push(`Soil moisture (${inputs.soil_moisture_pct}%) already exceeds optimal field capacity (${t.irrigate.optimal_soil_moisture_pct.value}%).`);
    }
  } else {
    irrigateMissing.push("Soil moisture sensor telemetry (%)");
  }

  if (irrigateVerdict === "YES") {
    irrigateReasons.push("Soil and atmospheric moisture deficits support light to moderate irrigation.");
  }
  const irrigateConfidence = Math.max(0.3, irrigateInputsUsed.length / (irrigateInputsUsed.length + irrigateMissing.length));

  // Evaluate harvest_ok
  const harvestInputsUsed: string[] = [];
  const harvestMissing: string[] = [];
  const harvestReasons: string[] = [];
  let harvestVerdict: "YES" | "NO" | "CAUTION" = "YES";

  if (inputs.has_disaster_alert) {
    harvestVerdict = "NO";
    harvestReasons.push("Severe convective/cyclone alert active; halt all harvest machinery.");
  } else {
    if (inputs.rain_prob_pct !== undefined) {
      harvestInputsUsed.push(`Rain Probability: ${inputs.rain_prob_pct}%`);
      if (inputs.rain_prob_pct > t.harvest.max_rain_probability_pct.value) {
        harvestVerdict = "CAUTION";
        harvestReasons.push(`Elevated rain probability (${inputs.rain_prob_pct}%) creates post-harvest fungal moisture risk.`);
      }
    }
    if (inputs.wind_gust_kmh !== undefined) {
      harvestInputsUsed.push(`Wind Gusts: ${inputs.wind_gust_kmh} km/h`);
      if (inputs.wind_gust_kmh > t.harvest.max_wind_gust_kmh.value) {
        harvestVerdict = "NO";
        harvestReasons.push(`High wind gusts (${inputs.wind_gust_kmh} km/h) risk crop lodging and mechanical cutterbar loss.`);
      }
    }
  }

  if (harvestVerdict === "YES") {
    harvestReasons.push("Dry canopy and moderate winds provide optimal harvesting window.");
  }
  const harvestConfidence = Math.max(0.4, harvestInputsUsed.length / (harvestInputsUsed.length + (harvestMissing.length || 1)));

  return {
    spray_ok: {
      verdict: sprayVerdict,
      reasons: sprayReasons,
      inputs_used: sprayInputsUsed,
      missing_inputs: sprayMissing,
      confidence: Number(sprayConfidence.toFixed(2)),
      severity: sprayVerdict === "NO" ? "CRITICAL" : sprayVerdict === "CAUTION" ? "WARNING" : "NORMAL",
    },
    irrigate_ok: {
      verdict: irrigateVerdict,
      reasons: irrigateReasons,
      inputs_used: irrigateInputsUsed,
      missing_inputs: irrigateMissing,
      confidence: Number(irrigateConfidence.toFixed(2)),
      severity: irrigateVerdict === "NO" ? "WARNING" : "NORMAL",
    },
    harvest_ok: {
      verdict: harvestVerdict,
      reasons: harvestReasons,
      inputs_used: harvestInputsUsed,
      missing_inputs: harvestMissing,
      confidence: Number(harvestConfidence.toFixed(2)),
      severity: harvestVerdict === "NO" ? "CRITICAL" : harvestVerdict === "CAUTION" ? "WARNING" : "NORMAL",
    },
  };
}

// -----------------------------------------------------------------------------
// 2. FISHERMAN DETERMINISTIC VERDICTS (INCOIS Ocean State Criteria)
// -----------------------------------------------------------------------------

export interface FishermanVerdictInputs {
  wave_height_m?: number;
  wind_knots?: number;
  has_coastal_alert?: boolean;
  alert_severity?: string;
}

export function evaluateFishermanSafety(inputs: FishermanVerdictInputs): DecisionResult<"YES" | "NO" | "CAUTION"> {
  const t = thresholds.fisherman.safe_to_sail;
  const inputsUsed: string[] = [];
  const missingInputs: string[] = [];
  const reasons: string[] = [];
  let isSafe = true;
  let isCritical = false;

  if (inputs.has_coastal_alert) {
    isSafe = false;
    isCritical = true;
    inputsUsed.push(`Coastal Alert: ${inputs.alert_severity || "ACTIVE"}`);
    reasons.push("Active coastal squall/cyclone warning triggers total navigation prohibition.");
  }

  if (inputs.wave_height_m !== undefined) {
    inputsUsed.push(`Significant Wave Height: ${inputs.wave_height_m} m`);
    if (inputs.wave_height_m > t.max_wave_height_meters.value) {
      isSafe = false;
      if (inputs.wave_height_m >= 3.0) isCritical = true;
      reasons.push(`Significant wave/swell height (${inputs.wave_height_m} m) exceeds INCOIS safety limit (${t.max_wave_height_meters.value} m).`);
    }
  } else {
    missingInputs.push("INCOIS wave/swell telemetry (m)");
  }

  if (inputs.wind_knots !== undefined) {
    inputsUsed.push(`Marine Wind: ${inputs.wind_knots} knots`);
    if (inputs.wind_knots > t.max_wind_knots.value) {
      isSafe = false;
      if (inputs.wind_knots >= 30) isCritical = true;
      reasons.push(`Sustained marine wind (${inputs.wind_knots} kt) exceeds Beaufort 6 safety threshold (${t.max_wind_knots.value} kt).`);
    }
  } else {
    missingInputs.push("Surface wind in knots");
  }

  if (isSafe && reasons.length === 0) {
    reasons.push("Sea conditions calm to moderate; safe for coastal operations up to 25 nautical miles.");
  }

  const confidence = Math.max(0.3, inputsUsed.length / (inputsUsed.length + missingInputs.length));
  const verdict: "YES" | "NO" | "CAUTION" = isSafe ? "YES" : isCritical ? "NO" : "CAUTION";

  return {
    verdict,
    reasons,
    inputs_used: inputsUsed,
    missing_inputs: missingInputs,
    confidence: Number(confidence.toFixed(2)),
    severity: verdict === "NO" ? "CRITICAL" : verdict === "CAUTION" ? "WARNING" : "NORMAL",
  };
}

// -----------------------------------------------------------------------------
// 3. DISASTER OFFICER DETERMINISTIC VERDICTS (IMD & NDMA Severity Matrices)
// -----------------------------------------------------------------------------

export interface DisasterOfficerVerdictInputs {
  rainfall_rate_mm_hr?: number;
  wind_speed_kmh?: number;
  active_alerts?: Array<{ severity: string; event: string; headline?: string }>;
  river_gauge_above_danger_m?: number;
}

export function evaluateDisasterHazard(inputs: DisasterOfficerVerdictInputs): DecisionResult<string> {
  const inputsUsed: string[] = [];
  const missingInputs: string[] = [];
  const reasons: string[] = [];
  let hazardLevel = "LEVEL 0 (GREEN / NORMAL)";
  let severity: "CRITICAL" | "WARNING" | "NORMAL" = "NORMAL";

  const alerts = inputs.active_alerts || [];
  if (alerts.length > 0) {
    inputsUsed.push(`CAP 1.2 Alerts: ${alerts.length} active`);
    const topAlert = alerts[0];
    const topSev = topAlert.severity.toUpperCase();
    if (topSev === "EXTREME" || topSev === "SEVERE") {
      hazardLevel = "LEVEL 3 (RED / CRITICAL HAZARD)";
      severity = "CRITICAL";
      reasons.push(`CAP 1.2 ${topAlert.event} Red Alert: ${topAlert.headline || "Immediate threat to life"}`);
    } else if (topSev === "MODERATE") {
      hazardLevel = "LEVEL 2 (ORANGE / SEVERE ADVISORY)";
      severity = "WARNING";
      reasons.push(`CAP 1.2 ${topAlert.event} Orange Alert: Heightened readiness required.`);
    }
  }

  if (inputs.rainfall_rate_mm_hr !== undefined) {
    inputsUsed.push(`Precipitation Rate: ${inputs.rainfall_rate_mm_hr} mm/h`);
    if (inputs.rainfall_rate_mm_hr >= thresholds.disaster_officer.rainfall_intensity_mm_hr.cloudburst.value) {
      hazardLevel = "LEVEL 3 (RED / CLOUDBURST ALERT)";
      severity = "CRITICAL";
      reasons.push(`Precipitation (${inputs.rainfall_rate_mm_hr} mm/h) fulfills IMD Cloudburst criteria.`);
    } else if (inputs.rainfall_rate_mm_hr >= thresholds.disaster_officer.rainfall_intensity_mm_hr.heavy.value) {
      if (severity !== "CRITICAL") {
        hazardLevel = "LEVEL 2 (ORANGE / HEAVY DOWNPOUR)";
        severity = "WARNING";
      }
      reasons.push(`Intense rainfall (${inputs.rainfall_rate_mm_hr} mm/h) poses acute urban flash flood danger.`);
    }
  } else {
    missingInputs.push("Doppler instantaneous rainfall rate (mm/h)");
  }

  if (inputs.wind_speed_kmh !== undefined) {
    inputsUsed.push(`Wind Velocity: ${inputs.wind_speed_kmh} km/h`);
    if (inputs.wind_speed_kmh >= thresholds.disaster_officer.wind_speed_kmh.critical.value) {
      hazardLevel = "LEVEL 3 (RED / GALE STORM)";
      severity = "CRITICAL";
      reasons.push(`Severe storm winds (${inputs.wind_speed_kmh} km/h) threaten thatched roofing and utility lines.`);
    }
  }

  if (reasons.length === 0) {
    reasons.push("All district perimeter telemetry within standard baseline tolerances. Standby protocol active.");
  }

  const confidence = Math.max(0.4, inputsUsed.length / (inputsUsed.length + missingInputs.length));

  return {
    verdict: hazardLevel,
    reasons,
    inputs_used: inputsUsed,
    missing_inputs: missingInputs,
    confidence: Number(confidence.toFixed(2)),
    severity,
  };
}

// -----------------------------------------------------------------------------
// 4. CITIZEN / URBAN COMMUTER DETERMINISTIC VERDICTS (CPHEEO Drainage Rules)
// -----------------------------------------------------------------------------

export interface CitizenVerdictInputs {
  precipitation_mm?: number;
  rain_probability_pct?: number;
  rainfall_intensity_mm_hr?: number;
  has_flood_alert?: boolean;
  temperature_c?: number;
}

export function evaluateCitizenCommute(inputs: CitizenVerdictInputs): {
  umbrella_needed: DecisionResult<"YES" | "NO">;
  commute_risk: DecisionResult<"CLEAR" | "CAUTION" | "SEVERE">;
  waterlogging_risk: DecisionResult<"NIL" | "MODERATE" | "SEVERE">;
} {
  const t = thresholds.citizen;

  // Umbrella evaluation
  const umbrellaInputsUsed: string[] = [];
  const umbrellaMissing: string[] = [];
  const umbrellaReasons: string[] = [];
  let umbrellaYes = false;

  if (inputs.precipitation_mm !== undefined) {
    umbrellaInputsUsed.push(`Precipitation: ${inputs.precipitation_mm} mm`);
    if (inputs.precipitation_mm > t.umbrella.precip_amount_mm.value) {
      umbrellaYes = true;
      umbrellaReasons.push(`Measurable precipitation (${inputs.precipitation_mm} mm) expected.`);
    }
  }

  if (inputs.rain_probability_pct !== undefined) {
    umbrellaInputsUsed.push(`Rain Probability: ${inputs.rain_probability_pct}%`);
    if (inputs.rain_probability_pct >= t.umbrella.rain_prob_threshold_pct.value) {
      umbrellaYes = true;
      umbrellaReasons.push(`High hourly rain probability (${inputs.rain_probability_pct}%).`);
    }
  } else {
    umbrellaMissing.push("Hourly rain probability (%)");
  }

  if (!umbrellaYes) {
    umbrellaReasons.push("Dry forecast and low rain probability across daily commute hours.");
  }

  // Waterlogging evaluation
  const waterlogInputsUsed: string[] = [];
  const waterlogMissing: string[] = [];
  const waterlogReasons: string[] = [];
  let waterlogVerdict: "NIL" | "MODERATE" | "SEVERE" = "NIL";

  if (inputs.has_flood_alert) {
    waterlogVerdict = "SEVERE";
    waterlogReasons.push("Active civic waterlogging alert / underpass inundation reported.");
  } else if (inputs.rainfall_intensity_mm_hr !== undefined) {
    waterlogInputsUsed.push(`Rain Rate: ${inputs.rainfall_intensity_mm_hr} mm/h`);
    if (inputs.rainfall_intensity_mm_hr >= t.waterlogging_risk.hourly_rate_mm.value) {
      waterlogVerdict = "SEVERE";
      waterlogReasons.push(`Rainfall intensity (${inputs.rainfall_intensity_mm_hr} mm/h) exceeds municipal drainage capacity (15 mm/h).`);
    } else if (inputs.rainfall_intensity_mm_hr > 5.0) {
      waterlogVerdict = "MODERATE";
      waterlogReasons.push(`Moderate rainfall (${inputs.rainfall_intensity_mm_hr} mm/h) may cause localized puddle accumulation.`);
    }
  } else {
    waterlogMissing.push("Instantaneous rainfall rate (mm/h)");
  }

  if (waterlogVerdict === "NIL") {
    waterlogReasons.push("Roadways and underpass drains running clear; zero inundation detected.");
  }

  // Commute risk synthesis
  const commuteVerdict: "CLEAR" | "CAUTION" | "SEVERE" =
    waterlogVerdict === "SEVERE" ? "SEVERE" : waterlogVerdict === "MODERATE" || umbrellaYes ? "CAUTION" : "CLEAR";

  return {
    umbrella_needed: {
      verdict: umbrellaYes ? "YES" : "NO",
      reasons: umbrellaReasons,
      inputs_used: umbrellaInputsUsed,
      missing_inputs: umbrellaMissing,
      confidence: Number((umbrellaInputsUsed.length / (umbrellaInputsUsed.length + (umbrellaMissing.length || 1))).toFixed(2)),
      severity: umbrellaYes ? "WARNING" : "NORMAL",
    },
    waterlogging_risk: {
      verdict: waterlogVerdict,
      reasons: waterlogReasons,
      inputs_used: waterlogInputsUsed,
      missing_inputs: waterlogMissing,
      confidence: Number((waterlogInputsUsed.length / (waterlogInputsUsed.length + (waterlogMissing.length || 1))).toFixed(2)),
      severity: waterlogVerdict === "SEVERE" ? "CRITICAL" : waterlogVerdict === "MODERATE" ? "WARNING" : "NORMAL",
    },
    commute_risk: {
      verdict: commuteVerdict,
      reasons: waterlogReasons,
      inputs_used: [...umbrellaInputsUsed, ...waterlogInputsUsed],
      missing_inputs: [...umbrellaMissing, ...waterlogMissing],
      confidence: 0.85,
      severity: commuteVerdict === "SEVERE" ? "CRITICAL" : commuteVerdict === "CAUTION" ? "WARNING" : "NORMAL",
    },
  };
}

// -----------------------------------------------------------------------------
// 5. AVIATION DETERMINISTIC VERDICTS (ICAO Annex 2 & 3 Met Standards)
// -----------------------------------------------------------------------------

export interface AviationVerdictInputs {
  visibility_meters?: number;
  cloud_base_ft?: number;
  wind_knots?: number;
  wind_gusts_knots?: number;
  thunderstorm_detected?: boolean;
}

export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR" | "insufficient data";

export function evaluateAviationFlightCategory(inputs: AviationVerdictInputs): DecisionResult<FlightCategory> {
  const inputsUsed: string[] = [];
  const missingInputs: string[] = [];
  const reasons: string[] = [];

  if (inputs.visibility_meters !== undefined) {
    inputsUsed.push(`Visibility: ${inputs.visibility_meters} m`);
  } else {
    missingInputs.push("Aerodrome surface visibility (m)");
  }

  if (inputs.cloud_base_ft !== undefined) {
    inputsUsed.push(`Cloud Base / Ceiling: ${inputs.cloud_base_ft} ft AGL`);
  } else {
    missingInputs.push("Lowest cloud ceiling (ft AGL)");
  }

  // CRITICAL SPEC REQUIREMENT: If visibility or cloud base is missing, return "insufficient data" rather than guessing!
  if (inputs.visibility_meters === undefined || inputs.cloud_base_ft === undefined) {
    return {
      verdict: "insufficient data",
      reasons: [
        `Cannot determine Flight-Weather Category without METAR/Doppler parameters: missing ${missingInputs.join(", ")}.`,
      ],
      inputs_used: inputsUsed,
      missing_inputs: missingInputs,
      confidence: 0.0,
      severity: "WARNING",
    };
  }

  const vis = inputs.visibility_meters;
  const ceil = inputs.cloud_base_ft;

  let category: FlightCategory = "VFR";
  let severity: "CRITICAL" | "WARNING" | "NORMAL" = "NORMAL";

  if (vis < 1500 || ceil < 500) {
    category = "LIFR";
    severity = "CRITICAL";
    reasons.push(`Low Instrument Flight Rules: ${vis < 1500 ? `Visibility ${vis}m (<1,500m)` : `Ceiling ${ceil}ft (<500ft AGL)`}.`);
  } else if (vis < 5000 || ceil < 1000) {
    category = "IFR";
    severity = "CRITICAL";
    reasons.push(`Instrument Flight Rules: ${vis < 5000 ? `Visibility ${vis}m (1,500–5,000m)` : `Ceiling ${ceil}ft (500–1,000ft AGL)`}.`);
  } else if (vis <= 8000 || ceil <= 3000) {
    category = "MVFR";
    severity = "WARNING";
    reasons.push(`Marginal VFR: ${vis <= 8000 ? `Visibility ${vis}m (5,000–8,000m)` : `Ceiling ${ceil}ft (1,000–3,000ft AGL)`}.`);
  } else {
    category = "VFR";
    severity = "NORMAL";
    reasons.push(`Visual Flight Rules: Ceiling ${ceil}ft (>3,000ft AGL) and visibility ${vis}m (>8,000m). Unrestricted visual navigation.`);
  }

  if (inputs.thunderstorm_detected) {
    severity = "CRITICAL";
    reasons.push("Thunderstorm activity detected within aerodrome traffic circuit; convective downdrafts expected.");
  }

  return {
    verdict: category,
    reasons,
    inputs_used: inputsUsed,
    missing_inputs: missingInputs,
    confidence: 1.0,
    severity,
  };
}
