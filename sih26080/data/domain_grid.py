"""
SIH26080: Domain Grid & Geographic Orographic Feature Definitions
Domain:
  1. Maharashtra + Western Ghats Corridor (0.5° stride, ~180 points)
  2. Core Monsoon Zone (MCZ) Coarse Sample (1.0° stride, ~120 points)
Total: ~300 points
"""

import math
from typing import List, Dict, Any

# Core Monsoon Zone (Rajeevan et al. 2010): 18°N-28°N, 65°E-88°E
CMZ_BOUNDS = {
    "lat_min": 18.0,
    "lat_max": 28.0,
    "lon_min": 65.0,
    "lon_max": 88.0,
}

# Western Ghats and Maharashtra Focus Domain: 14°N-22°N, 72.5°E-80.5°E
MAHA_GHATS_BOUNDS = {
    "lat_min": 14.0,
    "lat_max": 22.0,
    "lon_min": 72.5,
    "lon_max": 80.5,
}

# Approximate Western Ghats Ridge Line Coordinates (lat -> crest lon, approx elevation m)
GHATS_RIDGE = [
    (14.0, 74.8, 650),
    (15.0, 74.2, 750),
    (16.0, 73.9, 850),
    (17.0, 73.7, 950),
    (18.0, 73.5, 1100),
    (19.0, 73.6, 1200),
    (20.0, 73.8, 1000),
    (21.0, 74.0, 600),
]

def approximate_elevation(lat: float, lon: float) -> float:
    """
    Approximates terrain elevation (meters) over Maharashtra & Western Ghats
    based on distance from the Ghats ridge line and eastward plateau drop.
    """
    # Find closest ridge point
    closest_dist = float('inf')
    ridge_elev = 200.0
    for r_lat, r_lon, r_el in GHATS_RIDGE:
        dist = math.hypot(lat - r_lat, (lon - r_lon) * math.cos(math.radians(lat)))
        if dist < closest_dist:
            closest_dist = dist
            ridge_elev = r_el
    
    # Distance in km (approx 111 km per degree)
    dist_km = closest_dist * 111.0
    
    # West of Ghats (Coastal plain, 0-80m)
    if lon < 73.2:
        return max(5.0, 40.0 - (73.2 - lon) * 30.0)
    
    # Ghats crest zone (< 35km from ridge)
    if dist_km < 35.0:
        factor = math.exp(-0.5 * (dist_km / 15.0) ** 2)
        return 150.0 + (ridge_elev - 150.0) * factor
    
    # East of Ghats (Deccan Plateau, 450m - 650m)
    if lon > 74.5:
        # Drops from 650m near Pune/Nashik to 250m towards Vidarbha
        return max(200.0, 600.0 - (lon - 74.5) * 50.0)
    
    return 350.0

def approximate_dist_to_coast_km(lat: float, lon: float) -> float:
    """Approximate distance to Arabian Sea coastline in km."""
    # Coastline approx lon between 72.8°E and 74.5°E
    coast_lon = 72.8 + (19.0 - min(19.0, max(14.0, lat))) * 0.25
    if lon <= coast_lon:
        return 0.0
    return (lon - coast_lon) * 111.0 * math.cos(math.radians(lat))

def get_terrain_type(lat: float, lon: float, elev: float) -> str:
    """Classifies terrain into 4 operational meteorological strata."""
    dist_coast = approximate_dist_to_coast_km(lat, lon)
    if dist_coast < 45.0 and elev < 150.0:
        return "Coastal Plain"
    elif elev >= 400.0 and lon < 74.8:
        return "Windward Ghats"
    elif lon >= 74.5 and lon < 76.5 and lat < 20.0:
        return "Rain Shadow"
    else:
        return "Central Plains"

def generate_domain_grid() -> List[Dict[str, Any]]:
    """
    Generates the official ~300 evaluation grid points:
    1. Maharashtra & Western Ghats: 14°N to 22°N (0.5° step), 72.5°E to 80.5°E (0.5° step)
    2. Core Monsoon Zone Coarse: 18°N to 27°N (1.0° step), 77°E to 86°E (1.0° step)
    """
    grid = []
    seen = set()

    # 1. Maharashtra & Western Ghats (0.5° stride)
    lat = 14.5
    while lat <= 21.5:
        lon = 72.5
        while lon <= 80.0:
            key = (round(lat, 2), round(lon, 2))
            if key not in seen:
                seen.add(key)
                elev = approximate_elevation(lat, lon)
                dist_coast = approximate_dist_to_coast_km(lat, lon)
                stratum = get_terrain_type(lat, lon, elev)
                grid.append({
                    "id": f"pt_{len(grid)+1:03d}",
                    "lat": round(lat, 2),
                    "lon": round(lon, 2),
                    "region": "Maharashtra_Ghats",
                    "elevation_m": round(elev, 1),
                    "dist_coast_km": round(dist_coast, 1),
                    "terrain_stratum": stratum,
                    "is_cmz": (18.0 <= lat <= 28.0) and (65.0 <= lon <= 88.0),
                })
            lon += 0.5
        lat += 0.5

    # 2. Core Monsoon Zone coarse sample (1.0° stride)
    lat = 18.0
    while lat <= 27.0:
        lon = 77.0
        while lon <= 86.0:
            key = (round(lat, 2), round(lon, 2))
            if key not in seen:
                seen.add(key)
                elev = approximate_elevation(lat, lon)
                dist_coast = approximate_dist_to_coast_km(lat, lon)
                stratum = get_terrain_type(lat, lon, elev)
                grid.append({
                    "id": f"pt_{len(grid)+1:03d}",
                    "lat": round(lat, 2),
                    "lon": round(lon, 2),
                    "region": "Core_Monsoon_Zone",
                    "elevation_m": round(elev, 1),
                    "dist_coast_km": round(dist_coast, 1),
                    "terrain_stratum": stratum,
                    "is_cmz": True,
                })
            lon += 1.0
        lat += 1.0

    return grid

if __name__ == "__main__":
    pts = generate_domain_grid()
    print(f"Generated {len(pts)} domain grid points.")
    mcz_count = sum(1 for p in pts if p['is_cmz'])
    ghats_count = sum(1 for p in pts if p['terrain_stratum'] == 'Windward Ghats')
    coastal_count = sum(1 for p in pts if p['terrain_stratum'] == 'Coastal Plain')
    print(f"  - Core Monsoon Zone (MCZ) sample: {mcz_count} points")
    print(f"  - Windward Ghats points: {ghats_count}")
    print(f"  - Coastal Plain points: {coastal_count}")
