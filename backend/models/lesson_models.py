"""
Pydantic models for lesson content and curriculum structure.
These models define the structured output that CrewAI agents will generate.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any, Union
from datetime import datetime

class CodeChallenge(BaseModel):
    """Interactive coding challenge structure"""
    starter_code: str = Field(
        description="Initial code template for the student",
        example='name = ""\nprint(f"Hello, {name}!")'
    )
    solution_code: str = Field(
        description="Complete solution code",
        example='name = "Alice"\nprint(f"Hello, {name}!")'
    )
    test_cases: List[Dict[str, Any]] = Field(
        description="Input/output test cases to validate student solutions",
        example=[
            {"input": "Alice", "expected_output": "Hello, Alice!"},
            {"input": "Bob", "expected_output": "Hello, Bob!"}
        ]
    )
    hints: List[str] = Field(
        description="Progressive hints to help students when stuck",
        example=[
            "Remember to assign a value to the variable 'name'",
            "Use the input() function to get user input",
            "Check the syntax of your f-string formatting"
        ]
    )
    explanation: str = Field(
        description="Explanation of what the challenge teaches",
        example="This challenge teaches you about variables and string formatting in Python."
    )

class Tutorial(BaseModel):
    """Step-by-step tutorial content"""
    steps: List[Dict[str, str]] = Field(
        description="Ordered tutorial steps with title and content",
        example=[
            {
                "title": "What are Variables?",
                "content": "Variables are like boxes that store information..."
            },
            {
                "title": "Creating Your First Variable", 
                "content": "Let's create a variable to store your name..."
            }
        ]
    )
    interactive_examples: List[str] = Field(
        description="Code examples students can run and modify",
        example=[
            'my_name = "Python Learner"\nprint(my_name)',
            'age = 10\nprint(f"I am {age} years old")'
        ]
    )
    key_concepts: List[str] = Field(
        description="Main concepts being taught in this tutorial",
        example=["Variables", "String assignment", "Print function", "F-string formatting"]
    )

class Project(BaseModel):
    """Project-based learning content"""
    project_brief: str = Field(
        description="What the student will build",
        example="Build a simple calculator that can add, subtract, multiply, and divide two numbers."
    )
    milestones: List[Dict[str, str]] = Field(
        description="Project checkpoints with descriptions",
        example=[
            {
                "title": "Setup Variables",
                "description": "Create variables to store two numbers from user input"
            },
            {
                "title": "Add Operations", 
                "description": "Create functions for basic math operations"
            },
            {
                "title": "User Interface",
                "description": "Add a simple menu for users to choose operations"
            }
        ]
    )
    starter_files: Optional[Dict[str, str]] = Field(
        description="Initial project files with basic structure",
        example={
            "calculator.py": "# Your calculator project starts here\n# TODO: Add your code below\n",
            "README.md": "# My Calculator Project\n\nThis calculator can perform basic math operations."
        },
        default=None
    )
    success_criteria: List[str] = Field(
        description="How to know the project is complete",
        example=[
            "Calculator can add two numbers correctly",
            "Calculator can subtract two numbers correctly", 
            "Calculator handles user input validation",
            "Code is well-commented and organized"
        ]
    )

class Assessment(BaseModel):
    """Assessment and quiz content"""
    questions: List[Dict[str, Any]] = Field(
        description="Quiz questions with multiple choice or coding problems",
        example=[
            {
                "type": "multiple_choice",
                "question": "What symbol is used to assign a value to a variable in Python?",
                "options": ["=", "==", "->", ":="],
                "correct_answer": 0,
                "explanation": "The = symbol assigns values to variables, while == compares values."
            },
            {
                "type": "coding",
                "question": "Write a program that prints 'Hello, World!' to the screen.",
                "starter_code": "# Write your code here\n",
                "solution": "print('Hello, World!')",
                "test_cases": [{"expected_output": "Hello, World!"}]
            }
        ]
    )
    passing_score: int = Field(
        description="Minimum score to pass (0-100)",
        ge=0, le=100,
        example=70
    )
    feedback_rubric: Dict[str, str] = Field(
        description="Feedback messages based on performance ranges",
        example={
            "excellent": "Outstanding work! You've mastered these concepts.",
            "good": "Great job! You understand most of the material.",
            "needs_improvement": "You're getting there! Review the concepts and try again.",
            "needs_help": "Don't worry, learning takes time. Let's review together."
        }
    )

class LessonContent(BaseModel):
    """Main lesson content output from AI - this is what CrewAI tasks will generate"""
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
    
    # Content varies by lesson type - only one should be populated
    challenge: Optional[CodeChallenge] = Field(
        description="Interactive coding challenge content",
        default=None
    )
    tutorial: Optional[Tutorial] = Field(
        description="Step-by-step tutorial content", 
        default=None
    )
    project: Optional[Project] = Field(
        description="Project-based learning content",
        default=None
    )
    assessment: Optional[Assessment] = Field(
        description="Assessment and quiz content",
        default=None
    )
    
    # Common elements for all lesson types
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
    use_learning_style: bool = Field(default=True, description="Adapt to visual/text/mixed preference")
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
    id: str = Field(
        description="Unique lesson identifier",
        example="variables_basics_8_10"
    )
    title: str = Field(
        description="Template lesson title (will be personalized by AI)",
        example="Introduction to Variables"
    )
    type: Literal['challenge', 'tutorial', 'project', 'assessment'] = Field(
        description="Type of lesson content to generate"
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

# Validation helpers
class LessonValidationError(Exception):
    """Custom exception for lesson content validation errors"""
    pass

def validate_lesson_content(content: LessonContent) -> bool:
    """Validate that lesson content has exactly one content type"""
    content_types = [
        content.challenge is not None,
        content.tutorial is not None, 
        content.project is not None,
        content.assessment is not None
    ]
    
    if sum(content_types) != 1:
        raise LessonValidationError(
            "Lesson content must have exactly one content type (challenge, tutorial, project, or assessment)"
        )
    
    return True

# Example usage for CrewAI task configuration
LESSON_GENERATION_PROMPT_TEMPLATE = """
Generate personalized Python lesson content for student: {student_name}
Age: {age} years old
Experience Level: {experience}
Learning Style: {learning_style}  
Interests: {interests}

Lesson Blueprint: {blueprint_title}
Lesson Type: {lesson_type}
Concepts to Cover: {concepts}
Age Group: {age_group}
Complexity Level: {complexity_level}/5

Create engaging, age-appropriate content that incorporates the student's interests and learning preferences.
The content should be encouraging, use the student's name, and match their experience level.
"""
