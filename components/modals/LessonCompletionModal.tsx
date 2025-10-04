import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface LessonCompletionModalProps {
  visible: boolean;
  onContinue: () => void;
  onBackToDashboard: () => void;
  lessonTitle: string;
  nextLessonTitle?: string;
  hasNextLesson: boolean;
  autoAdvanceDefault?: boolean;
}

export const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({
  visible,
  onContinue,
  onBackToDashboard,
  lessonTitle,
  nextLessonTitle,
  hasNextLesson,
  autoAdvanceDefault,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [countdown, setCountdown] = useState(10);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(autoAdvanceDefault ?? true);
  
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const celebrationAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(celebrationAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Initialize auto-advance from provided default each time it opens
      setAutoAdvance(autoAdvanceDefault ?? true);

      // Start countdown if has next lesson
      if (hasNextLesson && autoAdvance) {
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              onContinue();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      celebrationAnim.setValue(0);
      setCountdown(10);
      setAutoAdvance(autoAdvanceDefault ?? true);
    }
  }, [visible, hasNextLesson, autoAdvance, autoAdvanceDefault]);

  const handleContinue = () => {
    setAutoAdvance(false);
    onContinue();
  };

  const handleBackToDashboard = () => {
    setAutoAdvance(false);
    onBackToDashboard();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={50} style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#2a2a3e' : '#ffffff',
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Celebration Icons */}
          <Animated.View
            style={[
              styles.celebrationContainer,
              {
                opacity: celebrationAnim,
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationEmoji}>✨</Text>
            <Text style={styles.celebrationEmoji}>🚀</Text>
          </Animated.View>

          {/* Completion Message */}
          <View style={styles.content}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111827' }]}>
              Lesson Complete!
            </Text>
            
            <Text style={[styles.subtitle, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
              Great job finishing "{lessonTitle}"
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={20} color="#f59e0b" />
                <Text style={[styles.statText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  +50 XP
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={20} color="#ef4444" />
                <Text style={[styles.statText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Streak +1
                </Text>
              </View>
            </View>

            {hasNextLesson && nextLessonTitle && (
              <View style={styles.nextLessonInfo}>
                <Text style={[styles.nextLessonLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                  Next lesson:
                </Text>
                <Text style={[styles.nextLessonTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  {nextLessonTitle}
                </Text>
              </View>
            )}

            {/* Countdown */}
            {hasNextLesson && autoAdvance && (
              <View style={styles.countdownContainer}>
                <Text style={[styles.countdownText, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                  Auto-advancing in {countdown}s
                </Text>
                <TouchableOpacity
                  style={styles.cancelAutoButton}
                  onPress={() => setAutoAdvance(false)}
                >
                  <Text style={styles.cancelAutoText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {hasNextLesson ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleBackToDashboard}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    Back to Dashboard
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleContinue}
                >
                  <Text style={styles.primaryButtonText}>
                    Continue Learning
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { width: '100%' }]}
                onPress={handleBackToDashboard}
              >
                <Text style={styles.primaryButtonText}>
                  Back to Dashboard
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  celebrationContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 1,
  },
  celebrationEmoji: {
    fontSize: 32,
  },
  content: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextLessonInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  nextLessonLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  nextLessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 14,
    marginBottom: 8,
  },
  cancelAutoButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  cancelAutoText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#6b7280',
  },
});
