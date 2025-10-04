"""
Models for code execution and testing functionality.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class CodeExecutionRequest(BaseModel):
    """Request model for executing student code"""
    student_code: str = Field(description="The code written by the student")
    lesson_id: str = Field(description="ID of the lesson/challenge")
    test_cases: List[Dict[str, Any]] = Field(
        description="Test cases to run against the code",
        example=[
            {"input": "5", "expected_output": "25"},
            {"input": "3", "expected_output": "9"}
        ]
    )
    timeout_seconds: int = Field(default=10, description="Maximum execution time")
    memory_limit_mb: int = Field(default=128, description="Memory limit in MB")

class TestResult(BaseModel):
    """Result of a single test case"""
    test_id: int = Field(description="Test case number")
    passed: bool = Field(description="Whether the test passed")
    input_data: Optional[str] = Field(description="Input provided to the code", default=None)
    expected_output: str = Field(description="Expected output")
    actual_output: Optional[str] = Field(description="Actual output from student code", default=None)
    execution_time_ms: Optional[float] = Field(description="Execution time in milliseconds", default=None)
    error_message: Optional[str] = Field(description="Error message if test failed", default=None)

class CodeExecutionResponse(BaseModel):
    """Response model for code execution"""
    success: bool = Field(description="Whether code executed successfully")
    total_tests: int = Field(description="Total number of test cases")
    passed_tests: int = Field(description="Number of tests that passed")
    test_results: List[TestResult] = Field(description="Detailed results for each test")
    overall_output: Optional[str] = Field(description="Complete program output", default=None)
    syntax_errors: List[str] = Field(default_factory=list, description="Syntax errors found")
    runtime_errors: List[str] = Field(default_factory=list, description="Runtime errors encountered")
    execution_time_total_ms: float = Field(description="Total execution time")
    memory_used_mb: Optional[float] = Field(description="Memory usage in MB", default=None)
    hints_triggered: List[str] = Field(default_factory=list, description="Hints that should be shown")

class CodeSubmissionRequest(BaseModel):
    """Request model for submitting student code"""
    student_id: str = Field(description="Student identifier")
    lesson_id: str = Field(description="Lesson/challenge identifier")
    submitted_code: str = Field(description="Code submitted by student")
    test_cases: List[Dict[str, Any]] = Field(description="Test cases to validate against")

class CodeSubmission(BaseModel):
    """Model for storing student code submissions"""
    submission_id: str = Field(description="Unique submission identifier")
    student_id: str = Field(description="Student identifier")
    lesson_id: str = Field(description="Lesson/challenge identifier")
    submitted_code: str = Field(description="Code submitted by student")
    execution_result: CodeExecutionResponse = Field(description="Execution results")
    submitted_at: datetime = Field(default_factory=datetime.now)
    score: int = Field(description="Score achieved (0-100)", ge=0, le=100)
    attempts: int = Field(description="Number of attempts made", default=1)

class CodeEditorSettings(BaseModel):
    """Settings for the code editor interface"""
    theme: Literal["light", "dark", "auto"] = Field(default="dark")
    font_size: int = Field(default=14, ge=10, le=24)
    tab_size: int = Field(default=4, ge=2, le=8)
    word_wrap: bool = Field(default=True)
    line_numbers: bool = Field(default=True)
    syntax_highlighting: bool = Field(default=True)
    auto_completion: bool = Field(default=True)
    vim_mode: bool = Field(default=False)

class HintSystem(BaseModel):
    """Progressive hint system for coding challenges"""
    hint_level: int = Field(description="Current hint level (0 = no hints)", default=0)
    available_hints: List[str] = Field(description="All available hints in order")
    hints_used: List[str] = Field(default_factory=list, description="Hints already shown")
    max_hints: int = Field(description="Maximum number of hints available")
    
    def get_next_hint(self) -> Optional[str]:
        """Get the next available hint"""
        if self.hint_level < len(self.available_hints):
            next_hint = self.available_hints[self.hint_level]
            self.hints_used.append(next_hint)
            self.hint_level += 1
            return next_hint
        return None

class CodeAnalysis(BaseModel):
    """Analysis of student code for feedback"""
    complexity_score: int = Field(description="Code complexity (1-5)", ge=1, le=5)
    style_issues: List[str] = Field(default_factory=list, description="Code style suggestions")
    best_practices: List[str] = Field(default_factory=list, description="Best practice recommendations")
    performance_notes: List[str] = Field(default_factory=list, description="Performance improvement suggestions")
    readability_score: int = Field(description="Code readability (1-10)", ge=1, le=10)
    has_comments: bool = Field(description="Whether code includes comments")
    variable_naming_quality: Literal["poor", "good", "excellent"] = Field(description="Quality of variable names")
