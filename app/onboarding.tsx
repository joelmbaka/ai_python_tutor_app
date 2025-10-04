import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { OnboardingModal, UserData } from '../components/modals/OnboardingModal';
import { apiService } from '../services/api';
import { updateStreak, updateCurrentLesson, storeLessonContent } from '../store/slices/progressSlice';
import { completeOnboarding } from '../store/slices/userSlice';
import { ChecklistLoader } from '../components/ui/ChecklistLoader';

export default function OnboardingScreen() {
  const dispatch = useDispatch();
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const checklistItems = [
    'Saving your profile',
    'Setting up your learning path',
    'Personalizing content',
    'Finalizing setup',
    'Generating your first lesson',
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      progressTimersRef.current.forEach(clearTimeout);
      progressTimersRef.current = [];
    };
  }, []);

  const handleOnboardingComplete = async (userData: UserData) => {
    console.log('User completed onboarding:', userData);

    // Save to Redux store (automatically persists to AsyncStorage)
    dispatch(completeOnboarding({
      name: userData.name,
      age: userData.age,
      experience: userData.experience,
      interests: userData.interests ?? [],
      preferredStyle: userData.preferredStyle || 'mixed',
    }));

    // Start their learning streak
    dispatch(updateStreak());

    try {
      // Show loader and start timeout watchdog (3 minutes)
      setLoaderVisible(true);
      setTimedOut(false);
      setActiveIndex(0);
      timeoutRef.current = setTimeout(() => setTimedOut(true), 3 * 60 * 1000);

      // Clear any existing progress timers
      progressTimersRef.current.forEach(clearTimeout);
      progressTimersRef.current = [];

      // Kick off prerequisite call in background (we'll await later)
      const startJourneyPromise = apiService.startLearningJourney(userData.age);
      // Begin generation as soon as we know the first lesson id, but don't block UI until last step
      const combinedPromise = startJourneyPromise.then(async (startResponse) => {
        const firstLessonId = startResponse.first_lesson.lesson_id;
        const genResponse = await apiService.generateLesson({
          blueprint_id: firstLessonId,
          student_profile: {
            name: userData.name,
            age: userData.age,
            experience: userData.experience,
            learning_style: userData.preferredStyle || 'mixed',
            interests: userData.interests ?? [],
          },
          custom_instructions: `First lesson for ${userData.name}, age ${userData.age}`,
        });
        return { startResponse, firstLessonId, genResponse };
      });

      // Stagger first four steps by 6s each
      progressTimersRef.current.push(setTimeout(() => setActiveIndex(1), 6000));
      progressTimersRef.current.push(setTimeout(() => setActiveIndex(2), 12000));
      progressTimersRef.current.push(setTimeout(() => setActiveIndex(3), 18000));

      // At 24s, switch to final step and keep spinner until AI returns
      progressTimersRef.current.push(setTimeout(() => {
        setActiveIndex(4);

        (async () => {
          try {
            const { startResponse, firstLessonId, genResponse } = await combinedPromise;

            if (genResponse.success) {
              // Update current lesson in progress
              dispatch(updateCurrentLesson({
                id: firstLessonId,
                progress: 0,
                lastSavedAt: new Date().toISOString(),
              }));

              // Persist lesson content for later access from Learn tab
              dispatch(storeLessonContent({ id: firstLessonId, content: genResponse.lesson_content }));

              // Navigate directly to the lesson screen
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              progressTimersRef.current.forEach(clearTimeout);
              progressTimersRef.current = [];
              setLoaderVisible(false);
              router.replace({
                pathname: '/lesson',
                params: {
                  lessonId: firstLessonId,
                  lessonData: JSON.stringify(genResponse.lesson_content),
                  lessonPosition: startResponse.first_lesson.position.toString(),
                  totalLessons: startResponse.first_lesson.total_lessons.toString(),
                },
              });
            } else {
              // If generation failed, proceed to dashboard as fallback
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              progressTimersRef.current.forEach(clearTimeout);
              progressTimersRef.current = [];
              setLoaderVisible(false);
              router.replace('/(tabs)/learn');
            }
          } catch (error) {
            console.error('Failed to start learning:', error);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            progressTimersRef.current.forEach(clearTimeout);
            progressTimersRef.current = [];
            setLoaderVisible(false);
            router.replace('/(tabs)/learn');
          }
        })();
      }, 24000));
    } catch (error) {
      console.error('Failed to start learning:', error);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setLoaderVisible(false);
      router.replace('/(tabs)/learn');
    }
  };

  return (
    <>
      <OnboardingModal 
        visible={true}
        onComplete={handleOnboardingComplete}
      />
      <ChecklistLoader
        visible={loaderVisible}
        items={checklistItems}
        activeIndex={activeIndex}
        timedOut={timedOut}
        title="Preparing your first lesson..."
      />
    </>
  );
}
