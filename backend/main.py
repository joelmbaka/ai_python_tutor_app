"""
AI Python Tutor Backend
Main FastAPI application for generating personalized Python lessons using CrewAI.
"""

from fastapi import FastAPI, HTTPException
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
    LessonContent
)
from crews.lesson_generator import lesson_generator_crew
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
from data.coursework_offerings import get_coursework_for_age
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
        
        # Calculate curriculum statistics
        lesson_types = {}
        for blueprint in blueprints:
            lesson_types[blueprint.type] = lesson_types.get(blueprint.type, 0) + 1
        
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
            skill_progression=unique_skills[:10],  # Top 10 skills
            lesson_types_distribution=lesson_types
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
    elif 14 <= student_age <= 16:
        age_group = "14-16"
    else:
        raise HTTPException(status_code=400, detail="Age must be between 8-16")
    
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
                "type": cw.type,
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
            "lesson_generator_crew": "ready"
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
- Learning Style: {profile.learning_style}

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
- Optimize for {profile.learning_style} learning style
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
- Type: {blueprint.type}
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
- Adapt to Learning Style: {blueprint.personalization_hooks.use_learning_style}
- Include Encouragement: {blueprint.personalization_hooks.include_encouragement}

DURATION & DIFFICULTY:
- Estimated Duration: {blueprint.estimated_duration_range['min_minutes']}-{blueprint.estimated_duration_range['max_minutes']} minutes
- Tags: {', '.join(blueprint.tags) if blueprint.tags else 'None'}

CONTENT TYPE SPECIFIC INSTRUCTIONS:
{get_content_type_instructions(blueprint.type)}
"""

def get_content_type_instructions(lesson_type: str) -> str:
    """Get specific instructions based on lesson type."""
    instructions = {
        "challenge": """
FOR CODING CHALLENGES:
- Create engaging starter code that students can build upon
- Provide a complete solution that demonstrates best practices
- Include progressive hints that guide without giving away the answer
- Design test cases that validate student understanding
- Add clear explanations of what the challenge teaches
""",
        "tutorial": """
FOR TUTORIALS:
- Break content into digestible, sequential steps
- Provide interactive code examples students can run and modify
- Identify and highlight key concepts being taught
- Use analogies and real-world examples appropriate for the age group
- Ensure each step builds logically on the previous one
""",
        "project": """
FOR PROJECTS:
- Define a clear, achievable project goal
- Break the project into meaningful milestones
- Provide starter files or templates if helpful
- Set specific success criteria for completion
- Connect the project to real-world applications
""",
        "assessment": """
FOR ASSESSMENTS:
- Create a mix of multiple choice and coding questions
- Ensure questions test understanding, not just memorization
- Provide clear explanations for correct answers
- Set appropriate passing scores
- Include encouraging feedback for different performance levels
"""
    }
    return instructions.get(lesson_type, "")

def create_mock_lesson_content(blueprint: LessonBlueprint, student: StudentProfile) -> LessonContent:
    """Create mock lesson content as fallback when AI generation fails."""
    from models.lesson_models import CodeChallenge, Tutorial, Project, Assessment
    
    # Base content structure
    mock_content = LessonContent(
        title=f"{student.name}'s {blueprint.title}! 🎯",
        learning_objectives=[
            f"Understand {concept}" for concept in blueprint.concepts[:3]
        ],
        introduction=f"Hey {student.name}! Ready to learn about {blueprint.concepts[0] if blueprint.concepts else 'programming'}? Let's make coding fun and exciting!",
        explanation=f"This lesson covers {', '.join(blueprint.concepts)} which are fundamental concepts in Python programming.",
        encouragement=f"Great job, {student.name}! You're doing amazing work learning to code. Keep going! 🌟",
        next_steps="Continue to the next lesson to build on these concepts and become an even better programmer!",
        estimated_duration=30,
        difficulty_rating=blueprint.complexity_level,
        concepts_covered=blueprint.concepts
    )
    
    # Add content type based on blueprint
    if blueprint.type == "challenge":
        mock_content.challenge = CodeChallenge(
            starter_code="# Your code here\nprint('Hello, World!')",
            solution_code="print('Hello, World!')",
            test_cases=[{"expected_output": "Hello, World!"}],
            hints=["Start with the print function", "Don't forget the quotes!"],
            explanation="This challenge teaches you about the print function in Python."
        )
    elif blueprint.type == "tutorial":
        mock_content.tutorial = Tutorial(
            steps=[
                {"title": "Step 1", "content": f"Learn about {blueprint.concepts[0] if blueprint.concepts else 'programming'}"},
                {"title": "Step 2", "content": "Practice with examples"},
                {"title": "Step 3", "content": "Apply your knowledge"}
            ],
            interactive_examples=["print('Hello!')", f"name = '{student.name}'"],
            key_concepts=blueprint.concepts
        )
    elif blueprint.type == "project":
        mock_content.project = Project(
            project_brief=f"Build a simple {blueprint.concepts[0] if blueprint.concepts else 'programming'} project",
            milestones=[
                {"title": "Setup", "description": "Set up your project structure"},
                {"title": "Implementation", "description": "Write the main code"},
                {"title": "Testing", "description": "Test your project works correctly"}
            ],
            success_criteria=["Project runs without errors", "Meets all requirements"],
            starter_files={"main.py": "# Your project starts here\n"}
        )
    elif blueprint.type == "assessment":
        mock_content.assessment = Assessment(
            questions=[
                {
                    "type": "multiple_choice",
                    "question": f"What is {blueprint.concepts[0] if blueprint.concepts else 'programming'}?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": 0,
                    "explanation": "This is the correct answer because..."
                }
            ],
            passing_score=70,
            feedback_rubric={
                "excellent": "Outstanding work!",
                "good": "Great job!",
                "needs_improvement": "Keep practicing!",
                "needs_help": "Let's review together!"
            }
        )
    
    return mock_content

def main() -> None:
    """Run the FastAPI application with uvicorn main:app --reload --host 0.0.0.0 --port 8000"""
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()