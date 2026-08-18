from app.database import SessionLocal
from app.models.problem import Problem
from app.ai.vector_store_manager import vector_store_manager
from langchain_core.documents import Document


class ProblemVectorLoader:
    """Load DSA problems from PostgreSQL into ChromaDB."""

    def load(self):
        db = SessionLocal()

        try:
            problems = (
                db.query(Problem)
                .order_by(Problem.id)
                .all()
            )

            documents = []

            for problem in problems:
                content = f"""
Title: {problem.title}

Category: {problem.category}

Topic: {problem.topic}

Difficulty: {problem.difficulty}

Problem Description:
{problem.description}

Approach:
{problem.approach or "Not available"}

Time Complexity:
{problem.time_complexity or "Not available"}

Space Complexity:
{problem.space_complexity or "Not available"}

Programming Language:
{problem.programming_language or "Not available"}

Solution Code:
{problem.solution_code or "Not available"}
"""

                document = Document(
                    page_content=content.strip(),
                    metadata={
                        "problem_id": problem.id,
                        "title": problem.title,
                        "category": problem.category,
                        "topic": problem.topic,
                        "difficulty": problem.difficulty,
                        "programming_language": (
                            problem.programming_language
                            or "unknown"
                        ),
                        "source": (
                            problem.source
                            or "DSA Mentor AI"
                        ),
                    },
                )

                documents.append(document)

            if not documents:
                print("No problems found in PostgreSQL.")
                return

            vector_store_manager.add_documents(documents)

            print(
                f"Successfully indexed "
                f"{len(documents)} problems into ChromaDB."
            )

        finally:
            db.close()


if __name__ == "__main__":
    loader = ProblemVectorLoader()
    loader.load()