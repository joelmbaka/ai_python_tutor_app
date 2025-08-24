import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Lesson {
  id: string;
  title: string;
  type: 'challenge' | 'tutorial' | 'project';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completedAt?: string;
  score?: number;
  timeSpent?: number; // in minutes
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: string;
}

export interface Streak {
  current: number;
  longest: number;
  lastActivityDate: string;
}

export interface ProgressState {
  completedLessons: Lesson[];
  currentLesson: {
    id: string;
    progress: number; // 0-100
    codeState?: string;
    lastSavedAt: string;
  } | null;
  badges: Badge[];
  streak: Streak;
  totalXP: number;
  level: number;
  stats: {
    totalLessonsCompleted: number;
    totalTimeSpent: number; // in minutes
    averageScore: number;
    challengesCompleted: number;
    projectsCompleted: number;
  };
}

const initialState: ProgressState = {
  completedLessons: [],
  currentLesson: null,
  badges: [],
  streak: {
    current: 0,
    longest: 0,
    lastActivityDate: '',
  },
  totalXP: 0,
  level: 1,
  stats: {
    totalLessonsCompleted: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    challengesCompleted: 0,
    projectsCompleted: 0,
  },
};

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    completeLesson: (state, action: PayloadAction<Lesson>) => {
      const lesson = action.payload;
      state.completedLessons.push(lesson);
      
      // Update stats
      state.stats.totalLessonsCompleted += 1;
      state.stats.totalTimeSpent += lesson.timeSpent || 0;
      
      if (lesson.type === 'challenge') {
        state.stats.challengesCompleted += 1;
      } else if (lesson.type === 'project') {
        state.stats.projectsCompleted += 1;
      }
      
      // Recalculate average score
      const lessonsWithScores = state.completedLessons.filter(l => l.score !== undefined);
      if (lessonsWithScores.length > 0) {
        state.stats.averageScore = lessonsWithScores.reduce((sum, l) => sum + (l.score || 0), 0) / lessonsWithScores.length;
      }
      
      // Award XP based on lesson type and score
      const baseXP = lesson.type === 'project' ? 100 : lesson.type === 'challenge' ? 50 : 25;
      const scoreMultiplier = (lesson.score || 50) / 100;
      const earnedXP = Math.round(baseXP * scoreMultiplier);
      state.totalXP += earnedXP;
      
      // Check for level up (every 500 XP)
      const newLevel = Math.floor(state.totalXP / 500) + 1;
      if (newLevel > state.level) {
        state.level = newLevel;
      }
      
      // Clear current lesson if it matches
      if (state.currentLesson?.id === lesson.id) {
        state.currentLesson = null;
      }
    },
    
    updateCurrentLesson: (state, action: PayloadAction<ProgressState['currentLesson']>) => {
      state.currentLesson = action.payload;
    },
    
    updateLessonProgress: (state, action: PayloadAction<{ id: string; progress: number; codeState?: string }>) => {
      const { id, progress, codeState } = action.payload;
      state.currentLesson = {
        id,
        progress,
        codeState,
        lastSavedAt: new Date().toISOString(),
      };
    },
    
    unlockBadge: (state, action: PayloadAction<Badge>) => {
      state.badges.push(action.payload);
    },
    
    updateStreak: (state) => {
      const today = new Date().toDateString();
      const lastActivity = new Date(state.streak.lastActivityDate).toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (lastActivity === today) {
        // Already updated today
        return;
      } else if (lastActivity === yesterday) {
        // Continue streak
        state.streak.current += 1;
      } else {
        // Reset streak
        state.streak.current = 1;
      }
      
      state.streak.lastActivityDate = new Date().toISOString();
      
      if (state.streak.current > state.streak.longest) {
        state.streak.longest = state.streak.current;
      }
    },
    
    resetProgress: (state) => {
      return initialState;
    },
  },
});

export const {
  completeLesson,
  updateCurrentLesson,
  updateLessonProgress,
  unlockBadge,
  updateStreak,
  resetProgress,
} = progressSlice.actions;

export default progressSlice.reducer;
