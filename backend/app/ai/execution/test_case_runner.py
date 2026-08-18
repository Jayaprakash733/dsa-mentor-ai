from dataclasses import dataclass
from typing import List
import ast
import json
import re

from app.ai.execution.code_executor import code_execution_agent


@dataclass
class TestCase:
    input: str
    expected_output: str


@dataclass
class TestCaseResult:
    passed: bool
    input: str
    expected_output: str
    actual_output: str
    error: str = ""
    timed_out: bool = False


@dataclass
class TestSuiteResult:
    passed: int
    total: int
    test_cases: List[TestCaseResult]


class FunctionInputError(Exception):
    pass


class TestCaseRunner:
    """Supports normal stdin programs and Python LeetCode Solution methods."""

    @staticmethod
    def _split_top_level_assignments(text: str) -> list[str]:
        parts = []
        start = 0
        depth = 0
        quote = None
        escaped = False

        for index, char in enumerate(text):
            if quote:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == quote:
                    quote = None
                continue

            if char in ("'", '"'):
                quote = char
            elif char in "([{":
                depth += 1
            elif char in ")]}":
                depth -= 1
            elif char == "," and depth == 0:
                parts.append(text[start:index].strip())
                start = index + 1

        tail = text[start:].strip()
        if tail:
            parts.append(tail)

        return parts

    @classmethod
    def _parse_function_arguments(cls, raw_input: str) -> list:
        text = raw_input.strip()

        if text.startswith("Input:"):
            text = text[len("Input:"):].strip()

        if "Output:" in text:
            text = text.split("Output:", 1)[0].strip()

        if not text:
            return []

        values = []

        for assignment in cls._split_top_level_assignments(text):
            if "=" not in assignment:
                try:
                    values.append(ast.literal_eval(assignment.strip()))
                    continue
                except Exception as exc:
                    raise FunctionInputError(
                        f"Could not parse function input: {assignment}"
                    ) from exc

            name, value_text = assignment.split("=", 1)

            if not re.fullmatch(r"\s*[A-Za-z_]\w*\s*", name):
                raise FunctionInputError(
                    f"Unsupported input assignment: {assignment}"
                )

            try:
                values.append(ast.literal_eval(value_text.strip()))
            except Exception as exc:
                raise FunctionInputError(
                    f"Could not parse value for {name.strip()}: {value_text}"
                ) from exc

        return values

    @staticmethod
    def _normalize_output(value: str) -> str:
        text = (value or "").strip()

        if text in {"True", "true"}:
            return "true"
        if text in {"False", "false"}:
            return "false"
        if text in {"None", "null"}:
            return "null"

        try:
            parsed = json.loads(text)
            return json.dumps(
                parsed,
                ensure_ascii=False,
                separators=(",", ":"),
            )
        except Exception:
            pass

        try:
            parsed = ast.literal_eval(text)
            if isinstance(parsed, tuple):
                parsed = list(parsed)
            return json.dumps(
                parsed,
                ensure_ascii=False,
                separators=(",", ":"),
            )
        except Exception:
            return " ".join(text.split())

    @classmethod
    def _build_function_code(
        cls,
        code: str,
        function_name: str,
        raw_input: str,
    ) -> str:
        arguments = cls._parse_function_arguments(raw_input)
        args_literal = ", ".join(repr(value) for value in arguments)

        harness = f"""
import json as __dsa_json

__dsa_solution = Solution()
__dsa_result = __dsa_solution.{function_name}({args_literal})

if isinstance(__dsa_result, tuple):
    __dsa_result = list(__dsa_result)

print(
    __dsa_json.dumps(
        __dsa_result,
        ensure_ascii=False,
        separators=(",", ":")
    )
)
"""
        return f"{code.rstrip()}\n\n{harness}"

    def run(
        self,
        code: str,
        language: str,
        test_cases: List[TestCase],
        function_name: str | None = None,
    ) -> TestSuiteResult:

        results: List[TestCaseResult] = []

        function_mode = (
            language.lower() == "python"
            and bool(function_name)
            and bool(re.search(r"class\s+Solution\s*[:(]", code))
        )

        for test_case in test_cases:
            actual_output = ""
            error = ""
            timed_out = False
            passed = False

            try:
                if function_mode:
                    executable_code = self._build_function_code(
                        code,
                        function_name,
                        test_case.input,
                    )
                    execution = code_execution_agent.execute(
                        code=executable_code,
                        language=language,
                        stdin="",
                    )
                else:
                    execution = code_execution_agent.execute(
                        code=code,
                        language=language,
                        stdin=test_case.input,
                    )

                actual_output = execution.stdout.strip()
                timed_out = execution.timed_out

                expected = self._normalize_output(
                    test_case.expected_output
                )
                actual = self._normalize_output(actual_output)

                passed = (
                    execution.success
                    and not execution.timed_out
                    and actual == expected
                )

                if execution.timed_out:
                    error = execution.stderr or "Execution timed out."
                elif not execution.success:
                    error = execution.stderr or "Program execution failed."

            except FunctionInputError as exc:
                error = str(exc)

            except Exception as exc:
                error = str(exc)

            results.append(
                TestCaseResult(
                    passed=passed,
                    input=test_case.input,
                    expected_output=test_case.expected_output.strip(),
                    actual_output=actual_output,
                    error=error,
                    timed_out=timed_out,
                )
            )

        passed_count = sum(item.passed for item in results)

        return TestSuiteResult(
            passed=passed_count,
            total=len(results),
            test_cases=results,
        )


test_case_runner = TestCaseRunner()