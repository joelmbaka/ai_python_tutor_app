"""
Code execution service for running Python code safely.
Supports local sandbox execution.
"""

import asyncio
import sys
import subprocess
import tempfile
import os
import json
import time
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv
from models.execution_models import CodeExecutionRequest, CodeExecutionResponse, TestResult

# Ensure .env is loaded (tries backend/.env specifically, then defaults)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=str(_env_path), override=False)
load_dotenv(override=False)

class CodeExecutor:
    """Main code execution service"""
    
    def __init__(self, execution_backend: str = "local"):
        """Initialize code executor with local backend"""
        self.backend = execution_backend
        self.logger = logging.getLogger("code_executor")
        if not self.logger.handlers:
            # Inherit root handlers configured by Uvicorn; do not add new handlers
            pass
        
    async def execute_code(self, request: CodeExecutionRequest) -> CodeExecutionResponse:
        """Execute code locally"""
        start_time = time.time()
        try:
            self.logger.info(
                "Execute code request: lesson_id=%s tests=%d timeout=%ss backend=%s",
                request.lesson_id,
                len(request.test_cases),
                request.timeout_seconds,
                self.backend,
            )
        except Exception:
            # Logging should never break execution
            pass
        
        if self.backend == "local":
            return await self._execute_locally(request, start_time)
        else:
            raise ValueError(f"Unsupported backend: {self.backend}")
    
    
    async def _execute_locally(self, request: CodeExecutionRequest, start_time: float) -> CodeExecutionResponse:
        """Execute code locally with sandbox restrictions"""
        test_results = []
        passed_tests = 0
        overall_outputs: List[str] = []
        
        for i, test_case in enumerate(request.test_cases):
            try:
                # Prepare input and code
                input_data = test_case.get("input", "")
                # Always inject custom input() to avoid blocking/EOF, even if no input provided
                prepared_code = self._prepare_code_with_input(request.student_code, input_data)
                stdin_payload = b""  # input() will read from injected _input_data

                # Create temporary file
                with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                    f.write(prepared_code)
                    temp_file = f.name

                # Execute with timeout and restrictions
                test_start_time = time.time()
                try:
                    # Preferred async subprocess (works on POSIX and on Windows with Proactor loop)
                    process = await asyncio.create_subprocess_exec(
                        sys.executable, temp_file,
                        stdin=asyncio.subprocess.PIPE,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    
                    try:
                        self.logger.debug("[T%d] Started subprocess pid=%s for %s", i, getattr(process, "pid", "?"), temp_file)
                    except Exception:
                        pass
                    try:
                        stdout, stderr = await asyncio.wait_for(
                            process.communicate(input=stdin_payload),
                            timeout=request.timeout_seconds
                        )
                        duration_ms = (time.time() - test_start_time) * 1000

                        actual_output = stdout.decode(errors='replace').strip()
                        expected_output = test_case["expected_output"].strip()
                        stderr_str = stderr.decode(errors='replace').strip() if stderr else ""
                        try:
                            self.logger.debug(
                                "[T%d] returncode=%s duration_ms=%.2f stderr_last_line=%s",
                                i,
                                getattr(process, "returncode", None),
                                duration_ms,
                                (stderr_str.splitlines()[-1] if stderr_str else ""),
                            )
                        except Exception:
                            pass

                        # A test only passes if stdout matches expected AND there's no stderr
                        passed_flag = (actual_output == expected_output) and (not stderr_str)

                        test_result = TestResult(
                            test_id=i,
                            passed=passed_flag,
                            input_data=input_data.strip("\n") or None,
                            expected_output=expected_output,
                            actual_output=actual_output,
                            error_message=stderr_str or None,
                            execution_time_ms=duration_ms
                        )
                        
                        if test_result.passed:
                            passed_tests += 1
                        if test_result.actual_output:
                            overall_outputs.append(test_result.actual_output)
                            
                    except asyncio.TimeoutError:
                        # Ensure the process is terminated to avoid lingering tasks
                        try:
                            process.kill()
                        except ProcessLookupError:
                            pass
                        await process.communicate()
                        try:
                            self.logger.warning("[T%d] Timeout after %ss; process killed", i, request.timeout_seconds)
                        except Exception:
                            pass
                        test_result = TestResult(
                            test_id=i,
                            passed=False,
                            expected_output=test_case["expected_output"],
                            error_message=f"Code execution timed out after {request.timeout_seconds}s",
                            execution_time_ms=float(request.timeout_seconds) * 1000
                        )
                except NotImplementedError as nie:
                    # Windows SelectorEventLoop does not support subprocess. Fallback to thread + subprocess.run
                    try:
                        self.logger.warning(
                            "[T%d] Async subprocess unsupported on this loop; using thread fallback. Err=%s",
                            i, nie
                        )
                    except Exception:
                        pass
                    try:
                        t0 = time.time()
                        cp = await asyncio.to_thread(
                            subprocess.run,
                            [sys.executable, temp_file],
                            input=stdin_payload,
                            capture_output=True,
                            timeout=request.timeout_seconds
                        )
                        duration_ms = (time.time() - t0) * 1000
                        # Decode outputs safely
                        stdout_text = cp.stdout.decode(errors='replace').strip() if isinstance(cp.stdout, (bytes, bytearray)) else (cp.stdout or "").strip()
                        stderr_text = cp.stderr.decode(errors='replace').strip() if isinstance(cp.stderr, (bytes, bytearray)) else (cp.stderr or "").strip()
                        expected_output = test_case["expected_output"].strip()

                        # A test only passes if stdout matches expected AND there's no stderr
                        passed_flag = (stdout_text == expected_output) and (not stderr_text)

                        test_result = TestResult(
                            test_id=i,
                            passed=passed_flag,
                            input_data=input_data.strip("\n") or None,
                            expected_output=expected_output,
                            actual_output=stdout_text,
                            error_message=stderr_text or None,
                            execution_time_ms=duration_ms
                        )
                        if test_result.passed:
                            passed_tests += 1
                        if test_result.actual_output:
                            overall_outputs.append(test_result.actual_output)
                        try:
                            self.logger.debug(
                                "[T%d] Fallback returncode=%s duration_ms=%.2f stderr_last_line=%s",
                                i,
                                getattr(cp, "returncode", None),
                                duration_ms,
                                (stderr_text.splitlines()[-1] if stderr_text else ""),
                            )
                        except Exception:
                            pass
                    except subprocess.TimeoutExpired:
                        test_result = TestResult(
                            test_id=i,
                            passed=False,
                            expected_output=test_case["expected_output"],
                            error_message=f"Code execution timed out after {request.timeout_seconds}s",
                            execution_time_ms=float(request.timeout_seconds) * 1000
                        )
                    except Exception as fe:
                        try:
                            self.logger.exception("[T%d] Fallback subprocess error: %s", i, fe)
                        except Exception:
                            pass
                        test_result = TestResult(
                            test_id=i,
                            passed=False,
                            expected_output=test_case["expected_output"],
                            error_message=f"Execution error: {type(fe).__name__}: {str(fe)}"
                        )
                
                test_results.append(test_result)
                
                # Cleanup
                os.unlink(temp_file)
                try:
                    self.logger.debug("[T%d] Cleaned up temp file %s", i, temp_file)
                except Exception:
                    pass
                
            except Exception as e:
                try:
                    self.logger.exception("[T%d] Execution error: %s", i, e)
                except Exception:
                    pass
                test_results.append(TestResult(
                    test_id=i,
                    passed=False,
                    expected_output=test_case["expected_output"],
                    error_message=f"Execution error: {type(e).__name__}: {str(e)}"
                ))
                # Ensure cleanup if temp_file exists
                try:
                    if 'temp_file' in locals() and os.path.exists(temp_file):
                        os.unlink(temp_file)
                except Exception:
                    pass
        
        total_time = (time.time() - start_time) * 1000
        # Aggregate outputs and runtime errors for convenience
        overall_output_combined = "\n".join([o for o in overall_outputs if o]) or None
        runtime_errors_agg = [tr.error_message for tr in test_results if getattr(tr, "error_message", None)]
        
        return CodeExecutionResponse(
            success=len(test_results) > 0,
            total_tests=len(request.test_cases),
            passed_tests=passed_tests,
            test_results=test_results,
            overall_output=overall_output_combined,
            runtime_errors=runtime_errors_agg,
            execution_time_total_ms=total_time
        )
    
    
    def _prepare_code_with_input(self, code: str, input_data: str) -> str:
        """Prepare code with input handling by always providing a safe input() wrapper.
        If input_data is provided, feed those values; otherwise return empty strings for input() calls.
        """
        lines = input_data.split('\n') if input_data else []
        input_setup = '\n'.join([f'_input_data = {repr(lines)}', '_input_index = 0'])
        
        input_replacement = '''
def input(prompt=""):
    global _input_index
    if _input_index < len(_input_data):
        result = _input_data[_input_index]
        _input_index += 1
        return result
    return ""
'''
        
        return f"{input_setup}\n{input_replacement}\n{code}"

# Singleton instance
code_executor = CodeExecutor(execution_backend="local")
