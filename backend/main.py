"""
AI Python Tutor Backend
Main FastAPI application for generating personalized Python lessons using CrewAI.
"""

from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from models import (
    GenerateLessonRequest, 
    GenerateLessonResponse, 
    StudentProfile,
    LessonProgress,
    NextLessonRecommendation,
    CurriculumOverview,
    HealthCheckResponse,
    LessonBlueprint,
    LessonContent,
    GenerateNewChallengeRequest,
    GenerateNewChallengeResponse
)
from models.execution_models import CodeExecutionRequest, CodeExecutionResponse, CodeSubmission, CodeSubmissionRequest
from services.code_executor import code_executor
from services.code_analyzer import code_analyzer
from crews.lesson_generator import lesson_generator_crew
from crews.challenge_generator import challenge_generator_crew
from data.lesson_blueprints import (
    get_blueprint_by_id, 
    get_blueprints_for_age, 
    get_next_lesson,
    check_prerequisites,
    CURRICULUM_BY_AGE
)
from data.default_coursework import (
    get_default_coursework_for_age,
    get_first_lesson_for_age,
    DEFAULT_LEARNING_PATHS
)
from data.coursework_offerings import (
    load_coursework_content,
    get_all_coursework_summaries,
    get_coursework_for_age
)

# Helper functions for adaptive learning
def get_adaptive_next_lesson(current_lesson_id: str, student_profile: StudentProfile, performance_score: int) -> str:
    """Recommend next lesson based on student performance and adaptive difficulty"""
    
    # Get current lesson difficulty
    current_blueprint = get_blueprint_by_id(current_lesson_id)
    if not current_blueprint:
        return "variables_intro_8_10"  # Default fallback
    
    # Adaptive logic based on performance
    if performance_score >= 90:
        # Excellent performance - can skip ahead or tackle advanced concepts
        next_lesson = get_next_lesson(current_lesson_id, student_profile.age, skip_intermediate=True)
    elif performance_score >= 70:
        # Good performance - proceed normally
        next_lesson = get_next_lesson(current_lesson_id, student_profile.age)
    else:
        # Needs more practice - recommend review or easier variant
        next_lesson = get_review_lesson(current_lesson_id) or current_lesson_id
    
    return next_lesson or "review_fundamentals"

def get_review_lesson(lesson_id: str) -> str | None:
    """Get a review/practice lesson for reinforcement"""
    review_mapping = {
        "variables_intro_8_10": "variables_practice_8_10",
        "functions_intro_8_10": "functions_practice_8_10",
        "loops_intro_8_10": "loops_practice_8_10"
    }
    return review_mapping.get(lesson_id)

def generate_study_suggestions(analysis: Dict[str, Any], student_profile: StudentProfile) -> List[str]:
    """Generate personalized study suggestions based on code analysis"""
    
    suggestions = []
    score = analysis.get("overall_score", 0)
    
    # Performance-based suggestions
    if score < 50:
        suggestions.extend([
            f"Review the basic concepts from this lesson, {student_profile.name}",
            "Try breaking the problem into smaller steps",
            "Practice with simpler examples first"
        ])
    elif score < 80:
        suggestions.extend([
            "You're doing well! Try optimizing your code",
            "Consider edge cases in your solutions",
            "Practice explaining your code out loud"
        ])
    else:
        suggestions.extend([
            "Excellent work! Challenge yourself with harder problems",
            "Try implementing the same solution in different ways",
            "Help other students or explore advanced topics"
        ])
    
    # Interest-based suggestions
    interests = student_profile.interests
    if "games" in interests:
        suggestions.append("Try creating a simple game with your new coding skills")
    if "art" in interests:
        suggestions.append("Explore creating digital art or animations with code")
    if "music" in interests:
        suggestions.append("Learn about making music or sound effects with programming")
    
    # Learning approach adaptations based on interests
    if "art" in interests or "design" in interests:
        suggestions.append("Draw diagrams to visualize your code logic")
    elif "writing" in interests or "reading" in interests:
        suggestions.append("Write detailed comments explaining each step")
    
    return suggestions[:4]  # Limit to 4 suggestions

import json
from datetime import datetime, date
import time

app = FastAPI(
    title="AI Python Tutor API", 
    description="Backend API for generating personalized Python lessons using CrewAI",
    version="1.0.0"
)

# Enable CORS for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint used as a basic health-check."""
    return {"message": "AI Python Tutor API is running! 🐍🎓"}

@app.post("/generate-lesson", response_model=GenerateLessonResponse, tags=["Lesson Generation"])
async def generate_lesson(request: GenerateLessonRequest):
    """Generate a personalized Python lesson using CrewAI with structured output."""
    start_time = time.time()
    
    try:
        # Get the lesson blueprint
        blueprint = get_blueprint_by_id(request.blueprint_id)
        
        # Format student profile and blueprint for AI processing
        student_profile_str = format_student_profile_for_ai(request.student_profile)
        lesson_blueprint_str = format_lesson_blueprint_for_ai(blueprint)
        
        # Call CrewAI to generate structured lesson content
        crew_result = lesson_generator_crew.kickoff(inputs={
            "lesson_blueprint": lesson_blueprint_str,
            "student_profile": student_profile_str
        })
        
        # Access the structured Pydantic output
        if hasattr(crew_result, 'pydantic') and crew_result.pydantic:
            # CrewAI returned structured output
            lesson_content = crew_result.pydantic
            generation_time = time.time() - start_time
            
            return GenerateLessonResponse(
                success=True,
                lesson_content=lesson_content,
                generation_time_seconds=round(generation_time, 2),
                fallback_used=False
            )
        else:
            # Fallback: try to access the raw output and parse it
            raise ValueError("CrewAI did not return structured output")
    
    except Exception as e:
        # Fallback to mock data if AI fails
        print(f"AI generation failed: {str(e)}, falling back to mock data")
        mock_lesson_content = create_mock_lesson_content(
            blueprint, 
            request.student_profile
        )
        generation_time = time.time() - start_time
        
        return GenerateLessonResponse(
            success=True,
            lesson_content=mock_lesson_content,
            generation_time_seconds=round(generation_time, 2),
            error_message=f"AI generation failed: {str(e)}",
            fallback_used=True
        )

@app.get("/curriculum/{age_group}", response_model=CurriculumOverview, tags=["Curriculum"])
async def get_curriculum_overview(age_group: str):
    """Get curriculum overview for a specific age group."""
    try:
        blueprints = get_blueprints_for_age(age_group)
        
        # Extract skill progression
        skill_progression = []
        sorted_blueprints = sorted(blueprints, key=lambda x: x.position_in_curriculum)
        for blueprint in sorted_blueprints:
            skill_progression.extend(blueprint.concepts)
        
        # Remove duplicates while preserving order
        unique_skills = []
        for skill in skill_progression:
            if skill not in unique_skills:
                unique_skills.append(skill)
        
        return CurriculumOverview(
            age_group=age_group,
            total_lessons=len(blueprints),
            estimated_duration_weeks=len(blueprints) * 2,  # Rough estimate
            skill_progression=unique_skills[:10]  # Top 10 skills
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/lesson/blueprint/{blueprint_id}", response_model=LessonBlueprint, tags=["Lesson Management"])
async def get_lesson_blueprint(blueprint_id: str):
    """Get a specific lesson blueprint by ID."""
    try:
        blueprint = get_blueprint_by_id(blueprint_id)
        return blueprint
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/student/next-lesson", response_model=NextLessonRecommendation, tags=["Student Progress"])
async def get_next_lesson_recommendation(
    current_lesson_id: str,
    student_age: int,
    completed_lessons: str = ""  # Comma-separated list
):
    """Get the next recommended lesson for a student."""
    try:
        # Determine age group
        if student_age <= 10:
            age_group = "8-10"
        elif student_age <= 13:
            age_group = "11-13"
        else:
            age_group = "14-16"
        
        # Parse completed lessons
        completed_lesson_list = [
            lesson.strip() for lesson in completed_lessons.split(",") 
            if lesson.strip()
        ]
        
        # Get next lesson
        next_lesson = get_next_lesson(current_lesson_id, age_group)
        
        # Check prerequisites
        prerequisites_met = check_prerequisites(next_lesson.id, completed_lesson_list)
        missing_prereqs = [
            prereq for prereq in next_lesson.prerequisites 
            if prereq not in completed_lesson_list
        ] if not prerequisites_met else []
        
        return NextLessonRecommendation(
            recommended_lesson_id=next_lesson.id,
            lesson_title=next_lesson.title,
            estimated_difficulty=next_lesson.complexity_level,
            prerequisites_met=prerequisites_met,
            missing_prerequisites=missing_prereqs,
            reason=f"Builds on {', '.join(next_lesson.concepts)} concepts",
            confidence_score=0.95 if prerequisites_met else 0.7
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/student/start-learning", tags=["Student Journey"])
async def start_learning_journey(
    student_age: int,
    student_id: str = "demo_student"
):
    """
    Initialize a student's learning journey with the default coursework.
    This is called when a user clicks 'Start Learning' for the first time.
    """
    # Determine age group
    if 8 <= student_age <= 10:
        age_group = "8-10"
    elif 11 <= student_age <= 13:
        age_group = "11-13"
    elif 14 <= student_age <= 18:
        age_group = "14-16"  # Use advanced curriculum for ages 14-18
    else:
        raise HTTPException(status_code=400, detail="Age must be between 8-18")
    
    # Get default coursework and first lesson
    default_coursework = get_default_coursework_for_age(age_group)
    first_lesson_id = get_first_lesson_for_age(age_group)
    
    return {
        "student_id": student_id,
        "age_group": age_group,
        "enrolled_coursework": {
            "id": default_coursework.id,
            "title": default_coursework.title,
            "total_lessons": default_coursework.total_lessons,
            "estimated_duration": f"{default_coursework.estimated_weeks['min_weeks']}-{default_coursework.estimated_weeks['max_weeks']} weeks"
        },
        "first_lesson": {
            "lesson_id": first_lesson_id,
            "position": 1,
            "total_lessons": default_coursework.total_lessons
        },
        "learning_path": DEFAULT_LEARNING_PATHS[age_group],
        "message": f"Welcome to your Python learning journey! You've been enrolled in the complete {age_group} curriculum.",
        "next_action": f"Generate lesson content for: {first_lesson_id}"
    }

@app.get("/student/coursework-options/{age_group}", tags=["Dashboard"])
async def get_coursework_options(age_group: str):
    """
    Get all available coursework options for an age group.
    Used on the dashboard for flexible learning path selection.
    """
    if age_group not in ["8-10", "11-13", "14-16"]:
        raise HTTPException(status_code=400, detail="Invalid age group")
    
    coursework_options = get_coursework_for_age(age_group)
    default_coursework = get_default_coursework_for_age(age_group)
    
    return {
        "age_group": age_group,
        "default_coursework_id": default_coursework.id,
        "total_options": len(coursework_options),
        "coursework_options": [
            {
                "id": cw.id,
                "title": cw.title,
                "description": cw.description,
                "category": cw.category.value,
                "total_lessons": cw.total_lessons,
                "estimated_duration": f"{cw.estimated_weeks['min_weeks']}-{cw.estimated_weeks['max_weeks']} weeks",
                "skill_level": f"{cw.skill_level_start} → {cw.skill_level_end}",
                "is_free": cw.is_free,
                "price": cw.price_usd,
                "is_default": cw.id == default_coursework.id,
                "final_projects": cw.final_projects[:3]  # Show first 3 projects
            }
            for cw in coursework_options
        ]
    }

@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Detailed health check with system status."""
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0",
        services={
            "api": "operational",
            "database": "operational", 
            "ai_agents": "operational"
        },
        curriculum_stats={
            age_group: len(blueprints) 
            for age_group, blueprints in CURRICULUM_BY_AGE.items()
        },
        ai_models_status={
            "nvidia_nim": "connected",
            "lesson_generator_crew": "ready",
            "code_executor": "operational"
        }
    )

def format_student_profile_for_ai(profile: StudentProfile) -> str:
    """Format student profile into a comprehensive string for AI processing."""
    return f"""
STUDENT PROFILE:

PERSONAL INFORMATION:
- Name: {profile.name}
- Age: {profile.age} years old
- Programming Experience: {profile.experience}

INTERESTS & HOBBIES:
- Primary Interests: {', '.join(profile.interests) if profile.interests else 'None specified'}

LEARNING PROGRESS:
- Completed Lessons: {profile.total_lessons_completed}
- Current Streak: {profile.current_streak} days
- Completed Lesson IDs: {', '.join(profile.completed_lessons) if profile.completed_lessons else 'None yet'}

PERSONALIZATION INSTRUCTIONS:
- Use {profile.name}'s name throughout the lesson content
- Connect coding concepts to their interests: {', '.join(profile.interests[:3]) if profile.interests else 'general examples'}
- Adapt language complexity for age {profile.age} ({profile.experience} experience level)
- Create engaging, interactive content that matches their interests and age group
- Build confidence with encouraging, age-appropriate feedback
- Make coding feel engaging and achievable
"""

def format_lesson_blueprint_for_ai(blueprint: LessonBlueprint) -> str:
    """Format lesson blueprint into a detailed specification for AI processing."""
    return f"""
LESSON BLUEPRINT SPECIFICATION:

BASIC INFORMATION:
- Lesson ID: {blueprint.id}
- Title: {blueprint.title}
- Target Age Group: {blueprint.age_group}
- Skill Level: {blueprint.skill_level}
- Position in Curriculum: {blueprint.position_in_curriculum}

LEARNING OBJECTIVES:
- Primary Concepts: {', '.join(blueprint.concepts)}
- Prerequisites: {', '.join(blueprint.prerequisites) if blueprint.prerequisites else 'None'}
- Complexity Level: {blueprint.complexity_level}/5

CONTENT REQUIREMENTS:
- Language Complexity: {blueprint.content_requirements.language_complexity}
- Maximum Code Lines: {blueprint.content_requirements.max_code_lines or 'No limit'}
- Minimum Examples: {blueprint.content_requirements.min_examples}
- Maximum Examples: {blueprint.content_requirements.max_examples}
- Include Emojis: {blueprint.content_requirements.include_emojis}
- Interactive Elements: {blueprint.content_requirements.interactive_elements}

PERSONALIZATION SETTINGS:
- Use Student Name: {blueprint.personalization_hooks.use_student_name}
- Use Interests: {blueprint.personalization_hooks.use_interests}
- Age-Appropriate Language: {blueprint.personalization_hooks.use_age_appropriate_language}
- Adapt to Interests and Age: {blueprint.personalization_hooks.use_interests and blueprint.personalization_hooks.use_age_appropriate_language}
- Include Encouragement: {blueprint.personalization_hooks.include_encouragement}

DURATION & DIFFICULTY:
- Estimated Duration: {blueprint.estimated_duration_range['min_minutes']}-{blueprint.estimated_duration_range['max_minutes']} minutes
- Tags: {', '.join(blueprint.tags) if blueprint.tags else 'None'}

CHALLENGE CONTENT INSTRUCTIONS:
{get_content_type_instructions()}
"""

def get_content_type_instructions() -> str:
    """Return challenge content instructions (challenge-only)."""
    return """
FOR CODING CHALLENGES:
- Create engaging starter code that students can build upon
- Provide a complete solution that demonstrates best practices
- Include progressive hints that guide without giving away the answer
- Ensure examples are runnable and age-appropriate
- Add clear explanations of what the challenge teaches
"""

def create_mock_lesson_content(blueprint: LessonBlueprint, student: StudentProfile) -> LessonContent:
    """Create mock lesson content as fallback when AI generation fails (challenge + practice exercises)."""
    from models.lesson_models import SimpleChallenge, Exercise
    
    # Base content structure
    challenge = SimpleChallenge(
        problem_description=f"Write a simple program that demonstrates {blueprint.concepts[0] if blueprint.concepts else 'Python basics'}.",
        starter_code="# Your code here\nprint('Hello, World!')",
        solution_code="print('Hello, World!')",
        hints=["Start with the print function", "Don't forget the quotes!"],
        explanation="This challenge teaches you about the print function in Python."
    )
    
    # Create 2-3 simple practice exercises
    exercises_list = [
        Exercise(
            question="Try experimenting with the print function and create your own messages!",
            starter_code="# Experiment here!\nprint('Your message here')",
            explanation="Practice using the print function with different messages."
        ),
        Exercise(
            question="Create variables for your name and age, then print a friendly sentence using them.",
            starter_code="# Your turn!\nname = 'Alice'\nage = 12\n# Print: Hello, my name is Alice and I am 12 years old!",
            explanation="Practice variables and string formatting."
        ),
        Exercise(
            question="Write a function greet(name) that returns a greeting, then call it with your name.",
            starter_code="def greet(name):\n    # TODO: return a greeting using name\n    pass\n\nprint(greet('Alice'))",
            explanation="Practice writing simple functions and return values."
        ),
    ]

    mock_content = LessonContent(
        title=f"{student.name}'s {blueprint.title}! 🎯",
        learning_objectives=[
            f"Understand {concept}" for concept in blueprint.concepts[:3]
        ],
        introduction=f"Hey {student.name}! Ready to learn about {blueprint.concepts[0] if blueprint.concepts else 'programming'}? Let's make coding fun and exciting!",
        challenge=challenge,
        explanation=f"This lesson covers {', '.join(blueprint.concepts)} which are fundamental concepts in Python programming.",
        encouragement=f"Great job, {student.name}! You're doing amazing work learning to code. Keep going! 🌟",
        next_steps="Continue to the next lesson to build on these concepts and become an even better programmer!",
        estimated_duration=30,
        difficulty_rating=blueprint.complexity_level,
        concepts_covered=blueprint.concepts,
        exercises=exercises_list[:3]
    )

    return mock_content

@app.post("/execute-code", response_model=CodeExecutionResponse, tags=["Code Execution"])
async def execute_student_code(request: CodeExecutionRequest) -> CodeExecutionResponse:
    """Execute student code against test cases and return results"""
    try:
        result = await code_executor.execute_code(request)
        return result
    except Exception as e:
        return CodeExecutionResponse(
            success=False,
            total_tests=len(request.test_cases),
            passed_tests=0,
            test_results=[],
            overall_output=None,
            execution_time_total_ms=0.0,
            memory_used_mb=None,
            runtime_errors=[f"Execution failed: {str(e)}"]
        )

@app.post("/analyze-code", tags=["Code Analysis"])
async def analyze_student_code(
    student_code: str,
    lesson_id: str,
    student_profile: StudentProfile,
    execution_result: CodeExecutionResponse,
    expected_concepts: List[str] = None
):
    """Analyze student code and provide intelligent feedback and hints"""
    try:
        analysis = await code_analyzer.analyze_student_code(
            student_code=student_code,
            lesson_id=lesson_id,
            execution_result=execution_result,
            student_profile=student_profile,
            expected_concepts=expected_concepts or []
        )
        return analysis
    except Exception as e:
        return {
            "error": f"Analysis failed: {str(e)}",
            "overall_score": 0,
            "adaptive_hints": ["Keep practicing and learning!"],
            "encouragement": f"You're doing great, {student_profile.name if student_profile else 'there'}!"
        }

@app.post("/submit-code-with-analysis", tags=["Code Execution"])
async def submit_code_with_analysis(
    student_code: str,
    lesson_id: str,
    student_profile: StudentProfile,
    test_cases: List[Dict[str, Any]],
    expected_concepts: List[str] = None,
    timeout_seconds: int = 10
):
    """Execute student code and provide comprehensive analysis and feedback"""
    try:
        # Execute the code
        execution_request = CodeExecutionRequest(
            student_code=student_code,
            lesson_id=lesson_id,
            test_cases=test_cases,
            timeout_seconds=timeout_seconds
        )
        
        execution_result = await code_executor.execute_code(execution_request)
        
        # Analyze the code and results
        analysis = await code_analyzer.analyze_student_code(
            student_code=student_code,
            lesson_id=lesson_id,
            execution_result=execution_result,
            student_profile=student_profile,
            expected_concepts=expected_concepts or []
        )
        
        return {
            "execution_result": execution_result,
            "code_analysis": analysis,
            "learning_insights": {
                "mastery_level": "developing" if analysis["overall_score"] < 70 else "proficient" if analysis["overall_score"] < 90 else "advanced",
                "recommended_next_lesson": get_adaptive_next_lesson(lesson_id, student_profile, analysis["overall_score"]),
                "study_suggestions": generate_study_suggestions(analysis, student_profile)
            }
        }
        
    except Exception as e:
        return {
            "error": f"Analysis failed: {str(e)}",
            "execution_result": None,
            "code_analysis": None,
            "learning_insights": None
        }

@app.post("/submit-code", tags=["Code Execution"])
async def submit_code_solution(request: CodeSubmissionRequest):
    """Submit and evaluate student code solution"""
    execution_request = CodeExecutionRequest(
        student_code=request.submitted_code,
        lesson_id=request.lesson_id,
        test_cases=request.test_cases
    )
    
    execution_result = await code_executor.execute_code(execution_request)
    
    # Calculate score based on passed tests
    score = int((execution_result.passed_tests / execution_result.total_tests) * 100) if execution_result.total_tests > 0 else 0
    
    submission = CodeSubmission(
        submission_id=f"{request.student_id}_{request.lesson_id}_{int(time.time())}",
        student_id=request.student_id,
        lesson_id=request.lesson_id,
        submitted_code=request.submitted_code,
        execution_result=execution_result,
        score=score
    )
    
    return {
        "submission_id": submission.submission_id,
        "score": score,
        "passed_tests": execution_result.passed_tests,
        "total_tests": execution_result.total_tests,
        "success": execution_result.passed_tests == execution_result.total_tests,
        "execution_result": execution_result
    }

@app.post("/generate-new-challenge", response_model=GenerateNewChallengeResponse, tags=["Challenge Generation"])
async def generate_new_challenge(request: GenerateNewChallengeRequest):
    """Generate a new challenge based on current lesson context and specified difficulty."""
    start_time = time.time()
    
    try:
        # Format current challenge and context for AI processing
        current_challenge_str = format_challenge_for_ai(request.current_challenge)
        student_profile_str = format_student_profile_for_ai(request.student_profile)
        lesson_context_str = format_lesson_context_for_ai(request.lesson_context or {})
        
        # Call CrewAI to generate new challenge
        crew_result = challenge_generator_crew.kickoff(inputs={
            "lesson_context": lesson_context_str,
            "current_challenge": current_challenge_str,
            "student_profile": student_profile_str,
            "difficulty": request.difficulty
        })
        
        # Access the structured Pydantic output
        if hasattr(crew_result, 'pydantic') and crew_result.pydantic:
            # CrewAI returned structured output
            new_challenge = crew_result.pydantic
            generation_time = time.time() - start_time
            
            return GenerateNewChallengeResponse(
                success=True,
                new_challenge=new_challenge,
                generation_time_seconds=round(generation_time, 2),
                fallback_used=False
            )
        else:
            # Fallback: try to access the raw output and parse it
            raise ValueError("CrewAI did not return structured output")
    
    except Exception as e:
        # Fallback to mock challenge if AI fails
        print(f"AI challenge generation failed: {str(e)}, falling back to mock data")
        mock_challenge = create_mock_challenge(
            request.current_challenge, 
            request.student_profile,
            request.difficulty
        )
        generation_time = time.time() - start_time
        
        return GenerateNewChallengeResponse(
            success=True,
            new_challenge=mock_challenge,
            generation_time_seconds=round(generation_time, 2),
            error_message=f"AI generation failed: {str(e)}",
            fallback_used=True
        )

def format_challenge_for_ai(challenge: Dict[str, Any]) -> str:
    """Format current challenge details for AI processing."""
    return f"""
CURRENT CHALLENGE:
- Problem: {challenge.get('problem_description', 'N/A')}
- Concepts: Based on starter code and solution
- Difficulty Level: Inferred from complexity

STARTER CODE:
{challenge.get('starter_code', 'N/A')}

SOLUTION CODE:
{challenge.get('solution_code', 'N/A')}

HINTS PROVIDED:
{chr(10).join(f'- {hint}' for hint in challenge.get('hints', []))}

EXPLANATION:
{challenge.get('explanation', 'N/A')}
"""

def format_lesson_context_for_ai(context: Dict[str, Any]) -> str:
    """Format lesson context for AI processing."""
    return f"""
LESSON CONTEXT:
- Title: {context.get('title', 'N/A')}
- Learning Objectives: {', '.join(context.get('learning_objectives', []))}
- Concepts Covered: {', '.join(context.get('concepts_covered', []))}
- Estimated Duration: {context.get('estimated_duration', 'N/A')} minutes
- Current Difficulty: {context.get('difficulty_rating', 'N/A')}/5
"""

def create_mock_challenge(current_challenge: Dict[str, Any], student: StudentProfile, difficulty: int):
    """Create mock challenge as fallback when AI generation fails."""
    from models.lesson_models import SimpleChallenge
    
    # Create difficulty-appropriate challenge
    if difficulty <= 2:
        problem = f"Hi {student.name}! Create a variable with your favorite color and print a message using it."
        starter = "# Create a variable for your favorite color\nfavorite_color = \"\"\n\n# Print a message using your variable\n"
        solution = "favorite_color = \"blue\"\nprint(f\"My favorite color is {favorite_color}!\")"
        hints = [
            "Remember to put quotes around text values",
            "Use f-strings with curly braces {} to include variables",
            "Don't forget the exclamation mark!"
        ]
    elif difficulty == 3:
        problem = f"Write a function that takes a name and age, then returns a personalized greeting message."
        starter = "def create_greeting(name, age):\n    # Your code here\n    pass\n\n# Test your function\nprint(create_greeting(\"Alex\", 12))"
        solution = "def create_greeting(name, age):\n    return f\"Hello {name}! You are {age} years old.\"\n\nprint(create_greeting(\"Alex\", 12))"
        hints = [
            "Use the return keyword to send back a value",
            "F-strings are great for combining text and variables",
            "Make sure to use both parameters in your message"
        ]
    else:  # difficulty >= 4
        problem = f"Create a function that takes a list of numbers and returns only the even numbers, then sort them."
        starter = "def filter_even_numbers(numbers):\n    # Your code here\n    pass\n\n# Test with this list\ntest_list = [5, 2, 8, 1, 9, 4]\nresult = filter_even_numbers(test_list)\nprint(result)"
        solution = "def filter_even_numbers(numbers):\n    even_nums = [num for num in numbers if num % 2 == 0]\n    return sorted(even_nums)\n\ntest_list = [5, 2, 8, 1, 9, 4]\nresult = filter_even_numbers(test_list)\nprint(result)"
        hints = [
            "Use the modulo operator % to check if a number is even",
            "List comprehensions can filter items efficiently",
            "The sorted() function can arrange numbers in order",
            "Even numbers have a remainder of 0 when divided by 2"
        ]
    
    return SimpleChallenge(
        problem_description=problem,
        starter_code=starter,
        solution_code=solution,
        hints=hints,
        explanation=f"This challenge helps you practice with variables, functions, and basic programming concepts at difficulty level {difficulty}."
    )

def main() -> None:
    """Run the FastAPI application with 
    
    uvicorn main:app --host 0.0.0.0 --port 8083

    """
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)

if __name__ == "__main__":
    main()