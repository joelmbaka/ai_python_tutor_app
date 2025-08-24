/**
 * API service for communicating with the AI Python Tutor backend
 */

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.100.11:8000'  // Development server
  : 'https://your-production-api.com';  // Production server

interface StudentProfile {
  name: string;
  age: number;
  experience: 'beginner' | 'some' | 'advanced';
  learning_style: 'visual' | 'text' | 'mixed';
  interests: string[];
}

interface LessonProgress {
  current_lesson_id: string;
  completed_lessons: string[];
  time_spent_minutes: number;
  average_score: number;
}

interface GenerateLessonRequest {
  blueprint_id: string;
  student_profile: StudentProfile;
  start_date?: string;
  custom_instructions?: string;
}

interface LessonContent {
  title: string;
  learning_objectives: string[];
  introduction: string;
  challenge?: {
    starter_code: string;
    solution_code: string;
    test_cases: Array<{
      input: string;
      expected_output: string;
      description: string;
    }>;
    hints: string[];
  };
  tutorial?: {
    steps: Array<{
      step_number: number;
      title: string;
      content: string;
      code_example?: string;
    }>;
    interactive_examples: Array<{
      description: string;
      code: string;
      expected_output: string;
    }>;
    key_concepts: string[];
  };
  project?: {
    project_brief: string;
    milestones: Array<{
      milestone_number: number;
      title: string;
      description: string;
      deliverables: string[];
    }>;
    starter_files: Array<{
      filename: string;
      content: string;
    }>;
    success_criteria: string[];
  };
  assessment?: {
    questions: Array<{
      question_id: string;
      question_text: string;
      question_type: string;
      options?: string[];
      correct_answer: string;
      explanation: string;
      difficulty: string;
    }>;
    passing_score: number;
    feedback_rubric: Record<string, string>;
  };
  explanation: string;
  encouragement: string;
  next_steps: string[];
  estimated_duration: number;
  difficulty_rating: number;
  concepts_covered: string[];
}

interface GenerateLessonResponse {
  success: boolean;
  lesson_content: LessonContent;
  generation_time_seconds: number;
  error_message?: string;
  fallback_used: boolean;
}

interface StartLearningResponse {
  student_id: string;
  age_group: string;
  enrolled_coursework: {
    id: string;
    title: string;
    total_lessons: number;
    estimated_duration: string;
  };
  first_lesson: {
    lesson_id: string;
    position: number;
    total_lessons: number;
  };
  learning_path: {
    title: string;
    total_lessons: number;
    duration: string;
    first_lesson: string;
    description: string;
  };
  message: string;
  next_action: string;
}

interface CourseworkOption {
  id: string;
  title: string;
  description: string;
  type: string;
  total_lessons: number;
  estimated_duration: string;
  skill_level: string;
  is_free: boolean;
  price?: number;
  is_default: boolean;
  final_projects: string[];
}

interface CourseworkOptionsResponse {
  age_group: string;
  default_coursework_id: string;
  total_options: number;
  coursework_options: CourseworkOption[];
}

class APIService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Start a student's learning journey and get their default coursework
   */
  async startLearningJourney(studentAge: number, studentId?: string): Promise<StartLearningResponse> {
    const params = new URLSearchParams({
      student_age: studentAge.toString(),
      ...(studentId && { student_id: studentId }),
    });

    return this.request<StartLearningResponse>(`/student/start-learning?${params}`);
  }

  /**
   * Generate lesson content using AI
   */
  async generateLesson(request: GenerateLessonRequest): Promise<GenerateLessonResponse> {
    return this.request<GenerateLessonResponse>('/generate-lesson', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get all coursework options for an age group
   */
  async getCourseworkOptions(ageGroup: string): Promise<CourseworkOptionsResponse> {
    return this.request<CourseworkOptionsResponse>(`/student/coursework-options/${ageGroup}`);
  }

  /**
   * Get curriculum overview for an age group
   */
  async getCurriculumOverview(ageGroup: string) {
    return this.request(`/curriculum/${ageGroup}`);
  }

  /**
   * Get a specific lesson blueprint
   */
  async getLessonBlueprint(blueprintId: string) {
    return this.request(`/lesson/blueprint/${blueprintId}`);
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new APIService();
export type {
  CourseworkOption,
  CourseworkOptionsResponse, GenerateLessonRequest,
  GenerateLessonResponse, LessonContent, LessonProgress, StartLearningResponse, StudentProfile
};

