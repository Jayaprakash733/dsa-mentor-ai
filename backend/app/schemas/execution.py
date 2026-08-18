from pydantic import BaseModel, Field


class CodeExecutionRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = "python"


class CodeExecutionResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    exit_code: int | None
    timed_out: bool


class TestCase(BaseModel):
    input: str = ""
    expected_output: str


class TestCaseExecutionRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = "python"
    function_name: str | None = None
    test_cases: list[TestCase] = Field(..., min_length=1)


class TestCaseResult(BaseModel):
    passed: bool
    input: str
    expected_output: str
    actual_output: str
    error: str = ""
    timed_out: bool = False


class TestCaseExecutionResponse(BaseModel):
    passed: int
    total: int
    test_cases: list[TestCaseResult]