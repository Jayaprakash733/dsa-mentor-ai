import json
import re
from typing import Any, Dict

from app.ai.llm_client import llm_client


class AnswerEvaluator:
    """Evaluate a student's answer and decide the next tutoring action."""

    def evaluate(
        self,
        problem: str,
        question: str,
        student_answer: str,
        conversation_history: str = "",
    ) -> Dict[str, Any]:
        """
        Evaluate the student's answer using the LLM.

        Returns:
            {
                "is_correct": bool,
                "feedback": str,
                "next_action": str
            }
        """

        prompt = f"""
You are an expert DSA tutor evaluating a student's answer.

Problem:
{problem}

Previous Conversation:
{conversation_history}

Tutor Question:
{question}

Student Answer:
{student_answer}

Evaluate the student's answer.

Rules:
1. Decide whether the answer is correct in the context of the question.
2. If correct:
   - Clearly say it is correct.
   - Give short positive feedback.
   - Suggest the next logical learning step.
3. If incorrect:
   - Do not reveal the complete solution.
   - Explain briefly what is wrong.
   - Give a small hint so the student can try again.
4. If the answer is partially correct:
   - Acknowledge the correct part.
   - Explain what is missing.
   - Give a guiding hint.
5. Keep the response beginner-friendly.
6. Stay focused on the current DSA problem.
7. Do not introduce unrelated examples.

Return ONLY valid JSON in this exact structure:

{{
    "is_correct": true,
    "feedback": "Short feedback for the student.",
    "next_action": "next_step"
}}

Allowed next_action values:
- "next_step"
- "retry"
- "explain"
"""

        raw_response = llm_client.generate(prompt)

        return self._parse_response(raw_response)

    def _parse_response(
        self,
        response: str,
    ) -> Dict[str, Any]:
        """Safely parse the LLM JSON response."""

        try:
            return json.loads(response)

        except json.JSONDecodeError:
            pass

        # Handle cases where the model wraps JSON in ```json ... ```
        match = re.search(
            r"\{.*\}",
            response,
            re.DOTALL,
        )

        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        # Safe fallback
        return {
            "is_correct": False,
            "feedback": response,
            "next_action": "explain",
        }


answer_evaluator = AnswerEvaluator()