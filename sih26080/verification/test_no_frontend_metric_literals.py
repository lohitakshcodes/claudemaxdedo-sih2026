"""
Unit Test: Verify No Unmeasured Metric Literals Appear in Frontend (STOP-THE-LINE Rule 1)

Checks:
1. app/sih26080/page.tsx must import resultsData from results.json
2. app/sih26080/page.tsx must NOT contain hardcoded unmeasured metric literals:
   - "0.28", "0.49", "28.4", "16.8", "40.8%", "0.38", "0.26", "142.5", "188.0", "near-perfect"
3. All metrics in the UI must be dynamically referenced from resultsData or manifestData
"""

import unittest
import os
import re

class TestNoFrontendMetricLiterals(unittest.TestCase):

    def setUp(self):
        self.ui_file_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "app", "sih26080", "page.tsx")
        )
        self.assertTrue(os.path.exists(self.ui_file_path), f"UI file {self.ui_file_path} does not exist")
        with open(self.ui_file_path, "r", encoding="utf-8") as f:
            self.ui_content = f.read()
            self.lines = self.ui_content.splitlines()

    def test_imports_results_json(self):
        """Verify the UI imports results.json and provenance_manifest.json directly."""
        self.assertIn("import resultsData from", self.ui_content, "UI must import resultsData from results.json")
        self.assertIn("import manifestData from", self.ui_content, "UI must import manifestData from provenance_manifest.json")

    def test_no_banned_unmeasured_literals(self):
        """Verify no unmeasured numeric literals or unsubstantiated claims appear in the UI."""
        banned_patterns = [
            (r'40\.8%', "Unmeasured claim: 40.8% Domain RMSE Reduction"),
            (r'near-perfect', "Unsubstantiated claim: near-perfect spatial alignment"),
            (r'>\s*0\.28\s*<', "Unmeasured literal: ETS 0.28"),
            (r'>\s*0\.49\s*<', "Unmeasured literal: ETS 0.49"),
            (r'>\s*28\.4\s*mm<', "Unmeasured literal: RMSE 28.4 mm"),
            (r'>\s*16\.8\s*mm<', "Unmeasured literal: RMSE 16.8 mm"),
            (r'>\s*142\.5\s*mm<', "Unmeasured literal: 142.5 mm"),
            (r'>\s*188\.0\s*mm<', "Unmeasured literal: 188.0 mm"),
        ]

        violations = []
        for pattern, desc in banned_patterns:
            for idx, line in enumerate(self.lines, 1):
                if re.search(pattern, line):
                    violations.append(f"Line {idx}: {desc} -> {line.strip()}")

        self.assertEqual(len(violations), 0, f"Found unmeasured metric literals in frontend:\n" + "\n".join(violations))

    def test_results_json_exists_and_valid(self):
        """Verify that results.json exists and contains master benchmark keys."""
        import json
        results_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data", "results.json")
        )
        self.assertTrue(os.path.exists(results_path), "results.json must exist")
        with open(results_path, "r") as f:
            data = json.load(f)

        self.assertIn("overall_benchmark", data)
        self.assertIn("regime_breakdown", data)
        self.assertIn("domain", data)
        self.assertIn("probabilistic_verification", data)
        self.assertIn("Raw ECMWF IFS (0.25°)", data["overall_benchmark"])
        self.assertIn("Regime-Aware RQDM (Stage 1)", data["overall_benchmark"])

if __name__ == "__main__":
    unittest.main()
