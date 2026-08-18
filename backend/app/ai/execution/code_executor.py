from dataclasses import dataclass
import shutil
import subprocess
import tempfile
from pathlib import Path


@dataclass
class ExecutionResult:
    success: bool
    stdout: str
    stderr: str
    exit_code: int | None
    timed_out: bool


class CodeExecutionAgent:
    """
    Execute student code inside the Docker sandbox.

    Supported languages:
    - Python
    - C
    - C++
    - Java

    Docker image:
        dsa-code-sandbox:latest

    Security:
    - Network disabled
    - Memory limit
    - CPU limit
    - PID limit
    - Read-only container filesystem
    - Temporary writable workspace
    - Linux capabilities dropped
    - no-new-privileges
    - Execution timeout
    """

    def __init__(
        self,
        image: str = "dsa-code-sandbox:latest",
        timeout: int = 5,
        memory: str = "128m",
        cpus: str = "0.5",
        pids_limit: int = 64,
    ):
        self.image = image
        self.timeout = timeout
        self.memory = memory
        self.cpus = cpus
        self.pids_limit = pids_limit

    def execute(
        self,
        code: str,
        language: str = "python",
        stdin: str = "",
    ) -> ExecutionResult:

        # -------------------------------------------------
        # Validate code
        # -------------------------------------------------

        if not code or not code.strip():
            return ExecutionResult(
                success=False,
                stdout="",
                stderr="Code cannot be empty.",
                exit_code=None,
                timed_out=False,
            )

        # -------------------------------------------------
        # Normalize language
        # -------------------------------------------------

        language = self._normalize_language(language)

        if language not in {
            "python",
            "c",
            "cpp",
            "java",
        }:
            return ExecutionResult(
                success=False,
                stdout="",
                stderr=(
                    f"Unsupported language: {language}. "
                    "Supported languages: Python, C, C++, Java."
                ),
                exit_code=None,
                timed_out=False,
            )

        # -------------------------------------------------
        # Check Docker
        # -------------------------------------------------

        if shutil.which("docker") is None:
            return ExecutionResult(
                success=False,
                stdout="",
                stderr=(
                    "Docker CLI was not found. "
                    "Make sure Docker Desktop is running "
                    "and docker is available in PATH."
                ),
                exit_code=None,
                timed_out=False,
            )

        # -------------------------------------------------
        # Temporary workspace
        # -------------------------------------------------

        work_dir = Path(
            tempfile.mkdtemp(
                prefix="dsa_exec_"
            )
        )

        try:

            # -------------------------------------------------
            # Write student source code
            # -------------------------------------------------

            self._write_source(
                work_dir,
                code,
                language,
            )

            # -------------------------------------------------
            # Build language command
            # -------------------------------------------------

            command = self._build_command(
                language
            )

            # -------------------------------------------------
            # Docker command
            # -------------------------------------------------

            docker_command = [
                "docker",
                "run",
                "--rm",

                # IMPORTANT:
                # Attach stdin so input() / scanf / cin /
                # Scanner can receive test-case input.
                "-i",

                # -----------------------------
                # Network isolation
                # -----------------------------

                "--network",
                "none",

                # -----------------------------
                # Resource limits
                # -----------------------------

                "--memory",
                self.memory,

                "--cpus",
                self.cpus,

                "--pids-limit",
                str(self.pids_limit),

                # -----------------------------
                # Container hardening
                # -----------------------------

                "--read-only",

                "--tmpfs",
                "/tmp:rw,nosuid,size=64m",

                "--cap-drop",
                "ALL",

                "--security-opt",
                "no-new-privileges",

                # -----------------------------
                # Temporary workspace only
                # -----------------------------

                "-v",
                f"{work_dir.resolve()}:/workspace:rw",

                "-w",
                "/workspace",

                # -----------------------------
                # Sandbox image
                # -----------------------------

                self.image,

            ] + command

            # -------------------------------------------------
            # Execute
            # -------------------------------------------------

            try:

                process = subprocess.run(
                    docker_command,

                    # Test-case input
                    input=stdin or "",

                    capture_output=True,
                    text=True,
                    timeout=self.timeout,
                )

                return ExecutionResult(
                    success=(
                        process.returncode == 0
                    ),
                    stdout=(
                        process.stdout or ""
                    ),
                    stderr=(
                        process.stderr or ""
                    ),
                    exit_code=(
                        process.returncode
                    ),
                    timed_out=False,
                )

            # -------------------------------------------------
            # Timeout
            # -------------------------------------------------

            except subprocess.TimeoutExpired as exc:

                return ExecutionResult(
                    success=False,

                    stdout=self._decode(
                        exc.stdout
                    ),

                    stderr=(
                        self._decode(
                            exc.stderr
                        )
                        + "\nExecution timed out."
                    ).strip(),

                    exit_code=None,

                    timed_out=True,
                )

        # -------------------------------------------------
        # Unexpected executor error
        # -------------------------------------------------

        except Exception as exc:

            return ExecutionResult(
                success=False,
                stdout="",
                stderr=str(exc),
                exit_code=None,
                timed_out=False,
            )

        # -------------------------------------------------
        # Cleanup temporary files
        # -------------------------------------------------

        finally:

            self._cleanup(
                work_dir
            )

    # =====================================================
    # LANGUAGE NORMALIZATION
    # =====================================================

    @staticmethod
    def _normalize_language(
        language: str,
    ) -> str:

        value = (
            language or "python"
        ).strip().lower()

        aliases = {
            "py": "python",
            "python3": "python",

            "c++": "cpp",
            "cc": "cpp",
            "cxx": "cpp",
            "cplusplus": "cpp",
        }

        return aliases.get(
            value,
            value,
        )

    # =====================================================
    # WRITE SOURCE FILE
    # =====================================================

    @staticmethod
    def _write_source(
        work_dir: Path,
        code: str,
        language: str,
    ) -> None:

        filenames = {
            "python": "main.py",
            "c": "main.c",
            "cpp": "main.cpp",
            "java": "Main.java",
        }

        filename = filenames[
            language
        ]

        (
            work_dir / filename
        ).write_text(
            code,
            encoding="utf-8",
        )

    # =====================================================
    # BUILD COMMAND
    # =====================================================

    @staticmethod
    def _build_command(
        language: str,
    ) -> list[str]:

        # -----------------------------
        # Python
        # -----------------------------

        if language == "python":

            return [
                "python",
                "main.py",
            ]

        # -----------------------------
        # C
        # -----------------------------

        if language == "c":

            return [
                "sh",
                "-c",
                (
                    "gcc main.c "
                    "-O2 "
                    "-o main "
                    "&& ./main"
                ),
            ]

        # -----------------------------
        # C++
        # -----------------------------

        if language == "cpp":

            return [
                "sh",
                "-c",
                (
                    "g++ "
                    "-std=c++17 "
                    "-O2 "
                    "main.cpp "
                    "-o main "
                    "&& ./main"
                ),
            ]

        # -----------------------------
        # Java
        # -----------------------------

        if language == "java":

            return [
                "sh",
                "-c",
                (
                    "javac "
                    "-encoding UTF-8 "
                    "Main.java "
                    "&& "
                    "java "
                    "-cp /workspace "
                    "Main"
                ),
            ]

        raise ValueError(
            f"Unsupported language: {language}"
        )

    # =====================================================
    # DECODE OUTPUT
    # =====================================================

    @staticmethod
    def _decode(
        value,
    ) -> str:

        if value is None:
            return ""

        if isinstance(
            value,
            bytes,
        ):
            return value.decode(
                "utf-8",
                errors="replace",
            )

        return str(value)

    # =====================================================
    # CLEANUP
    # =====================================================

    @staticmethod
    def _cleanup(
        directory: Path,
    ) -> None:

        if not directory.exists():
            return

        try:

            for child in directory.iterdir():

                try:

                    if (
                        child.is_file()
                        or child.is_symlink()
                    ):
                        child.unlink()

                    elif child.is_dir():
                        CodeExecutionAgent._cleanup(
                            child
                        )

                except OSError:
                    pass

            directory.rmdir()

        except OSError:
            pass


# =========================================================
# SINGLETON
# =========================================================

code_execution_agent = CodeExecutionAgent(
    image="dsa-code-sandbox:latest",
    timeout=5,
    memory="128m",
    cpus="0.5",
    pids_limit=64,
)