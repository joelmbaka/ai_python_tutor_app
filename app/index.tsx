import { router } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export default function Index() {
  const { isOnboarded } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (isOnboarded) {
      router.replace('/(tabs)/learn');
    } else {
      router.replace('/onboarding');
    }
  }, [isOnboarded]);

  return null;
}

