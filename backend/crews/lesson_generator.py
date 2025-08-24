"""
CrewAI crew for generating personalized Python lesson content.
This crew takes lesson blueprints and student preferences to create tailored educational content.
"""

from crewai import Agent, Task, Crew, Process
from llms import llama_70b, llama_scout, llama_maverick
from models.lesson_models import LessonContent, LessonBlueprint

# Python Education Specialist Agent
python_tutor = Agent(
    role="Expert Python Programming Tutor & Educational Content Creator",
    goal="Generate engaging, age-appropriate, and personalized Python programming lessons that make coding fun and accessible for kids.",
    backstory="""You are a passionate Python programming educator with 10+ years of experience teaching coding to children and teenagers. 
    You understand developmental psychology and how kids learn best at different ages. You excel at:
    
    - Breaking down complex programming concepts into digestible, age-appropriate explanations
    - Creating engaging, interactive coding challenges that feel like games
    - Using storytelling, analogies, and real-world examples that connect with kids' interests
    - Adapting your teaching style to visual, auditory, and kinesthetic learners
    - Building confidence through encouraging feedback and celebrating small wins
    - Making coding feel magical and empowering rather than intimidating
    
    You always personalize content using the student's name, interests, and experience level to create meaningful connections.""",
    llm=llama_70b,
    function_calling_llm=llama_maverick,
    verbose=True,
    allow_delegation=False,
)

# Content Adaptation Specialist Agent  
content_adapter = Agent(
    role="Educational Content Adaptation Specialist",
    goal="Ensure lesson content perfectly matches the student's age group, learning style, and technical experience level.",
    backstory="""You are an expert in educational psychology and adaptive learning systems. You specialize in:
    
    - Age-appropriate language and complexity adjustment (8-10: simple & visual, 11-13: transitional, 14-16: advanced)
    - Learning style adaptation (visual learners need diagrams, kinesthetic learners need hands-on activities)
    - Difficulty scaling based on prior programming experience
    - Cultural sensitivity and inclusive language
    - Attention span considerations for different age groups
    - Motivation techniques that work for each developmental stage
    
    You review and refine educational content to ensure it's perfectly tailored to the individual learner.""",
    llm=llama_scout,
    function_calling_llm=llama_maverick,
    verbose=True,
    allow_delegation=False,
)

# Main lesson generation task
generate_lesson_task = Task(
    description="""Create a comprehensive, personalized Python lesson based on the lesson blueprint and student profile.

    LESSON BLUEPRINT: {lesson_blueprint}
    STUDENT PROFILE: {student_profile}
    
    REQUIREMENTS:
    1. **Personalization**: Use the student's name, age, interests, and learning preferences throughout
    2. **Age-Appropriate Content**: Match language complexity and concepts to the student's age group
    3. **Learning Style Adaptation**: Adapt content for visual/text/mixed learning preferences
    4. **Interactive Elements**: Include hands-on coding activities, not just theory
    5. **Encouragement**: Provide positive, motivating feedback that builds confidence
    6. **Real-World Connections**: Connect coding concepts to the student's interests and hobbies
    7. **Progressive Difficulty**: Ensure content matches the student's experience level
    8. **Clear Learning Path**: Show how this lesson connects to their overall Python journey
    
    CONTENT STRUCTURE:
    - **Title**: Exciting, personalized lesson title with student's name
    - **Learning Objectives**: Clear, achievable goals for this lesson
    - **Introduction**: Engaging hook that connects to student's interests
    - **Main Content**: Age-appropriate explanation with examples
    - **Interactive Component**: Hands-on coding activity (challenge/tutorial/project/assessment)
    - **Encouragement**: Personalized motivational message
    - **Next Steps**: Preview of what comes next in their learning journey
    
    QUALITY STANDARDS:
    - Content must be technically accurate and follow Python best practices
    - Explanations should build on concepts the student already knows
    - Code examples must be runnable and tested
    - Language should be encouraging, never condescending
    - Activities should be challenging but achievable""",
    
    expected_output="""A complete LessonContent object containing:
    - Personalized title incorporating student's name and interests
    - Clear learning objectives tailored to the lesson blueprint concepts
    - Engaging introduction that hooks the student's attention
    - Age-appropriate explanation of Python concepts
    - Interactive content (challenge/tutorial/project/assessment) with:
      * Starter code and solution code (for challenges)
      * Step-by-step instructions (for tutorials) 
      * Project milestones and success criteria (for projects)
      * Questions and rubrics (for assessments)
    - Encouraging feedback using the student's name and interests
    - Clear next steps in their learning journey
    - Accurate metadata (duration, difficulty, concepts covered)""",
    
    agent=python_tutor,
    output_pydantic=LessonContent,  # Ensures structured output matching our model
)

# Content review and adaptation task
adapt_content_task = Task(
    description="""Review and refine the generated lesson content to ensure it perfectly matches the student's profile and learning needs.

    STUDENT PROFILE: {student_profile}
    GENERATED CONTENT: Use the output from the previous task
    
    ADAPTATION CHECKLIST:
    1. **Age Appropriateness**: Verify language complexity matches age group
       - Ages 8-10: Simple vocabulary, short sentences, lots of analogies
       - Ages 11-13: Moderate complexity, technical terms with explanations
       - Ages 14-16: Advanced vocabulary, professional programming terminology
    
    2. **Learning Style Optimization**: 
       - Visual learners: Add more analogies, mental models, "imagine" statements
       - Text learners: Include more detailed explanations, step-by-step breakdowns
       - Mixed learners: Balance visual and textual elements
    
    3. **Experience Level Calibration**:
       - Beginner: Extra explanation, more hints, simpler examples
       - Some experience: Build on prior knowledge, moderate challenges
       - Advanced: Complex examples, real-world applications, fewer hints
    
    4. **Interest Integration**: Ensure examples and analogies connect to student's hobbies
    5. **Motivation Enhancement**: Add encouraging language and celebrate progress
    6. **Technical Accuracy**: Verify all code examples are correct and runnable
    
    Make any necessary adjustments to optimize the content for this specific student.""",
    
    expected_output="""The refined LessonContent with optimized:
    - Language complexity appropriate for the student's age and experience
    - Learning style adaptations (visual analogies, detailed explanations, etc.)
    - Interest-based examples and connections
    - Appropriate level of challenge and support
    - Encouraging, confidence-building tone throughout
    - Technically accurate and tested code examples""",
    
    agent=content_adapter,
    context=[generate_lesson_task],  # Uses output from the lesson generation task
    output_pydantic=LessonContent,
)

# CrewAI crew for lesson generation
lesson_generator_crew = Crew(
    agents=[python_tutor, content_adapter],
    tasks=[generate_lesson_task, adapt_content_task],
    verbose=True,
    process=Process.sequential,  # Tasks run in order
)

def main():
    """Entry point for testing the lesson generation crew."""
    # Example blueprint and student profile for testing
    test_blueprint = """
    LESSON BLUEPRINT:
    ID: variables_intro_8_10
    Title: Magic Boxes (Variables)
    Type: challenge
    Age Group: 8-10
    Skill Level: beginner
    Concepts: ["variables", "assignment", "naming"]
    Complexity Level: 1/5
    Prerequisites: ["computational_thinking_intro_8_10"]
    """
    
    test_student_profile = """
    STUDENT PROFILE:
    Name: Alice
    Age: 9 years old
    Experience Level: beginner (never coded before)
    Learning Style: visual
    Interests: ["games", "art", "animals", "music"]
    
    PERSONALIZATION PREFERENCES:
    - Use student's name throughout content
    - Connect coding concepts to her interests in games and art
    - Use simple, encouraging language
    - Include visual analogies and metaphors
    - Make coding feel like creative play
    """
    
    try:
        result = lesson_generator_crew.kickoff(inputs={
            "lesson_blueprint": test_blueprint,
            "student_profile": test_student_profile
        })
        
        # Access the structured output
        if hasattr(result, 'pydantic') and result.pydantic:
            lesson_content = result.pydantic
            print("✅ Personalized lesson content generated successfully!")
            print(f"Title: {lesson_content.title}")
            print(f"Learning Objectives: {len(lesson_content.learning_objectives)} objectives")
            print(f"Content Type: {'Challenge' if lesson_content.challenge else 'Tutorial' if lesson_content.tutorial else 'Other'}")
            print(f"Estimated Duration: {lesson_content.estimated_duration} minutes")
            print(f"Difficulty: {lesson_content.difficulty_rating}/5")
            print(f"Concepts: {', '.join(lesson_content.concepts_covered)}")
        else:
            print("❌ No structured output received")
            print("Raw output:", result)
            
    except Exception as e:
        print(f"❌ Error generating lesson: {str(e)}")


if __name__ == "__main__":
    main()
