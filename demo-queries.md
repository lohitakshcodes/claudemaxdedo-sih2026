# WeatherGPT Phase 2: Demonstration Queries & Verdict Signatures

This document specifies the Phase 2 test queries, their execution results, and their expected deterministic verdict shapes under the "code decides, LLM explains" architecture.

---

## 1. Test Query 1: Farmer Persona (Agrochemical Spraying & Irrigation)

### English Query
- **Prompt**: `"Can I spray tomorrow morning?"`
- **Location**: `Rohtas District, Bihar`
- **Persona**: `farmer`
- **Language**: `en`

#### Expected Verdict Shape
```json
{
  "heroCard": {
    "type": "farmer_action",
    "verdict": "IMMEDIATE ACTION: SPRAY: YES | IRRIGATE: YES | HARVEST: YES",
    "subVerdict": "Weather parameters within ICAR safe spraying envelope (06:00 AM – 09:30 AM recommended).",
    "severity": "NORMAL",
    "badge": "LIVE",
    "source": "ICAR Agro-Met Advisory & Open-Meteo GFS",
    "modelOrRunTime": "GFS 0.25° Global Ensemble",
    "fetchedAt": "2026-09-28T05:51:00.000Z",
    "confidence": 1.0,
    "missingInputs": [],
    "metrics": [
      { "label": "Spray Window", "value": "06:00 - 09:30 AM (Permitted)", "status": "PASS", "badge": "LIVE", "source": "ICAR Rules" },
      { "label": "Irrigation Action", "value": "Apply Light Irrigation", "status": "PASS", "badge": "LIVE", "source": "PMKSY Criteria" },
      { "label": "Harvest Safety", "value": "Safe for Harvest", "status": "PASS", "badge": "LIVE", "source": "IARI Protocol" },
      { "label": "Surface Wind", "value": "11 km/h (Limit: 15 km/h)", "status": "PASS", "badge": "LIVE", "source": "Open-Meteo" },
      { "label": "Rain Forecast", "value": "0.0 mm (Limit: 0.5 mm)", "status": "PASS", "badge": "LIVE", "source": "Open-Meteo" },
      { "label": "Confidence", "value": "100%", "status": "INFO", "badge": "LIVE", "source": "Rule Engine" }
    ]
  },
  "verdictPayload": {
    "farmer": {
      "spray_ok": {
        "verdict": "YES",
        "reasons": ["Weather parameters within ICAR safe spraying envelope (06:00 AM – 09:30 AM recommended)."],
        "inputs_used": ["Surface Wind: 11 km/h", "Rain (next 24h): 0 mm", "Temperature: 28°C"],
        "missing_inputs": [],
        "confidence": 1.0,
        "severity": "NORMAL"
      }
    }
  }
}
```

### Indic Query (Hindi / Bhojpuri)
- **Prompt**: `"कल सुबह कीटनाशक छिड़काव कर सकते हैं?"` / `"काल्हु सबेरे कीटनाशक छिड़कल जा सकेला?"`
- **Output**: Generates full vernacular advisory with verified Bhashini TTS voice base64 payload.

---

## 2. Test Query 2: Fisherman Persona (Coastal Navigation & Sea Safety)

### English Query
- **Prompt**: `"Is it safe to go out off Ratnagiri today?"`
- **Location**: `Ratnagiri, Maharashtra`
- **Persona**: `fisherman`
- **Language**: `en`

#### Expected Verdict Shape
```json
{
  "heroCard": {
    "type": "marine_safety",
    "verdict": "SEA SAFETY: SAFE TO SAIL (YES)",
    "subVerdict": "Sea conditions calm to moderate; safe for coastal operations up to 25 nautical miles.",
    "severity": "NORMAL",
    "badge": "LIVE",
    "source": "INCOIS Ocean State Forecast & IMD Marine",
    "confidence": 1.0,
    "metrics": [
      { "label": "Sea Safety Verdict", "value": "Safe to Sail: YES", "status": "PASS", "badge": "LIVE", "source": "Rule Engine" },
      { "label": "Swell / Wave Height", "value": "1.3 m (Moderate)", "status": "PASS", "badge": "LIVE", "source": "INCOIS Swell Model" },
      { "label": "Wind Velocity", "value": "8 kt (15 km/h)", "status": "PASS", "badge": "LIVE", "source": "Open-Meteo GFS" },
      { "label": "Safe Distance", "value": "< 25 NM Coastal Waters", "status": "PASS", "badge": "LIVE", "source": "INCOIS SOP" },
      { "label": "Coastal Alert Level", "value": "GREEN / NORMAL", "status": "PASS", "badge": "LIVE", "source": "NDMA SACHET" }
    ]
  }
}
```

### Indic Query (Marathi)
- **Prompt**: `"काय आज रत्नागिरीमध्ये समुद्रात जाणे सुरक्षित आहे का?"`
- **Output**: Returns Marathi advisory explaining the INCOIS swell height and Beaufort wind threshold.

---

## 3. Test Query 3: Citizen Persona (Commute, Waterlogging & Umbrella)

### English Query
- **Prompt**: `"Will my commute flood tomorrow evening?"`
- **Location**: `Delhi`
- **Persona**: `citizen`
- **Language**: `en`

#### Expected Verdict Shape
```json
{
  "heroCard": {
    "type": "commute_advisor",
    "verdict": "COMMUTE: CLEAR | UMBRELLA: NO",
    "subVerdict": "Roadways and underpass drains running clear; zero inundation detected.",
    "severity": "NORMAL",
    "badge": "LIVE",
    "source": "Municipal Storm Telemetry & Open-Meteo",
    "confidence": 0.85,
    "metrics": [
      { "label": "Waterlogging Risk", "value": "NIL", "status": "PASS", "badge": "LIVE", "source": "CPHEEO Standards" },
      { "label": "Umbrella Requirement", "value": "NO", "status": "PASS", "badge": "LIVE", "source": "WMO Rain Threshold" },
      { "label": "Temperature", "value": "31°C", "status": "PASS", "badge": "LIVE", "source": "Open-Meteo GFS" },
      { "label": "Hourly Rain Prob", "value": "10%", "status": "PASS", "badge": "LIVE", "source": "GFS Ensemble" }
    ]
  }
}
```

---

## 4. Test Query 4: Aviation Persona (Flight-Weather Categories)

### Case A: Valid Aerodrome Telemetry (Pune)
- **Prompt**: `"Flight weather category at Pune this afternoon?"`
- **Location**: `Pune`
- **Persona**: `aviation`
- **Language**: `en`

#### Expected Verdict Shape
```json
{
  "heroCard": {
    "type": "aviation_flight",
    "verdict": "CATEGORY: VFR (GO/NO-GO: GO)",
    "subVerdict": "Visual Flight Rules: Ceiling 4200ft (>3,000ft AGL) and visibility 9500m (>8,000m). Unrestricted visual navigation.",
    "severity": "NORMAL",
    "badge": "LIVE",
    "source": "ICAO Annex 3 & Aerodrome METAR Grid",
    "confidence": 1.0,
    "metrics": [
      { "label": "Flight-Weather Category", "value": "VFR", "status": "PASS", "badge": "LIVE", "source": "ICAO Standards" },
      { "label": "Surface Visibility", "value": "9500 m", "status": "PASS", "badge": "LIVE", "source": "Aerodrome METAR" },
      { "label": "Cloud Base (Ceiling)", "value": "4200 ft AGL", "status": "PASS", "badge": "LIVE", "source": "Ceilometer" },
      { "label": "Wind & Gusts", "value": "6 kt (Gusts: 8 kt)", "status": "PASS", "badge": "LIVE", "source": "Anemometer" },
      { "label": "Thunderstorm Risk", "value": "NIL / Clear", "status": "PASS", "badge": "LIVE", "source": "Doppler S-Band" }
    ]
  }
}
```

### Case B: Missing Ceilometer / METAR Sensor Feeds (Chenari Block)
- **Prompt**: `"Flight weather category at Chenari Block?"`
- **Output Rule**: **NEVER GUESS**. Returns `"insufficient data"` with a `SAMPLE` badge and lists missing parameters:
```json
{
  "heroCard": {
    "type": "aviation_flight",
    "verdict": "CATEGORY: INSUFFICIENT DATA",
    "subVerdict": "Cannot determine Flight-Weather Category without METAR/Doppler parameters: missing Aerodrome surface visibility (m), Lowest cloud ceiling (ft AGL).",
    "severity": "WARNING",
    "badge": "SAMPLE",
    "source": "ICAO Annex 3 & Aerodrome METAR Grid",
    "notice": "Missing visibility and cloud base sensor feeds for this coordinates.",
    "confidence": 0.0,
    "missingInputs": ["Aerodrome surface visibility (m)", "Lowest cloud ceiling (ft AGL)"]
  }
}
```

---

## 5. Test Query 5: Out of Scope Guard

### English Query
- **Prompt**: `"Tell me a joke."`
- **Response**:
```json
{
  "status": "SUCCESS",
  "isOutOfScope": true,
  "advisory": {
    "english": "I am WeatherGPT, a deterministic meteorological and disaster advisory agent. I cannot tell jokes or answer general knowledge queries, but I can provide verified weather forecasts, agricultural spray windows, marine safety advisories, and aviation flight categories. Please ask about weather conditions for any location."
  },
  "heroCard": {
    "type": "out_of_scope",
    "verdict": "QUERY OUT OF METEOROLOGICAL SCOPE",
    "subVerdict": "Please ask about weather, agriculture, marine safety, disaster risks, or aviation."
  }
}
```

### Indic Query (Hindi)
- **Prompt**: `"मुझे एक चुटकुला सुनाओ"`
- **Response**: Returns polite Hindi redirect:
  *"मैं वेदरजीपीटी (WeatherGPT) हूँ, एक मौसम और आपदा सुरक्षा सलाहकार। मैं चुटकुले या सामान्य विषय नहीं बता सकता, लेकिन आपको मौसम पूर्वानुमान, कीटनाशक छिड़काव, समुद्री सुरक्षा और उड़ान मौसम की सटीक जानकारी दे सकता हूँ। कृपया किसी स्थान का मौसम पूछें।"*

---

## 6. Context-Aware Follow-Up Query Resolution

### Sequential Query Interaction:
- **Turn 1**: User asks: `"What is the weather in Pune?"`
  - Location resolved: `Pune, Maharashtra, India`
- **Turn 2**: User asks: `"and tomorrow?"`
  - Result: The intent engine analyzes conversation context, detects that `Pune` was the prior active location, and evaluates the forecast for `Pune` without requiring the user to retype the city name.
