from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.problem import Problem
from app.schemas.problem import ProblemCreate, ProblemResponse


router = APIRouter(
    prefix="/problems",
    tags=["Problems"],
)


@router.post(
    "",
    response_model=ProblemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_problem(
    data: ProblemCreate,
    db: Session = Depends(get_db),
):
    problem = Problem(
        title=data.title,
        description=data.description,
        difficulty=data.difficulty,
        category=data.category,
        topic=data.topic,
    )

    db.add(problem)
    db.commit()
    db.refresh(problem)

    return problem


@router.get(
    "",
    response_model=list[ProblemResponse],
)
def list_problems(
    db: Session = Depends(get_db),
):
    problems = db.scalars(
        select(Problem).order_by(Problem.id)
    ).all()

    return problems


@router.get(
    "/{problem_id}",
    response_model=ProblemResponse,
)
def get_problem(
    problem_id: int,
    db: Session = Depends(get_db),
):
    problem = db.get(Problem, problem_id)

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    return problem