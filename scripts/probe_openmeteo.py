"""
Open-Meteo Capability Probe for JJAS 2024 Forecasts
Probes:
1. GFS Seamless (Historical Forecast API)
2. GFS Previous Runs (Day 1..3)
3. ECMWF IFS (ecmwf_ifs025) Previous Runs (Day 1..3)
4. ECMWF IFS Single Runs (&run=...)
5. Request budget & latency measurement over 10 points
"""

import urllib.request
import urllib.error
import json
import time

LAT = 19.9975  # Nashik (Core Monsoon / Ghats transition)
LON = 73.7898
START_DATE = "2024-07-01"
END_DATE = "2024-07-05"

probes = [
    {
        "name": "GFS Seamless Continuous (Historical Forecast API)",
        "url": f"https://historical-forecast-api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&start_date={START_DATE}&end_date={END_DATE}&hourly=precipitation&models=gfs_seamless&timezone=UTC"
    },
    {
        "name": "GFS Previous Runs Day 1-3 (Previous Runs API)",
        "url": f"https://previous-runs-api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&start_date={START_DATE}&end_date={END_DATE}&hourly=precipitation_previous_day1,precipitation_previous_day2,precipitation_previous_day3&models=gfs_seamless&timezone=UTC"
    },
    {
        "name": "GFS on Main API with previous_day1..3",
        "url": f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&past_days=5&hourly=precipitation_previous_day1,precipitation_previous_day2,precipitation_previous_day3&models=gfs_seamless&timezone=UTC"
    },
    {
        "name": "ECMWF IFS Previous Runs Day 1-3 (Previous Runs API)",
        "url": f"https://previous-runs-api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&start_date={START_DATE}&end_date={END_DATE}&hourly=precipitation_previous_day1,precipitation_previous_day2,precipitation_previous_day3&models=ecmwf_ifs025&timezone=UTC"
    },
    {
        "name": "ECMWF IFS Continuous (Historical Forecast API)",
        "url": f"https://historical-forecast-api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&start_date={START_DATE}&end_date={END_DATE}&hourly=precipitation&models=ecmwf_ifs025&timezone=UTC"
    },
    {
        "name": "ECMWF IFS Single Run (run=2024-07-01T00:00)",
        "url": f"https://single-run-api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&run=2024-07-01T00:00&hourly=precipitation&models=ecmwf_ifs025&timezone=UTC"
    },
    {
        "name": "ECMWF IFS Single Run on Main API (run=2024-07-01T00:00)",
        "url": f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&run=2024-07-01T00:00&hourly=precipitation&models=ecmwf_ifs025&timezone=UTC"
    },
    {
        "name": "GFS Single Run (run=2024-07-01T00:00)",
        "url": f"https://single-run-api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&run=2024-07-01T00:00&hourly=precipitation&models=gfs_seamless&timezone=UTC"
    }
]

print("=" * 70)
print("OPEN-METEO PROBE: JJAS 2024 CAPABILITY & ENDPOINT VERIFICATION")
print("=" * 70)

results = []
for p in probes:
    t0 = time.time()
    status_str = ""
    details = ""
    try:
        req = urllib.request.Request(p["url"], headers={"User-Agent": "WeatherGPT-Probe/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = time.time() - t0
            code = resp.getcode()
            body = resp.read()
            data = json.loads(body.decode("utf-8"))
            hourly = data.get("hourly", {})
            keys = list(hourly.keys())
            # check non-null count
            has_data = any(k != "time" and any(v is not None for v in hourly.get(k, [])) for k in keys)
            if code == 200 and has_data:
                status_str = "WORKS (LIVE)"
                details = f"HTTP {code}, {elapsed:.2f}s, {len(body)} bytes, keys: {keys}"
            elif code == 200:
                status_str = "EMPTY / ALL NULL"
                details = f"HTTP {code}, {elapsed:.2f}s, all variables null"
            else:
                status_str = f"HTTP {code}"
                details = f"HTTP {code}, {elapsed:.2f}s"
    except urllib.error.HTTPError as e:
        elapsed = time.time() - t0
        err_msg = ""
        try:
            err_msg = json.loads(e.read().decode())
        except Exception:
            err_msg = str(e)
        status_str = f"HTTP {e.code}"
        details = f"{err_msg} ({elapsed:.2f}s)"
    except Exception as e:
        elapsed = time.time() - t0
        status_str = "FAILED"
        details = f"{str(e)} ({elapsed:.2f}s)"
    
    print(f"\nProbe: {p['name']}")
    print(f"  URL: {p['url'][:90]}...")
    print(f"  Status: {status_str}")
    print(f"  Details: {details}")
    results.append({"name": p["name"], "status": status_str, "details": details})

print("\n" + "=" * 70)
print("10-POINT REQUEST BUDGET & LATENCY BENCHMARK (Stride-2 Grid Estimation)")
print("=" * 70)

points = [
    (19.0, 73.0, "Mumbai/Coast"),
    (20.0, 74.0, "Nashik/Ghats"),
    (18.5, 74.0, "Pune/Interior"),
    (21.0, 79.0, "Nagpur/CMZ"),
    (23.0, 80.0, "Jabalpur/CMZ"),
    (24.0, 82.0, "Rewa/CMZ"),
    (22.0, 86.0, "Baripada/East"),
    (20.5, 86.5, "Bhubaneswar/East Coast"),
    (26.0, 74.0, "Ajmer/Semi-Arid"),
    (16.0, 74.5, "Belgaum/South Ghats")
]

times = []
sizes = []
for lat, lon, label in points:
    url = f"https://historical-forecast-api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&start_date=2024-07-01&end_date=2024-07-31&hourly=precipitation&models=gfs_seamless&timezone=UTC"
    t0 = time.time()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "WeatherGPT-Probe/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = time.time() - t0
            b = resp.read()
            times.append(elapsed)
            sizes.append(len(b))
            print(f"  Point {label} ({lat}, {lon}): {elapsed:.2f}s, {len(b)} bytes")
    except Exception as e:
        print(f"  Point {label} failed: {e}")

if times:
    avg_t = sum(times) / len(times)
    avg_size = sum(sizes) / len(sizes)
    print(f"\nAverage latency per point: {avg_t:.3f} s")
    print(f"Average payload per point (1 month hourly): {avg_size/1024:.1f} KB")
