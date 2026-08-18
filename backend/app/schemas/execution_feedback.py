from pydantic import BaseModel


class ExecutionFeedbackRequest(BaseModel):
    code: str

    language: str = "python"

    problem: str = ""

    topic: str = "Arrays"

    difficulty: str = "Medium"

    success: bool

    stdout: str = ""

    stderr: str = ""

    timed_out: bool = False


class ExecutionFeedbackResponse(BaseModel):
    feedback: str