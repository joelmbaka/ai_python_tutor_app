import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChallengeSlide1 } from './slides/ChallengeSlide1';
import { PreferencesSlide } from './slides/PreferencesSlide';
import { UserDetailsSlide } from './slides/UserDetailsSlide';
import { WelcomeSlide } from './slides/WelcomeSlide';

const { width, height } = Dimensions.get('window');

interface OnboardingModalProps {
  visible: boolean;
  onComplete: (userData: UserData) => void;
}

export interface UserData {
  name: string;
  age: number;
  experience: 'beginner' | 'some' | 'advanced';
  interests: string[];
  preferredStyle: 'visual' | 'text' | 'mixed';
}

interface RequiredUserData {
  name: string;
  age: number;
  experience: 'beginner' | 'some' | 'advanced';
  interests: string[];
  preferredStyle: 'visual' | 'text' | 'mixed';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [challenge1Completed, setChallenge1Completed] = useState(false);
  const [challenge2Completed, setChallenge2Completed] = useState(false);

  const slides = [
    { id: 'welcome', component: WelcomeSlide },
    { id: 'challenge1', component: ChallengeSlide1 },
    // { id: 'challenge2', component: ChallengeSlide2 }, // Hidden for now
    { id: 'userDetails', component: UserDetailsSlide },
    { id: 'preferences', component: PreferencesSlide },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Complete onboarding with proper validation
      if (isCompleteUserData(userData)) {
        onComplete(userData);
      }
    }
  };

  const isCompleteUserData = (data: Partial<UserData>): data is UserData => {
    return !!(
      data.name && 
      data.age && 
      data.experience && 
      data.interests && 
      data.interests.length > 0 && 
      data.preferredStyle
    );
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleUserDataUpdate = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const canProceed = (): boolean => {
    switch (currentSlide) {
      case 0: // Welcome
        return true;
      case 1: // Challenge 1
        return challenge1Completed;
      case 2: // User Details (Challenge 2 is hidden)
        return !!(userData.name && userData.age);
      case 3: // Preferences
        return isCompleteUserData(userData);
      default:
        return false;
    }
  };

  const renderSlide = () => {
    const SlideComponent = slides[currentSlide].component;
    const slideId = slides[currentSlide].id;

    const slideProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      onUserDataUpdate: handleUserDataUpdate,
      userData,
      canProceed: canProceed(),
    };

    switch (slideId) {
      case 'challenge1':
        return (
          <SlideComponent
            {...slideProps}
            onChallengeComplete={() => setChallenge1Completed(true)}
          />
        );
      case 'challenge2':
        return (
          <SlideComponent
            {...slideProps}
            onChallengeComplete={() => setChallenge2Completed(true)}
          />
        );
      case 'welcome':
      case 'userDetails':
      case 'preferences':
        return <SlideComponent {...(slideProps as any)} />;
      default:
        return <SlideComponent {...(slideProps as any)} />;
    }
  };

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index === currentSlide && styles.activeDot,
            index < currentSlide && styles.completedDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.container}>
        <BlurView intensity={20} style={styles.blurContainer}>
          {/* Progress Indicator */}
          {renderProgressIndicator()}

          {/* Slide Content */}
          <View style={styles.slideContainer}>
            {renderSlide()}
          </View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            {currentSlide > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.backButton]}
                onPress={handlePrevious}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                !canProceed() && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? 'Start Learning! 🚀' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  blurContainer: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: '#4A90E2',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButton: {
    backgroundColor: '#4A90E2',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
