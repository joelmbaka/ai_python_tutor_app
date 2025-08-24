"""
Sample lesson blueprints for different age groups and skill levels.
These define the curriculum structure that AI will use to generate personalized content.
"""

from typing import List
from models.lesson_models import LessonBlueprint, PersonalizationHooks, ContentRequirements

# Age Group 8-10: Visual & Block Programming Foundation
BLUEPRINTS_8_10: List[LessonBlueprint] = [
    LessonBlueprint(
        id="computational_thinking_intro_8_10",
        title="Thinking Like a Computer",
        type="tutorial",
        age_group="8-10",
        skill_level="beginner",
        prerequisites=[],
        concepts=["sequences", "patterns", "problem_solving"],
        complexity_level=1,
        position_in_curriculum=1,
        personalization_hooks=PersonalizationHooks(
            use_learning_style=True,
            include_encouragement=True,
            use_interests=True
        ),
        content_requirements=ContentRequirements(
            language_complexity="simple",
            include_emojis=True,
            max_code_lines=3,
            min_examples=2,
            max_examples=3
        ),
        tags=["computational_thinking", "beginner", "foundation"]
    ),
    
    LessonBlueprint(
        id="variables_intro_8_10",
        title="Magic Boxes (Variables)",
        type="challenge",
        age_group="8-10", 
        skill_level="beginner",
        prerequisites=["computational_thinking_intro_8_10"],
        concepts=["variables", "assignment", "naming"],
        complexity_level=1,
        position_in_curriculum=2,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=2,
            min_examples=3,
            interactive_elements=True
        ),
        tags=["variables", "basics", "interactive"]
    ),
    
    LessonBlueprint(
        id="print_fun_8_10",
        title="Making Python Talk",
        type="challenge",
        age_group="8-10",
        skill_level="beginner", 
        prerequisites=["variables_intro_8_10"],
        concepts=["print_function", "output", "strings"],
        complexity_level=1,
        position_in_curriculum=3,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=1,
            min_examples=4,
            include_emojis=True
        ),
        tags=["print", "output", "fun"]
    ),
    
    LessonBlueprint(
        id="emoji_patterns_8_10",
        title="Create Art with Code",
        type="project",
        age_group="8-10",
        skill_level="beginner",
        prerequisites=["print_fun_8_10"],
        concepts=["loops", "patterns", "repetition", "creativity"],
        complexity_level=2,
        position_in_curriculum=4,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=5,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["art", "loops", "creative", "patterns"]
    ),
    
    # Foundation Phase Expansion (Lessons 5-6)
    LessonBlueprint(
        id="numbers_math_8_10",
        title="Number Magic: Math with Python",
        type="challenge",
        age_group="8-10",
        skill_level="beginner",
        prerequisites=["emoji_patterns_8_10"],
        concepts=["numbers", "arithmetic", "math_operations", "integers"],
        complexity_level=1,
        position_in_curriculum=5,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=3,
            min_examples=4,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["math", "numbers", "arithmetic", "basics"]
    ),
    
    LessonBlueprint(
        id="user_input_8_10",
        title="Talking to Your Computer",
        type="tutorial",
        age_group="8-10",
        skill_level="beginner",
        prerequisites=["numbers_math_8_10"],
        concepts=["input_function", "user_interaction", "input_output"],
        complexity_level=2,
        position_in_curriculum=6,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=4,
            min_examples=3,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["input", "interaction", "communication"]
    ),
    
    # Logic Phase (Lessons 7-12)
    LessonBlueprint(
        id="making_choices_8_10",
        title="Teaching Your Computer to Choose",
        type="challenge",
        age_group="8-10",
        skill_level="beginner",
        prerequisites=["user_input_8_10"],
        concepts=["conditionals", "if_statements", "decision_making"],
        complexity_level=2,
        position_in_curriculum=7,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=5,
            min_examples=3,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["conditionals", "logic", "decisions"]
    ),
    
    LessonBlueprint(
        id="comparing_things_8_10",
        title="Which is Bigger? Comparing with Code",
        type="tutorial",
        age_group="8-10",
        skill_level="beginner",
        prerequisites=["making_choices_8_10"],
        concepts=["comparison_operators", "greater_than", "less_than", "equal"],
        complexity_level=2,
        position_in_curriculum=8,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=4,
            min_examples=4,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["comparisons", "operators", "logic"]
    ),
    
    LessonBlueprint(
        id="collections_intro_8_10",
        title="Treasure Chests: Storing Many Things",
        type="challenge",
        age_group="8-10",
        skill_level="beginner",
        prerequisites=["comparing_things_8_10"],
        concepts=["lists", "collections", "indexing", "append"],
        complexity_level=2,
        position_in_curriculum=9,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=5,
            min_examples=3,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["lists", "collections", "data_structures"]
    ),
    
    LessonBlueprint(
        id="turtle_graphics_8_10",
        title="Drawing Pictures with Code",
        type="project",
        age_group="8-10",
        skill_level="beginner",
        prerequisites=["collections_intro_8_10"],
        concepts=["turtle_graphics", "drawing", "coordinates", "loops"],
        complexity_level=2,
        position_in_curriculum=10,
        estimated_duration_range={"min_minutes": 30, "max_minutes": 45},
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=8,
            min_examples=2,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["graphics", "art", "turtle", "visual"]
    ),
    
    LessonBlueprint(
        id="guess_the_number_8_10",
        title="Build Your First Game",
        type="project",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["turtle_graphics_8_10"],
        concepts=["random_numbers", "while_loops", "game_logic", "user_interaction"],
        complexity_level=3,
        position_in_curriculum=11,
        estimated_duration_range={"min_minutes": 40, "max_minutes": 60},
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=10,
            min_examples=2,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["games", "random", "loops", "project"]
    ),
    
    LessonBlueprint(
        id="milestone_assessment_1_8_10",
        title="Show What You Know: Mid-Course Challenge",
        type="assessment",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["guess_the_number_8_10"],
        concepts=["review", "variables", "input", "conditionals", "loops"],
        complexity_level=2,
        position_in_curriculum=12,
        estimated_duration_range={"min_minutes": 25, "max_minutes": 40},
        content_requirements=ContentRequirements(
            language_complexity="simple",
            include_emojis=True,
            interactive_elements=True
        ),
        tags=["assessment", "review", "milestone"]
    ),
    
    # Creative Phase (Lessons 13-18)
    LessonBlueprint(
        id="music_maker_8_10",
        title="Making Music with Code",
        type="project",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["milestone_assessment_1_8_10"],
        concepts=["sound", "music", "loops", "lists", "timing"],
        complexity_level=3,
        position_in_curriculum=13,
        estimated_duration_range={"min_minutes": 35, "max_minutes": 50},
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=12,
            min_examples=2,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["music", "sound", "creative", "project"]
    ),
    
    LessonBlueprint(
        id="animation_basics_8_10",
        title="Bringing Pictures to Life",
        type="tutorial",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["music_maker_8_10"],
        concepts=["animation", "movement", "time", "coordinates"],
        complexity_level=3,
        position_in_curriculum=14,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=8,
            min_examples=3,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["animation", "graphics", "movement", "visual"]
    ),
    
    LessonBlueprint(
        id="pet_simulator_8_10",
        title="Create Your Virtual Pet",
        type="project",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["animation_basics_8_10"],
        concepts=["functions", "state_management", "user_choice", "persistence"],
        complexity_level=3,
        position_in_curriculum=15,
        estimated_duration_range={"min_minutes": 45, "max_minutes": 70},
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=15,
            min_examples=2,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["simulation", "pets", "functions", "project"]
    ),
    
    LessonBlueprint(
        id="story_generator_8_10",
        title="Magical Story Creator",
        type="challenge",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["pet_simulator_8_10"],
        concepts=["string_formatting", "randomization", "lists", "creativity"],
        complexity_level=3,
        position_in_curriculum=16,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=10,
            min_examples=3,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["stories", "creativity", "text", "random"]
    ),
    
    LessonBlueprint(
        id="kids_calculator_8_10",
        title="Build a Super Calculator",
        type="project",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["story_generator_8_10"],
        concepts=["functions", "math_operations", "error_handling", "user_interface"],
        complexity_level=3,
        position_in_curriculum=17,
        estimated_duration_range={"min_minutes": 40, "max_minutes": 60},
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=12,
            min_examples=2,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["calculator", "math", "functions", "tools"]
    ),
    
    LessonBlueprint(
        id="debugging_detective_8_10",
        title="Become a Code Detective",
        type="tutorial",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["kids_calculator_8_10"],
        concepts=["debugging", "error_types", "problem_solving", "testing"],
        complexity_level=2,
        position_in_curriculum=18,
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=6,
            min_examples=4,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["debugging", "errors", "problem_solving", "detective"]
    ),
    
    LessonBlueprint(
        id="showcase_portfolio_8_10",
        title="Your Amazing Python Portfolio",
        type="project",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["debugging_detective_8_10"],
        concepts=["portfolio", "documentation", "presentation", "reflection"],
        complexity_level=3,
        position_in_curriculum=19,
        estimated_duration_range={"min_minutes": 50, "max_minutes": 80},
        content_requirements=ContentRequirements(
            language_complexity="simple",
            max_code_lines=20,
            min_examples=1,
            interactive_elements=True,
            include_emojis=True
        ),
        tags=["portfolio", "showcase", "presentation", "reflection"]
    ),
    
    LessonBlueprint(
        id="graduation_celebration_8_10",
        title="Python Programming Graduate!",
        type="assessment",
        age_group="8-10",
        skill_level="intermediate",
        prerequisites=["showcase_portfolio_8_10"],
        concepts=["comprehensive_review", "celebration", "next_steps", "mastery"],
        complexity_level=3,
        position_in_curriculum=20,
        estimated_duration_range={"min_minutes": 30, "max_minutes": 45},
        content_requirements=ContentRequirements(
            language_complexity="simple",
            include_emojis=True,
            interactive_elements=True
        ),
        tags=["graduation", "celebration", "mastery", "achievement"]
    )
]

# Age Group 11-13: Mixed Visual + Text Programming  
BLUEPRINTS_11_13: List[LessonBlueprint] = [
    LessonBlueprint(
        id="python_basics_11_13",
        title="Python Programming Fundamentals",
        type="tutorial",
        age_group="11-13",
        skill_level="beginner",
        prerequisites=[],
        concepts=["syntax", "data_types", "variables", "basic_operations"],
        complexity_level=2,
        position_in_curriculum=1,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=8,
            min_examples=3,
            max_examples=5
        ),
        tags=["fundamentals", "syntax", "data_types"]
    ),
    
    LessonBlueprint(
        id="conditionals_intro_11_13", 
        title="Making Decisions with If Statements",
        type="challenge",
        age_group="11-13",
        skill_level="beginner",
        prerequisites=["python_basics_11_13"],
        concepts=["conditionals", "if_statements", "boolean_logic", "comparison_operators"],
        complexity_level=2,
        position_in_curriculum=2,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=10,
            min_examples=3,
            interactive_elements=True
        ),
        tags=["conditionals", "logic", "decision_making"]
    ),
    
    LessonBlueprint(
        id="loops_basics_11_13",
        title="Repeating Actions with Loops", 
        type="tutorial",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["conditionals_intro_11_13"],
        concepts=["for_loops", "while_loops", "iteration", "range_function"],
        complexity_level=3,
        position_in_curriculum=3,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=12,
            min_examples=4,
            interactive_elements=True
        ),
        tags=["loops", "iteration", "automation"]
    ),
    
    LessonBlueprint(
        id="calculator_project_11_13",
        title="Build Your First Calculator",
        type="project", 
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["loops_basics_11_13"],
        concepts=["functions", "user_input", "math_operations", "program_structure"],
        complexity_level=3,
        position_in_curriculum=4,
        estimated_duration_range={"min_minutes": 45, "max_minutes": 90},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=25,
            min_examples=2,
            interactive_elements=True
        ),
        tags=["project", "calculator", "functions", "real_world"]
    ),
    
    LessonBlueprint(
        id="functions_deep_dive_11_13",
        title="Creating Your Own Python Tools",
        type="tutorial",
        age_group="11-13", 
        skill_level="intermediate",
        prerequisites=["calculator_project_11_13"],
        concepts=["function_definition", "parameters", "return_values", "scope"],
        complexity_level=3,
        position_in_curriculum=5,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=15,
            min_examples=4,
            max_examples=6
        ),
        tags=["functions", "modular_programming", "reusability"]
    ),
    
    # Advanced Foundation (Lessons 6-10)
    LessonBlueprint(
        id="string_manipulation_11_13",
        title="Master Text Processing",
        type="tutorial",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["functions_deep_dive_11_13"],
        concepts=["strings", "slicing", "methods", "formatting", "text_processing"],
        complexity_level=3,
        position_in_curriculum=6,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=12,
            min_examples=4,
            interactive_elements=True
        ),
        tags=["strings", "text", "processing", "methods"]
    ),
    
    LessonBlueprint(
        id="lists_advanced_11_13",
        title="Lists: Your Data Powerhouse",
        type="challenge",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["string_manipulation_11_13"],
        concepts=["lists", "methods", "comprehensions", "nested_lists", "sorting"],
        complexity_level=3,
        position_in_curriculum=7,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=15,
            min_examples=5,
            interactive_elements=True
        ),
        tags=["lists", "data_structures", "methods", "algorithms"]
    ),
    
    LessonBlueprint(
        id="dictionaries_intro_11_13",
        title="Dictionaries: Key-Value Magic",
        type="tutorial",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["lists_advanced_11_13"],
        concepts=["dictionaries", "keys", "values", "methods", "data_organization"],
        complexity_level=3,
        position_in_curriculum=8,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=12,
            min_examples=4,
            interactive_elements=True
        ),
        tags=["dictionaries", "data_structures", "organization"]
    ),
    
    LessonBlueprint(
        id="error_handling_11_13",
        title="Handling Mistakes Like a Pro",
        type="challenge",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["dictionaries_intro_11_13"],
        concepts=["try_except", "error_types", "debugging", "graceful_failure"],
        complexity_level=3,
        position_in_curriculum=9,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=10,
            min_examples=4,
            interactive_elements=True
        ),
        tags=["errors", "exceptions", "debugging", "robustness"]
    ),
    
    LessonBlueprint(
        id="file_operations_11_13",
        title="Working with Files and Data",
        type="tutorial",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["error_handling_11_13"],
        concepts=["file_io", "reading", "writing", "csv", "data_persistence"],
        complexity_level=4,
        position_in_curriculum=10,
        estimated_duration_range={"min_minutes": 40, "max_minutes": 60},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=18,
            min_examples=3,
            interactive_elements=True
        ),
        tags=["files", "data", "io", "persistence"]
    ),
    
    # Game Development Phase (Lessons 11-15)
    LessonBlueprint(
        id="pygame_intro_11_13",
        title="Game Development Basics",
        type="project",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["file_operations_11_13"],
        concepts=["pygame", "graphics", "events", "game_loop", "sprites"],
        complexity_level=4,
        position_in_curriculum=11,
        estimated_duration_range={"min_minutes": 50, "max_minutes": 75},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=25,
            min_examples=2,
            interactive_elements=True
        ),
        tags=["games", "pygame", "graphics", "entertainment"]
    ),
    
    LessonBlueprint(
        id="pong_game_11_13",
        title="Build Classic Pong Game",
        type="project",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["pygame_intro_11_13"],
        concepts=["collision_detection", "movement", "scoring", "game_mechanics"],
        complexity_level=4,
        position_in_curriculum=12,
        estimated_duration_range={"min_minutes": 60, "max_minutes": 90},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=35,
            min_examples=1,
            interactive_elements=True
        ),
        tags=["games", "pong", "collision", "mechanics"]
    ),
    
    LessonBlueprint(
        id="snake_game_11_13",
        title="Create Snake Game",
        type="project",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["pong_game_11_13"],
        concepts=["game_logic", "grid_systems", "growth_mechanics", "high_scores"],
        complexity_level=4,
        position_in_curriculum=13,
        estimated_duration_range={"min_minutes": 70, "max_minutes": 100},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=40,
            min_examples=1,
            interactive_elements=True
        ),
        tags=["games", "snake", "logic", "advanced"]
    ),
    
    LessonBlueprint(
        id="quiz_app_11_13",
        title="Interactive Quiz Application",
        type="project",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["snake_game_11_13"],
        concepts=["user_interface", "data_storage", "scoring", "multiple_choice"],
        complexity_level=3,
        position_in_curriculum=14,
        estimated_duration_range={"min_minutes": 45, "max_minutes": 65},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=30,
            min_examples=2,
            interactive_elements=True
        ),
        tags=["quiz", "interface", "education", "interactive"]
    ),
    
    LessonBlueprint(
        id="milestone_assessment_2_11_13",
        title="Advanced Skills Assessment",
        type="assessment",
        age_group="11-13",
        skill_level="intermediate",
        prerequisites=["quiz_app_11_13"],
        concepts=["comprehensive_review", "problem_solving", "project_planning"],
        complexity_level=3,
        position_in_curriculum=15,
        estimated_duration_range={"min_minutes": 35, "max_minutes": 50},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            interactive_elements=True
        ),
        tags=["assessment", "milestone", "review", "skills"]
    ),
    
    # Web & API Phase (Lessons 16-20)
    LessonBlueprint(
        id="web_scraping_basics_11_13",
        title="Gathering Data from the Web",
        type="tutorial",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["milestone_assessment_2_11_13"],
        concepts=["requests", "html", "beautiful_soup", "data_extraction"],
        complexity_level=4,
        position_in_curriculum=16,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=20,
            min_examples=3,
            interactive_elements=True
        ),
        tags=["web", "scraping", "data", "internet"]
    ),
    
    LessonBlueprint(
        id="api_basics_11_13",
        title="Working with APIs and JSON",
        type="challenge",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["web_scraping_basics_11_13"],
        concepts=["apis", "json", "requests", "data_parsing", "weather_api"],
        complexity_level=4,
        position_in_curriculum=17,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=15,
            min_examples=3,
            interactive_elements=True
        ),
        tags=["api", "json", "web_services", "data"]
    ),
    
    LessonBlueprint(
        id="data_visualization_11_13",
        title="Creating Charts and Graphs",
        type="project",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["api_basics_11_13"],
        concepts=["matplotlib", "charts", "graphs", "data_analysis", "visualization"],
        complexity_level=4,
        position_in_curriculum=18,
        estimated_duration_range={"min_minutes": 50, "max_minutes": 75},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=25,
            min_examples=3,
            interactive_elements=True
        ),
        tags=["visualization", "charts", "data", "analysis"]
    ),
    
    LessonBlueprint(
        id="personal_website_11_13",
        title="Build Your Personal Website",
        type="project",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["data_visualization_11_13"],
        concepts=["html", "css", "flask", "templates", "deployment"],
        complexity_level=5,
        position_in_curriculum=19,
        estimated_duration_range={"min_minutes": 80, "max_minutes": 120},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=40,
            min_examples=2,
            interactive_elements=True
        ),
        tags=["web", "flask", "website", "deployment"]
    ),
    
    LessonBlueprint(
        id="capstone_project_11_13",
        title="Design Your Own Python Project",
        type="project",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["personal_website_11_13"],
        concepts=["project_planning", "architecture", "implementation", "presentation"],
        complexity_level=5,
        position_in_curriculum=20,
        estimated_duration_range={"min_minutes": 90, "max_minutes": 150},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=60,
            min_examples=1,
            interactive_elements=True
        ),
        tags=["capstone", "independent", "planning", "creativity"]
    ),
    
    # Advanced Specialization (Lessons 21-25)
    LessonBlueprint(
        id="oop_introduction_11_13",
        title="Object-Oriented Programming Basics",
        type="tutorial",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["capstone_project_11_13"],
        concepts=["classes", "objects", "methods", "attributes", "inheritance"],
        complexity_level=4,
        position_in_curriculum=21,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=20,
            min_examples=4,
            interactive_elements=True
        ),
        tags=["oop", "classes", "objects", "advanced"]
    ),
    
    LessonBlueprint(
        id="ai_chatbot_11_13",
        title="Build an AI Chatbot",
        type="project",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["oop_introduction_11_13"],
        concepts=["nlp", "chatbots", "pattern_matching", "responses", "ai_basics"],
        complexity_level=5,
        position_in_curriculum=22,
        estimated_duration_range={"min_minutes": 60, "max_minutes": 90},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=35,
            min_examples=2,
            interactive_elements=True
        ),
        tags=["ai", "chatbot", "nlp", "futuristic"]
    ),
    
    LessonBlueprint(
        id="automation_scripts_11_13",
        title="Automate Boring Tasks",
        type="challenge",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["ai_chatbot_11_13"],
        concepts=["automation", "file_manipulation", "email", "scheduling", "productivity"],
        complexity_level=4,
        position_in_curriculum=23,
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=25,
            min_examples=3,
            interactive_elements=True
        ),
        tags=["automation", "productivity", "scripts", "practical"]
    ),
    
    LessonBlueprint(
        id="portfolio_showcase_11_13",
        title="Professional Portfolio Development",
        type="project",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["automation_scripts_11_13"],
        concepts=["portfolio", "documentation", "github", "presentation", "career"],
        complexity_level=4,
        position_in_curriculum=24,
        estimated_duration_range={"min_minutes": 70, "max_minutes": 100},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            max_code_lines=30,
            min_examples=2,
            interactive_elements=True
        ),
        tags=["portfolio", "github", "career", "professional"]
    ),
    
    LessonBlueprint(
        id="python_mastery_11_13",
        title="Python Programming Mastery Certificate",
        type="assessment",
        age_group="11-13",
        skill_level="advanced",
        prerequisites=["portfolio_showcase_11_13"],
        concepts=["mastery_assessment", "career_paths", "next_steps", "celebration"],
        complexity_level=4,
        position_in_curriculum=25,
        estimated_duration_range={"min_minutes": 45, "max_minutes": 60},
        content_requirements=ContentRequirements(
            language_complexity="moderate",
            interactive_elements=True
        ),
        tags=["mastery", "certificate", "graduation", "achievement"]
    )
]

# Age Group 14-16: Full Text Programming
BLUEPRINTS_14_16: List[LessonBlueprint] = [
    LessonBlueprint(
        id="data_structures_intro_14_16",
        title="Organizing Data with Lists and Dictionaries",
        type="tutorial",
        age_group="14-16",
        skill_level="intermediate",
        prerequisites=[],
        concepts=["lists", "dictionaries", "indexing", "data_organization"],
        complexity_level=3,
        position_in_curriculum=1,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=20,
            min_examples=4,
            max_examples=7,
            include_emojis=False
        ),
        tags=["data_structures", "lists", "dictionaries", "organization"]
    ),
    
    LessonBlueprint(
        id="file_handling_14_16",
        title="Reading and Writing Files",
        type="challenge",
        age_group="14-16",
        skill_level="intermediate", 
        prerequisites=["data_structures_intro_14_16"],
        concepts=["file_io", "text_processing", "data_persistence", "file_paths"],
        complexity_level=4,
        position_in_curriculum=2,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=25,
            min_examples=3,
            interactive_elements=True
        ),
        tags=["files", "io", "data_persistence", "text_processing"]
    ),
    
    LessonBlueprint(
        id="oop_basics_14_16",
        title="Object-Oriented Programming Concepts",
        type="tutorial",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["file_handling_14_16"],
        concepts=["classes", "objects", "methods", "attributes", "encapsulation"],
        complexity_level=4,
        position_in_curriculum=3,
        estimated_duration_range={"min_minutes": 60, "max_minutes": 120},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=30,
            min_examples=3,
            max_examples=5
        ),
        tags=["oop", "classes", "objects", "advanced_concepts"]
    ),
    
    LessonBlueprint(
        id="web_scraper_project_14_16",
        title="Build a Web Data Collector",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["oop_basics_14_16"],
        concepts=["web_scraping", "requests", "html_parsing", "data_analysis", "libraries"],
        complexity_level=5,
        position_in_curriculum=4,
        estimated_duration_range={"min_minutes": 90, "max_minutes": 180},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=50,
            min_examples=2,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["web_scraping", "real_world", "libraries", "data_collection"]
    ),
    
    LessonBlueprint(
        id="assessment_comprehensive_14_16",
        title="Python Programming Assessment",
        type="assessment",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["web_scraper_project_14_16"],
        concepts=["comprehensive_review", "problem_solving", "code_analysis", "debugging"],
        complexity_level=4,
        position_in_curriculum=5,
        estimated_duration_range={"min_minutes": 45, "max_minutes": 75},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            include_emojis=False,
            interactive_elements=True
        ),
        tags=["assessment", "comprehensive", "evaluation", "skills_check"]
    ),
    
    # Advanced Programming Concepts (Lessons 6-10)
    LessonBlueprint(
        id="algorithms_analysis_14_16",
        title="Algorithms and Computational Complexity",
        type="tutorial",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["assessment_comprehensive_14_16"],
        concepts=["algorithms", "big_o", "complexity", "optimization", "efficiency"],
        complexity_level=5,
        position_in_curriculum=6,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=25,
            min_examples=4,
            include_emojis=False
        ),
        tags=["algorithms", "complexity", "optimization", "computer_science"]
    ),
    
    LessonBlueprint(
        id="advanced_oop_14_16",
        title="Advanced Object-Oriented Design",
        type="challenge",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["algorithms_analysis_14_16"],
        concepts=["inheritance", "polymorphism", "abstract_classes", "design_patterns"],
        complexity_level=5,
        position_in_curriculum=7,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=30,
            min_examples=3,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["oop", "design_patterns", "inheritance", "advanced"]
    ),
    
    LessonBlueprint(
        id="data_structures_advanced_14_16",
        title="Advanced Data Structures & Trees",
        type="tutorial",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["advanced_oop_14_16"],
        concepts=["trees", "graphs", "stacks", "queues", "hash_tables"],
        complexity_level=5,
        position_in_curriculum=8,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=35,
            min_examples=4,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["data_structures", "trees", "graphs", "algorithms"]
    ),
    
    LessonBlueprint(
        id="database_integration_14_16",
        title="Database Design and SQL Integration",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["data_structures_advanced_14_16"],
        concepts=["sql", "databases", "sqlite", "orm", "data_modeling"],
        complexity_level=4,
        position_in_curriculum=9,
        estimated_duration_range={"min_minutes": 60, "max_minutes": 90},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=40,
            min_examples=3,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["database", "sql", "data_modeling", "backend"]
    ),
    
    LessonBlueprint(
        id="testing_debugging_14_16",
        title="Professional Testing and Debugging",
        type="challenge",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["database_integration_14_16"],
        concepts=["unit_testing", "pytest", "debugging", "profiling", "code_quality"],
        complexity_level=4,
        position_in_curriculum=10,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=25,
            min_examples=5,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["testing", "debugging", "quality", "professional"]
    ),
    
    # Web Development & APIs (Lessons 11-15)
    LessonBlueprint(
        id="flask_advanced_14_16",
        title="Full-Stack Web Application",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["testing_debugging_14_16"],
        concepts=["flask", "templates", "forms", "authentication", "sessions"],
        complexity_level=5,
        position_in_curriculum=11,
        estimated_duration_range={"min_minutes": 90, "max_minutes": 120},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=60,
            min_examples=2,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["web", "flask", "fullstack", "authentication"]
    ),
    
    LessonBlueprint(
        id="rest_api_development_14_16",
        title="Building REST APIs",
        type="tutorial",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["flask_advanced_14_16"],
        concepts=["rest_api", "json", "endpoints", "status_codes", "api_design"],
        complexity_level=4,
        position_in_curriculum=12,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=30,
            min_examples=4,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["api", "rest", "web_services", "backend"]
    ),
    
    LessonBlueprint(
        id="microservices_intro_14_16",
        title="Microservices Architecture Basics",
        type="challenge",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["rest_api_development_14_16"],
        concepts=["microservices", "docker", "containerization", "scalability"],
        complexity_level=5,
        position_in_curriculum=13,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=35,
            min_examples=2,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["microservices", "docker", "architecture", "scalability"]
    ),
    
    LessonBlueprint(
        id="cloud_deployment_14_16",
        title="Cloud Deployment and DevOps",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["microservices_intro_14_16"],
        concepts=["cloud", "deployment", "ci_cd", "monitoring", "scaling"],
        complexity_level=5,
        position_in_curriculum=14,
        estimated_duration_range={"min_minutes": 75, "max_minutes": 110},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=25,
            min_examples=3,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["cloud", "deployment", "devops", "production"]
    ),
    
    LessonBlueprint(
        id="milestone_assessment_3_14_16",
        title="Software Engineering Assessment",
        type="assessment",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["cloud_deployment_14_16"],
        concepts=["software_engineering", "system_design", "problem_solving"],
        complexity_level=5,
        position_in_curriculum=15,
        estimated_duration_range={"min_minutes": 60, "max_minutes": 90},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["assessment", "software_engineering", "system_design"]
    ),
    
    # Data Science & AI (Lessons 16-20)
    LessonBlueprint(
        id="data_science_fundamentals_14_16",
        title="Data Science with Python",
        type="tutorial",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["milestone_assessment_3_14_16"],
        concepts=["pandas", "numpy", "data_analysis", "statistics", "visualization"],
        complexity_level=4,
        position_in_curriculum=16,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=30,
            min_examples=4,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["data_science", "pandas", "analysis", "statistics"]
    ),
    
    LessonBlueprint(
        id="machine_learning_intro_14_16",
        title="Introduction to Machine Learning",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["data_science_fundamentals_14_16"],
        concepts=["machine_learning", "scikit_learn", "classification", "regression"],
        complexity_level=5,
        position_in_curriculum=17,
        estimated_duration_range={"min_minutes": 80, "max_minutes": 120},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=40,
            min_examples=3,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["machine_learning", "ai", "classification", "prediction"]
    ),
    
    LessonBlueprint(
        id="deep_learning_basics_14_16",
        title="Neural Networks and Deep Learning",
        type="challenge",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["machine_learning_intro_14_16"],
        concepts=["neural_networks", "tensorflow", "keras", "deep_learning"],
        complexity_level=5,
        position_in_curriculum=18,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=35,
            min_examples=2,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["deep_learning", "neural_networks", "ai", "tensorflow"]
    ),
    
    LessonBlueprint(
        id="computer_vision_14_16",
        title="Computer Vision Applications",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["deep_learning_basics_14_16"],
        concepts=["computer_vision", "opencv", "image_processing", "cnn"],
        complexity_level=5,
        position_in_curriculum=19,
        estimated_duration_range={"min_minutes": 70, "max_minutes": 100},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=45,
            min_examples=2,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["computer_vision", "opencv", "image_processing", "ai"]
    ),
    
    LessonBlueprint(
        id="nlp_project_14_16",
        title="Natural Language Processing Project",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["computer_vision_14_16"],
        concepts=["nlp", "sentiment_analysis", "text_processing", "transformers"],
        complexity_level=5,
        position_in_curriculum=20,
        estimated_duration_range={"min_minutes": 75, "max_minutes": 110},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=40,
            min_examples=2,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["nlp", "text_analysis", "ai", "language"]
    ),
    
    # Specialization & Career Prep (Lessons 21-30)
    LessonBlueprint(
        id="cybersecurity_basics_14_16",
        title="Cybersecurity and Ethical Hacking",
        type="tutorial",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["nlp_project_14_16"],
        concepts=["cybersecurity", "encryption", "network_security", "ethical_hacking"],
        complexity_level=4,
        position_in_curriculum=21,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=25,
            min_examples=4,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["cybersecurity", "encryption", "security", "ethics"]
    ),
    
    LessonBlueprint(
        id="blockchain_crypto_14_16",
        title="Blockchain and Cryptocurrency",
        type="challenge",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["cybersecurity_basics_14_16"],
        concepts=["blockchain", "cryptocurrency", "smart_contracts", "web3"],
        complexity_level=5,
        position_in_curriculum=22,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=30,
            min_examples=3,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["blockchain", "crypto", "web3", "decentralized"]
    ),
    
    LessonBlueprint(
        id="mobile_app_backend_14_16",
        title="Mobile App Backend Development",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["blockchain_crypto_14_16"],
        concepts=["mobile_backend", "api_gateway", "push_notifications", "real_time"],
        complexity_level=4,
        position_in_curriculum=23,
        estimated_duration_range={"min_minutes": 85, "max_minutes": 125},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=50,
            min_examples=2,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["mobile", "backend", "api", "real_time"]
    ),
    
    LessonBlueprint(
        id="performance_optimization_14_16",
        title="High-Performance Python Applications",
        type="challenge",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["mobile_app_backend_14_16"],
        concepts=["performance", "profiling", "caching", "async_programming"],
        complexity_level=5,
        position_in_curriculum=24,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=35,
            min_examples=4,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["performance", "optimization", "async", "scaling"]
    ),
    
    LessonBlueprint(
        id="open_source_contribution_14_16",
        title="Contributing to Open Source",
        type="tutorial",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["performance_optimization_14_16"],
        concepts=["open_source", "git_advanced", "collaboration", "code_review"],
        complexity_level=3,
        position_in_curriculum=25,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=20,
            min_examples=3,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["open_source", "collaboration", "git", "community"]
    ),
    
    LessonBlueprint(
        id="startup_mvp_14_16",
        title="Build a Startup MVP",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["open_source_contribution_14_16"],
        concepts=["mvp", "product_development", "user_research", "iteration"],
        complexity_level=5,
        position_in_curriculum=26,
        estimated_duration_range={"min_minutes": 120, "max_minutes": 180},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=80,
            min_examples=1,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["startup", "mvp", "product", "entrepreneurship"]
    ),
    
    LessonBlueprint(
        id="technical_interview_prep_14_16",
        title="Technical Interview Preparation",
        type="challenge",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["startup_mvp_14_16"],
        concepts=["algorithms", "data_structures", "problem_solving", "interview_skills"],
        complexity_level=4,
        position_in_curriculum=27,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=25,
            min_examples=6,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["interviews", "algorithms", "career", "preparation"]
    ),
    
    LessonBlueprint(
        id="industry_mentorship_14_16",
        title="Industry Mentorship and Networking",
        type="tutorial",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["technical_interview_prep_14_16"],
        concepts=["networking", "mentorship", "career_paths", "industry_insights"],
        complexity_level=2,
        position_in_curriculum=28,
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=10,
            min_examples=2,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["mentorship", "networking", "career", "industry"]
    ),
    
    LessonBlueprint(
        id="final_capstone_14_16",
        title="Senior Capstone Project",
        type="project",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["industry_mentorship_14_16"],
        concepts=["capstone", "research", "innovation", "presentation"],
        complexity_level=5,
        position_in_curriculum=29,
        estimated_duration_range={"min_minutes": 150, "max_minutes": 240},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            max_code_lines=100,
            min_examples=1,
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["capstone", "research", "innovation", "mastery"]
    ),
    
    LessonBlueprint(
        id="computer_science_mastery_14_16",
        title="Computer Science Mastery Diploma",
        type="assessment",
        age_group="14-16",
        skill_level="advanced",
        prerequisites=["final_capstone_14_16"],
        concepts=["comprehensive_mastery", "college_readiness", "career_preparation"],
        complexity_level=5,
        position_in_curriculum=30,
        estimated_duration_range={"min_minutes": 90, "max_minutes": 120},
        content_requirements=ContentRequirements(
            language_complexity="advanced",
            interactive_elements=True,
            include_emojis=False
        ),
        tags=["mastery", "diploma", "college_prep", "career_ready"]
    )
]

# Combined curriculum by age group
CURRICULUM_BY_AGE = {
    "8-10": BLUEPRINTS_8_10,
    "11-13": BLUEPRINTS_11_13, 
    "14-16": BLUEPRINTS_14_16
}

# Helper functions
def get_blueprint_by_id(blueprint_id: str) -> LessonBlueprint:
    """Get a specific lesson blueprint by ID"""
    for age_group, blueprints in CURRICULUM_BY_AGE.items():
        for blueprint in blueprints:
            if blueprint.id == blueprint_id:
                return blueprint
    raise ValueError(f"Blueprint with ID '{blueprint_id}' not found")

def get_blueprints_for_age(age_group: str) -> List[LessonBlueprint]:
    """Get all lesson blueprints for a specific age group"""
    if age_group not in CURRICULUM_BY_AGE:
        raise ValueError(f"Age group '{age_group}' not supported")
    return CURRICULUM_BY_AGE[age_group]

def get_next_lesson(current_blueprint_id: str, age_group: str) -> LessonBlueprint:
    """Get the next lesson in the curriculum sequence"""
    blueprints = get_blueprints_for_age(age_group)
    current_blueprint = get_blueprint_by_id(current_blueprint_id)
    
    next_position = current_blueprint.position_in_curriculum + 1
    
    for blueprint in blueprints:
        if blueprint.position_in_curriculum == next_position:
            return blueprint
    
    raise ValueError(f"No next lesson found after '{current_blueprint_id}'")

def check_prerequisites(blueprint_id: str, completed_lessons: List[str]) -> bool:
    """Check if student has completed all prerequisites for a lesson"""
    blueprint = get_blueprint_by_id(blueprint_id)
    return all(prereq in completed_lessons for prereq in blueprint.prerequisites)
