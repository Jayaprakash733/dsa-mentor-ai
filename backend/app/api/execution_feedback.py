from fastapi import APIRouter

from app.schemas.execution_feedback import (
    ExecutionFeedbackRequest,
    ExecutionFeedbackResponse,
)

from app.ai.execution.feedback_agent import (
    execution_feedback_agent,
)


router = APIRouter(
    prefix="/execute",
    tags=["Code Execution"],
)


@router.post(
    "/feedback",
    response_model=ExecutionFeedbackResponse,
)
def execution_feedback(
    request: ExecutionFeedbackRequest,
):

    feedback = (
        execution_feedback_agent.generate_feedback(
            code=request.code,
            problem=request.problem,
            topic=request.topic,
            difficulty=request.difficulty,
            success=request.success,
            stdout=request.stdout,
            stderr=request.stderr,
            timed_out=request.timed_out,
            language=request.language,
        )
    )

    return {
        "feedback": feedback
    }