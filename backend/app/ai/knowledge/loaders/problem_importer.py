from app.ai.knowledge.loaders.problem_loader import problem_loader
from app.database import SessionLocal
from app.models.problem import Problem


def import_problems():
    problems = problem_loader.load()

    db = SessionLocal()

    try:
        for data in problems:
            existing = (
                db.query(Problem)
                .filter(Problem.title == data["title"])
                .first()
            )

            if existing:
                print(f"Skipping existing problem: {data['title']}")
                continue

            problem = Problem(
                title=data["title"],
                description=data["description"],
                difficulty=data["difficulty"],
                category="DSA",
                topic=data["topic"],
                approach=data.get("approach"),
                time_complexity=data.get("time_complexity"),
                space_complexity=data.get("space_complexity"),
                source="Local Dataset",
                source_url=None,
            )

            db.add(problem)
            print(f"Added: {data['title']}")

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    import_problems()