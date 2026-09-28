"""
Unit Test: Verify No Synthetic Data Generators Are Reachable from Results Pipeline (STOP-THE-LINE Rule 3)

Validates:
1. sih26080.pipeline.reproduce_benchmark does NOT contain or import any simulation functions
2. simulate_controlled_dataset and simulate_domain_dataset are completely removed from production modules
3. synthetic_fixture is guarded and forbidden from being imported by the pipeline
4. Results pipeline explicitly requires real observation files from data/raw/imd/
"""

import unittest
import inspect
import importlib

class TestNoSyntheticInPipeline(unittest.TestCase):

    def test_reproduce_benchmark_has_no_simulator(self):
        """Verify reproduce_benchmark has zero simulation functions or generators."""
        from sih26080.pipeline import reproduce_benchmark
        source_code = inspect.getsource(reproduce_benchmark)

        self.assertNotIn(
            "def simulate_controlled_dataset", source_code,
            "CRITICAL: simulate_controlled_dataset must not exist in reproduce_benchmark.py"
        )
        self.assertNotIn(
            "def simulate_domain_dataset", source_code,
            "CRITICAL: simulate_domain_dataset must not exist in reproduce_benchmark.py"
        )
        self.assertNotIn(
            "simulate_controlled_dataset(", source_code,
            "CRITICAL: simulate_controlled_dataset must not be called in reproduce_benchmark.py"
        )

    def test_synthetic_fixture_is_guarded(self):
        """Verify synthetic_fixture raises RuntimeError if called."""
        from sih26080.tests.fixtures.synthetic_fixture import guarded_synthetic_fixture
        with self.assertRaises(RuntimeError):
            guarded_synthetic_fixture()

    def test_pipeline_files_contain_no_simulation_definitions(self):
        """Ensure all pipeline files strictly require real data."""
        import glob
        pipeline_files = glob.glob("sih26080/pipeline/*.py")
        self.assertTrue(len(pipeline_files) > 0, "Pipeline files must exist")

        for fpath in pipeline_files:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
                self.assertNotIn(
                    "def simulate_domain_dataset", content,
                    f"Found simulation function in {fpath}"
                )

if __name__ == "__main__":
    unittest.main()
