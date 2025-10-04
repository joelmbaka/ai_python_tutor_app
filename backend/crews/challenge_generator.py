"""
CrewAI crew for generating new coding challenges based on current lesson context.
This crew takes current lesson/challenge details and generates fresh challenges with specified difficulty.
"""

from crewai import Agent, Task, Crew, Process
from llms import llama_70b, llama_scout, llama_maverick
from models.lesson_models import SimpleChallenge

# Single Challenge Generator Agent
challenge_generator = Agent(
    role="Challenge Generator",
    goal="Generate complete, engaging coding challenges that build on existing lesson concepts with specified difficulty.",
    backstory="""Expert coding challenge designer. Create new problem variations that reinforce core concepts, scale difficulty (1-5), ensure age-appropriateness, and provide proper starter code, solutions, and progressive hints.""",
    llm=llama_70b,
    verbose=True,
    allow_delegation=False,
)

# Single challenge generation task
generate_challenge_task = Task(
    description="""Generate a new coding challenge with specified difficulty {difficulty}/5.

    CONTEXT: {lesson_context}
    CURRENT: {current_challenge}
    PROFILE: {student_profile}

    Create NEW challenge teaching same concepts but different problem. Match difficulty, ensure age-appropriate, include starter code, solution, progressive hints, and explanation. Validate all code syntax.
    """,

    expected_output="""SimpleChallenge object with problem_description, starter_code, solution_code, hints (3-4), and explanation.""",

    agent=challenge_generator,
    output_pydantic=SimpleChallenge,
)

# CrewAI crew for new challenge generation (single agent/task for speed)
challenge_generator_crew = Crew(
    agents=[challenge_generator],
    tasks=[generate_challenge_task],
    verbose=True,
    process=Process.sequential,
)
