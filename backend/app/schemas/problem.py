from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProblemCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    category: str
    topic: str


class ProblemResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    category: str
    topic: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)