/**
 * API Service for AI Python Tutor App
 * Handles communication with the local backend instead of Judge0
 */
// Base URL hard-coded for local backend
const API_BASE_URL = 'http://192.168.100.11:8083';

interface TestCase {
  input?: string;
  expected_output: string;
}

interface TestResult {
  test_id: number;
  passed: boolean;
  input_data?: string;
  expected_output: string;
  actual_output?: string;
  execution_time_ms?: number;
  error_message?: string;
}

interface CodeExecutionRequest {
  student_code: string;
  lesson_id: string;
  test_cases: TestCase[];
  timeout_seconds?: number;
  memory_limit_mb?: number;
}

interface CodeExecutionResponse {
  success: boolean;
  total_tests: number;
  passed_tests: number;
  test_results: TestResult[];
  overall_output?: string;
  syntax_errors: string[];
  runtime_errors: string[];
  execution_time_total_ms: number;
  memory_used_mb?: number;
  hints_triggered: string[];
}

interface CodeSubmissionRequest {
  student_id: string;
  lesson_id: string;
  submitted_code: string;
  test_cases: TestCase[];
}

interface CodeSubmissionResponse {
  submission_id: string;
  score: number;
  passed_tests: number;
  total_tests: number;
  success: boolean;
  execution_result: CodeExecutionResponse;
}

interface SimpleChallenge {
  problem_description: string;
  starter_code: string;
  solution_code: string;
  hints: string[];
  explanation: string;
}

interface Exercise {
  question: string;
  starter_code: string;
  explanation: string;
}

interface Tutorial {
  steps: Array<{ title: string; content: string }>;
  interactive_examples: string[];
  key_concepts: string[];
}

interface Project {
  project_brief: string;
  milestones: Array<{ title: string; description: string }>;
  starter_files?: Record<string, string>;
  success_criteria: string[];
}

interface Assessment {
  questions: Array<{
    type: string;
    question: string;
    options?: string[];
    correct_answer?: number;
    explanation?: string;
    starter_code?: string;
    solution?: string;
    test_cases?: Array<{ expected_output: string }>;
  }>;
  passing_score: number;
  feedback_rubric: Record<string, string>;
}

interface LessonContent {
  title: string;
  learning_objectives: string[];
  introduction: string;
  challenge?: SimpleChallenge;
  // New multi-exercise support (preferred)
  exercises?: Exercise[];
  // Backward compatibility with older API responses
  exercise?: Exercise;
  tutorial?: Tutorial;
  project?: Project;
  assessment?: Assessment;
  explanation: string;
  encouragement: string;
  next_steps: string;
  estimated_duration: number;
  difficulty_rating: number;
  concepts_covered: string[];
}

interface StartLearningResponse {
  student_id?: string;
  age_group?: string;
  message?: string;
  next_action?: string;
  first_lesson: {
    lesson_id: string;
    position: number;
    total_lessons: number;
  };
  enrolled_coursework: {
    id?: string;
    title: string;
    total_lessons: number;
    estimated_duration: string;
  };
  learning_path: {
    description: string;
    title?: string;
    duration?: string;
    total_lessons?: number;
    first_lesson?: string;
  };
}

interface GenerateNewChallengeRequest {
  lesson_id: string;
  current_challenge: Record<string, any> | SimpleChallenge | null;
  student_profile: {
    name: string;
    age: number;
    experience: 'beginner' | 'some' | 'advanced';
    learning_style: 'visual' | 'text' | 'mixed';
    interests: string[];
    completed_lessons?: string[];
    current_streak?: number;
    total_lessons_completed?: number;
  };
  difficulty: number; // 1-5
  lesson_context?: {
    title?: string;
    learning_objectives?: string[];
    concepts_covered?: string[];
    estimated_duration?: number;
    difficulty_rating?: number;
  };
}

interface GenerateNewChallengeResponse {
  success: boolean;
  new_challenge?: SimpleChallenge;
  generation_time_seconds?: number;
  error_message?: string;
  fallback_used?: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Execute student code against test cases
   */
  async executeCode(
    request: CodeExecutionRequest,
    options?: { signal?: AbortSignal; propagateAbort?: boolean }
  ): Promise<CodeExecutionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/execute-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_code: request.student_code,
          lesson_id: request.lesson_id,
          test_cases: request.test_cases,
          timeout_seconds: request.timeout_seconds || 10,
          memory_limit_mb: request.memory_limit_mb || 128,
        }),
        signal: options?.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      // Handle aborts distinctly so callers can cancel cleanly
      if (error && (error.name === 'AbortError' || error.message?.includes('aborted'))) {
        if (options?.propagateAbort) {
          throw error;
        }
        return {
          success: false,
          total_tests: request.test_cases.length,
          passed_tests: 0,
          test_results: [],
          overall_output: '',
          syntax_errors: [],
          runtime_errors: ['Request aborted'],
          execution_time_total_ms: 0,
          hints_triggered: [],
        };
      }
      console.error('Code execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Return a fallback error response
      return {
        success: false,
        total_tests: request.test_cases.length,
        passed_tests: 0,
        test_results: [],
        overall_output: '',
        syntax_errors: [],
        runtime_errors: [`Network error: ${errorMessage}`],
        execution_time_total_ms: 0,
        hints_triggered: [],
      };
    }
  }

  /**
   * Generate a new challenge based on current lesson context
   */
  async generateNewChallenge(
    request: GenerateNewChallengeRequest,
    options?: { signal?: AbortSignal }
  ): Promise<GenerateNewChallengeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-new-challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: options?.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result as GenerateNewChallengeResponse;
    } catch (error) {
      console.error('New challenge generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`New challenge generation failed: ${errorMessage}`);
    }
  }

  /**
   * Submit student code for evaluation
   */
  async submitCode(request: CodeSubmissionRequest): Promise<CodeSubmissionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Code submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Code submission failed: ${errorMessage}`);
    }
  }

  /**
   * Check if the backend is running and accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Generate a lesson using the AI backend
   */
  async generateLesson(request: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Lesson generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Lesson generation failed: ${errorMessage}`);
    }
  }

  /**
   * Submit code with comprehensive analysis
   */
  async submitCodeWithAnalysis(
    studentCode: string,
    lessonId: string,
    studentProfile: any,
    testCases: TestCase[],
    expectedConcepts?: string[],
    timeoutSeconds: number = 10
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/submit-code-with-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_code: studentCode,
          lesson_id: lessonId,
          student_profile: studentProfile,
          test_cases: testCases,
          expected_concepts: expectedConcepts,
          timeout_seconds: timeoutSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Code analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Code analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Start learning journey for a student
   */
  async startLearningJourney(age: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/student/start-learning?student_age=${age}&student_id=demo_student`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Start learning journey error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Start learning journey failed: ${errorMessage}`);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  TestCase,
  TestResult,
  CodeExecutionRequest,
  CodeExecutionResponse,
  CodeSubmissionRequest,
  CodeSubmissionResponse,
  LessonContent,
  StartLearningResponse,
  SimpleChallenge,
  Exercise,
  Tutorial,
  Project,
  Assessment,
  GenerateNewChallengeRequest,
  GenerateNewChallengeResponse,
};
