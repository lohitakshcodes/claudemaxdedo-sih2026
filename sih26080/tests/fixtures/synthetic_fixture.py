"""
TEST FIXTURE ONLY - STRICTLY FORBIDDEN IN RESULTS PIPELINE

This file contains mock generators used ONLY for unit testing test harnesses.
It is guarded so that if imported by any module in sih26080/pipeline/, it raises RuntimeError.
"""

import sys

import inspect

# Raise immediately if imported by production pipeline
for frame_info in inspect.stack():
    fn = frame_info.filename.replace("\\", "/")
    if "sih26080/pipeline" in fn:
        raise RuntimeError(
            f"CRITICAL STOP-THE-LINE VIOLATION: synthetic_fixture imported by pipeline module: {fn}"
        )

import numpy as np

def guarded_synthetic_fixture():
    raise RuntimeError("Synthetic generator forbidden in real results pipeline")
