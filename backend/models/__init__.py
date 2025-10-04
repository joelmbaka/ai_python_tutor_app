"""
Pydantic models for the AI Python Tutor backend.
"""

from .lesson_models import (
    SimpleChallenge,
    Exercise,
    LearnContent,
    LearnChallengeContent,
    LessonContent,
    LessonBlueprint,
    PersonalizationHooks,
    ContentRequirements,
)

# Request/Response models for API endpoints
from .api_models import (
    GenerateLessonRequest,
    GenerateLessonResponse,
    StudentProfile,
    LessonProgress,
    NextLessonRecommendation,
    CurriculumOverview,
    HealthCheckResponse,
    GenerateNewChallengeRequest,
    GenerateNewChallengeResponse
)

__all__ = [
    # Core lesson models
    "SimpleChallenge",
    "Exercise",
    "LearnContent",
    "LearnChallengeContent",
    "LessonContent",
    "LessonBlueprint",
    "PersonalizationHooks",
    "ContentRequirements",
    
    # API models
    "GenerateLessonRequest",
    "GenerateLessonResponse", 
    "StudentProfile",
    "LessonProgress",
    "NextLessonRecommendation",
    "CurriculumOverview", 
    "HealthCheckResponse",
    "GenerateNewChallengeRequest",
    "GenerateNewChallengeResponse"
]