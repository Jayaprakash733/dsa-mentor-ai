from fastapi import APIRouter, HTTPException
from pathlib import Path
import json


router = APIRouter(
    prefix="/problems",
    tags=["Problems"],
)


DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "problems.json"
)


def load_problems() -> list[dict]:
    if not DATA_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Problem dataset not found.",
        )

    with DATA_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


@router.get("")
def get_problems(
    topic: str | None = None,
    difficulty: str | None = None,
    limit: int = 50,
):
    problems = load_problems()

    if topic:
        problems = [
            problem
            for problem in problems
            if topic.lower()
            in [
                str(t).lower()
                for t in problem.get("topics", [])
            ]
        ]

    if difficulty:
        problems = [
            problem
            for problem in problems
            if str(
                problem.get("difficulty", "")
            ).lower()
            == difficulty.lower()
        ]

    return {
        "total": len(problems),
        "problems": problems[:limit],
    }


@router.get("/{problem_id}")
def get_problem(problem_id: str):

    problems = load_problems()

    for problem in problems:

        if (
            problem.get("id")
            == problem_id
            or problem.get("problem_id")
            == problem_id
        ):
            return problem

    raise HTTPException(
        status_code=404,
        detail="Problem not found.",
    )