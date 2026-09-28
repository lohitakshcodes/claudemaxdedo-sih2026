/**
 * SIH26080: Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts
 * Constants, IMD Thresholds, and Spatial Bounding Boxes
 * Evaluating Organization: MoES / NCMRWF & IMD
 */

export interface ImdRainfallThreshold {
  id: string;
  name: string;
  minMm: number;
  maxMm: number;
  color: string;
  severity: "NORMAL" | "ADVISORY" | "WARNING" | "CRITICAL";
  isOperationalFocus: boolean;
}

// Official IMD 24-Hour Accumulated Rainfall Categories
export const IMD_RAINFALL_THRESHOLDS: ImdRainfallThreshold[] = [
  {
    id: "very_light",
    name: "Very Light Rain",
    minMm: 0.1,
    maxMm: 2.4,
    color: "#e0f2fe", // light sky
    severity: "NORMAL",
    isOperationalFocus: false,
  },
  {
    id: "light",
    name: "Light Rain",
    minMm: 2.5,
    maxMm: 15.5,
    color: "#7dd3fc", // sky
    severity: "NORMAL",
    isOperationalFocus: false,
  },
  {
    id: "moderate",
    name: "Moderate Rain",
    minMm: 15.6,
    maxMm: 64.4,
    color: "#0284c7", // blue
    severity: "ADVISORY",
    isOperationalFocus: true,
  },
  {
    id: "heavy",
    name: "Heavy Rain",
    minMm: 64.5,
    maxMm: 115.5,
    color: "#f59e0b", // amber/orange
    severity: "WARNING",
    isOperationalFocus: true,
  },
  {
    id: "very_heavy",
    name: "Very Heavy Rain",
    minMm: 115.6,
    maxMm: 204.4,
    color: "#dc2626", // red
    severity: "CRITICAL",
    isOperationalFocus: true,
  },
  {
    id: "extremely_heavy",
    name: "Extremely Heavy Rain",
    minMm: 204.5,
    maxMm: 999.0,
    color: "#7f1d1d", // dark maroon/purple
    severity: "CRITICAL",
    isOperationalFocus: true,
  },
];

// Core Monsoon Zone (MCZ) bounding coordinates (Rajeevan et al. 2010)
export const CORE_MONSOON_ZONE = {
  name: "Monsoon Core Zone (MCZ)",
  citation: "Rajeevan, Gadgil, & Bhate (2010), J. Earth Syst. Sci., 119(3), 229–247",
  latMin: 18.0,
  latMax: 28.0,
  lonMin: 65.0,
  lonMax: 88.0,
  activeAnomalyThreshold: 1.0, // Z > +1.0 for >= 3 days
  breakAnomalyThreshold: -1.0,  // Z < -1.0 for >= 3 days
  minSpellDurationDays: 3,
};

// Western Ghats Orographic & Coastal Corridor
export const WESTERN_GHATS_CORRIDOR = {
  name: "Western Ghats & West Coast",
  latMin: 8.0,
  latMax: 21.5,
  lonMin: 72.5,
  lonMax: 76.5,
  elevationThresholdM: 300,
  coastalDistanceCells: 2, // ~50 km
};

// Fractions Skill Score (FSS) Neighborhood Scales
export const FSS_NEIGHBORHOOD_SCALES = [
  { scaleCells: 1, scaleKm: 25, label: "25 km (1x1 Grid)" },
  { scaleCells: 3, scaleKm: 75, label: "75 km (3x3 Meso-β)" },
  { scaleCells: 5, scaleKm: 125, label: "125 km (5x5 District)" },
  { scaleCells: 9, scaleKm: 225, label: "225 km (9x9 Sub-divisional)" },
];
