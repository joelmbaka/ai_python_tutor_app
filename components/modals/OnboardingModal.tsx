import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { ChallengeSlide1 } from './slides/ChallengeSlide1';
import { PreferencesSlide } from './slides/PreferencesSlide';
import { UserDetailsSlide } from './slides/UserDetailsSlide';
import { WelcomeSlide } from './slides/WelcomeSlide';
import CoinFlightOverlay from '../ui/CoinFlightOverlay';

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
  const coinBalance = useSelector((state: RootState) => state.coins.balance);
  const [coinTrigger, setCoinTrigger] = useState(0);
  const prevBalanceRef = useRef(coinBalance);
  const coinBadgeRef = useRef<View | null>(null);

  const slides = [
    { id: 'welcome', component: WelcomeSlide },
    { id: 'challenge1', component: ChallengeSlide1 },
    // { id: 'challenge2', component: ChallengeSlide2 }, // Hidden for now
    { id: 'userDetails', component: UserDetailsSlide },
  ];

  // Trigger coin flight animation on balance increase (except on welcome slide)
  useEffect(() => {
    if (coinBalance > prevBalanceRef.current && currentSlide !== 0) {
      setCoinTrigger((t) => t + 1);
    }
    prevBalanceRef.current = coinBalance;
  }, [coinBalance, currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Complete onboarding with proper validation
      if (isCompleteUserData(userData)) {
        const finalData: UserData = {
          name: userData.name!,
          age: userData.age!,
          experience: userData.experience!,
          preferredStyle: userData.preferredStyle!,
          interests: userData.interests ?? [],
        };
        onComplete(finalData);
      }
    }
  };

  const isCompleteUserData = (data: Partial<UserData>): data is UserData => {
    return !!(
      data.name &&
      data.age &&
      data.experience
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
      case 2: // User Details
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
          {/* Coin Badge (hidden on welcome slide) */}
          {currentSlide !== 0 && (
            <View ref={coinBadgeRef} style={styles.coinBadgeTopRight}>
              <View style={styles.coinBadge}>
                <Ionicons name="cash-outline" size={16} color="#ffffff" />
                <Text style={styles.coinText}>{coinBalance}</Text>
              </View>
            </View>
          )}
          {/* Coin flight overlay */}
          <CoinFlightOverlay trigger={coinTrigger} targetRef={coinBadgeRef} />
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
    paddingVertical: 24,
    marginTop: 8,
    gap: 8,
  },
  coinBadgeTopRight: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  coinText: {
    color: '#ffffff',
    fontWeight: '700',
    marginLeft: 6,
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
