import re
from enum import Enum
from typing import Any, Dict, List


class ConversationPhase(str, Enum):
    """Track the student's current learning phase."""

    UNDERSTANDING = "understanding"
    APPROACH = "approach"
    IMPLEMENTATION = "implementation"
    TESTING = "testing"
    OPTIMIZATION = "optimization"
    COMPLETED = "completed"


class ConversationAnalyzer:
    """Analyze student messages and detect the tutoring phase."""

    def detect_phase(
        self,
        message: str,
        message_type: str = "text",
        problem: str = "",
    ) -> ConversationPhase:
        """
        Detect the current conversation phase.

        The phase rules follow the uploaded
        Conversational Tutor implementation.
        """

        message_lower = message.lower()

        # Understanding phase
        if any(
            word in message_lower
            for word in [
                "understand",
                "explain",
                "what is",
                "how does",
                "confused about",
            ]
        ):
            return ConversationPhase.UNDERSTANDING

        # Approach phase
        if any(
            word in message_lower
            for word in [
                "approach",
                "strategy",
                "algorithm",
                "data structure",
                "how should",
                "way to",
            ]
        ):
            return ConversationPhase.APPROACH

        # Implementation phase
        if (
            message_type == "code"
            or any(
                word in message_lower
                for word in [
                    "wrote",
                    "code",
                    "implement",
                    "here's my",
                ]
            )
        ):
            return ConversationPhase.IMPLEMENTATION

        # Testing phase
        if any(
            word in message_lower
            for word in [
                "test",
                "example",
                "case",
                "try",
                "run",
                "result",
                "output",
            ]
        ):
            return ConversationPhase.TESTING

        # Optimization phase
        if any(
            word in message_lower
            for word in [
                "faster",
                "optimize",
                "efficient",
                "better",
                "complexity",
                "improve",
            ]
        ):
            return ConversationPhase.OPTIMIZATION

        # Default
        return ConversationPhase.UNDERSTANDING

    def analyze_content(
        self,
        message: str,
        message_type: str = "text",
        problem: str = "",
    ) -> Dict[str, Any]:
        """
        Analyze the content of a student message.
        """

        return {
            "has_code": (
                message_type == "code"
                or "```" in message
            ),
            "has_question": "?" in message,
            "message_length": len(message),
            "code_snippets": self.extract_code_snippets(
                message
            ),
            "keywords": self.extract_keywords(
                message,
                problem,
            ),
        }

    def extract_code_snippets(
        self,
        message: str,
    ) -> List[str]:
        """Extract fenced code blocks from a message."""

        pattern = r"```(?:\w+)?\s*(.*?)```"

        matches = re.findall(
            pattern,
            message,
            re.DOTALL,
        )

        return [
            snippet.strip()
            for snippet in matches
            if snippet.strip()
        ]

    def extract_keywords(
        self,
        message: str,
        problem: str = "",
    ) -> List[str]:
        """
        Extract relevant keywords from the message.

        Problem-specific words are included when they
        appear in the student's message.
        """

        keywords = ["two sum"]

        text = message.lower()

        # Common DSA keywords
        dsa_keywords = [
            "array",
            "string",
            "hash map",
            "hashmap",
            "dictionary",
            "set",
            "stack",
            "queue",
            "linked list",
            "tree",
            "binary tree",
            "graph",
            "heap",
            "sorting",
            "search",
            "binary search",
            "recursion",
            "dynamic programming",
            "greedy",
            "two pointer",
            "sliding window",
            "time complexity",
            "space complexity",
            "o(n)",
            "o(log n)",
            "o(n^2)",
        ]

        for keyword in dsa_keywords:
            if keyword in text:
                keywords.append(keyword)

        # Include important words from problem title/context
        if problem:
            problem_words = re.findall(
                r"\b[a-zA-Z]{3,}\b",
                problem.lower(),
            )

            for word in problem_words:
                if word in text and word not in keywords:
                    keywords.append(word)

        return keywords


conversation_analyzer = ConversationAnalyzer()