import json
from pathlib import Path


class DSAProblemLoader:

    def __init__(self):
        self.data_path = (
            Path(__file__).resolve().parent.parent
            / "sources"
            / "dsa_problems.json"
        )

    def load(self):
        if not self.data_path.exists():
            raise FileNotFoundError(
                f"DSA dataset not found: {self.data_path}"
            )

        with open(self.data_path, "r", encoding="utf-8") as file:
            return json.load(file)


problem_loader = DSAProblemLoader()