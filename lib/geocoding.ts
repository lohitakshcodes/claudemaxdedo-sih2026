/**
 * Geospatial Geocoding Utility (Nominatim OpenStreetMap API)
 * Converts city/district/village name strings into high-precision Latitude & Longitude coordinates.
 * Includes rate-limit safety, caching, and fallback dictionary for Indian agro-meteorological regions.
 */

export interface GeocodingResult {
  locationQuery: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
  source: "nominatim" | "cached_fallback";
}

// Canonical coordinates for Indian cities and agricultural hubs
const INDIAN_LOCATIONS_FALLBACK: Record<string, { lat: number; lng: number; state: string; name: string }> = {
  pune: { lat: 18.5204, lng: 73.8567, state: "Maharashtra", name: "Pune, Maharashtra, India" },
  varanasi: { lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh", name: "Varanasi, Uttar Pradesh, India" },
  barabanki: { lat: 26.9298, lng: 81.1834, state: "Uttar Pradesh", name: "Barabanki, Uttar Pradesh, India" },
  nagpur: { lat: 21.1458, lng: 79.0882, state: "Maharashtra", name: "Nagpur, Maharashtra, India" },
  patna: { lat: 25.5941, lng: 85.1376, state: "Bihar", name: "Patna, Bihar, India" },
  chandauli: { lat: 25.2612, lng: 83.2662, state: "Uttar Pradesh", name: "Chandauli, Uttar Pradesh, India" },
  lucknow: { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh", name: "Lucknow, Uttar Pradesh, India" },
  mumbai: { lat: 19.0760, lng: 72.8777, state: "Maharashtra", name: "Mumbai, Maharashtra, India" },
  delhi: { lat: 28.6139, lng: 77.2090, state: "Delhi", name: "New Delhi, Delhi, India" },
  bengaluru: { lat: 12.9716, lng: 77.5946, state: "Karnataka", name: "Bengaluru, Karnataka, India" },
  hyderabad: { lat: 17.3850, lng: 78.4867, state: "Telangana", name: "Hyderabad, Telangana, India" },
  chennai: { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu", name: "Chennai, Tamil Nadu, India" },
  kolkata: { lat: 22.5726, lng: 88.3639, state: "West Bengal", name: "Kolkata, West Bengal, India" },
  jaipur: { lat: 26.9124, lng: 75.7873, state: "Rajasthan", name: "Jaipur, Rajasthan, India" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, state: "Gujarat", name: "Ahmedabad, Gujarat, India" },
  chandigarh: { lat: 30.7333, lng: 76.7794, state: "Punjab/Haryana", name: "Chandigarh, India" },
};

const geocodeCache = new Map<string, GeocodingResult>();

/**
 * Geocodes a place name string to [lat, lng] using OpenStreetMap Nominatim.
 */
export async function geocodeLocation(cityName: string): Promise<GeocodingResult> {
  const cleanQuery = cityName.trim();
  const normalizedKey = cleanQuery.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (geocodeCache.has(normalizedKey)) {
    return geocodeCache.get(normalizedKey)!;
  }

  // Check fallback dictionary first for quick lookup
  if (INDIAN_LOCATIONS_FALLBACK[normalizedKey]) {
    const entry = INDIAN_LOCATIONS_FALLBACK[normalizedKey];
    const result: GeocodingResult = {
      locationQuery: cleanQuery,
      displayName: entry.name,
      latitude: entry.lat,
      longitude: entry.lng,
      country: "India",
      state: entry.state,
      source: "cached_fallback",
    };
    geocodeCache.set(normalizedKey, result);
    return result;
  }

  // Live Nominatim API lookup
  try {
    const encoded = encodeURIComponent(`${cleanQuery}, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "WeatherGPT-SIH2026/1.0 (agro-weather-research@sih.gov.in)",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const result: GeocodingResult = {
          locationQuery: cleanQuery,
          displayName: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          country: item.address?.country || "India",
          state: item.address?.state,
          source: "nominatim",
        };
        geocodeCache.set(normalizedKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn(`[Geocoding] Nominatim lookup failed for "${cleanQuery}", searching fuzzy fallbacks.`, err);
  }

  // Fuzzy match fallback if not found in exact dictionary
  for (const [key, val] of Object.entries(INDIAN_LOCATIONS_FALLBACK)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      const fallbackResult: GeocodingResult = {
        locationQuery: cleanQuery,
        displayName: val.name,
        latitude: val.lat,
        longitude: val.lng,
        country: "India",
        state: val.state,
        source: "cached_fallback",
      };
      geocodeCache.set(normalizedKey, fallbackResult);
      return fallbackResult;
    }
  }

  // Default to central India (Nagpur/Varanasi) if unknown
  const defaultResult: GeocodingResult = {
    locationQuery: cleanQuery,
    displayName: `${cleanQuery} (Default Agro-Grid)`,
    latitude: 25.3176,
    longitude: 82.9739,
    country: "India",
    state: "Uttar Pradesh",
    source: "cached_fallback",
  };
  geocodeCache.set(normalizedKey, defaultResult);
  return defaultResult;
}

/**
 * Automatically extracts city or district names from a free-form natural language query.
 */
export function extractLocationFromQuery(query: string, explicitLocation?: string): string {
  if (explicitLocation && explicitLocation.trim() && explicitLocation.trim().toLowerCase() !== "default") {
    return explicitLocation.trim();
  }

  const lower = query.toLowerCase();
  
  // List of major Indian cities, districts, and agro-climatic zones
  const knownPlaces: Array<{ key: string; name: string }> = [
    { key: "pune", name: "Pune" },
    { key: "varanasi", name: "Varanasi" },
    { key: "barabanki", name: "Barabanki" },
    { key: "nagpur", name: "Nagpur" },
    { key: "patna", name: "Patna" },
    { key: "chandauli", name: "Chandauli" },
    { key: "lucknow", name: "Lucknow" },
    { key: "mumbai", name: "Mumbai" },
    { key: "delhi", name: "Delhi" },
    { key: "bengaluru", name: "Bengaluru" },
    { key: "bangalore", name: "Bengaluru" },
    { key: "hyderabad", name: "Hyderabad" },
    { key: "chennai", name: "Chennai" },
    { key: "kolkata", name: "Kolkata" },
    { key: "jaipur", name: "Jaipur" },
    { key: "ahmedabad", name: "Ahmedabad" },
    { key: "chandigarh", name: "Chandigarh" },
    { key: "nashik", name: "Nashik" },
    { key: "pimpalgaon", name: "Pimpalgaon" },
    { key: "lasalgaon", name: "Lasalgaon" },
    { key: "fatehpur", name: "Fatehpur" },
    { key: "kanpur", name: "Kanpur" },
    { key: "gorakhpur", name: "Gorakhpur" },
    { key: "ghazipur", name: "Ghazipur" },
    { key: "indore", name: "Indore" },
    { key: "bhopal", name: "Bhopal" },
    { key: "amravati", name: "Amravati" },
    { key: "solapur", name: "Solapur" },
    { key: "satara", name: "Satara" },
    { key: "kolhapur", name: "Kolhapur" },
  ];

  for (const item of knownPlaces) {
    const regex = new RegExp(`\\b${item.key}\\b`, "i");
    if (regex.test(lower)) {
      return item.name;
    }
  }

  return explicitLocation || "Varanasi";
}

