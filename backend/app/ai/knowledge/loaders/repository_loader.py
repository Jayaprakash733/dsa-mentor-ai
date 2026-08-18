from pathlib import Path

from app.database import SessionLocal
from app.models.problem import Problem


class RepositoryLoader:
    """Load DSA source-code files from the external repository."""

    SUPPORTED_EXTENSIONS = {
        ".py": "python",
        ".cpp": "cpp",
        ".c": "c",
        ".java": "java",
        ".js": "javascript",
    }

    IGNORED_NAMES = {
        ".ds_store",
        "in.txt",
        "readme.md",
    }

    def __init__(self, repository_path: str):
        self.repository_path = Path(repository_path)

        if not self.repository_path.exists():
            raise FileNotFoundError(
                f"Repository not found: {self.repository_path}"
            )

    def get_files(self):
        """Return supported source-code files."""
        return [
            path
            for path in self.repository_path.rglob("*")
            if (
                path.is_file()
                and path.suffix.lower() in self.SUPPORTED_EXTENSIONS
                and path.name.lower() not in self.IGNORED_NAMES
            )
        ]

    def extract_topic(self, file_path: Path) -> str:
        """Use the first folder below repository as the topic."""
        relative_path = file_path.relative_to(self.repository_path)

        if len(relative_path.parts) > 1:
            return relative_path.parts[0]

        return "General DSA"

    def extract_title(self, file_path: Path) -> str:
        """Convert filename into a readable problem title."""
        title = file_path.stem

        replacements = {
            "_": " ",
            "-": " ",
        }

        for old, new in replacements.items():
            title = title.replace(old, new)

        return " ".join(title.split()).strip()

    def read_solution(self, file_path: Path) -> str:
        """Read source code safely."""
        try:
            return file_path.read_text(
                encoding="utf-8",
                errors="ignore",
            )
        except Exception as exc:
            print(f"Could not read {file_path}: {exc}")
            return ""

    def load_to_database(self, limit: int = 20):
        """
        Import a limited number of source files first.

        limit=20 is intentional so we can verify the pipeline
        before importing the complete repository.
        """

        files = self.get_files()[:limit]

        db = SessionLocal()

        added = 0
        skipped = 0

        try:
            for file_path in files:
                solution_code = self.read_solution(file_path)

                if not solution_code.strip():
                    skipped += 1
                    continue

                title = self.extract_title(file_path)
                topic = self.extract_topic(file_path)
                language = self.SUPPORTED_EXTENSIONS[
                    file_path.suffix.lower()
                ]

                existing = (
                    db.query(Problem)
                    .filter(
                        Problem.title == title,
                        Problem.topic == topic,
                        Problem.programming_language == language,
                    )
                    .first()
                )

                if existing:
                    skipped += 1
                    continue

                problem = Problem(
                    title=title,
                    description=f"DSA implementation for {title}.",
                    difficulty="Unknown",
                    category="DSA",
                    topic=topic,
                    approach=None,
                    time_complexity=None,
                    space_complexity=None,
                    source="CompetitiveProgrammingQuestionBank",
                    source_url=(
                        "https://github.com/"
                        "smv1999/CompetitiveProgrammingQuestionBank"
                    ),
                    solution_code=solution_code,
                    programming_language=language,
                )

                db.add(problem)
                added += 1

                print(
                    f"Added: {title} "
                    f"[{topic}] [{language}]"
                )

            db.commit()

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()

        print("\nImport completed.")
        print(f"Added: {added}")
        print(f"Skipped: {skipped}")
        print(f"Processed: {len(files)}")


if __name__ == "__main__":

    repository_path = (
    Path(__file__).resolve().parents[5]
    / "datasets"
    / "CompetitiveProgrammingQuestionBank"
)

    loader = RepositoryLoader(str(repository_path))

    loader.load_to_database(limit=20)