import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { SimpleCodeEditor } from '../components/ui/SimpleCodeEditor';
import { ExerciseEditor } from '../components/ui/ExerciseEditor';
import { CoinFlightOverlay } from '../components/ui/CoinFlightOverlay';
import { CoinDeductToastOverlay } from '../components/ui/CoinDeductToastOverlay';

import { LessonCompletionModal } from '../components/modals/LessonCompletionModal';
import { NewChallengeModal } from '../components/modals/NewChallengeModal';
import { LessonContent, apiService, type GenerateNewChallengeRequest } from '../services/api';
import { completeLesson, updateLessonProgress } from '../store/slices/progressSlice';
import { RootState } from '../store/store';

export default function LessonScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();
  const lessonId = String(params.lessonId || 'unknown_lesson');
  const dispatch = useDispatch();
  const autoAdvanceSetting = useSelector((state: RootState) => state.settings.learning.autoAdvance);
  const coinBalance = useSelector((state: RootState) => state.coins.balance);
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const progressState = useSelector((state: RootState) => state.progress);
  const coinBadgeRef = useRef<View | null>(null);
  const [coinTrigger, setCoinTrigger] = useState(0);
  const [deductTrigger, setDeductTrigger] = useState(0);
  const prevBalanceRef = useRef(coinBalance);
  useEffect(() => {
    if (coinBalance > prevBalanceRef.current) {
      setCoinTrigger((t) => t + 1);
    } else if (coinBalance < prevBalanceRef.current) {
      setDeductTrigger((t) => t + 1);
    }
    prevBalanceRef.current = coinBalance;
  }, [coinBalance]);
  
  // Parse lesson data from navigation params before usage
  let lessonData: LessonContent | null = null;
  try {
    lessonData = params.lessonData ? JSON.parse(params.lessonData as string) : null;
  } catch (error) {
    console.error('Failed to parse lesson data:', error);
  }
  
  const tabs = ['learn', 'code', 'exercise'];
  const [activeTab, setActiveTab] = useState<'learn' | 'code' | 'exercise'>('learn');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Allow lesson completion only after a successful challenge run
  const [challengePassed, setChallengePassed] = useState(false);
  
  // New challenge generation states
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(lessonData?.challenge || null);
  
  
  // Update current challenge when lesson data changes
  useEffect(() => {
    if (lessonData?.challenge && !currentChallenge) {
      setCurrentChallenge(lessonData.challenge);
    }
  }, [lessonData]);

  // Lesson sequencing context from navigation (optional)
  const lessonPosition = params.lessonPosition ? Number(params.lessonPosition) : null;
  const totalLessons = params.totalLessons ? Number(params.totalLessons) : null;
  const hasNext = !!(lessonPosition && totalLessons && lessonPosition < totalLessons);

  const steps = lessonData?.tutorial?.steps || [];
  const totalSteps = steps.length;

  useEffect(() => {
    // Update overall lesson progress based on step index
    if (lessonId && totalSteps > 0) {
      const progressPct = Math.max(0, Math.min(100, Math.round((currentStepIndex / totalSteps) * 100)));
      dispatch(updateLessonProgress({ id: lessonId, progress: progressPct }));
    }
  }, [currentStepIndex, totalSteps, lessonId]);

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleCompleteLesson = () => {
    if (lessonData && lessonId) {
      dispatch(completeLesson({
        id: lessonId,
        title: lessonData.title,
        type: 'tutorial', // You might want to get this from lessonData
        difficulty: 'beginner',
        completedAt: new Date().toISOString(),
        score: 100,
        timeSpent: lessonData.estimated_duration,
      }));
      setShowCompletionModal(true);
    }
  };

  const handleQuitLesson = () => {
    Alert.alert(
      'Quit Lesson',
      'Are you sure you want to quit this lesson? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Quit', 
          style: 'destructive',
          onPress: () => router.replace('/(tabs)/learn')
        },
      ]
    );
  };

  const handleContinueToNext = () => {
    setShowCompletionModal(false);
    // For now, go back to dashboard. Later we can implement next lesson logic
    router.replace('/(tabs)/learn');
  };

  const handleBackToDashboard = () => {
    setShowCompletionModal(false);
    router.replace('/(tabs)/learn');
  };
  
  const handleGenerateNewChallenge = async (difficulty: number) => {
    setIsGeneratingChallenge(true);
    // Keep modal open to show full loading overlay; it will close on success
    
    try {
      const requestData: GenerateNewChallengeRequest = {
        lesson_id: lessonId,
        current_challenge: currentChallenge,
        student_profile: {
          name: userProfile?.name || 'Student',
          age: userProfile?.age ?? 12,
          experience: (userProfile?.experience ?? 'beginner'),
          learning_style: (userProfile?.preferredStyle ?? 'mixed'),
          interests: userProfile?.interests ?? ['games', 'science'],
          completed_lessons: progressState?.completedLessons?.map(l => l.id) ?? [],
          current_streak: progressState?.streak?.current ?? 0,
          total_lessons_completed: progressState?.stats?.totalLessonsCompleted ?? 0,
        },
        difficulty,
        lesson_context: {
          title: lessonData?.title,
          learning_objectives: lessonData?.learning_objectives,
          concepts_covered: lessonData?.concepts_covered,
          estimated_duration: lessonData?.estimated_duration,
          difficulty_rating: lessonData?.difficulty_rating,
        },
      };
      
      const result = await apiService.generateNewChallenge(requestData);
      
      if (result.success && result.new_challenge) {
        setCurrentChallenge(result.new_challenge);
        // Reset challenge passed state for new challenge
        setChallengePassed(false);
        // Switch to code tab to show new challenge
        setActiveTab('code');
        // Close modal after successful generation
        setShowNewChallengeModal(false);
      } else {
        throw new Error(result.error_message || 'Failed to generate challenge');
      }
    } catch (error) {
      console.error('Error generating new challenge:', error);
      Alert.alert(
        'Generation Failed',
        'Could not generate a new challenge. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  const renderExercises = () => {
    // Prefer API-provided exercises. Support both a single Exercise (lessonData.exercise)
    // and an array (lessonData.exercises). Fallback to mock list if none provided.
    const apiExercises = (lessonData as any)?.exercises;
    const exercises = (Array.isArray(apiExercises) && apiExercises.length > 0)
      ? apiExercises
      : (lessonData?.exercise
          ? [{
              id: 'api-1',
              title: 'Practice Exercise',
              description: (lessonData.exercise as any).question,
              starterCode: (lessonData.exercise as any).starter_code,
              explanation: (lessonData.exercise as any).explanation,
              difficulty: 'Easy'
            }]
          : [
      {
        id: '1',
        title: 'Basic Variable Assignment',
        description: 'Create variables and assign values to them',
        starterCode: '# Create a variable named "name" and assign your name to it\n\n',
        solution: '# Create a variable named "name" and assign your name to it\nname = "Your Name"',
        difficulty: 'Easy'
      },
      {
        id: '2', 
        title: 'Simple Function',
        description: 'Write a function that takes two numbers and returns their sum',
        starterCode: '# Write a function called "add_numbers" that takes two parameters\n\n\ndef add_numbers(a, b):\n    # Your code here\n    pass',
        solution: 'def add_numbers(a, b):\n    return a + b',
        difficulty: 'Medium'
      },
      {
        id: '3',
        title: 'List Operations', 
        description: 'Create a list and perform basic operations on it',
        starterCode: '# Create a list of your favorite colors\n# Then add a new color to the list\n\n',
        solution: '# Create a list of your favorite colors\ncolors = ["blue", "green", "red"]\n# Then add a new color to the list\ncolors.append("purple")',
        difficulty: 'Easy'
      }
    ]);

    return (
      <View style={styles.exercisesContainer}>
        <Text style={[styles.exercisesHeader, { color: isDark ? '#ffffff' : '#111827' }]}>
          Practice Exercises
        </Text>
        <Text style={[styles.exercisesSubheader, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
          Click on any exercise card to expand the code editor
        </Text>
        
        {exercises.map((exercise: any, index: number) => (
          <View key={String(exercise.id ?? index + 1)} style={[styles.exerciseCard, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
            <TouchableOpacity
              style={styles.exerciseCardHeader}
              onPress={() => {
                const idStr = String(exercise.id ?? index + 1);
                setExpandedExerciseId(expandedExerciseId === idStr ? null : idStr);
              }}
            >
              <View style={styles.exerciseCardLeft}>
                <Text style={[styles.exerciseNumber, { color: '#6366f1' }]}> 
                  {index + 1}
                </Text>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseTitle, { color: isDark ? '#ffffff' : '#111827' }]}> 
                    {exercise.title ?? 'Practice Exercise'}
                  </Text>
                  {expandedExerciseId !== String(exercise.id ?? index + 1) && (
                    <Text style={[styles.exerciseDescription, { color: isDark ? '#d1d5db' : '#6b7280' }]}> 
                      {exercise.description ?? exercise.question ?? ''}
                    </Text>
                  )}
                  <View style={styles.exerciseMeta}>
                    <View style={[styles.difficultyBadge, { 
                      backgroundColor: (exercise.difficulty ?? 'Easy') === 'Easy' ? '#10b981' : 
                                     (exercise.difficulty ?? 'Easy') === 'Medium' ? '#f59e0b' : '#ef4444' 
                    }]}> 
                      <Text style={styles.difficultyText}>{exercise.difficulty ?? 'Easy'}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Ionicons 
                name={expandedExerciseId === String(exercise.id ?? index + 1) ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={isDark ? '#9ca3af' : '#6b7280'} 
              />
            </TouchableOpacity>
            
            {expandedExerciseId === String(exercise.id ?? index + 1) && (
              <Animated.View entering={FadeIn} style={styles.exerciseCodeEditor}>
                <ExerciseEditor
                  question={exercise.question ?? exercise.description}
                  explanation={exercise.explanation ?? (exercise.solution ? `Solution: ${exercise.solution}` : '')}
                  starterCode={exercise.starter_code ?? exercise.starterCode}
                  lessonId={lessonId}
                  onCodeChange={(code) => {
                    const progressPct = Math.max(0, Math.min(100, Math.round((currentStepIndex / totalSteps) * 100)));
                    dispatch(updateLessonProgress({ id: lessonId, progress: progressPct, codeState: code }));
                  }}
                  onRunCode={(code, results) => {
                    console.log('Running exercise code:', code, results);
                  }}
                />
              </Animated.View>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (!lessonData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f9fafb' }]}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={80} color="#ef4444" />
          <Text style={[styles.errorTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Lesson Not Found
          </Text>
          <Text style={[styles.errorText, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
            Unable to load lesson content. Please try again.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'learn':
        return (
          <Animated.View entering={FadeIn} style={styles.tabContent}>
            {/* Introduction */}
            <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Introduction
              </Text>
              <Text style={[styles.cardText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                {lessonData.introduction}
              </Text>
            </View>

            {/* Learning Objectives */}
            <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                What You'll Learn
              </Text>
              {lessonData.learning_objectives.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={[styles.objectiveText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                    {objective}
                  </Text>
                </View>
              ))}
            </View>

            {/* Tutorial Steps */}
            {lessonData.tutorial && totalSteps > 0 && (
              <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
                <View style={styles.stepHeader}>
                  <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827', flex: 1 }]}>
                    Tutorial Steps
                  </Text>
                  <Text style={[styles.stepIndicator, { color: isDark ? '#d1d5db' : '#6b7280' }]}>Step {currentStepIndex + 1} of {totalSteps}</Text>
                </View>
                {(() => {
                  const step = steps[currentStepIndex] as any;
                  if (!step) return null;
                  const stepTitle = step.title ?? step.heading ?? step.name ?? `Step ${step.step_number ?? currentStepIndex + 1}`;
                  const stepText = (step.content ?? step.text ?? step.description ?? '').toString();
                  const stepCode = step.code_example ?? step.code ?? step.example;
                  return (
                    <View style={styles.stepItem}>
                      <View style={styles.stepHeader}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{step.step_number ?? currentStepIndex + 1}</Text>
                        </View>
                        <Text style={[styles.stepTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                          {stepTitle}
                        </Text>
                      </View>
                      {!!stepText && (
                        <Text style={[styles.stepContent, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                          {stepText}
                        </Text>
                      )}
                      {!!stepCode && (
                        <View style={[styles.codeBlock, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}>
                          <Text style={[styles.codeText, { color: isDark ? '#e5e7eb' : '#374151' }]}>
                            {stepCode}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })()}
                <View style={styles.stepNav}>
                  <TouchableOpacity
                    style={[styles.stepNavButton, { opacity: currentStepIndex === 0 ? 0.5 : 1 }]}
                    disabled={currentStepIndex === 0}
                    onPress={handlePrevStep}
                  >
                    <Ionicons name="chevron-back" size={20} color="#111827" />
                    <Text style={styles.stepNavButtonText}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.stepNavButton, { opacity: currentStepIndex === totalSteps - 1 ? 0.5 : 1 }]}
                    disabled={currentStepIndex === totalSteps - 1}
                    onPress={handleNextStep}
                  >
                    <Text style={styles.stepNavButtonText}>Next</Text>
                    <Ionicons name="chevron-forward" size={20} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Key Concepts */}
            {lessonData.tutorial?.key_concepts && (
              <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
                <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Key Concepts
                </Text>
                <View style={styles.conceptsGrid}>
                  {lessonData.tutorial.key_concepts.map((concept, index) => (
                    <View key={index} style={[styles.conceptTag, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
                      <Text style={[styles.conceptText, { color: isDark ? '#e5e7eb' : '#374151' }]}>
                        {concept}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Encouragement */}
            <View style={[styles.card, styles.encouragementCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4' }]}>
              <Ionicons name="star" size={24} color="#22c55e" />
              <Text style={[styles.encouragementText, { color: isDark ? '#ffffff' : '#15803d' }]}>
                {lessonData.encouragement}
              </Text>
            </View>
          </Animated.View>
        );

      case 'code':
        return (
          <Animated.View entering={FadeIn} style={styles.tabContent}>
            {currentChallenge && (
              <SimpleCodeEditor
                key={currentChallenge.problem_description || `${lessonId}-challenge`}
                initialCode={currentChallenge.starter_code || ''}
                hints={currentChallenge.hints || []}
                solutionCode={currentChallenge.solution_code || ''}
                problemDescription={currentChallenge.problem_description || ''}
                explanation={currentChallenge.explanation || ''}
                onCodeChange={(code) => {
                  // Track student progress and persist code state
                  const progressPct = Math.max(0, Math.min(100, Math.round((currentStepIndex / totalSteps) * 100)));
                  dispatch(updateLessonProgress({ id: lessonId, progress: progressPct, codeState: code }));
                }}
                onRunCode={(code, meta) => {
                  // Track code execution and success
                  console.log('Executing solution code:', code, meta);
                  if (meta?.success) {
                    setChallengePassed(true);
                  }
                }}
              />
            )}
            
            {/* New Challenge Button */}
            <View style={styles.newChallengeContainer}>
              <TouchableOpacity
                style={[styles.newChallengeButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
                onPress={() => setShowNewChallengeModal(true)}
                disabled={isGeneratingChallenge}
              >
                <Ionicons 
                  name={isGeneratingChallenge ? "hourglass-outline" : "refresh"} 
                  size={20} 
                  color={isDark ? '#ffffff' : '#111827'} 
                />
                <Text style={[styles.newChallengeButtonText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  {isGeneratingChallenge ? 'Generating...' : 'New Challenge'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 'exercise':
        return (
          <Animated.View entering={FadeIn} style={styles.tabContent}>
            {renderExercises()}
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f9fafb' }]}>
      {/* Menu Overlay */}
      {showMenu && (
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        />
      )}
      
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#111827'} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            {lessonData.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
            {lessonData.estimated_duration} minutes • {lessonData.difficulty_rating}/5 difficulty
          </Text>
        </View>
        <View style={styles.menuContainer}>
          <View style={styles.coinBadge} ref={coinBadgeRef}>
            <Ionicons name="cash-outline" size={16} color="#ffffff" />
            <Text style={styles.coinText}>{coinBalance}</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={isDark ? '#ffffff' : '#111827'} />
          </TouchableOpacity>
          
          {showMenu && (
            <View style={[styles.dropdown, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => {
                  setShowMenu(false);
                  handleQuitLesson();
                }}
              >
                <Ionicons name="exit-outline" size={20} color="#ef4444" />
                <Text style={[styles.dropdownText, { color: '#ef4444' }]}>
                  Quit Lesson
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.tabContainer}>
        <View style={[styles.tabBar, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
          {[
            { key: 'learn', label: 'Learn', icon: 'book-outline' },
            { key: 'code', label: 'Code', icon: 'code-slash-outline' },
            { key: 'exercise', label: 'Exercises', icon: 'create-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                activeTab === tab.key && styles.activeTabItem,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.key ? '#6366f1' : (isDark ? '#9ca3af' : '#6b7280')}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: activeTab === tab.key
                      ? '#6366f1'
                      : isDark ? '#9ca3af' : '#6b7280',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      {challengePassed && (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteLesson}
          >
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
            <Ionicons name="checkmark" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Completion Modal */}
      <LessonCompletionModal
        visible={showCompletionModal}
        onContinue={handleContinueToNext}
        onBackToDashboard={handleBackToDashboard}
        lessonTitle={lessonData?.title || 'Lesson'}
        hasNextLesson={hasNext}
        autoAdvanceDefault={autoAdvanceSetting}
      />
      
      <NewChallengeModal
        visible={showNewChallengeModal}
        onClose={() => setShowNewChallengeModal(false)}
        onGenerateChallenge={handleGenerateNewChallenge}
        isLoading={isGeneratingChallenge}
      />
      
      <CoinFlightOverlay trigger={coinTrigger} targetRef={coinBadgeRef} />
      <CoinDeductToastOverlay trigger={deductTrigger} targetRef={coinBadgeRef} text="-1" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  menuContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
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
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    minWidth: 140,
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: '#eef2ff',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    gap: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  objectiveText: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  stepItem: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  codeBlock: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  codeText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    lineHeight: 20,
  },
  conceptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conceptTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  conceptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  encouragementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
  },
  encouragementText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 8,
  },
  hintNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  hintText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  challengeDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  hintSubtext: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  testCaseItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  testCaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  testCaseDetails: {
    marginBottom: 4,
  },
  testCaseLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  testCaseValue: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginTop: 2,
  },
  stepNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  stepNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  stepNavButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  completeButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
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
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  exercisesContainer: {
    gap: 16,
  },
  exercisesHeader: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  exercisesSubheader: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  exerciseCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  exerciseCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 20,
    fontWeight: '700',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 36,
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseCodeEditor: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.3)',
    paddingTop: 16,
  },
  newChallengeContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.3)',
  },
  newChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newChallengeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
