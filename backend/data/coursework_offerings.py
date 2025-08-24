"""
Pre-defined coursework offerings for different learning goals and time commitments.
These create flexible pathways through the lesson blueprints.
"""

from typing import List
from models.coursework_models import CourseworkBlueprint, CourseworkType

# ===== AGE GROUP 8-10 COURSEWORK OPTIONS =====

COURSEWORK_8_10: List[CourseworkBlueprint] = [
    # Full comprehensive curriculum
    CourseworkBlueprint(
        id="full_python_kids_8_10",
        title="Complete Python Adventure for Young Coders",
        description="The full 20-lesson journey from complete beginner to confident young programmer. Perfect for kids who want to become real Python coders!",
        type=CourseworkType.FULL_CURRICULUM,
        age_group="8-10",
        lesson_sequence=[
            "computational_thinking_intro_8_10", "variables_intro_8_10", "print_fun_8_10", 
            "emoji_patterns_8_10", "numbers_math_8_10", "user_input_8_10", "making_choices_8_10",
            "comparing_things_8_10", "collections_intro_8_10", "turtle_graphics_8_10",
            "guess_the_number_8_10", "milestone_assessment_1_8_10", "music_maker_8_10",
            "animation_basics_8_10", "pet_simulator_8_10", "story_generator_8_10",
            "kids_calculator_8_10", "debugging_detective_8_10", "showcase_portfolio_8_10",
            "graduation_celebration_8_10"
        ],
        total_lessons=20,
        estimated_hours={"min_hours": 8, "max_hours": 15},
        estimated_weeks={"min_weeks": 8, "max_weeks": 12},
        skill_level_start="beginner",
        skill_level_end="intermediate",
        learning_outcomes=[
            "Master fundamental Python programming concepts",
            "Build 5+ interactive games and creative projects",
            "Understand variables, loops, conditionals, and functions",
            "Create art, music, and stories with code",
            "Debug and solve programming problems independently",
            "Present a portfolio of programming projects"
        ],
        final_projects=[
            "Interactive turtle graphics art",
            "Number guessing game",
            "Music composition program", 
            "Virtual pet simulator",
            "Story generator",
            "Personal programming portfolio"
        ],
        has_milestones=True,
        allows_skipping=False,
        requires_sequence=True,
        tags=["comprehensive", "beginner_friendly", "creative", "long_term"]
    ),
    
    # Quick start option
    CourseworkBlueprint(
        id="python_quickstart_8_10",
        title="Python Quick Start for Kids",
        description="Essential Python basics in just 6 lessons! Perfect for kids who want to try programming and see if they like it.",
        type=CourseworkType.QUICK_START,
        age_group="8-10",
        lesson_sequence=[
            "computational_thinking_intro_8_10", "variables_intro_8_10", "print_fun_8_10",
            "emoji_patterns_8_10", "making_choices_8_10", "turtle_graphics_8_10"
        ],
        total_lessons=6,
        estimated_hours={"min_hours": 3, "max_hours": 5},
        estimated_weeks={"min_weeks": 2, "max_weeks": 3},
        skill_level_start="beginner",
        skill_level_end="beginner",
        learning_outcomes=[
            "Understand what programming is and why it's fun",
            "Learn variables and basic Python syntax", 
            "Create simple programs and art with code",
            "Make decisions with if statements",
            "Build confidence in coding abilities"
        ],
        final_projects=[
            "Emoji art patterns",
            "Simple turtle drawing"
        ],
        has_milestones=False,
        allows_skipping=True,
        requires_sequence=True,
        tags=["quick", "introduction", "trial", "confidence_building"]
    ),
    
    # Summer intensive
    CourseworkBlueprint(
        id="summer_coding_camp_8_10",
        title="Summer Coding Camp Adventure",
        description="2-week intensive summer program covering games, art, and creativity. Perfect for summer break!",
        type=CourseworkType.SUMMER_INTENSIVE,
        age_group="8-10",
        lesson_sequence=[
            "computational_thinking_intro_8_10", "variables_intro_8_10", "print_fun_8_10",
            "emoji_patterns_8_10", "numbers_math_8_10", "making_choices_8_10",
            "turtle_graphics_8_10", "guess_the_number_8_10", "music_maker_8_10",
            "animation_basics_8_10", "pet_simulator_8_10", "story_generator_8_10"
        ],
        total_lessons=12,
        estimated_hours={"min_hours": 6, "max_hours": 10},
        estimated_weeks={"min_weeks": 2, "max_weeks": 3},
        skill_level_start="beginner",
        skill_level_end="intermediate",
        learning_outcomes=[
            "Create multiple fun programming projects",
            "Learn core programming concepts through play",
            "Build games, art, music, and stories",
            "Develop problem-solving skills",
            "Gain confidence for continued learning"
        ],
        final_projects=[
            "Turtle art gallery",
            "Guessing game",
            "Music composition",
            "Virtual pet",
            "Story generator"
        ],
        has_milestones=True,
        allows_skipping=False,
        requires_sequence=True,
        tags=["intensive", "summer", "creative", "project_focused"]
    ),
    
    # Creative track
    CourseworkBlueprint(
        id="creative_coding_8_10",
        title="Creative Coding: Art, Music & Stories",
        description="Focus on the creative side of programming! Perfect for artistic kids who love making things.",
        type=CourseworkType.SPECIALTY_TRACK,
        age_group="8-10",
        lesson_sequence=[
            "variables_intro_8_10", "print_fun_8_10", "emoji_patterns_8_10",
            "turtle_graphics_8_10", "music_maker_8_10", "animation_basics_8_10",
            "story_generator_8_10", "showcase_portfolio_8_10"
        ],
        total_lessons=8,
        estimated_hours={"min_hours": 4, "max_hours": 7},
        estimated_weeks={"min_weeks": 3, "max_weeks": 5},
        skill_level_start="beginner",
        skill_level_end="intermediate",
        learning_outcomes=[
            "Use code as a creative medium",
            "Create digital art with programming",
            "Compose music with Python",
            "Generate stories and animations",
            "Build a creative portfolio"
        ],
        final_projects=[
            "Digital art gallery",
            "Original music compositions", 
            "Animated stories",
            "Creative coding portfolio"
        ],
        has_milestones=True,
        allows_skipping=True,
        requires_sequence=False,
        tags=["creative", "art", "music", "storytelling", "flexible"]
    )
]

# ===== AGE GROUP 11-13 COURSEWORK OPTIONS =====

COURSEWORK_11_13: List[CourseworkBlueprint] = [
    # Full curriculum
    CourseworkBlueprint(
        id="full_python_teens_11_13",
        title="Complete Python Programming Mastery",
        description="Comprehensive 25-lesson journey from basics to advanced programming, including games, web development, and AI basics.",
        type=CourseworkType.FULL_CURRICULUM,
        age_group="11-13",
        lesson_sequence=[
            "python_basics_11_13", "conditionals_intro_11_13", "loops_basics_11_13",
            "calculator_project_11_13", "functions_deep_dive_11_13", "string_manipulation_11_13",
            "lists_advanced_11_13", "dictionaries_intro_11_13", "error_handling_11_13",
            "file_operations_11_13", "pygame_intro_11_13", "pong_game_11_13", "snake_game_11_13",
            "quiz_app_11_13", "milestone_assessment_2_11_13", "web_scraping_basics_11_13",
            "api_basics_11_13", "data_visualization_11_13", "personal_website_11_13",
            "capstone_project_11_13", "oop_introduction_11_13", "ai_chatbot_11_13",
            "automation_scripts_11_13", "portfolio_showcase_11_13", "python_mastery_11_13"
        ],
        total_lessons=25,
        estimated_hours={"min_hours": 17, "max_hours": 31},
        estimated_weeks={"min_weeks": 12, "max_weeks": 20},
        skill_level_start="beginner",
        skill_level_end="advanced",
        learning_outcomes=[
            "Master intermediate to advanced Python programming",
            "Build real web applications and games",
            "Work with APIs and databases",
            "Create AI applications and chatbots",
            "Develop a professional GitHub portfolio",
            "Prepare for high school computer science"
        ],
        final_projects=[
            "Classic arcade games (Pong, Snake)",
            "Personal portfolio website",
            "AI chatbot application",
            "Data visualization dashboard",
            "Automation scripts",
            "Independent capstone project"
        ],
        has_milestones=True,
        allows_skipping=False,
        requires_sequence=True,
        tags=["comprehensive", "advanced", "professional", "career_prep"]
    ),
    
    # Game development track
    CourseworkBlueprint(
        id="game_dev_track_11_13",
        title="Python Game Development Bootcamp",
        description="Focus on creating awesome games with Python! Learn programming through game development.",
        type=CourseworkType.SPECIALTY_TRACK,
        age_group="11-13",
        lesson_sequence=[
            "python_basics_11_13", "conditionals_intro_11_13", "loops_basics_11_13",
            "functions_deep_dive_11_13", "lists_advanced_11_13", "pygame_intro_11_13",
            "pong_game_11_13", "snake_game_11_13", "quiz_app_11_13", "capstone_project_11_13"
        ],
        total_lessons=10,
        estimated_hours={"min_hours": 8, "max_hours": 15},
        estimated_weeks={"min_weeks": 5, "max_weeks": 8},
        skill_level_start="beginner",
        skill_level_end="intermediate",
        learning_outcomes=[
            "Master Python through game development",
            "Understand game programming concepts",
            "Create classic arcade games",
            "Learn graphics and animation",
            "Build a game portfolio"
        ],
        final_projects=[
            "Pong game with AI opponent",
            "Snake game with high scores",
            "Original game creation"
        ],
        has_milestones=True,
        allows_skipping=False,
        requires_sequence=True,
        tags=["games", "pygame", "graphics", "entertainment", "engaging"]
    ),
    
    # Web development track
    CourseworkBlueprint(
        id="web_dev_track_11_13", 
        title="Web Development with Python",
        description="Learn to build websites and web applications! Perfect for kids interested in web development.",
        type=CourseworkType.SPECIALTY_TRACK,
        age_group="11-13",
        lesson_sequence=[
            "python_basics_11_13", "functions_deep_dive_11_13", "dictionaries_intro_11_13",
            "file_operations_11_13", "web_scraping_basics_11_13", "api_basics_11_13",
            "data_visualization_11_13", "personal_website_11_13", "portfolio_showcase_11_13"
        ],
        total_lessons=9,
        estimated_hours={"min_hours": 7, "max_hours": 12},
        estimated_weeks={"min_weeks": 4, "max_weeks": 7},
        skill_level_start="beginner",
        skill_level_end="intermediate",
        learning_outcomes=[
            "Build real websites with Python",
            "Work with web APIs and data",
            "Create data visualizations",
            "Understand web development concepts",
            "Deploy projects online"
        ],
        final_projects=[
            "Personal portfolio website",
            "Data visualization dashboard",
            "API-powered web application"
        ],
        has_milestones=True,
        allows_skipping=True,
        requires_sequence=True,
        tags=["web", "apis", "data", "visualization", "practical"]
    )
]

# ===== AGE GROUP 14-16 COURSEWORK OPTIONS =====

COURSEWORK_14_16: List[CourseworkBlueprint] = [
    # Full computer science curriculum
    CourseworkBlueprint(
        id="computer_science_diploma_14_16",
        title="Computer Science Mastery Diploma",
        description="Complete 30-lesson computer science education covering algorithms, web development, AI, and career preparation. College and industry ready!",
        type=CourseworkType.FULL_CURRICULUM,
        age_group="14-16",
        lesson_sequence=[
            "data_structures_intro_14_16", "file_handling_14_16", "oop_basics_14_16",
            "web_scraper_project_14_16", "assessment_comprehensive_14_16", "algorithms_analysis_14_16",
            "advanced_oop_14_16", "data_structures_advanced_14_16", "database_integration_14_16",
            "testing_debugging_14_16", "flask_advanced_14_16", "rest_api_development_14_16",
            "microservices_intro_14_16", "cloud_deployment_14_16", "milestone_assessment_3_14_16",
            "data_science_fundamentals_14_16", "machine_learning_intro_14_16", "deep_learning_basics_14_16",
            "computer_vision_14_16", "nlp_project_14_16", "cybersecurity_basics_14_16",
            "blockchain_crypto_14_16", "mobile_app_backend_14_16", "performance_optimization_14_16",
            "open_source_contribution_14_16", "startup_mvp_14_16", "technical_interview_prep_14_16",
            "industry_mentorship_14_16", "final_capstone_14_16", "computer_science_mastery_14_16"
        ],
        total_lessons=30,
        estimated_hours={"min_hours": 35, "max_hours": 60},
        estimated_weeks={"min_weeks": 20, "max_weeks": 40},
        skill_level_start="intermediate",
        skill_level_end="advanced",
        learning_outcomes=[
            "Master advanced computer science concepts",
            "Build industry-level applications",
            "Understand AI and machine learning",
            "Develop professional software engineering skills",
            "Prepare for college computer science programs",
            "Build a portfolio for internships and jobs",
            "Network with industry professionals"
        ],
        final_projects=[
            "Full-stack web application",
            "Machine learning project",
            "Computer vision application",
            "Startup MVP",
            "Senior research capstone",
            "Professional portfolio"
        ],
        has_milestones=True,
        allows_skipping=False,
        requires_sequence=True,
        is_free=False,
        price_usd=299.99,
        tags=["comprehensive", "professional", "college_prep", "premium", "career_ready"]
    ),
    
    # AI/ML specialization
    CourseworkBlueprint(
        id="ai_ml_specialization_14_16",
        title="Artificial Intelligence & Machine Learning Track",
        description="Specialized track focusing on AI, machine learning, and data science. Perfect for future AI engineers!",
        type=CourseworkType.SPECIALTY_TRACK,
        age_group="14-16",
        lesson_sequence=[
            "data_structures_intro_14_16", "algorithms_analysis_14_16", "database_integration_14_16",
            "data_science_fundamentals_14_16", "machine_learning_intro_14_16", "deep_learning_basics_14_16",
            "computer_vision_14_16", "nlp_project_14_16", "final_capstone_14_16"
        ],
        total_lessons=9,
        estimated_hours={"min_hours": 12, "max_hours": 20},
        estimated_weeks={"min_weeks": 6, "max_weeks": 10},
        skill_level_start="intermediate",
        skill_level_end="advanced",
        learning_outcomes=[
            "Master machine learning algorithms",
            "Build AI applications",
            "Work with neural networks",
            "Create computer vision projects",
            "Understand natural language processing",
            "Develop data science skills"
        ],
        final_projects=[
            "Image classification system",
            "Natural language chatbot", 
            "Data analysis dashboard",
            "AI research project"
        ],
        has_milestones=True,
        allows_skipping=False,
        requires_sequence=True,
        is_free=False,
        price_usd=199.99,
        tags=["ai", "machine_learning", "data_science", "advanced", "premium"]
    ),
    
    # Software engineering track
    CourseworkBlueprint(
        id="software_engineering_14_16",
        title="Software Engineering Professional Track", 
        description="Industry-focused track covering professional software development, from algorithms to deployment.",
        type=CourseworkType.SPECIALTY_TRACK,
        age_group="14-16",
        lesson_sequence=[
            "algorithms_analysis_14_16", "advanced_oop_14_16", "data_structures_advanced_14_16",
            "testing_debugging_14_16", "flask_advanced_14_16", "rest_api_development_14_16",
            "microservices_intro_14_16", "cloud_deployment_14_16", "performance_optimization_14_16",
            "open_source_contribution_14_16", "technical_interview_prep_14_16", "startup_mvp_14_16"
        ],
        total_lessons=12,
        estimated_hours={"min_hours": 15, "max_hours": 25},
        estimated_weeks={"min_weeks": 8, "max_weeks": 12},
        skill_level_start="intermediate", 
        skill_level_end="advanced",
        learning_outcomes=[
            "Master professional development practices",
            "Build scalable web applications",
            "Understand software architecture",
            "Learn DevOps and deployment",
            "Prepare for technical interviews",
            "Contribute to open source projects"
        ],
        final_projects=[
            "Microservices application",
            "Cloud-deployed web app",
            "Open source contribution",
            "Startup MVP"
        ],
        has_milestones=True,
        allows_skipping=False,
        requires_sequence=True,
        is_free=False,
        price_usd=249.99,
        tags=["software_engineering", "professional", "industry", "premium", "career_ready"]
    )
]

# Combined coursework by age group
ALL_COURSEWORK = {
    "8-10": COURSEWORK_8_10,
    "11-13": COURSEWORK_11_13,
    "14-16": COURSEWORK_14_16
}

# Helper functions
def get_coursework_for_age(age_group: str) -> List[CourseworkBlueprint]:
    """Get all coursework options for a specific age group"""
    return ALL_COURSEWORK.get(age_group, [])

def get_coursework_by_id(coursework_id: str) -> CourseworkBlueprint:
    """Get a specific coursework by ID"""
    for age_group, coursework_list in ALL_COURSEWORK.items():
        for coursework in coursework_list:
            if coursework.id == coursework_id:
                return coursework
    raise ValueError(f"Coursework with ID '{coursework_id}' not found")

def get_coursework_by_type(age_group: str, coursework_type: CourseworkType) -> List[CourseworkBlueprint]:
    """Get coursework options by type for an age group"""
    coursework_list = get_coursework_for_age(age_group)
    return [cw for cw in coursework_list if cw.type == coursework_type]
