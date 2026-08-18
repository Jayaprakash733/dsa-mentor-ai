from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProblemCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    category: str
    topic: str

    approach: str | None = None
    time_complexity: str | None = None
    space_complexity: str | None = None
    source: str | None = None
    source_url: str | None = None
    solution_code: str | None = None
    programming_language: str | None = None


class ProblemResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    category: str
    topic: str

    approach: str | None = None
    time_complexity: str | None = None
    space_complexity: str | None = None
    source: str | None = None
    source_url: str | None = None
    solution_code: str | None = None
    programming_language: str | None = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)