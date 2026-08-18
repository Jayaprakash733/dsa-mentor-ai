from fastapi import APIRouter

from app.ai.execution.code_executor import code_execution_agent
from app.ai.execution.test_case_runner import (
    test_case_runner,
    TestCase as RunnerTestCase,
)
from app.schemas.execution import (
    CodeExecutionRequest,
    CodeExecutionResponse,
    TestCaseExecutionRequest,
    TestCaseExecutionResponse,
    TestCaseResult,
)


router = APIRouter(
    prefix="/execute",
    tags=["Code Execution"],
)


@router.post("", response_model=CodeExecutionResponse)
def execute_code(request: CodeExecutionRequest):
    result = code_execution_agent.execute(
        code=request.code,
        language=request.language,
    )

    return CodeExecutionResponse(
        success=result.success,
        stdout=result.stdout,
        stderr=result.stderr,
        exit_code=result.exit_code,
        timed_out=result.timed_out,
    )


@router.post(
    "/tests",
    response_model=TestCaseExecutionResponse,
)
def execute_test_cases(request: TestCaseExecutionRequest):
    runner_test_cases = [
        RunnerTestCase(
            input=item.input,
            expected_output=item.expected_output,
        )
        for item in request.test_cases
    ]

    result = test_case_runner.run(
        code=request.code,
        language=request.language,
        test_cases=runner_test_cases,
        function_name=request.function_name,
    )

    return TestCaseExecutionResponse(
        passed=result.passed,
        total=result.total,
        test_cases=[
            TestCaseResult(
                passed=item.passed,
                input=item.input,
                expected_output=item.expected_output,
                actual_output=item.actual_output,
                error=item.error,
                timed_out=item.timed_out,
            )
            for item in result.test_cases
        ],
    )