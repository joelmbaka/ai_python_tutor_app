"""
Default coursework selection for automatic enrollment when users start learning.
These are the comprehensive full curriculum paths that new students get enrolled in.
"""

from typing import Dict
from models.coursework_models import CourseworkBlueprint
from data.coursework_offerings import get_coursework_by_id

# Default coursework IDs for each age group (the full curriculum options)
DEFAULT_COURSEWORK_IDS: Dict[str, str] = {
    "8-10": "full_python_kids_8_10",        # 20 lessons, 8-12 weeks
    "11-13": "full_python_teens_11_13",     # 25 lessons, 12-20 weeks  
    "14-16": "computer_science_diploma_14_16"  # 30 lessons, 20-40 weeks
}

def get_default_coursework_for_age(age_group: str) -> CourseworkBlueprint:
    """
    Get the default full curriculum coursework for a specific age group.
    This is what students are automatically enrolled in when they click 'Start Learning'.
    """
    if age_group not in DEFAULT_COURSEWORK_IDS:
        raise ValueError(f"No default coursework defined for age group: {age_group}")
    
    coursework_id = DEFAULT_COURSEWORK_IDS[age_group]
    return get_coursework_by_id(coursework_id)

def get_first_lesson_for_age(age_group: str) -> str:
    """
    Get the first lesson ID for the default coursework of an age group.
    This is the lesson that gets generated when a user first starts learning.
    """
    default_coursework = get_default_coursework_for_age(age_group)
    if not default_coursework.lesson_sequence:
        raise ValueError(f"No lessons defined in default coursework for age group: {age_group}")
    
    return default_coursework.lesson_sequence[0]

def get_all_default_coursework() -> Dict[str, CourseworkBlueprint]:
    """Get all default coursework options mapped by age group"""
    return {
        age_group: get_default_coursework_for_age(age_group) 
        for age_group in DEFAULT_COURSEWORK_IDS.keys()
    }

def is_default_coursework(coursework_id: str) -> bool:
    """Check if a coursework ID is one of the default full curriculum options"""
    return coursework_id in DEFAULT_COURSEWORK_IDS.values()

# Summary of default learning paths
DEFAULT_LEARNING_PATHS = {
    "8-10": {
        "title": "Complete Python Adventure for Young Coders",
        "total_lessons": 20,
        "duration": "8-12 weeks",
        "first_lesson": "computational_thinking_intro_8_10",
        "description": "Full journey from beginner to confident young programmer"
    },
    "11-13": {
        "title": "Complete Python Programming Mastery", 
        "total_lessons": 25,
        "duration": "12-20 weeks",
        "first_lesson": "python_basics_11_13",
        "description": "Comprehensive programming journey including games and web development"
    },
    "14-16": {
        "title": "Computer Science Mastery Diploma",
        "total_lessons": 30, 
        "duration": "20-40 weeks",
        "first_lesson": "data_structures_intro_14_16",
        "description": "Complete computer science education covering algorithms, AI, and career prep"
    }
}
