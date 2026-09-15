"""
Export SIH 2026 PPTX files to official PDF format using macOS Keynote AppleScript.
SIH Guideline: "You need to save the file in PDF and upload the same on portal. No PPT, Word Doc or any other format will be supported."
"""

import os
import subprocess

FILES = [
    ('SIH2026_SIH26068_WeatherGPT_ClaudeMaxDedo.pptx', 'SIH2026_SIH26068_WeatherGPT_ClaudeMaxDedo.pdf'),
    ('SIH2026_SIH26193_KrishiSmriti_ClaudeMaxDedo.pptx', 'SIH2026_SIH26193_KrishiSmriti_ClaudeMaxDedo.pdf')
]

cwd = os.path.abspath(os.getcwd())

for pptx_name, pdf_name in FILES:
    pptx_path = os.path.join(cwd, pptx_name)
    pdf_path = os.path.join(cwd, pdf_name)
    
    if not os.path.exists(pptx_path):
        print(f"File not found: {pptx_path}")
        continue

    apple_script = f'''
    set pptxPath to POSIX file "{pptx_path}"
    set pdfPath to POSIX file "{pdf_path}"
    
    tell application "Keynote"
        activate
        set theDoc to open pptxPath
        delay 2
        export theDoc to pdfPath as PDF
        close theDoc saving no
    end tell
    '''
    
    try:
        print(f"Exporting {pptx_name} -> {pdf_name} via Keynote...")
        res = subprocess.run(['osascript', '-e', apple_script], capture_output=True, text=True, timeout=45)
        if res.returncode == 0 and os.path.exists(pdf_path):
            size_kb = os.path.getsize(pdf_path) / 1024
            print(f"Successfully generated PDF: {pdf_name} ({size_kb:.1f} KB)")
        else:
            print(f"Keynote export warning: {res.stderr}")
    except Exception as e:
        print(f"Error converting {pptx_name}: {e}")
