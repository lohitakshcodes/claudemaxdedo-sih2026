"""
Generate high-resolution diagram images for Slide 3 of SIH 2026 Presentations.
- WeatherGPT: 5-Step Intent & Persona Adaptation Pipeline
- KrishiSmriti: 4-Layer Autonomous Decision Engine & 5 Parallel Ingestion APIs
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('scripts/diagrams', exist_ok=True)

def generate_weathergpt_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    
    # Title banner
    title_box = patches.FancyBboxPatch((0.02, 0.88), 0.96, 0.10, boxstyle="round,pad=0.0,rounding_size=0.015",
                                      fc="#1e293b", ec="#0f172a", lw=1.5)
    ax.add_patch(title_box)
    ax.text(0.5, 0.93, "WEATHERGPT: 5-STEP PERSONA-WISE INTENT & ADAPTATION PIPELINE", 
            ha='center', va='center', color='white', weight='bold', fontsize=11, fontfamily='sans-serif')
    
    # Raw Event input box on left (x: 0.02 -> 0.17)
    input_box = patches.FancyBboxPatch((0.02, 0.06), 0.15, 0.79, boxstyle="round,pad=0.0,rounding_size=0.02",
                                       fc="#eff6ff", ec="#3b82f6", lw=1.5)
    ax.add_patch(input_box)
    ax.text(0.095, 0.80, "RAW EVENT", ha='center', va='center', color='#1d4ed8', weight='bold', fontsize=9)
    ax.text(0.095, 0.73, "Pune (18.52°N)", ha='center', va='center', color='#0f172a', weight='bold', fontsize=8)
    ax.text(0.095, 0.54, "Temp: 29.4°C\nRain: 35.2 mm\nWind: 24 km/h\nRH: 88%\nPress: 1008hPa", 
            ha='center', va='center', color='#334155', fontsize=7.5, family='monospace')
    ax.text(0.095, 0.20, "IMD Doppler Radar\nWMO WIS 2.0 MQTT\nAWS S3 GFS 0.25°", 
            ha='center', va='center', color='#475569', fontsize=6.8, style='italic')

    # Steps 1 to 4 (x: 0.19 to 0.72)
    steps = [
        ("Step 1:\nContext", "Resolve Persona\nGPS Pin & Dialect\nMetadata Extract", "#f8fafc", "#94a3b8"),
        ("Step 2:\nTool Exec", "Selective Query\nNWP Byte-Slice\nRAG Bulletins", "#f8fafc", "#94a3b8"),
        ("Step 3:\nRule Fusion", "Domain Rules\nICAO / ICAR Limits\nZero-Memory Math", "#f8fafc", "#94a3b8"),
        ("Step 4:\nPrompt Lock", "Pydantic Schemas\nStrict Vocabulary\nRegex Assertion", "#eff6ff", "#3b82f6")
    ]
    
    step_w = 0.118
    step_gap = 0.015
    for i, (stitle, sdesc, sbg, sbc) in enumerate(steps):
        x = 0.19 + i * (step_w + step_gap)
        sbox = patches.FancyBboxPatch((x, 0.42), step_w, 0.43, boxstyle="round,pad=0.0,rounding_size=0.015",
                                      fc=sbg, ec=sbc, lw=1.2)
        ax.add_patch(sbox)
        ax.text(x + step_w / 2, 0.77, stitle, ha='center', va='center', color='#0f172a', weight='bold', fontsize=7.8)
        ax.text(x + step_w / 2, 0.56, sdesc, ha='center', va='center', color='#334155', fontsize=6.8)
        
        # Sequential step arrows
        if i < 3:
            ax.annotate('', xy=(x + step_w + step_gap, 0.63), xytext=(x + step_w, 0.63),
                        arrowprops=dict(arrowstyle="->", color="#0284c7", lw=1.5))

    # Initial arrow from input to step 1
    ax.annotate('', xy=(0.19, 0.63), xytext=(0.17, 0.63),
                arrowprops=dict(arrowstyle="->", color="#0284c7", lw=1.5))

    # Bottom Metric Bar (x: 0.19 -> 0.72)
    metric_w = 4 * step_w + 3 * step_gap
    metric_box = patches.FancyBboxPatch((0.19, 0.06), metric_w, 0.32, boxstyle="round,pad=0.0,rounding_size=0.015",
                                        fc="#f8fafc", ec="#94a3b8", lw=1.2)
    ax.add_patch(metric_box)
    ax.text(0.19 + metric_w / 2, 0.28, "KEY VERIFIED ENGINEERING BENCHMARKS", ha='center', va='center', color='#0f172a', weight='bold', fontsize=8.5)
    ax.text(0.19 + metric_w / 2, 0.19, "• Latency: < 140ms  |  Zarr Byte-Slicing: -99.5% NWP Payload Transfer", 
            ha='center', va='center', color='#0369a1', weight='bold', fontsize=7.4)
    ax.text(0.19 + metric_w / 2, 0.11, "• Decoupled Regex Assertion Node: 0.00% Verified Hallucination Rate", 
            ha='center', va='center', color='#0369a1', weight='bold', fontsize=7.4)

    # 4 Persona Delivery Outputs on right (x: 0.75 -> 0.98)
    outputs = [
        ("Farmer", "WhatsApp Audio: 'Delay cotton spray, 35mm rain'", "#ecfdf5", "#059669", "#065f46"),
        ("Aviation Pilot", "METAR/TAF: 'VAPO convective, holding 25m'", "#eff6ff", "#2563eb", "#1e40af"),
        ("Fisherman", "Audio Warning: '2.5m swells, return by 2PM'", "#fef3c7", "#d97706", "#92400e"),
        ("Smart City", "Municipal Alert: 'Clear Zone 3 drain #2'", "#fef2f2", "#dc2626", "#991b1b")
    ]
    
    card_w = 0.225
    card_h = 0.18
    for j, (pname, ptext, pbg, pbc, ptc) in enumerate(outputs):
        y = 0.67 - j * 0.20
        obox = patches.FancyBboxPatch((0.755, y), card_w, card_h, boxstyle="round,pad=0.0,rounding_size=0.012",
                                      fc=pbg, ec=pbc, lw=1.2)
        ax.add_patch(obox)
        ax.text(0.765, y + 0.125, pname, color=ptc, weight='bold', fontsize=7.5)
        ax.text(0.765, y + 0.055, ptext, color='#1e293b', fontsize=6.2)
        
        # Branching arrow from Step 4 right edge to each card
        ax.annotate('', xy=(0.755, y + card_h / 2), xytext=(0.19 + metric_w, 0.63),
                    arrowprops=dict(arrowstyle="->", color="#0284c7", lw=1.2, connectionstyle="arc3,rad=0.0"))

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    plt.tight_layout()
    out_path = 'scripts/diagrams/weathergpt_architecture_diagram.png'
    plt.savefig(out_path, bbox_inches='tight', pad_inches=0.05)
    plt.close()
    print(f"WeatherGPT diagram generated at {out_path}")

def generate_krishismriti_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    
    # Title banner
    title_box = patches.FancyBboxPatch((0.02, 0.88), 0.96, 0.10, boxstyle="round,pad=0.0,rounding_size=0.015",
                                      fc="#14532d", ec="#052e16", lw=1.5)
    ax.add_patch(title_box)
    ax.text(0.5, 0.93, "KRISHISMRITI: 4-LAYER DETERMINISTIC AGRO-DECISION ARCHITECTURE", 
            ha='center', va='center', color='white', weight='bold', fontsize=11, fontfamily='sans-serif')
    
    # 5 Parallel APIs on left (x: 0.02 -> 0.23)
    apis_box = patches.FancyBboxPatch((0.02, 0.06), 0.21, 0.79, boxstyle="round,pad=0.0,rounding_size=0.02",
                                      fc="#f0fdf4", ec="#16a34a", lw=1.5)
    ax.add_patch(apis_box)
    ax.text(0.125, 0.80, "5 PARALLEL APIS (GPS PIN)", ha='center', va='center', color='#15803d', weight='bold', fontsize=8.5)
    
    api_list = [
        ("1. Open-Meteo", "7-Day Precip & Soil Moisture", "#0284c7"),
        ("2. SoilGrids ISRIC", "250m Baseline NPK & pH", "#b45309"),
        ("3. Copernicus DEM", "Elevation & Slope Drainage", "#475569"),
        ("4. Agmarknet DMI", "3,000 APMC Live Prices", "#15803d"),
        ("5. Sentinel-1/2 SAR", "NDVI & Canopy Vigor", "#7c3aed")
    ]
    for k, (aname, adesc, acolor) in enumerate(api_list):
        ay = 0.65 - k * 0.13
        abox = patches.FancyBboxPatch((0.03, ay), 0.19, 0.10, boxstyle="round,pad=0.0,rounding_size=0.01",
                                     fc="#ffffff", ec=acolor, lw=1.0)
        ax.add_patch(abox)
        ax.text(0.04, ay + 0.065, aname, color=acolor, weight='bold', fontsize=7.2)
        ax.text(0.04, ay + 0.025, adesc, color='#475569', fontsize=6.2)

    # 3 Central Stages (x: 0.255 -> 0.735)
    layers = [
        ("Layer 2:\nContext Engine", "Merges API Telemetry\ninto Unified State JSON\nFilters by Crop & Region", "#f8fafc", "#64748b"),
        ("Layer 3:\nICAR Math Shield", "Deterministic Python Code\nTarget NPK - Soil NPK\nEnforces CIBRC 15-20kg Cap\nZero Probabilistic Guessing", "#eff6ff", "#3b82f6"),
        ("Layer 4:\nVernacular Audio", "LangChain State Machine\nBhashini Vernacular TTS\nWhatsApp Audio Delivery\nZero-Form Touch Cards", "#f0fdf4", "#16a34a")
    ]
    
    layer_w = 0.148
    layer_gap = 0.015
    for i, (ltitle, ldesc, lbg, lbc) in enumerate(layers):
        x = 0.255 + i * (layer_w + layer_gap)
        lbox = patches.FancyBboxPatch((x, 0.42), layer_w, 0.43, boxstyle="round,pad=0.0,rounding_size=0.015",
                                      fc=lbg, ec=lbc, lw=1.2)
        ax.add_patch(lbox)
        ax.text(x + layer_w / 2, 0.77, ltitle, ha='center', va='center', color='#0f172a', weight='bold', fontsize=7.8)
        ax.text(x + layer_w / 2, 0.56, ldesc, ha='center', va='center', color='#334155', fontsize=6.8)
        
        # Arrow to next
        if i < 2:
            ax.annotate('', xy=(x + layer_w + layer_gap, 0.63), xytext=(x + layer_w, 0.63),
                        arrowprops=dict(arrowstyle="->", color="#15803d", lw=1.5))

    # Arrow from APIs to Layer 2
    ax.annotate('', xy=(0.255, 0.63), xytext=(0.23, 0.63),
                arrowprops=dict(arrowstyle="->", color="#15803d", lw=1.5))

    # Bottom Metric Bar
    mid_w = 3 * layer_w + 2 * layer_gap
    metric_box = patches.FancyBboxPatch((0.255, 0.06), mid_w, 0.32, boxstyle="round,pad=0.0,rounding_size=0.015",
                                        fc="#f8fafc", ec="#94a3b8", lw=1.2)
    ax.add_patch(metric_box)
    ax.text(0.255 + mid_w / 2, 0.28, "KEY VERIFIED ENGINEERING BENCHMARKS", ha='center', va='center', color='#0f172a', weight='bold', fontsize=8.5)
    ax.text(0.255 + mid_w / 2, 0.19, "• Mandi Sync: 3,000 APMCs in 3.8s  |  Urea Overdose Prevented: -30%", 
            ha='center', va='center', color='#15803d', weight='bold', fontsize=7.4)
    ax.text(0.255 + mid_w / 2, 0.11, "• Zero Hallucination: 100% Deterministic ICAR Agronomic Safeguards", 
            ha='center', va='center', color='#15803d', weight='bold', fontsize=7.4)

    # B2G Delivery on right (x: 0.76 -> 0.98)
    g2c_box = patches.FancyBboxPatch((0.76, 0.06), 0.22, 0.79, boxstyle="round,pad=0.0,rounding_size=0.02",
                                     fc="#fefce8", ec="#ca8a04", lw=1.5)
    ax.add_patch(g2c_box)
    ax.text(0.87, 0.80, "B2G / G2C REACH", ha='center', va='center', color='#854d0e', weight='bold', fontsize=8.5)
    
    channels = [
        ("State WhatsApp", "140M+ Smallholders"),
        ("Krishi Sakhis", "1:1,500 Field Tablets"),
        ("Gram Panchayats", "250k CSC Kiosks"),
        ("Kisan Call Centres", "1800 Toll-Free System")
    ]
    for m, (cname, csub) in enumerate(channels):
        cy = 0.62 - m * 0.17
        cbox = patches.FancyBboxPatch((0.775, cy), 0.19, 0.13, boxstyle="round,pad=0.0,rounding_size=0.01",
                                      fc="#ffffff", ec="#ca8a04", lw=1.0)
        ax.add_patch(cbox)
        ax.text(0.87, cy + 0.08, cname, ha='center', va='center', color='#1e293b', fontsize=7.2, weight='bold')
        ax.text(0.87, cy + 0.035, csub, ha='center', va='center', color='#854d0e', fontsize=6.2)

    # Arrow from Layer 4 to B2G Delivery Box
    ax.annotate('', xy=(0.76, 0.63), xytext=(0.255 + mid_w, 0.63),
                arrowprops=dict(arrowstyle="->", color="#ca8a04", lw=1.5))

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    plt.tight_layout()
    out_path = 'scripts/diagrams/krishismriti_architecture_diagram.png'
    plt.savefig(out_path, bbox_inches='tight', pad_inches=0.05)
    plt.close()
    print(f"KrishiSmriti diagram generated at {out_path}")

def generate_weathergpt_safeguards_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    
    # Title banner
    title_box = patches.FancyBboxPatch((0.02, 0.86), 0.96, 0.12, boxstyle="round,pad=0.02",
                                      fc="#1e293b", ec="#0f172a", lw=1.5)
    ax.add_patch(title_box)
    ax.text(0.5, 0.92, "WEATHERGPT: 3-TIER VERIFIABLE ENGINEERING SAFEGUARD MATRIX", 
            ha='center', va='center', color='white', weight='bold', fontsize=11, fontfamily='sans-serif')
    
    rows = [
        ("CHALLENGE 01: 10GB Binary NWP Bloat", 
         "NWP models (GFS/WRF) output 10GB GRIB2 files.\nDownloading full grids causes 15s web lag.",
         "#fef2f2", "#dc2626",
         "SAFEGUARD: Cloud Byte-Range Streaming", 
         "Kerchunk metadata indexes stream only requested lat/long bytes directly from AWS S3.\nLatency drops from 15s to < 300ms (-99.5% payload).",
         "#eff6ff", "#2563eb"),
        ("CHALLENGE 02: High-Stakes LLM Hallucinations", 
         "Probabilistic LLMs guessing dates, rainfall volume, or\nwind vectors risk severe disaster casualties.",
         "#fef2f2", "#dc2626",
         "SAFEGUARD: Decoupled Truth Assertion Node", 
         "LLM acts only as parameter router. Regex fact-checker matches text against raw API JSON.\nAuto-replaces any mismatch with raw template (0.00% errors).",
         "#f0fdf4", "#16a34a"),
        ("CHALLENGE 03: Rural Dialect & Acoustic Noise", 
         "Standard voice models fail with background tractor noise,\naccents, and non-standard meteorological slang.",
         "#fef2f2", "#dc2626",
         "SAFEGUARD: Bhashini Acoustic Cascade + Glossary", 
         "Domain dictionary normalizes rural terms ('toofani baarish' -> 'convective squall')\nprior to ingestion. 8kHz noise cancellation filter.",
         "#fefce8", "#ca8a04")
    ]
    
    for idx, (rtitle, rdesc, rbg, rbc, stitle, sdesc, sbg, sbc) in enumerate(rows):
        y = 0.58 - idx * 0.25
        # Risk Box (Left)
        rbox = patches.FancyBboxPatch((0.02, y), 0.44, 0.22, boxstyle="round,pad=0.02", fc=rbg, ec=rbc, lw=1.2)
        ax.add_patch(rbox)
        ax.text(0.04, y + 0.17, rtitle, color=rbc, weight='bold', fontsize=8)
        ax.text(0.04, y + 0.08, rdesc, color='#334155', fontsize=7.2)
        
        # Center Transition Arrow
        ax.annotate('', xy=(0.51, y + 0.11), xytext=(0.47, y + 0.11),
                    arrowprops=dict(arrowstyle="->", color="#0284c7", lw=2.0))
        ax.text(0.49, y + 0.14, "FIX", ha='center', va='center', color='#0284c7', weight='bold', fontsize=7)
        
        # Safeguard Box (Right)
        sbox = patches.FancyBboxPatch((0.52, y), 0.46, 0.22, boxstyle="round,pad=0.02", fc=sbg, ec=sbc, lw=1.2)
        ax.add_patch(sbox)
        ax.text(0.54, y + 0.17, stitle, color=sbc, weight='bold', fontsize=8)
        ax.text(0.54, y + 0.08, sdesc, color='#334155', fontsize=7.2)

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    plt.tight_layout()
    out_path = 'scripts/diagrams/weathergpt_safeguards_diagram.png'
    plt.savefig(out_path, bbox_inches='tight', pad_inches=0.05)
    plt.close()
    print(f"WeatherGPT safeguards diagram generated at {out_path}")

def generate_krishismriti_safeguards_diagram():
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    
    # Title banner
    title_box = patches.FancyBboxPatch((0.02, 0.86), 0.96, 0.12, boxstyle="round,pad=0.02",
                                      fc="#14532d", ec="#052e16", lw=1.5)
    ax.add_patch(title_box)
    ax.text(0.5, 0.92, "KRISHISMRITI: 4-POINT OPERATIONAL RISK & SAFEGUARD MATRIX", 
            ha='center', va='center', color='white', weight='bold', fontsize=11, fontfamily='sans-serif')
    
    cards = [
        ("RISK 01: Chemical Overdose", "Hallucinated dosage burns crop\n& bankrupts smallholders.", 
         "SAFEGUARD: ICAR Math Engine", "Deterministic Python calculates exact NPK\nwith CIBRC 15-20 kg/acre hard caps.", "#dc2626", "#15803d"),
        ("RISK 02: Rural Illiteracy", "Complex apps & text search\nfail for non-reading farmers.", 
         "SAFEGUARD: Zero-Form Cards", "Visual soil/crop touch cards +\n1-button Bhashini regional voice notes.", "#dc2626", "#0284c7"),
        ("RISK 03: Field Connectivity", "Frequent 2G/3G network blackouts\nin remote agricultural belts.", 
         "SAFEGUARD: Offline PWA", "SQLite storage saves baseline crop calendars\n& fertilizer equations on device.", "#dc2626", "#ca8a04"),
        ("RISK 04: Commercial Bias", "Private apps sell inputs, incentivizing\nexcess chemical purchases.", 
         "SAFEGUARD: B2G Public Model", "Pure G2C public utility; frequently instructs\nNOT to buy/spray when weather is adverse.", "#dc2626", "#7c3aed")
    ]
    
    for idx, (rtitle, rdesc, stitle, sdesc, rbc, sbc) in enumerate(cards):
        x = 0.02 + idx * 0.245
        # Card
        cbox = patches.FancyBboxPatch((x, 0.08), 0.23, 0.74, boxstyle="round,pad=0.02", fc="#f8fafc", ec="#cbd5e1", lw=1.2)
        ax.add_patch(cbox)
        
        # Risk header
        ax.text(x + 0.115, 0.74, rtitle, ha='center', color=rbc, weight='bold', fontsize=7.2)
        ax.text(x + 0.115, 0.62, rdesc, ha='center', color='#475569', fontsize=6.5)
        
        # Divider line
        ax.plot([x + 0.02, x + 0.21], [0.50, 0.50], color='#cbd5e1', lw=1.0, linestyle='--')
        
        # Safeguard header
        ax.text(x + 0.115, 0.42, stitle, ha='center', color=sbc, weight='bold', fontsize=7.2)
        ax.text(x + 0.115, 0.26, sdesc, ha='center', color='#1e293b', fontsize=6.5)

    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    plt.tight_layout()
    out_path = 'scripts/diagrams/krishismriti_safeguards_diagram.png'
    plt.savefig(out_path, bbox_inches='tight', pad_inches=0.05)
    plt.close()
    print(f"KrishiSmriti safeguards diagram generated at {out_path}")

if __name__ == '__main__':
    generate_weathergpt_diagram()
    generate_krishismriti_diagram()
    generate_weathergpt_safeguards_diagram()
    generate_krishismriti_safeguards_diagram()

