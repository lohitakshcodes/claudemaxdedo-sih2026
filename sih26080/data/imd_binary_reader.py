#!/usr/bin/env python3
"""
Native 25-line Binary Parser for IMD High-Resolution 0.25° Gridded Rainfall
Dataset: Pai et al. (2014), Mausam, 65(1), 1-18.
Grid: 135 (longitudes 66.5°E to 100.0°E) x 129 (latitudes 6.5°N to 38.5°N)
Daily record: 17,415 4-byte IEEE single-precision floats (69,660 bytes/day).
Missing value flag: -999.0
Zero dependencies on dead portals or external packages; pure NumPy.
"""

import sys
import numpy as np

NLON = 135
NLAT = 129
DAILY_FLOATS = NLON * NLAT
BYTES_PER_FLOAT = 4
DAILY_BYTES = DAILY_FLOATS * BYTES_PER_FLOAT  # 69,660 bytes

LONS = np.linspace(66.5, 100.0, NLON)
LATS = np.linspace(6.5, 38.5, NLAT)

def read_imd_rainfall_year(file_path: str, is_leap_year: bool = False) -> np.ndarray:
    """
    Reads an entire year of IMD daily 0.25° gridded rainfall.
    Returns: 3D float32 numpy array of shape (days, 129, 135) with -999.0 replaced by np.nan.
    """
    expected_days = 366 if is_leap_year else 365
    raw_data = np.fromfile(file_path, dtype=np.float32)
    actual_days = len(raw_data) // DAILY_FLOATS
    
    if actual_days < expected_days:
        print(f"[Warning] Expected {expected_days} days, found {actual_days} days in {file_path}", file=sys.stderr)
    
    grid = raw_data[:actual_days * DAILY_FLOATS].reshape((actual_days, NLAT, NLON))
    # Replace ocean/extraterritorial mask with NaN
    grid[grid == -999.0] = np.nan
    return grid

def extract_monsoon_season(grid_year: np.ndarray, is_leap_year: bool = False) -> np.ndarray:
    """
    Extracts June 1 through September 30 (122 days).
    Day of year index:
    Non-leap: June 1 is Day 152 (0-indexed 151), Sept 30 is Day 273 (0-indexed 272).
    Leap: June 1 is Day 153 (0-indexed 152), Sept 30 is Day 274 (0-indexed 273).
    """
    start_idx = 152 if is_leap_year else 151
    end_idx = start_idx + 122
    return grid_year[start_idx:end_idx, :, :]

if __name__ == "__main__":
    print(f"IMD Binary Parser configured:")
    print(f"  Longitudes: {NLON} points ({LONS[0]:.2f}°E to {LONS[-1]:.2f}°E, step 0.25°)")
    print(f"  Latitudes:  {NLAT} points ({LATS[0]:.2f}°N to {LATS[-1]:.2f}°N, step 0.25°)")
    print(f"  Daily slice: {DAILY_FLOATS} floats = {DAILY_BYTES:,} bytes/day")
