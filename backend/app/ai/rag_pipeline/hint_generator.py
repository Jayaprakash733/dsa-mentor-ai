from typing import Dict


class HintGenerator:
    """Generate progressive hints for DSA problems."""

    def __init__(self):
        self.hint_levels = {
            1: "Conceptual Direction",
            2: "Data Structure / Algorithm",
            3: "Detailed Approach",
            4: "Pseudocode",
            5: "Code Structure",
            6: "Complete Solution",
        }

    def generate_hints(
        self,
        topic: str,
        problem_context: str = "",
    ) -> Dict[int, str]:
        """Generate six progressive hints."""

        hints = {
            1: self._conceptual_hint(topic),
            2: self._data_structure_hint(topic),
            3: self._approach_hint(problem_context),
            4: self._pseudocode_hint(),
            5: self._code_structure_hint(),
            6: self._solution_hint(),
        }

        return hints

    def get_hint(
        self,
        level: int,
        topic: str,
        problem_context: str = "",
    ) -> str:
        """Return one hint at the requested level."""

        level = max(1, min(level, 6))

        hints = self.generate_hints(
            topic=topic,
            problem_context=problem_context,
        )

        return hints[level]

    def _conceptual_hint(self, topic: str) -> str:
        """Level 1: Conceptual direction."""

        hints_map = {
            "Arrays": (
                "Think about how many times you need to examine the data. "
                "Do you need to look at it once or multiple times?"
            ),
            "Trees": (
                "Think about the structure of the tree. "
                "How would you visit each node systematically?"
            ),
            "Graphs": (
                "Think about how the nodes are connected. "
                "What should you explore first?"
            ),
            "Dynamic Programming": (
                "Can you break the problem into smaller, "
                "overlapping subproblems?"
            ),
            "Recursion": (
                "Think about the base case and the recursive case."
            ),
            "Sorting": (
                "Think about what order the elements need to be in."
            ),
            "Hashing": (
                "Can you store information so that you can look it up faster?"
            ),
            "Stacks": (
                "Think about whether the problem follows "
                "Last In, First Out (LIFO)."
            ),
            "Queues": (
                "Think about whether the problem follows "
                "First In, First Out (FIFO)."
            ),
            "Strings": (
                "Think about whether you are looking for patterns, "
                "substrings, or character properties."
            ),
        }

        return hints_map.get(
            topic,
            "Think about the problem structure and what pattern it follows.",
        )

    def _data_structure_hint(self, topic: str) -> str:
        """Level 2: Data structure or algorithm."""

        suggestions = {
            "Arrays": (
                "Consider whether you need to remember values "
                "you have already seen. A hash map may help."
            ),
            "Trees": (
                "Consider DFS or BFS. Think about whether recursion "
                "or another data structure is more suitable."
            ),
            "Graphs": (
                "Consider BFS for shortest-path style problems "
                "or DFS for connectivity/traversal."
            ),
            "Dynamic Programming": (
                "Think about the state you need to track "
                "and how smaller subproblems combine."
            ),
            "Recursion": (
                "Think about what parameters your recursive function needs."
            ),
            "Sorting": (
                "Consider which sorting algorithm fits the constraints "
                "and its time/space complexity."
            ),
            "Hashing": (
                "Consider storing key-value pairs for fast lookup."
            ),
            "Stacks": (
                "Consider using a stack when you need to track state "
                "or process elements in reverse order."
            ),
            "Queues": (
                "Consider a queue when processing order matters "
                "and FIFO behavior is useful."
            ),
            "Strings": (
                "Consider character frequency maps or a sliding window."
            ),
        }

        return suggestions.get(
            topic,
            "Think about which data structure naturally fits this problem.",
        )

    def _approach_hint(self, problem_context: str) -> str:
        """Level 3: More specific approach."""

        if problem_context:
            return (
                f"Break this problem into smaller steps and trace them "
                f"using the given example: {problem_context}"
            )

        return (
            "Break the problem into smaller steps and trace your approach "
            "with a concrete example."
        )

    def _pseudocode_hint(self) -> str:
        """Level 4: Pseudocode."""

        return """
1. Initialize the required data structure.
2. Iterate through the input.
3. Process each element according to the problem requirement.
4. Update the required state.
5. Return the result.
""".strip()

    def _code_structure_hint(self) -> str:
        """Level 5: Code structure."""

        return """
def solve(input_data):
    # Initialize required variables/data structures
    ...

    # Process the input
    for item in input_data:
        ...

    # Return the result
    return result
""".strip()

    def _solution_hint(self) -> str:
        """Level 6: Full solution."""

        return (
            "Provide the complete working solution, followed by "
            "an explanation of why it works and its time and space complexity."
        )


hint_generator = HintGenerator()