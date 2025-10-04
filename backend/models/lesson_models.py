"""
Pydantic models for lesson content and curriculum structure.
These models define the structured output that CrewAI agents will generate.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal, Dict
from datetime import datetime

class SimpleChallenge(BaseModel):
    """Simplified coding challenge with hints and solution reveal"""
    problem_description: str = Field(
        description="Clear description of the coding problem to solve",
        example="Write a function that greets a person by name using f-string formatting."
    )
    starter_code: str = Field(
        description="Initial code template for the student",
        example='def greet_person(name):\n    # Your code here\n    pass'
    )
    solution_code: str = Field(
        description="Complete solution code that can be revealed",
        example='def greet_person(name):\n    return f"Hello, {name}!"\n\n# Test it\nprint(greet_person("Alice"))'
    )
    hints: List[str] = Field(
        description="Progressive hints to help students when stuck",
        example=[
            "Remember to use f-string formatting with curly braces {}",
            "The function should return a string, not print it",
            "Don't forget to include the exclamation mark in your greeting"
        ]
    )
    explanation: str = Field(
        description="Explanation of what the challenge teaches",
        example="This challenge teaches you about functions, parameters, and f-string formatting in Python."
    )

class Exercise(BaseModel):
    """Simple practice exercise with open-ended coding"""
    question: str = Field(
        description="Practice question or prompt for the student",
        example="Try creating variables for your name and age, then print them out."
    )
    starter_code: str = Field(
        description="Optional starter code template",
        example='# Try it yourself!\nname = ""\nage = 0\n\n# Write your code below:'
    )
    explanation: str = Field(
        description="Brief explanation of what to practice",
        example="Practice using variables and the print() function."
    )
    
# Legacy lesson type models removed: Tutorial, Project, Assessment (challenge-only)

class LearnContent(BaseModel):
    """Incremental model: base Learn tab content only (no interactive content)."""
    title: str = Field(
        description="Personalized lesson title",
        example="Alice's Adventure with Python Variables! 🐍"
    )
    learning_objectives: List[str] = Field(
        description="What the student will learn in this lesson",
        example=[
            "Understand what variables are and why they're useful",
            "Create and assign values to variables",
            "Use variables in print statements",
            "Practice with different data types"
        ]
    )
    introduction: str = Field(
        description="Engaging lesson introduction tailored to student",
        example="Hey Alice! Ready to learn about variables? Think of them as magical boxes that can store anything you want - your name, your age, even your favorite emoji! Let's explore together! 🎯"
    )
    explanation: str = Field(
        description="Concept explanation tailored to age and experience level",
        example="Variables are like labeled containers that hold information. Just like you might have a box labeled 'toys' that contains your favorite games, a variable has a name and contains data. In Python, we create variables by giving them a name and assigning a value using the equals sign (=)."
    )
    encouragement: str = Field(
        description="Motivational message using student's name and interests",
        example="Amazing work, Alice! You're thinking like a real programmer now. Since you love games, imagine variables as the character stats in your favorite video game - each one stores important information! 🎮✨"
    )
    next_steps: str = Field(
        description="What comes after this lesson",
        example="Next up, we'll learn about different types of data you can store in variables - numbers, text, and even true/false values! Get ready to become a data master! 🚀"
    )
    estimated_duration: int = Field(
        description="Expected completion time in minutes",
        ge=5, le=120,
        example=25
    )
    difficulty_rating: int = Field(
        description="Difficulty level from 1 (very easy) to 5 (very hard)",
        ge=1, le=5,
        example=2
    )
    concepts_covered: List[str] = Field(
        description="Python concepts taught in this lesson",
        example=["variables", "assignment", "print_function", "string_data_type"]
    )

class LearnChallengeContent(LearnContent):
    """Incremental model: Learn content plus a SimpleChallenge for the Code tab."""
    challenge: SimpleChallenge = Field(
        description="Simplified coding challenge with hints and solution reveal"
    )

class LessonContent(BaseModel):
    """Main lesson content output from AI - challenge-only"""
    title: str = Field(
        description="Personalized lesson title",
        example="Alice's Adventure with Python Variables! 🐍"
    )
    learning_objectives: List[str] = Field(
        description="What the student will learn in this lesson",
        example=[
            "Understand what variables are and why they're useful",
            "Create and assign values to variables",
            "Use variables in print statements",
            "Practice with different data types"
        ]
    )
    introduction: str = Field(
        description="Engaging lesson introduction tailored to student",
        example="Hey Alice! Ready to learn about variables? Think of them as magical boxes that can store anything you want - your name, your age, even your favorite emoji! Let's explore together! 🎯"
    )
    
    # Challenge-only content
    challenge: SimpleChallenge = Field(
        description="Simplified coding challenge with hints and solution reveal"
    )
    exercises: Optional[List[Exercise]] = Field(
        description="List of open-ended practice exercises (2-3 recommended)",
        default=None
    )
    
    # Common elements for all lessons
    explanation: str = Field(
        description="Concept explanation tailored to age and experience level",
        example="Variables are like labeled containers that hold information. Just like you might have a box labeled 'toys' that contains your favorite games, a variable has a name and contains data. In Python, we create variables by giving them a name and assigning a value using the equals sign (=)."
    )
    encouragement: str = Field(
        description="Motivational message using student's name and interests",
        example="Amazing work, Alice! You're thinking like a real programmer now. Since you love games, imagine variables as the character stats in your favorite video game - each one stores important information! 🎮✨"
    )
    next_steps: str = Field(
        description="What comes after this lesson",
        example="Next up, we'll learn about different types of data you can store in variables - numbers, text, and even true/false values! Get ready to become a data master! 🚀"
    )
    
    # Metadata
    estimated_duration: int = Field(
        description="Expected completion time in minutes",
        ge=5, le=120,
        example=25
    )
    difficulty_rating: int = Field(
        description="Difficulty level from 1 (very easy) to 5 (very hard)",
        ge=1, le=5,
        example=2
    )
    concepts_covered: List[str] = Field(
        description="Python concepts taught in this lesson",
        example=["variables", "assignment", "print_function", "string_data_type"]
    )

class PersonalizationHooks(BaseModel):
    """Configuration for how AI should personalize content"""
    use_student_name: bool = Field(default=True, description="Include student's name in content")
    use_interests: bool = Field(default=True, description="Incorporate student's interests")
    use_age_appropriate_language: bool = Field(default=True, description="Adjust language complexity for age")
    use_experience_level: bool = Field(default=True, description="Adjust complexity based on coding experience")
    include_encouragement: bool = Field(default=True, description="Add motivational elements")

class ContentRequirements(BaseModel):
    """Specific content constraints and requirements"""
    max_code_lines: Optional[int] = Field(default=None, description="Maximum lines of code in examples")
    min_examples: int = Field(default=1, description="Minimum number of code examples")
    max_examples: int = Field(default=5, description="Maximum number of code examples")
    include_emojis: bool = Field(default=True, description="Use emojis to make content engaging")
    language_complexity: Literal["simple", "moderate", "advanced"] = Field(
        default="simple", 
        description="Language complexity level"
    )
    interactive_elements: bool = Field(default=True, description="Include interactive components")

class LessonBlueprint(BaseModel):
    """Framework structure that defines what AI should generate"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(
        description="Unique lesson identifier",
        example="variables_basics_8_10"
    )
    title: str = Field(
        description="Template lesson title (will be personalized by AI)",
        example="Introduction to Variables"
    )
    age_group: Literal['8-10', '11-13', '14-16'] = Field(
        description="Target age group for content complexity"
    )
    skill_level: Literal['beginner', 'intermediate', 'advanced'] = Field(
        description="Required skill level"
    )
    
    # Prerequisites and progression
    prerequisites: List[str] = Field(
        description="Required prior lesson IDs that must be completed first",
        example=["computational_thinking_basics", "python_introduction"],
        default_factory=list
    )
    concepts: List[str] = Field(
        description="Python concepts this lesson should cover",
        example=["variables", "assignment_operator", "data_types", "print_function"]
    )
    
    # AI generation parameters
    personalization_hooks: PersonalizationHooks = Field(
        description="Configuration for content personalization",
        default_factory=PersonalizationHooks
    )
    complexity_level: int = Field(
        description="Content complexity from 1 (very simple) to 5 (very complex)",
        ge=1, le=5,
        example=2
    )
    
    # Content constraints
    content_requirements: ContentRequirements = Field(
        description="Specific content constraints and requirements",
        default_factory=ContentRequirements
    )
    
    # Learning path context
    position_in_curriculum: int = Field(
        description="Lesson number in the overall curriculum sequence",
        ge=1,
        example=3
    )
    estimated_duration_range: Dict[str, int] = Field(
        description="Expected time range for completion",
        example={"min_minutes": 20, "max_minutes": 40},
        default_factory=lambda: {"min_minutes": 15, "max_minutes": 30}
    )
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    version: str = Field(default="1.0", description="Blueprint version for content updates")
    tags: List[str] = Field(
        description="Tags for categorizing and filtering lessons",
        example=["fundamentals", "syntax", "beginner_friendly"],
        default_factory=list
    )

# Validation helpers removed (challenge-only model)

# Example usage for CrewAI task configuration
LESSON_GENERATION_PROMPT_TEMPLATE = """
Generate personalized Python lesson content for student: {student_name}
Age: {age} years old
Experience Level: {experience}
Interests: {interests}

Lesson Blueprint: {blueprint_title}
Concepts to Cover: {concepts}
Age Group: {age_group}
Complexity Level: {complexity_level}/5

Create engaging, age-appropriate content that incorporates the student's interests and engagement preferences.
The content should be encouraging, use the student's name, and match their experience level.
"""
