from app.ai.llm_client import llm_client
from app.ai.vector_store_manager import vector_store_manager


class ExecutionFeedbackAgent:
    """
    Analyze student code execution results and provide
    educational DSA mentor feedback.
    """

    def generate_feedback(
        self,
        code: str,
        problem: str,
        topic: str,
        difficulty: str,
        success: bool,
        stdout: str,
        stderr: str,
        timed_out: bool,
        language: str = "python",
    ) -> str:

        retrieval_query = f"""
Problem:
{problem}

Topic:
{topic}

Student Code:
{code}

Execution Result:
Success: {success}

Output:
{stdout}

Error:
{stderr}

Timed Out:
{timed_out}
"""

        documents = vector_store_manager.similarity_search(
            retrieval_query,
            k=3,
        )

        if documents:
            context = "\n\n".join(
                document.page_content
                for document in documents
            )
        else:
            context = "No additional DSA context was found."

        prompt = f"""
You are DSA Mentor AI.

Your job is to analyze a student's code execution
and help them improve their problem-solving skills.

Problem:
{problem}

Topic:
{topic}

Difficulty:
{difficulty}

Programming Language:
{language}

Student Code:
{code}

Execution Successful:
{success}

Program Output:
{stdout}

Program Error:
{stderr}

Timed Out:
{timed_out}

Relevant DSA Knowledge:
{context}

Teaching Rules:

1. Do not immediately give the complete solution.
2. If the code failed, explain the actual problem clearly.
3. If there is a runtime error, explain what caused it.
4. If the code timed out, explain that the approach may be too slow.
5. If the code succeeded, acknowledge that it works.
6. If possible, identify the current time complexity.
7. Do not unnecessarily rewrite the student's entire code.
8. Give only the next useful improvement.
9. Keep the explanation concise and beginner-friendly.
10. Ask exactly ONE question at the end.
11. Stay focused on the current DSA problem.
12. Do not reveal the optimal solution unless explicitly asked.

Return only the mentor feedback.
"""

        return llm_client.generate(prompt)


execution_feedback_agent = ExecutionFeedbackAgent()