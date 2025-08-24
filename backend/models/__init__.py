"""
Pydantic models for the AI Python Tutor backend.
"""

from .lesson_models import (
    CodeChallenge,
    Tutorial,
    Project,
    Assessment,
    LessonContent,
    LessonBlueprint,
    PersonalizationHooks,
    ContentRequirements,
    validate_lesson_content
)

# Request/Response models for API endpoints
from .api_models import (
    GenerateLessonRequest,
    GenerateLessonResponse,
    StudentProfile,
    LessonProgress,
    NextLessonRecommendation,
    CurriculumOverview,
    HealthCheckResponse
)

__all__ = [
    # Core lesson models
    "CodeChallenge",
    "Tutorial", 
    "Project",
    "Assessment",
    "LessonContent",
    "LessonBlueprint",
    "PersonalizationHooks",
    "ContentRequirements",
    "validate_lesson_content",
    
    # API models
    "GenerateLessonRequest",
    "GenerateLessonResponse", 
    "StudentProfile",
    "LessonProgress",
    "NextLessonRecommendation",
    "CurriculumOverview", 
    "HealthCheckResponse"
]