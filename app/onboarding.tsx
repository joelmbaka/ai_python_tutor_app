import { router } from 'expo-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import { OnboardingModal, UserData } from '../components/modals/OnboardingModal';
import { updateStreak } from '../store/slices/progressSlice';
import { completeOnboarding } from '../store/slices/userSlice';

export default function OnboardingScreen() {
  const dispatch = useDispatch();

  const handleOnboardingComplete = (userData: UserData) => {
    console.log('User completed onboarding:', userData);
    
    // Save to Redux store (automatically persists to AsyncStorage)
    dispatch(completeOnboarding({
      name: userData.name,
      age: userData.age,
      experience: userData.experience,
      interests: userData.interests,
      preferredStyle: userData.preferredStyle,
    }));
    
    // Start their learning streak
    dispatch(updateStreak());
    
    // Navigate to main app
    router.replace('/(tabs)/learn');
  };

  return (
    <OnboardingModal 
      visible={true}
      onComplete={handleOnboardingComplete}
    />
  );
}
