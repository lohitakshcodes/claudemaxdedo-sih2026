#!/usr/bin/env python3
"""
Open-Meteo Real Forecast Archival & Caching Client (Task 2)
Attribution: Weather data by Open-Meteo.com under Creative Commons Attribution 4.0 International (CC BY 4.0)
Terms: https://open-meteo.com/en/terms

Features:
1. Exact request budget computation and polite batching (up to 25 coords per call).
2. Backoff logic on HTTP 429 / network errors.
3. Multi-lead previous run extraction (Day 0, Day 1, Day 2, Day 3) for ECMWF IFS 0.25°.
4. Temporal alignment to IMD 08:30 IST (04:00 UTC D-1 to 03:00 UTC D) 24h accumulation.
5. Strict non-null verification across the entire JJAS season (all 122 days).
6. Parquet caching with SHA-256 hash generation and per-point, per-month coverage reporting.
"""

import os
import sys
import time
import json
import math
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional
import urllib.request
import urllib.error
import requests
import numpy as np
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

from sih26080.data.domain_grid import generate_domain_grid

OPENMETEO_ATTRIBUTION = "Weather data by Open-Meteo.com under Creative Commons Attribution 4.0 International (CC BY 4.0)"
CACHE_DIR = "data/cache"
PARQUET_OUTPUT = os.path.join(CACHE_DIR, "openmeteo_ecmwf_jjas2024.parquet")
COVERAGE_REPORT_OUTPUT = os.path.join(CACHE_DIR, "openmeteo_coverage_report.json")

def compute_request_budget(n_points: int, batch_size: int = 25) -> Dict[str, Any]:
    """Computes polite batching request budget."""
    n_requests = math.ceil(n_points / batch_size)
    # Estimate ~1.5s per batch request + 0.5s pause
    est_duration_sec = n_requests * 2.0
    return {
        "total_points": n_points,
        "batch_size": batch_size,
        "total_requests": n_requests,
        "daily_limit_allowance": 10000,
        "percentage_of_daily_limit": round((n_requests / 10000.0) * 100.0, 3),
        "estimated_duration_seconds": round(est_duration_sec, 1),
    }

def fetch_with_backoff(url: str, max_retries: int = 5, timeout: int = 40) -> Any:
    """Executes HTTP GET with exponential backoff on 429 or network errors using requests."""
    headers = {
        "User-Agent": "SIH26080-Academic-Research/1.0 (MoES/IMD Evaluation; polite batching)",
    }
    
    for attempt in range(max_retries):
        try:
            resp = requests.get(url, headers=headers, timeout=timeout)
            if resp.status_code == 429:
                wait_time = 2.0 ** (attempt + 1) + 1.0
                print(f"  [429 Rate Limit] Backing off for {wait_time:.1f}s (attempt {attempt+1}/{max_retries})...")
                time.sleep(wait_time)
                continue
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.HTTPError as e:
            if resp.status_code in [500, 502, 503, 504]:
                wait_time = 2.0 ** attempt + 0.5
                print(f"  [HTTP {resp.status_code}] Server error, retrying in {wait_time:.1f}s...")
                time.sleep(wait_time)
            else:
                raise
        except Exception as e:
            wait_time = 2.0 ** attempt + 0.5
            print(f"  [Network error] {e}, retrying in {wait_time:.1f}s...")
            time.sleep(wait_time)
            
    raise RuntimeError(f"Failed to fetch {url} after {max_retries} attempts.")

def fetch_previous_runs_batch(
    points: List[Dict[str, Any]],
    start_date: str = "2024-05-31",
    end_date: str = "2024-09-30",
    model: str = "ecmwf_ifs025",
) -> List[Dict[str, Any]]:
    """
    Fetches hourly ECMWF IFS forecasts for a batch of points.
    Includes previous runs (day 0, 1, 2, 3) and 850hPa wind components.
    """
    lats = ",".join(str(p["lat"]) for p in points)
    lons = ",".join(str(p["lon"]) for p in points)
    hourly_vars = [
        "precipitation",
        "precipitation_previous_day1",
        "precipitation_previous_day2",
        "precipitation_previous_day3",
        "windspeed_850hPa",
        "winddirection_850hPa",
        "surface_pressure",
    ]
    url = (
        f"https://previous-runs-api.open-meteo.com/v1/forecast?"
        f"latitude={lats}&longitude={lons}&"
        f"start_date={start_date}&end_date={end_date}&"
        f"hourly={','.join(hourly_vars)}&"
        f"models={model}"
    )
    
    data = fetch_with_backoff(url)
    if isinstance(data, dict):
        return [data]
    return data

def aggregate_hourly_to_imd_daily(
    hourly_data: Dict[str, Any],
    lat: float,
    lon: float,
    pt_id: str,
) -> List[Dict[str, Any]]:
    """
    Aggregates hourly series into daily 24h intervals matching IMD convention:
    IMD Day D (08:30 IST) = 04:00 UTC (D-1) to 03:00 UTC (D).
    """
    times = hourly_data["time"]
    precip_d0 = hourly_data.get("precipitation", [])
    precip_d1 = hourly_data.get("precipitation_previous_day1", [])
    precip_d2 = hourly_data.get("precipitation_previous_day2", [])
    precip_d3 = hourly_data.get("precipitation_previous_day3", [])
    ws_850 = hourly_data.get("windspeed_850hPa", [])
    wd_850 = hourly_data.get("winddirection_850hPa", [])
    sp = hourly_data.get("surface_pressure", [])
    
    # Map UTC timestamp string to index
    # Format: "2024-05-31T00:00"
    time_to_idx = {t: idx for idx, t in enumerate(times)}
    
    # JJAS 2024: June 1, 2024 to September 30, 2024 (122 calendar days)
    start_dt = datetime(2024, 6, 1)
    end_dt = datetime(2024, 9, 30)
    curr_dt = start_dt
    
    daily_records = []
    
    while curr_dt <= end_dt:
        date_str = curr_dt.strftime("%Y-%m-%d")
        prev_dt = curr_dt - timedelta(days=1)
        prev_date_str = prev_dt.strftime("%Y-%m-%d")
        
        # 04:00 UTC (D-1) to 23:00 UTC (D-1) -> 20 hours
        # 00:00 UTC (D) to 03:00 UTC (D) -> 4 hours
        # Total = 24 hours
        h_indices = []
        for h in range(4, 24):
            t_str = f"{prev_date_str}T{h:02d}:00"
            if t_str in time_to_idx:
                h_indices.append(time_to_idx[t_str])
        for h in range(0, 4):
            t_str = f"{date_str}T{h:02d}:00"
            if t_str in time_to_idx:
                h_indices.append(time_to_idx[t_str])
                
        if len(h_indices) != 24:
            raise ValueError(f"Incomplete 24h window for {date_str} at pt {pt_id}: found {len(h_indices)} hours")
            
        def sum_precip(arr):
            sub = [arr[i] for i in h_indices]
            if any(x is None for x in sub):
                return None
            return round(float(sum(sub)), 2)
            
        def mean_val(arr):
            sub = [arr[i] for i in h_indices if arr[i] is not None]
            return round(float(np.mean(sub)), 2) if sub else None

        # Wind u and v components (m/s) from meteorological wind direction
        # u = -s * sin(rad), v = -s * cos(rad)
        u_vals = []
        v_vals = []
        for i in h_indices:
            s = ws_850[i]
            d = wd_850[i]
            if s is not None and d is not None:
                rad = math.radians(d)
                u_vals.append(-s * math.sin(rad))
                v_vals.append(-s * math.cos(rad))
                
        mean_u = round(float(np.mean(u_vals)), 2) if u_vals else None
        mean_v = round(float(np.mean(v_vals)), 2) if v_vals else None

        daily_records.append({
            "point_id": pt_id,
            "lat": lat,
            "lon": lon,
            "date": date_str,
            "lead_d0_mm": sum_precip(precip_d0),
            "lead_d1_mm": sum_precip(precip_d1),
            "lead_d2_mm": sum_precip(precip_d2),
            "lead_d3_mm": sum_precip(precip_d3),
            "wind_u_850_ms": mean_u,
            "wind_v_850_ms": mean_v,
            "surface_pressure_hpa": mean_val(sp),
        })
        
        curr_dt += timedelta(days=1)
        
    return daily_records

def run_openmeteo_harvest(batch_size: int = 25):
    """Executes full harvest for the 324 domain points across JJAS 2024."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    grid_points = generate_domain_grid()
    budget = compute_request_budget(len(grid_points), batch_size)
    
    print("=" * 70)
    print("OPEN-METEO REAL FORECAST DATA HARVEST (TASK 2)")
    print(f"Attribution: {OPENMETEO_ATTRIBUTION}")
    print(f"Total Grid Points: {budget['total_points']}")
    print(f"Batch Size: {budget['batch_size']}")
    print(f"Total HTTP Requests: {budget['total_requests']} ({budget['percentage_of_daily_limit']}% of daily quota)")
    print(f"Estimated Duration: ~{budget['estimated_duration_seconds']} seconds")
    print("=" * 70)
    
    all_daily_records = []
    batches = [grid_points[i:i+batch_size] for i in range(0, len(grid_points), batch_size)]
    
    for b_idx, batch in enumerate(batches, 1):
        print(f"[{b_idx}/{len(batches)}] Fetching batch of {len(batch)} coordinates ({batch[0]['lat']}, {batch[0]['lon']})...")
        t0 = time.time()
        batch_responses = fetch_previous_runs_batch(batch)
        elapsed = time.time() - t0
        print(f"  Fetched {len(batch_responses)} location payloads in {elapsed:.2f}s")
        
        for pt_cfg, resp in zip(batch, batch_responses):
            h_data = resp["hourly"]
            records = aggregate_hourly_to_imd_daily(
                h_data,
                lat=pt_cfg["lat"],
                lon=pt_cfg["lon"],
                pt_id=pt_cfg["id"],
            )
            all_daily_records.extend(records)
            
        # Polite inter-batch throttle
        time.sleep(0.5)
        
    df = pd.DataFrame(all_daily_records)
    print(f"\nHarvest Complete: {len(df):,} total point-day records.")
    
    # Non-null Verification
    expected_records = len(grid_points) * 122
    assert len(df) == expected_records, f"Record count mismatch: got {len(df)}, expected {expected_records}"
    
    null_counts = df[["lead_d0_mm", "lead_d1_mm", "lead_d2_mm", "lead_d3_mm", "wind_u_850_ms", "wind_v_850_ms"]].isnull().sum()
    print("\nNon-Null Audit:")
    for col, nulls in null_counts.items():
        pct = ((len(df) - nulls) / len(df)) * 100.0
        print(f"  {col}: {len(df) - nulls:,}/{len(df):,} non-null ({pct:.2f}%)")
        assert nulls == 0, f"Critical: Found {nulls} null values in {col}"
        
    # Per-month, per-point coverage report
    df["month"] = df["date"].apply(lambda d: d[:7])
    coverage_by_month = {}
    for m, m_group in df.groupby("month"):
        pts_with_full_coverage = sum(1 for _, pt_group in m_group.groupby("point_id") if pt_group["lead_d1_mm"].notnull().all())
        coverage_by_month[m] = {
            "month": m,
            "days": int(len(m_group) / len(grid_points)),
            "points_evaluated": int(len(grid_points)),
            "points_with_100pct_coverage": int(pts_with_full_coverage),
            "coverage_percentage": round((pts_with_full_coverage / len(grid_points)) * 100.0, 2),
            "mean_lead_d1_rainfall_mm": round(float(m_group["lead_d1_mm"].mean()), 2),
            "max_lead_d1_rainfall_mm": round(float(m_group["lead_d1_mm"].max()), 2),
        }
        
    print("\nMonthly Coverage Summary:")
    for m, stat in coverage_by_month.items():
        print(f"  {m} ({stat['days']} days): {stat['points_with_100pct_coverage']}/{stat['points_evaluated']} pts (100% complete) | Mean={stat['mean_lead_d1_rainfall_mm']}mm, Max={stat['max_lead_d1_rainfall_mm']}mm")
        
    # Save to Parquet
    table = pa.Table.from_pandas(df)
    pq.write_table(table, PARQUET_OUTPUT, compression="zstd")
    
    # Also save as NPZ for backup fast numpy access
    npz_output = os.path.join(CACHE_DIR, "openmeteo_ecmwf_jjas2024.npz")
    np.savez_compressed(
        npz_output,
        point_ids=df["point_id"].values.astype(str),
        dates=df["date"].values.astype(str),
        lats=df["lat"].values.astype(float),
        lons=df["lon"].values.astype(float),
        lead_d0=df["lead_d0_mm"].values.astype(float),
        lead_d1=df["lead_d1_mm"].values.astype(float),
        lead_d2=df["lead_d2_mm"].values.astype(float),
        lead_d3=df["lead_d3_mm"].values.astype(float),
        wind_u=df["wind_u_850_ms"].values.astype(float),
        wind_v=df["wind_v_850_ms"].values.astype(float),
    )
    
    # Calculate SHA-256
    sha256 = hashlib.sha256()
    with open(PARQUET_OUTPUT, "rb") as f:
        while chunk := f.read(1024 * 1024):
            sha256.update(chunk)
    parquet_hash = sha256.hexdigest()
    
    coverage_report = {
        "attribution": OPENMETEO_ATTRIBUTION,
        "source": "https://previous-runs-api.open-meteo.com",
        "model": "ecmwf_ifs025",
        "season": "JJAS 2024",
        "date_range": ["2024-06-01", "2024-09-30"],
        "total_domain_points": len(grid_points),
        "total_point_days": len(df),
        "parquet_file": PARQUET_OUTPUT,
        "parquet_sha256": parquet_hash,
        "parquet_size_bytes": os.path.getsize(PARQUET_OUTPUT),
        "coverage_by_month": coverage_by_month,
        "status": "VERIFIED_100_PERCENT_COMPLETE",
    }
    
    with open(COVERAGE_REPORT_OUTPUT, "w") as f:
        json.dump(coverage_report, f, indent=2)
        
    print(f"\nParquet Cache Saved: {PARQUET_OUTPUT} ({os.path.getsize(PARQUET_OUTPUT):,} bytes)")
    print(f"Parquet SHA-256: {parquet_hash}")
    print(f"Coverage Report Saved: {COVERAGE_REPORT_OUTPUT}")
    return coverage_report

if __name__ == "__main__":
    run_openmeteo_harvest(batch_size=25)
