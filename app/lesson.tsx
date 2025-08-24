import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
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
import { useDispatch } from 'react-redux';

import { LessonCompletionModal } from '../components/modals/LessonCompletionModal';
import { LessonContent } from '../services/api';
import { completeLesson } from '../store/slices/progressSlice';

export default function LessonScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState<'learn' | 'code' | 'test'>('learn');
  const [showMenu, setShowMenu] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  let lessonData: LessonContent | null = null;
  try {
    lessonData = params.lessonData ? JSON.parse(params.lessonData as string) : null;
  } catch (error) {
    console.error('Failed to parse lesson data:', error);
  }

  const handleCompleteLesson = () => {
    if (lessonData && params.lessonId) {
      dispatch(completeLesson({
        id: params.lessonId as string,
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
            {lessonData.tutorial && (
              <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
                <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Tutorial Steps
                </Text>
                {lessonData.tutorial.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepHeader}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{step.step_number}</Text>
                      </View>
                      <Text style={[styles.stepTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                        {step.title}
                      </Text>
                    </View>
                    <Text style={[styles.stepContent, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                      {step.content}
                    </Text>
                    {step.code_example && (
                      <View style={[styles.codeBlock, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}>
                        <Text style={[styles.codeText, { color: isDark ? '#e5e7eb' : '#374151' }]}>
                          {step.code_example}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
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
            <View style={[styles.card, styles.encouragementCard]}>
              <Ionicons name="heart" size={24} color="#ef4444" />
              <Text style={[styles.encouragementText, { color: isDark ? '#ffffff' : '#111827' }]}>
                {lessonData.encouragement}
              </Text>
            </View>
          </Animated.View>
        );

      case 'code':
        return (
          <Animated.View entering={FadeIn} style={styles.tabContent}>
            {lessonData.challenge && (
              <>
                <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
                  <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                    Starter Code
                  </Text>
                  <View style={[styles.codeBlock, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}>
                    <Text style={[styles.codeText, { color: isDark ? '#e5e7eb' : '#374151' }]}>
                      {lessonData.challenge.starter_code}
                    </Text>
                  </View>
                </View>

                <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
                  <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                    Hints
                  </Text>
                  {lessonData.challenge.hints.map((hint, index) => (
                    <View key={index} style={styles.hintItem}>
                      <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                      <Text style={[styles.hintText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                        {hint}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        );

      case 'test':
        return (
          <Animated.View entering={FadeIn} style={styles.tabContent}>
            {lessonData.challenge?.test_cases && (
              <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
                <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Test Cases
                </Text>
                {lessonData.challenge.test_cases.map((testCase, index) => (
                  <View key={index} style={styles.testCaseItem}>
                    <Text style={[styles.testCaseTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                      Test Case {index + 1}: {testCase.description}
                    </Text>
                    <View style={styles.testCaseDetails}>
                      <Text style={[styles.testCaseLabel, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                        Input:
                      </Text>
                      <Text style={[styles.testCaseValue, { color: isDark ? '#e5e7eb' : '#374151' }]}>
                        {testCase.input}
                      </Text>
                    </View>
                    <View style={styles.testCaseDetails}>
                      <Text style={[styles.testCaseLabel, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                        Expected Output:
                      </Text>
                      <Text style={[styles.testCaseValue, { color: isDark ? '#e5e7eb' : '#374151' }]}>
                        {testCase.expected_output}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
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
            { key: 'test', label: 'Test', icon: 'checkmark-circle-outline' },
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
      <Animated.View entering={FadeInDown.delay(400)} style={styles.bottomAction}>
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteLesson}>
          <Text style={styles.completeButtonText}>Mark as Complete</Text>
          <Ionicons name="checkmark" size={20} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Completion Modal */}
      <LessonCompletionModal
        visible={showCompletionModal}
        onContinue={handleContinueToNext}
        onBackToDashboard={handleBackToDashboard}
        lessonTitle={lessonData?.title || 'Lesson'}
        nextLessonTitle="Variables and Data Types" // This should come from your lesson sequence
        hasNextLesson={true} // This should be determined based on lesson position
      />
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
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
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
  },
  hintText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
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
});
