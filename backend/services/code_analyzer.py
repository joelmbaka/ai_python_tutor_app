"""
Intelligent code analysis service for providing hints, feedback, and educational insights.
Uses AI to analyze student code and provide contextual learning support.
"""

import ast
import re
from typing import List, Dict, Any, Optional, Tuple
from models.execution_models import TestResult, CodeExecutionResponse
from models.api_models import StudentProfile
from llms import llama_scout

class CodeAnalyzer:
    """AI-powered code analysis for educational feedback"""
    
    def __init__(self):
        self.llm = llama_scout
    
    async def analyze_student_code(
        self, 
        student_code: str, 
        lesson_id: str,
        execution_result: CodeExecutionResponse,
        student_profile: StudentProfile,
        expected_concepts: List[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze student code and provide educational feedback
        
        Returns comprehensive analysis including:
        - Concept mastery assessment
        - Code quality feedback
        - Personalized hints and suggestions
        - Next learning recommendations
        """
        
        # Basic code analysis
        syntax_analysis = self._analyze_syntax(student_code)
        logic_analysis = self._analyze_logic(student_code, execution_result)
        style_analysis = self._analyze_style(student_code)
        
        # AI-powered educational analysis
        educational_feedback = await self._generate_educational_feedback(
            student_code,
            execution_result,
            student_profile,
            expected_concepts or [],
            lesson_id
        )
        
        # Generate adaptive hints
        hints = await self._generate_adaptive_hints(
            student_code,
            execution_result,
            student_profile,
            syntax_analysis,
            logic_analysis
        )
        
        return {
            "overall_score": self._calculate_overall_score(execution_result, syntax_analysis, logic_analysis),
            "concept_mastery": educational_feedback.get("concept_mastery", {}),
            "code_quality": {
                "syntax": syntax_analysis,
                "logic": logic_analysis,
                "style": style_analysis
            },
            "personalized_feedback": educational_feedback.get("feedback", ""),
            "adaptive_hints": hints,
            "next_steps": educational_feedback.get("next_steps", []),
            "encouragement": educational_feedback.get("encouragement", ""),
            "areas_for_improvement": educational_feedback.get("improvements", []),
            "strengths": educational_feedback.get("strengths", [])
        }
    
    def _analyze_syntax(self, code: str) -> Dict[str, Any]:
        """Analyze code syntax and structure"""
        try:
            tree = ast.parse(code)
            
            analysis = {
                "is_valid": True,
                "syntax_errors": [],
                "structure": {
                    "functions_defined": len([n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]),
                    "classes_defined": len([n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]),
                    "loops_used": len([n for n in ast.walk(tree) if isinstance(n, (ast.For, ast.While))]),
                    "conditionals_used": len([n for n in ast.walk(tree) if isinstance(n, ast.If)]),
                    "variables_assigned": len([n for n in ast.walk(tree) if isinstance(n, ast.Assign)]),
                    "imports_used": len([n for n in ast.walk(tree) if isinstance(n, (ast.Import, ast.ImportFrom))])
                },
                "complexity_score": self._calculate_complexity(tree)
            }
            
            return analysis
            
        except SyntaxError as e:
            return {
                "is_valid": False,
                "syntax_errors": [f"Syntax error at line {e.lineno}: {e.msg}"],
                "structure": {},
                "complexity_score": 0
            }
    
    def _analyze_logic(self, code: str, execution_result: CodeExecutionResponse) -> Dict[str, Any]:
        """Analyze code logic and execution patterns"""
        
        # Analyze test results for logic patterns
        failed_tests = [t for t in execution_result.test_results if not t.passed]
        
        logic_issues = []
        patterns = []
        
        # Check for common logic issues
        if failed_tests:
            # Analyze failure patterns
            for test in failed_tests:
                if test.error_message:
                    if "NameError" in test.error_message:
                        logic_issues.append("Variable not defined before use")
                    elif "TypeError" in test.error_message:
                        logic_issues.append("Incorrect data type usage")
                    elif "IndentationError" in test.error_message:
                        logic_issues.append("Incorrect indentation")
                
                # Compare expected vs actual output
                if test.actual_output and test.expected_output:
                    if test.actual_output != test.expected_output:
                        patterns.append(f"Expected '{test.expected_output}' but got '{test.actual_output}'")
        
        return {
            "tests_passed": execution_result.passed_tests,
            "tests_failed": len(failed_tests),
            "logic_issues": logic_issues,
            "output_patterns": patterns,
            "execution_successful": execution_result.success
        }
    
    def _analyze_style(self, code: str) -> Dict[str, Any]:
        """Analyze code style and best practices"""
        
        style_issues = []
        good_practices = []
        
        lines = code.split('\n')
        
        # Check for style issues
        for i, line in enumerate(lines, 1):
            if line.strip():
                # Check line length
                if len(line) > 100:
                    style_issues.append(f"Line {i} is too long ({len(line)} characters)")
                
                # Check for comments
                if line.strip().startswith('#'):
                    good_practices.append(f"Good use of comments on line {i}")
        
        # Check for meaningful variable names
        var_pattern = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=', code)
        meaningful_vars = [v for v in var_pattern if len(v) > 2 and not v.startswith('_')]
        
        if meaningful_vars:
            good_practices.append("Uses meaningful variable names")
        
        return {
            "style_issues": style_issues,
            "good_practices": good_practices,
            "readability_score": min(10, max(1, 10 - len(style_issues)))
        }
    
    def _calculate_complexity(self, tree: ast.AST) -> int:
        """Calculate cyclomatic complexity of code"""
        complexity = 1  # Base complexity
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
        
        return complexity
    
    def _calculate_overall_score(self, execution_result: CodeExecutionResponse, 
                               syntax_analysis: Dict, logic_analysis: Dict) -> int:
        """Calculate overall code quality score (0-100)"""
        
        # Test success score (40% weight)
        test_score = (execution_result.passed_tests / max(execution_result.total_tests, 1)) * 40
        
        # Syntax score (30% weight)
        syntax_score = 30 if syntax_analysis.get("is_valid", False) else 0
        
        # Logic score (20% weight)
        logic_score = 20 if execution_result.success else 10
        
        # Style score (10% weight)
        style_score = min(10, len(syntax_analysis.get("structure", {}).get("good_practices", [])) * 2)
        
        return int(test_score + syntax_score + logic_score + style_score)
    
    async def _generate_educational_feedback(
        self,
        student_code: str,
        execution_result: CodeExecutionResponse,
        student_profile: StudentProfile,
        expected_concepts: List[str],
        lesson_id: str
    ) -> Dict[str, Any]:
        """Generate AI-powered educational feedback"""
        
        # Prepare context for AI analysis
        test_summary = f"{execution_result.passed_tests}/{execution_result.total_tests} tests passed"
        errors = execution_result.runtime_errors + execution_result.syntax_errors
        # Handle empty interests gracefully
        interests_text = ", ".join(student_profile.interests) if student_profile.interests else "various topics"
        
        prompt = f"""
        Analyze this Python code from a {student_profile.age}-year-old student named {student_profile.name} 
        with {student_profile.experience} programming experience. They are interested in {interests_text}.
        
        STUDENT CODE:
        ```python
        {student_code}
        ```
        
        EXECUTION RESULTS:
        - Tests: {test_summary}
        - Errors: {'; '.join(errors) if errors else 'None'}
        
        LESSON CONTEXT:
        - Lesson ID: {lesson_id}
        - Expected concepts: {', '.join(expected_concepts)}
        
        Please provide educational feedback in the following format:
        
        CONCEPT_MASTERY: Rate understanding of each expected concept (0-5)
        FEEDBACK: Encouraging, age-appropriate feedback paragraph
        STRENGTHS: List specific things the student did well
        IMPROVEMENTS: Specific, actionable suggestions for improvement
        NEXT_STEPS: What they should learn next
        ENCOURAGEMENT: Personal, motivating message using their name and interests
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            
            # Parse AI response (simplified - in production, use structured output)
            return {
                "concept_mastery": {"variables": 4, "functions": 3},  # Example
                "feedback": response[:200] + "..." if len(response) > 200 else response,
                "strengths": ["Good variable naming", "Correct syntax"],
                "improvements": ["Add error handling", "Improve efficiency"],
                "next_steps": ["Learn about loops", "Practice with functions"],
                "encouragement": f"Great work, {student_profile.name}! Keep coding!"
            }
            
        except Exception as e:
            return {
                "concept_mastery": {},
                "feedback": "Keep practicing and learning!",
                "strengths": ["Attempting the challenge"],
                "improvements": ["Review the lesson concepts"],
                "next_steps": ["Practice more examples"],
                "encouragement": f"You're doing great, {student_profile.name}!"
            }
    
    async def _generate_adaptive_hints(
        self,
        student_code: str,
        execution_result: CodeExecutionResponse,
        student_profile: StudentProfile,
        syntax_analysis: Dict,
        logic_analysis: Dict
    ) -> List[str]:
        """Generate adaptive hints based on student's specific issues"""
        
        hints = []
        
        # Syntax-based hints
        if not syntax_analysis.get("is_valid", True):
            hints.append("Check your syntax - make sure all parentheses and brackets are closed")
        
        # Logic-based hints
        if logic_analysis.get("logic_issues"):
            for issue in logic_analysis["logic_issues"][:2]:  # Limit to 2 hints
                if "Variable not defined" in issue:
                    hints.append("Make sure to define all variables before using them")
                elif "data type" in issue:
                    hints.append("Check if you're using the right data types (strings, numbers, etc.)")
        
        # Test-based hints
        failed_tests = execution_result.total_tests - execution_result.passed_tests
        if failed_tests > 0:
            hints.append(f"Try testing your code with the examples - {failed_tests} test(s) didn't pass")
        
        # Age-appropriate encouragement
        if student_profile.age <= 10:
            hints.append("Take your time and break the problem into small steps!")
        else:
            hints.append("Consider edge cases and different input scenarios")
        
        return hints[:3]  # Limit to 3 hints to avoid overwhelming


# Singleton instance
code_analyzer = CodeAnalyzer()
