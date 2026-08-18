import json
from pathlib import Path


SOURCE_FILE = Path(
    "leetcode-problems/merged_problems.json"
)

OUTPUT_FILE = Path(
    "app/data/problems.json"
)


def clean_text(value) -> str:
    """
    Safely convert string/list/dict/other values into text.
    Some dataset fields are strings while others are lists.
    """

    if value is None:
        return ""

    if isinstance(value, str):
        text = value

    elif isinstance(value, list):
        parts = []

        for item in value:

            if isinstance(item, str):
                parts.append(item)

            elif isinstance(item, dict):
                parts.append(
                    " ".join(
                        str(v)
                        for v in item.values()
                        if v is not None
                    )
                )

            else:
                parts.append(str(item))

        text = "\n".join(parts)

    elif isinstance(value, dict):
        text = "\n".join(
            f"{key}: {val}"
            for key, val in value.items()
            if val is not None
        )

    else:
        text = str(value)

    text = text.replace("\u00a0", " ")
    text = text.replace("\r\n", "\n")

    return text.strip()


def extract_examples(question: dict) -> list[dict]:
    examples = []

    raw_examples = question.get(
        "examples",
        []
    )

    if not isinstance(raw_examples, list):
        return examples

    for example in raw_examples:

        if not isinstance(example, dict):
            continue

        text = clean_text(
            example.get(
                "example_text",
                ""
            )
        )

        if not text:
            continue

        examples.append(
            {
                "example_num": example.get(
                    "example_num"
                ),
                "text": text,
            }
        )

    return examples


def extract_python_code(
    code_snippets
) -> str:

    if not code_snippets:
        return ""

    # Dictionary format
    if isinstance(
        code_snippets,
        dict
    ):

        # Prefer Python
        for key, value in code_snippets.items():

            key_lower = str(
                key
            ).lower()

            if "python" in key_lower:

                return (
                    value
                    if isinstance(value, str)
                    else clean_text(value)
                )

        # Fallback: first available snippet
        for value in code_snippets.values():

            if value:
                return (
                    value
                    if isinstance(value, str)
                    else clean_text(value)
                )

    # List format
    if isinstance(
        code_snippets,
        list
    ):

        for item in code_snippets:

            if not isinstance(item, dict):
                continue

            language = str(
                item.get(
                    "lang",
                    ""
                )
            ).lower()

            if "python" in language:

                code = item.get(
                    "code",
                    ""
                )

                return (
                    code
                    if isinstance(code, str)
                    else clean_text(code)
                )

    return ""


def extract_solution(
    solution
) -> str:

    if not solution:
        return ""

    # String solution
    if isinstance(
        solution,
        str
    ):
        return clean_text(
            solution
        )

    # Dictionary solution
    if isinstance(
        solution,
        dict
    ):

        parts = []

        for key, value in solution.items():

            if value is None:
                continue

            if isinstance(
                value,
                str
            ):
                parts.append(
                    f"{key}:\n{value}"
                )

            else:
                parts.append(
                    f"{key}:\n"
                    f"{clean_text(value)}"
                )

        return clean_text(
            "\n\n".join(parts)
        )

    # List solution
    if isinstance(
        solution,
        list
    ):

        parts = []

        for item in solution:

            if isinstance(
                item,
                str
            ):
                parts.append(item)

            elif isinstance(
                item,
                dict
            ):
                parts.append(
                    json.dumps(
                        item,
                        ensure_ascii=False
                    )
                )

            else:
                parts.append(
                    str(item)
                )

        return clean_text(
            "\n\n".join(parts)
        )

    return clean_text(
        solution
    )


def normalize_topics(
    topics
) -> list[str]:

    if not topics:
        return []

    if isinstance(
        topics,
        list
    ):
        return [
            clean_text(topic)
            for topic in topics
            if clean_text(topic)
        ]

    if isinstance(
        topics,
        str
    ):
        return [
            topics.strip()
        ]

    return [
        clean_text(topics)
    ]


def normalize_list(
    value
) -> list:

    if value is None:
        return []

    if isinstance(
        value,
        list
    ):
        return value

    return [value]


def convert_question(
    question: dict
) -> dict:

    return {
        "id": clean_text(
            question.get(
                "problem_slug"
            )
        ),

        "problem_id": clean_text(
            question.get(
                "problem_id"
            )
        ),

        "frontend_id": clean_text(
            question.get(
                "frontend_id"
            )
        ),

        "title": clean_text(
            question.get(
                "title",
                ""
            )
        ),

        "difficulty": clean_text(
            question.get(
                "difficulty",
                "Unknown"
            )
        ),

        "topics": normalize_topics(
            question.get(
                "topics",
                []
            )
        ),

        "description": clean_text(
            question.get(
                "description",
                ""
            )
        ),

        "constraints": clean_text(
            question.get(
                "constraints",
                ""
            )
        ),

        "follow_ups": normalize_list(
            question.get(
                "follow_ups",
                []
            )
        ),

        "hints": normalize_list(
            question.get(
                "hints",
                []
            )
        ),

        "examples": extract_examples(
            question
        ),

        "starter_code": extract_python_code(
            question.get(
                "code_snippets"
            )
        ),

        "solution": extract_solution(
            question.get(
                "solution"
            )
        ),
    }


def main():

    print(
        "========================================"
    )

    print(
        "DSA Problem Dataset Importer"
    )

    print(
        "========================================"
    )

    # -----------------------------------------
    # Check source
    # -----------------------------------------

    if not SOURCE_FILE.exists():

        raise FileNotFoundError(
            "\nSource dataset not found:\n"
            f"{SOURCE_FILE}\n\n"
            "Make sure the GitHub dataset exists."
        )

    print(
        f"\nSource:\n{SOURCE_FILE}"
    )

    print(
        "\nLoading dataset..."
    )

    # -----------------------------------------
    # Load JSON
    # -----------------------------------------

    with SOURCE_FILE.open(
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    questions = data.get(
        "questions",
        []
    )

    if not isinstance(
        questions,
        list
    ):

        raise ValueError(
            "Invalid dataset format: "
            "'questions' must be a list."
        )

    print(
        f"Found {len(questions)} problems."
    )

    # -----------------------------------------
    # Convert
    # -----------------------------------------

    converted = []

    skipped = 0

    for index, question in enumerate(
        questions,
        start=1
    ):

        if not isinstance(
            question,
            dict
        ):
            skipped += 1
            continue

        try:

            problem = convert_question(
                question
            )

            if not problem["id"]:

                skipped += 1
                continue

            converted.append(
                problem
            )

        except Exception as exc:

            print(
                f"Warning: skipped problem "
                f"{index}: {exc}"
            )

            skipped += 1

    # -----------------------------------------
    # Create output directory
    # -----------------------------------------

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # -----------------------------------------
    # Save
    # -----------------------------------------

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            converted,
            file,
            ensure_ascii=False,
            indent=2
        )

    # -----------------------------------------
    # Summary
    # -----------------------------------------

    print(
        "\n========================================"
    )

    print(
        "IMPORT COMPLETE"
    )

    print(
        "========================================"
    )

    print(
        f"Found:     {len(questions)}"
    )

    print(
        f"Imported:  {len(converted)}"
    )

    print(
        f"Skipped:   {skipped}"
    )

    print(
        f"Output:    {OUTPUT_FILE}"
    )

    # -----------------------------------------
    # Quick verification
    # -----------------------------------------

    if converted:

        first = converted[0]

        print(
            "\nFirst problem:"
        )

        print(
            f"ID:         {first['id']}"
        )

        print(
            f"Title:      {first['title']}"
        )

        print(
            f"Difficulty: {first['difficulty']}"
        )

        print(
            f"Topics:     {first['topics']}"
        )

        print(
            f"Examples:   {len(first['examples'])}"
        )

        print(
            f"Starter:    "
            f"{'Yes' if first['starter_code'] else 'No'}"
        )

        print(
            f"Solution:   "
            f"{'Yes' if first['solution'] else 'No'}"
        )


if __name__ == "__main__":
    main()