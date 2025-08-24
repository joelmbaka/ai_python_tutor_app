"""
API request/response models for the AI Python Tutor backend.
These models define the structure of data exchanged between the frontend and backend.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, date
from .lesson_models import LessonContent

class StudentProfile(BaseModel):
    """Student profile information for lesson personalization"""
    name: str = Field(description="Student's name for personalization")
    age: int = Field(ge=8, le=18, description="Student's age in years")
    experience: Literal['beginner', 'some', 'advanced'] = Field(
        description="Programming experience level"
    )
    learning_style: Literal['visual', 'text', 'mixed'] = Field(
        description="Preferred learning approach"
    )
    interests: List[str] = Field(
        description="Student's hobbies and interests for content personalization",
        example=["games", "art", "music", "sports", "science"]
    )
    completed_lessons: List[str] = Field(
        description="List of lesson IDs the student has completed",
        default_factory=list
    )
    current_streak: int = Field(
        description="Current learning streak in days",
        default=0,
        ge=0
    )
    total_lessons_completed: int = Field(
        description="Total number of lessons completed",
        default=0,
        ge=0
    )

class GenerateLessonRequest(BaseModel):
    """Request model for generating personalized lesson content"""
    blueprint_id: str = Field(
        description="ID of the lesson blueprint to use as template",
        example="variables_intro_8_10"
    )
    student_profile: StudentProfile = Field(
        description="Student information for content personalization"
    )
    start_date: Optional[str] = Field(
        description="When the student will start this lesson (YYYY-MM-DD format)",
        default=None,
        example="2024-01-15"
    )
    custom_instructions: Optional[str] = Field(
        description="Additional instructions for content customization",
        default=None,
        example="Focus extra attention on debugging skills"
    )

class GenerateLessonResponse(BaseModel):
    """Response model for lesson generation"""
    success: bool = Field(description="Whether lesson generation was successful")
    lesson_content: Optional[LessonContent] = Field(
        description="Generated lesson content",
        default=None
    )
    generation_time_seconds: Optional[float] = Field(
        description="Time taken to generate the lesson",
        default=None,
        ge=0
    )
    error_message: Optional[str] = Field(
        description="Error message if generation failed",
        default=None
    )
    fallback_used: bool = Field(
        description="Whether fallback/mock content was used instead of AI",
        default=False
    )

class LessonProgress(BaseModel):
    """Model for tracking student progress through a lesson"""
    lesson_id: str = Field(description="ID of the lesson")
    student_id: str = Field(description="Student identifier")
    started_at: datetime = Field(description="When the student started the lesson")
    completed_at: Optional[datetime] = Field(
        description="When the student completed the lesson",
        default=None
    )
    progress_percentage: int = Field(
        description="Completion percentage (0-100)",
        ge=0, le=100
    )
    time_spent_minutes: int = Field(
        description="Total time spent on the lesson in minutes",
        ge=0
    )
    score: Optional[int] = Field(
        description="Score achieved (0-100)",
        default=None,
        ge=0, le=100
    )
    hints_used: int = Field(
        description="Number of hints the student used",
        default=0,
        ge=0
    )
    attempts: int = Field(
        description="Number of attempts made",
        default=1,
        ge=1
    )
    notes: Optional[str] = Field(
        description="Additional notes about the student's progress",
        default=None
    )

class NextLessonRecommendation(BaseModel):
    """Response model for next lesson recommendations"""
    recommended_lesson_id: str = Field(description="ID of the recommended next lesson")
    lesson_title: str = Field(description="Title of the recommended lesson") 
    estimated_difficulty: int = Field(
        description="Expected difficulty for this student (1-5)",
        ge=1, le=5
    )
    prerequisites_met: bool = Field(
        description="Whether student has completed all prerequisites"
    )
    missing_prerequisites: List[str] = Field(
        description="List of prerequisite lesson IDs not yet completed",
        default_factory=list
    )
    reason: str = Field(
        description="Why this lesson is recommended",
        example="Builds on variables concept and introduces loops"
    )
    confidence_score: float = Field(
        description="AI confidence in this recommendation (0-1)",
        ge=0.0, le=1.0
    )

class CurriculumOverview(BaseModel):
    """Overview of curriculum structure for an age group"""
    age_group: str = Field(description="Target age group")
    total_lessons: int = Field(description="Total number of lessons in curriculum")
    estimated_duration_weeks: int = Field(
        description="Estimated time to complete full curriculum"
    )
    skill_progression: List[str] = Field(
        description="Main skill areas covered in order"
    )
    lesson_types_distribution: Dict[str, int] = Field(
        description="Count of each lesson type (challenge, tutorial, project, assessment)"
    )

class HealthCheckResponse(BaseModel):
    """Response model for health check endpoint"""
    status: Literal["healthy", "degraded", "unhealthy"] = Field(
        description="Overall system health status"
    )
    timestamp: datetime = Field(description="When the health check was performed")
    version: str = Field(description="API version")
    services: Dict[str, str] = Field(
        description="Status of individual services"
    )
    curriculum_stats: Dict[str, int] = Field(
        description="Statistics about loaded curriculum"
    )
    ai_models_status: Dict[str, str] = Field(
        description="Status of AI model connections",
        default_factory=dict
    )
