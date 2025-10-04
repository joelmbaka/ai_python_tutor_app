import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { LessonCard } from '../../components/ui/LessonCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { apiService, LessonContent, StartLearningResponse } from '../../services/api';
import { updateCurrentLesson, storeLessonContent } from '../../store/slices/progressSlice';
import { RootState } from '../../store/store';

interface LearningState {
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  coursework: StartLearningResponse | null;
  generatedLesson: LessonContent | null;
}

export default function LearnScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dispatch = useDispatch();
  
  const { isOnboarded, profile } = useSelector((state: RootState) => state.user);
  const { currentLesson, completedLessons, lessonContents } = useSelector((state: RootState) => state.progress);
  const coinBalance = useSelector((state: RootState) => state.coins.balance);

  const [state, setState] = useState<LearningState>({
    isLoading: false,
    isGenerating: false,
    error: null,
    coursework: null,
    generatedLesson: null,
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOnboarded && profile && !state.coursework) {
      initializeLearningJourney();
    }
  }, [isOnboarded, profile]);

  const initializeLearningJourney = async () => {
    if (!profile?.age) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiService.startLearningJourney(profile.age);
      setState(prev => ({ 
        ...prev, 
        coursework: response,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to initialize learning journey:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load your learning journey. Please try again.',
        isLoading: false,
      }));
    }
  };

  const generateFirstLesson = async () => {
    if (!state.coursework || !profile) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const studentProfile = {
        name: profile.name || 'Student',
        age: profile.age || 10,
        experience_level: profile.experience || 'beginner',
        learning_goals: ['Learn Python basics'],
        preferred_difficulty: 'easy',
        interests: profile.interests ?? [],
      };

      // Remove studentProgress as it's not needed in the new API

      const response = await apiService.generateLesson({
        blueprint_id: state.coursework.first_lesson.lesson_id,
        student_profile: {
          name: profile.name || 'Student',
          age: profile.age || 10,
          experience: profile.experience || 'beginner',
          learning_style: profile.preferredStyle || 'mixed',
          interests: profile.interests ?? [],
        },
        custom_instructions: `First lesson for ${profile.name}, age ${profile.age}`,
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          generatedLesson: response.lesson_content,
          isGenerating: false,
        }));
        
        dispatch(updateCurrentLesson({
          id: state.coursework.first_lesson.lesson_id,
          progress: 0,
          lastSavedAt: new Date().toISOString()
        }));
        // Persist content so it's available after reloads
        dispatch(storeLessonContent({ id: state.coursework.first_lesson.lesson_id, content: response.lesson_content }));
        
        // Navigate to lesson screen with sequencing info
        router.push({
          pathname: '/lesson',
          params: {
            lessonId: state.coursework.first_lesson.lesson_id,
            lessonData: JSON.stringify(response.lesson_content),
            lessonPosition: state.coursework.first_lesson.position.toString(),
            totalLessons: state.coursework.first_lesson.total_lessons.toString(),
          },
        });
      } else {
        throw new Error(response.error_message || 'Failed to generate lesson');
      }
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to generate your lesson. Please try again.',
        isGenerating: false,
      }));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeLearningJourney();
    setRefreshing(false);
  };

  const handleLessonPress = (lessonId: string, position: number) => {
    if (position === 1) {
      const candidateIdFromCoursework = state.coursework?.first_lesson.lesson_id;
      const preferredId = currentLesson?.id || (lessonContents && Object.keys(lessonContents)[0]) || candidateIdFromCoursework;
      const persistedLesson = preferredId ? (lessonContents?.[preferredId] as LessonContent | undefined) : undefined;
      if (persistedLesson && state.coursework) {
        router.push({
          pathname: '/lesson',
          params: {
            lessonId: preferredId || lessonId,
            lessonData: JSON.stringify(persistedLesson),
            lessonPosition: state.coursework.first_lesson.position.toString(),
            totalLessons: state.coursework.first_lesson.total_lessons.toString(),
          },
        });
      } else {
        // If content isn't found, generate it now
        generateFirstLesson();
      }
      return;
    }

    // For now, just show coming soon for subsequent lessons
    Alert.alert(
      'Coming Soon',
      'This lesson will be available once you complete the previous lessons.',
      [{ text: 'OK' }]
    );
  };

  // Remove this check since routing handles onboarding flow

  if (state.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f9fafb' }]}>
        <LoadingSpinner
          text="Setting up your learning journey..."
          subText="Personalizing your curriculum based on your preferences"
        />
      </SafeAreaView>
    );
  }

  if (state.error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f9fafb' }]}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={80} color="#ef4444" />
          <Text style={[styles.errorTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Something went wrong
          </Text>
          <Text style={[styles.errorText, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
            {state.error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeLearningJourney}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f9fafb' }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
              Hello, {profile?.name || 'Student'}! 👋
            </Text>
            <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              Ready to code?
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.coinBadge}>
              <Ionicons name="cash-outline" size={16} color="#ffffff" />
              <Text style={styles.coinText}>{coinBalance}</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={isDark ? '#d1d5db' : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Learning Path Overview */}
        {state.coursework && (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.pathOverview}>
            <View
              style={[
                styles.pathCard,
                { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' },
              ]}
            >
              <View style={styles.pathHeader}>
                <View style={styles.pathIcon}>
                  <Ionicons name="rocket" size={24} color="#6366f1" />
                </View>
                <View style={styles.pathInfo}>
                  <Text style={[styles.pathTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                    {state.coursework.enrolled_coursework.title}
                  </Text>
                  <Text style={[styles.pathMeta, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                    {state.coursework.enrolled_coursework.total_lessons} lessons • {state.coursework.enrolled_coursework.estimated_duration}
                  </Text>
                </View>
              </View>
              <Text style={[styles.pathDescription, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                {state.coursework.learning_path.description}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Current Lesson Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              Coursework
            </Text>
            {state.isGenerating && (
              <LoadingSpinner size={20} text="" />
            )}
          </View>

          {state.coursework && (() => {
            const candidateIdFromCoursework = state.coursework.first_lesson.lesson_id;
            const firstLessonId = currentLesson?.id || (lessonContents && Object.keys(lessonContents)[0]) || candidateIdFromCoursework;
            const persistedLesson = firstLessonId ? (lessonContents?.[firstLessonId] as LessonContent | undefined) : undefined;
            const title = persistedLesson?.title ?? 'Thinking Like a Computer';
            const description = persistedLesson?.introduction ?? 'Learn how computers think and solve problems step by step. This is your introduction to computational thinking!';
            const duration = persistedLesson?.estimated_duration ?? 15;
            const difficulty = (persistedLesson?.difficulty_rating as number | undefined) ?? 1;
            return (
              <LessonCard
                title={title}
                description={description}
                type={'tutorial'}
                duration={duration}
                difficulty={difficulty}
                position={state.coursework.first_lesson.position}
                totalLessons={state.coursework.enrolled_coursework.total_lessons}
                isCompleted={firstLessonId ? completedLessons.some(lesson => lesson.id === firstLessonId) : false}
                onPress={() => handleLessonPress(firstLessonId || candidateIdFromCoursework, state.coursework!.first_lesson.position)}
                animationDelay={100}
              />
            );
          })()}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' },
              ]}
            >
              <Ionicons name="play-circle" size={32} color="#10b981" />
              <Text style={[styles.actionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Continue Learning
              </Text>
              <Text style={[styles.actionText, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                Pick up where you left off
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' },
              ]}
            >
              <Ionicons name="code-slash" size={32} color="#8b5cf6" />
              <Text style={[styles.actionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Practice Code
              </Text>
              <Text style={[styles.actionText, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                Solve coding challenges
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  settingsButton: {
    padding: 8,
    marginLeft: 8,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinText: {
    color: '#ffffff',
    fontWeight: '700',
    marginLeft: 6,
  },
  pathOverview: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  pathCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pathIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pathInfo: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  pathMeta: {
    fontSize: 14,
  },
  pathDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
