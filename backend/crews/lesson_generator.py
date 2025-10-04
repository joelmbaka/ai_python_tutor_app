"""
CrewAI crew for generating personalized Python lesson content.
This crew takes lesson blueprints and student preferences to create tailored educational content.
"""

from crewai import Agent, Task, Crew, Process
from llms import llama_70b, llama_scout, llama_maverick
from models import LearnContent, LearnChallengeContent, LessonContent, LessonBlueprint

# Python Education Specialist Agent
python_tutor = Agent(
    role="Python Lesson Writer",
    goal="Write engaging, age-appropriate Learn tab content personalized for the student.",
    backstory="""You are a passionate Python programming educator with 10+ years of experience teaching coding to children and teenagers. 
    You understand developmental psychology and how kids learn best at different ages. You excel at:
    
    - Breaking down complex programming concepts into digestible, age-appropriate explanations
    - Creating engaging, interactive coding challenges that feel like games
    - Using storytelling, analogies, and real-world examples that connect with kids' lives
    - Adapting your teaching approach to different learning preferences and engagement styles
    - Building confidence through encouraging feedback and celebrating small wins
    - Making coding feel magical and empowering rather than intimidating
    
    You always personalize content using the student's name, age, and interests to create meaningful connections.""",
    llm=llama_70b,
    verbose=True,
    allow_delegation=False,
)

# Code Challenge Generator Agent
code_challenge_generator = Agent(
    role="Challenge Designer",
    goal="Design a simple, runnable coding challenge with hints and a revealable solution (no test cases).",
    backstory="""You are a senior software engineer and educational technologist who specializes in creating coding challenges for students. You excel at:
    
    - Designing progressive coding challenges that build skills step-by-step
    - Writing starter code that provides scaffolding without giving away solutions
    - Generating multiple solution approaches for different skill levels
    - Creating meaningful error messages and hints that guide students toward solutions
    - Ensuring code challenges are executable and educationally sound
    
    You understand that good challenges teach concepts through practice, not just memorization.""",
    llm=llama_70b,
    verbose=True,
    allow_delegation=False,
)

# Content Adaptation Specialist Agent  
content_adapter = Agent(
    role="Content Refiner",
    goal="Refine and finalize content to the student's profile and blueprint, delivering the final LessonContent.",
    backstory="""You are an expert in educational psychology and adaptive learning systems. You specialize in:
    
    - Age-appropriate language and complexity adjustment (8-10: simple & engaging, 11-13: transitional, 14-16: advanced)
    - Content adaptation for different engagement preferences and learning approaches
    - Difficulty scaling based on age and prior progress
    - Cultural sensitivity and inclusive language
    - Attention span considerations for different age groups
    - Motivation techniques that work for each developmental stage
    
    You review and refine educational content to ensure it's perfectly tailored to the individual learner.""",
    llm=llama_70b,
    verbose=True,
    allow_delegation=False,
)

# Stage 1: Learn tab content only
draft_learn_content_task = Task(
    description="""Produce only the Learn tab content (no interactive content yet) based on the lesson blueprint and student profile.

    LESSON BLUEPRINT: {lesson_blueprint}
    STUDENT PROFILE: {student_profile}

    REQUIREMENTS:
    - Personalize by name, age, and interests
    - Match language complexity to age
    - Provide encouragement and clear next steps
    - Include estimated duration, difficulty rating, and concepts covered
    """,

    expected_output="""A LearnContent object containing:
    - title
    - learning_objectives
    - introduction
    - explanation
    - encouragement
    - next_steps
    - estimated_duration (minutes)
    - difficulty_rating (1-5)
    - concepts_covered
    """,

    agent=python_tutor,
    output_pydantic=LearnContent,
)

# Stage 2: Add a SimpleChallenge (Code tab)
add_challenge_task = Task(
    description="""Add a SimpleChallenge to the Learn content based on the student profile. Do NOT add exercises yet.

    INPUT: Use output from the previous task
    STUDENT PROFILE: {student_profile}

    REQUIREMENTS:
    - No test cases; focus on learning (starter_code, solution_code, hints, explanation)
    - Starter and solution code must run
    - Provide progressive, educational hints
    - Keep difficulty appropriate for the student's level
    """,

    expected_output="""A LearnChallengeContent object containing all LearnContent fields plus:
    - challenge: { problem_description, starter_code, solution_code, hints[], explanation }
    """,

    agent=code_challenge_generator,
    context=[draft_learn_content_task],
    output_pydantic=LearnChallengeContent,
)

# Stage 3: Finalize full LessonContent (challenge with optional exercises)
finalize_lesson_task = Task(
    description="""Refine and finalize content to produce the final LessonContent.

    STUDENT PROFILE: {student_profile}
    INPUTS: Use outputs from the previous tasks

    CHECKLIST:
    - Age-appropriate language and difficulty
    - Align content to student's interests and engagement preferences
    - Ensure the 'challenge' field is populated and runnable
    - Do NOT include tutorial, project, or assessment content
    - Add 2-3 open-ended Exercises for practice when appropriate
    - Verify code examples are correct and runnable
    """,

    expected_output="""A final LessonContent object containing:
    - All LearnContent fields
    - Exactly: challenge
    - Exercises[] (list of 2-3 practice exercises)
    - Polished explanation, encouragement, next_steps, metadata
    """,

    agent=content_adapter,
    context=[draft_learn_content_task, add_challenge_task],
    output_pydantic=LessonContent,
)

# CrewAI crew for lesson generation
lesson_generator_crew = Crew(
    agents=[python_tutor, code_challenge_generator, content_adapter],
    tasks=[draft_learn_content_task, add_challenge_task, finalize_lesson_task],
    verbose=True,
    process=Process.sequential,  # Tasks run in order
)
