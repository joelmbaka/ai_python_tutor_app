"""
Coursework and curriculum management models for flexible lesson delivery.
These models allow creating different coursework paths from the lesson blueprints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal, Any
from datetime import datetime, date
from enum import Enum

class CourseworkType(str, Enum):
    """Different types of coursework offerings"""
    FULL_CURRICULUM = "full_curriculum"  # Complete age-appropriate curriculum
    QUICK_START = "quick_start"          # Essential lessons only (5-8 lessons)
    SUMMER_INTENSIVE = "summer_intensive" # 2-week intensive (10-15 lessons)
    WEEKEND_WARRIOR = "weekend_warrior"   # Weekend-friendly (8-12 lessons)
    SPECIALTY_TRACK = "specialty_track"   # Focused on specific skills
    CUSTOM = "custom"                     # User-defined selection

class CourseworkBlueprint(BaseModel):
    """Template for different coursework offerings"""
    id: str = Field(description="Unique coursework identifier")
    title: str = Field(description="Coursework title")
    description: str = Field(description="Detailed description")
    type: CourseworkType = Field(description="Type of coursework")
    age_group: Literal["8-10", "11-13", "14-16"] = Field(description="Target age group")
    
    # Lesson organization
    lesson_sequence: List[str] = Field(description="Ordered list of lesson blueprint IDs")
    total_lessons: int = Field(description="Total number of lessons")
    estimated_hours: Dict[str, int] = Field(
        description="Time estimates",
        example={"min_hours": 8, "max_hours": 15}
    )
    estimated_weeks: Dict[str, int] = Field(
        description="Duration estimates", 
        example={"min_weeks": 4, "max_weeks": 8}
    )
    
    # Learning outcomes
    skill_level_start: Literal["beginner", "intermediate", "advanced"] = Field(
        description="Required starting skill level"
    )
    skill_level_end: Literal["beginner", "intermediate", "advanced"] = Field(
        description="Skill level upon completion"
    )
    learning_outcomes: List[str] = Field(description="What students will achieve")
    final_projects: List[str] = Field(description="Major projects students will build")
    
    # Flexibility options
    has_milestones: bool = Field(default=True, description="Has checkpoint assessments")
    allows_skipping: bool = Field(default=False, description="Allows lesson skipping")
    requires_sequence: bool = Field(default=True, description="Must follow exact order")
    
    # Pricing and access
    is_free: bool = Field(default=True, description="Free or premium coursework")
    price_usd: Optional[float] = Field(default=None, description="Price if premium")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    version: str = Field(default="1.0", description="Coursework version")
    tags: List[str] = Field(default_factory=list, description="Search tags")

class StudentCourseworkProgress(BaseModel):
    """Track student progress through a specific coursework"""
    student_id: str = Field(description="Student identifier")
    coursework_id: str = Field(description="Coursework being taken")
    
    # Progress tracking
    enrolled_at: datetime = Field(description="When student enrolled")
    started_at: Optional[datetime] = Field(default=None, description="When first lesson started")
    completed_at: Optional[datetime] = Field(default=None, description="When coursework completed")
    
    # Lesson progress
    current_lesson_position: int = Field(default=0, description="Current lesson index in sequence")
    completed_lessons: List[str] = Field(default_factory=list, description="Completed lesson IDs")
    skipped_lessons: List[str] = Field(default_factory=list, description="Skipped lesson IDs")
    
    # Performance metrics
    total_time_spent_minutes: int = Field(default=0, description="Total learning time")
    average_lesson_score: Optional[float] = Field(default=None, description="Average score across lessons")
    milestone_scores: Dict[str, float] = Field(default_factory=dict, description="Scores on assessments")
    
    # Completion status
    completion_percentage: float = Field(default=0.0, description="Percentage complete (0-100)")
    is_active: bool = Field(default=True, description="Currently active enrollment")
    certificate_earned: bool = Field(default=False, description="Earned completion certificate")
    
    # Customization
    custom_lesson_sequence: Optional[List[str]] = Field(
        default=None, 
        description="Custom lesson order if different from blueprint"
    )
    notes: Optional[str] = Field(default=None, description="Student or teacher notes")

class CourseworkRecommendation(BaseModel):
    """AI recommendation for coursework selection"""
    student_profile: Dict[str, Any] = Field(description="Student information")
    recommended_coursework_id: str = Field(description="Best matching coursework")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Recommendation confidence")
    reasoning: str = Field(description="Why this coursework was recommended")
    alternatives: List[str] = Field(description="Other suitable coursework IDs")
    estimated_completion_time: str = Field(description="Expected time to complete")

class MilestoneCheckpoint(BaseModel):
    """Milestone assessment points within coursework"""
    id: str = Field(description="Milestone identifier")
    name: str = Field(description="Milestone name")
    position: int = Field(description="Position in lesson sequence")
    lesson_ids: List[str] = Field(description="Lessons covered by this milestone")
    required_score: float = Field(description="Minimum score to pass")
    badge_awarded: Optional[str] = Field(default=None, description="Badge for completion")

class CourseworkCertificate(BaseModel):
    """Digital certificate for coursework completion"""
    certificate_id: str = Field(description="Unique certificate ID")
    student_name: str = Field(description="Student's name")
    coursework_title: str = Field(description="Completed coursework title")
    completion_date: date = Field(description="Date of completion")
    final_score: float = Field(description="Overall score achieved")
    skills_mastered: List[str] = Field(description="Skills demonstrated")
    total_hours: int = Field(description="Total time invested")
    certificate_url: Optional[str] = Field(default=None, description="URL to digital certificate")
    verification_code: str = Field(description="Code for certificate verification")
