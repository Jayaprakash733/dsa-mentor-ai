import re
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.ai.rag_pipeline.langchain_rag import rag_pipeline
from app.services.answer_evaluator import answer_evaluator
from app.services.conversation_analyzer import conversation_analyzer
from app.services.conversation_manager import conversation_manager


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


# =========================================================
# REQUEST / RESPONSE MODELS
# =========================================================

class ChatRequest(BaseModel):
    message: str

    difficulty: str = "Medium"

    topic: str = "Arrays"

    request_type: str = "chat"

    hint_level: int = Field(
        default=1,
        ge=1,
        le=6,
    )

    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class ConversationSummary(BaseModel):
    session_id: str
    title: str
    topic: str
    difficulty: str
    updated_at: float


class ConversationHistoryResponse(BaseModel):
    session_id: str
    messages: list[dict[str, str]]


# =========================================================
# QUESTION EXTRACTION
# =========================================================

def extract_last_question(
    text: str,
) -> str:
    """
    Extract only the last question from the tutor response.

    Example:

    Full response:
        Let's look at nums = [2, 7, 11, 15].
        Since 2 + 7 = 9, correct indices kya honge?

    Returns:
        Since 2 + 7 = 9, correct indices kya honge?
    """

    text = text.strip()

    if not text:
        return ""

    question_positions = [
        match.start()
        for match in re.finditer(
            r"\?",
            text,
        )
    ]

    if not question_positions:
        return ""

    # Position of final question mark
    question_end = question_positions[-1]

    # Text before final question mark
    before_question = text[
        :question_end + 1
    ]

    # Find nearest sentence/line boundary
    boundaries = [
        before_question.rfind("\n"),
        before_question.rfind("."),
        before_question.rfind("!"),
    ]

    start = max(boundaries)

    question = before_question[
        start + 1:
    ].strip()

    return question


# =========================================================
# RECENT CHAT HISTORY
# =========================================================

@router.get(
    "/history",
    response_model=list[ConversationSummary],
)
def get_chat_history():
    """
    Return recent conversations for the
    ChatGPT-style sidebar.
    """

    return (
        conversation_manager
        .get_conversations()
    )


# =========================================================
# SINGLE CONVERSATION HISTORY
# =========================================================

@router.get(
    "/history/{session_id}",
    response_model=ConversationHistoryResponse,
)
def get_conversation(
    session_id: str,
):
    """
    Return all messages for one conversation.
    """

    session = (
        conversation_manager
        .get_session(session_id)
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return {
        "session_id": session_id,
        "messages": session.get(
            "messages",
            [],
        ),
    }


# =========================================================
# DELETE CONVERSATION
# =========================================================

@router.delete(
    "/history/{session_id}",
)
def delete_conversation(
    session_id: str,
):
    """
    Delete one conversation.
    """

    deleted = (
        conversation_manager
        .delete_session(
            session_id
        )
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return {
        "success": True,
        "session_id": session_id,
    }


# =========================================================
# MAIN CHAT ENDPOINT
# =========================================================

@router.post(
    "",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
):

    # -----------------------------------------------------
    # 1. Create / recover conversation session
    # -----------------------------------------------------

    session_id = (
        request.session_id
        or str(uuid4())
    )

    session = (
        conversation_manager
        .get_session(
            session_id
        )
    )

    if session is None:

        session = (
            conversation_manager
            .create_session(
                session_id=session_id,
                problem=request.message,
                difficulty=request.difficulty,
                topic=request.topic,
            )
        )

    else:

        # Keep topic and difficulty
        # synchronized with frontend.
        conversation_manager.update_session(
            session_id,
            topic=request.topic,
            difficulty=request.difficulty,
        )


    # -----------------------------------------------------
    # 2. Get previous conversation
    # -----------------------------------------------------

    messages = (
        conversation_manager
        .get_messages(
            session_id
        )
    )

    recent_messages = messages[-10:]

    conversation_history = ""

    for msg in recent_messages:

        role = msg["role"].upper()

        content = msg["content"]

        conversation_history += (
            f"{role}: {content}\n"
        )


    # -----------------------------------------------------
    # 3. Get original problem
    # -----------------------------------------------------

    problem = session.get(
        "problem",
        request.message,
    )


    # -----------------------------------------------------
    # 4. Check whether student is answering
    # -----------------------------------------------------

    awaiting_answer = (
        conversation_manager
        .is_awaiting_answer(
            session_id
        )
    )


    # -----------------------------------------------------
    # 5. Answer evaluation
    # -----------------------------------------------------

    if (
        awaiting_answer
        and request.request_type == "chat"
    ):

        tutor_question = (
            conversation_manager
            .get_last_tutor_question(
                session_id
            )
        )


        # ---------------------------------------------
        # Evaluate student's answer
        # ---------------------------------------------

        evaluation = (
            answer_evaluator.evaluate(
                problem=problem,
                question=tutor_question,
                student_answer=request.message,
                conversation_history=conversation_history,
            )
        )


        is_correct = evaluation.get(
            "is_correct",
            False,
        )

        feedback = evaluation.get(
            "feedback",
            "",
        )


        # ---------------------------------------------
        # Correct answer
        # ---------------------------------------------

        if is_correct:

            conversation_manager.advance_step(
                session_id
            )

            conversation_manager.set_awaiting_answer(
                session_id,
                False,
            )

            response = (
                f"✅ {feedback}\n\n"
                "Let's move to the next step."
            )


        # ---------------------------------------------
        # Wrong answer
        # ---------------------------------------------

        else:

            response = (
                f"💡 {feedback}\n\n"
                "Try answering the question again."
            )

            conversation_manager.set_awaiting_answer(
                session_id,
                True,
                tutor_question,
            )


    # -----------------------------------------------------
    # 6. Analyze student's message
    # -----------------------------------------------------

    else:

        phase = (
            conversation_analyzer.detect_phase(
                message=request.message,
                message_type=request.request_type,
                problem=problem,
            )
        )


        content_analysis = (
            conversation_analyzer.analyze_content(
                message=request.message,
                message_type=request.request_type,
                problem=problem,
            )
        )


        # ---------------------------------------------
        # Save analysis
        # ---------------------------------------------

        conversation_manager.update_session(
            session_id,
            current_phase=phase.value,
            last_content_analysis=content_analysis,
        )


        # ---------------------------------------------
        # Hint request
        # ---------------------------------------------

        if request.request_type == "hint":

            response = (
                rag_pipeline.get_hint(
                    query=request.message,
                    topic=request.topic,
                    hint_level=request.hint_level,
                    k=3,
                    problem=problem,
                    conversation_history=conversation_history,
                )
            )

            conversation_manager.set_hint_level(
                session_id,
                request.hint_level,
            )


        # ---------------------------------------------
        # Normal tutor conversation
        # ---------------------------------------------

        else:

            response = (
                rag_pipeline.ask(
                    query=request.message,
                    difficulty=request.difficulty,
                    k=3,
                    problem=problem,
                    conversation_history=conversation_history,
                )
            )


    # -----------------------------------------------------
    # 7. Save student message
    # -----------------------------------------------------

    conversation_manager.add_message(
        session_id=session_id,
        role="student",
        content=request.message,
    )


    # -----------------------------------------------------
    # 8. Save AI response
    # -----------------------------------------------------

    conversation_manager.add_message(
        session_id=session_id,
        role="assistant",
        content=response,
    )


    # -----------------------------------------------------
    # 9. Extract and save tutor question
    # -----------------------------------------------------

    tutor_question = (
        extract_last_question(
            response
        )
    )

    if tutor_question:

        conversation_manager.set_awaiting_answer(
            session_id=session_id,
            awaiting=True,
            tutor_question=tutor_question,
        )


    # -----------------------------------------------------
    # 10. Save latest student answer
    # -----------------------------------------------------

    conversation_manager.update_student_answer(
        session_id=session_id,
        answer=request.message,
    )


    # -----------------------------------------------------
    # 11. Return response
    # -----------------------------------------------------

    return {
        "response": response,
        "session_id": session_id,
    }