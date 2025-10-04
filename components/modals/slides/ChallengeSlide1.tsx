import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { UserData } from '../OnboardingModal';
import { useAppDispatch } from '../../../store/hooks';
import { addCoins } from '../../../store/slices/coinsSlice';

interface ChallengeSlide1Props {
  onNext: () => void;
  onChallengeComplete: () => void;
  canProceed: boolean;
  onUserDataUpdate?: (data: Partial<UserData>) => void;
  userData?: Partial<UserData>;
}

export const ChallengeSlide1: React.FC<ChallengeSlide1Props> = ({
  onChallengeComplete,
  canProceed,
  onUserDataUpdate,
  userData,
}) => {
  const [userName, setUserName] = useState(userData?.name || '');
  const [hasRun, setHasRun] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const dispatch = useAppDispatch();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const outputAnim = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Keep layout centered; no shifting to top on keyboard/output

  // Keep shared onboarding userData updated with the entered name
  React.useEffect(() => {
    if (onUserDataUpdate) {
      onUserDataUpdate({ name: userName.trim() });
    }
  }, [userName]);

  const runCode = () => {
    if (!userName.trim()) {
      setOutput('⚠️ Please enter your name first!');
      return;
    }

    setIsRunning(true);
    
    // Simulate code execution
    setTimeout(() => {
      const generatedOutput = `Hi, ${userName}!`;
      setOutput(generatedOutput);
      setHasRun(true);
      setIsRunning(false);
      
      // Award 1 coin only the first time the name is printed (and not already completed)
      if (!hasRun && !canProceed) {
        try {
          dispatch(addCoins(1));
        } catch (e) {
          console.warn('Failed to award onboarding coin:', e);
        }
      }
      
      // Animate output appearance
      Animated.timing(outputAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Auto-scroll to output section
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 600); // Slight delay to ensure animation has started

      // Mark challenge as complete
      setTimeout(() => {
        onChallengeComplete();
      }, 1000);
    }, 1500);
  };

  const getCodePreview = () => {
    const name = userName || 'Your Name';
    return `name = "${name}"
print("Hi, " + name + "!")`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.content, styles.centeredContent]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create your first interactive program</Text>
            <Text style={styles.subtitle}>Type your name below, then run to print a greeting.</Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Your name</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter your awesome name..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          {/* Code Preview */}
          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>Your Python Code:</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{getCodePreview()}</Text>
            </View>
          </View>

          {/* Run Button */}
          <TouchableOpacity
            style={[
              styles.runButton,
              !userName.trim() && styles.disabledButton,
              isRunning && styles.runningButton,
            ]}
            onPress={runCode}
            disabled={!userName.trim() || isRunning}
          >
            <LinearGradient
              colors={
                isRunning
                  ? ['#FFA726', '#FF7043']
                  : userName.trim()
                  ? ['#4CAF50', '#45a049']
                  : ['#666', '#555']
              }
              style={styles.runButtonGradient}
            >
              <Text style={styles.runButtonText}>
                {isRunning ? '⚡ Running...' : '▶️ RUN CODE'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Output Section */}
          {output && (
            <Animated.View
              style={[
                styles.outputSection,
                { opacity: outputAnim },
              ]}
            >
              <Text style={styles.outputLabel}>Output:</Text>
              <View style={styles.outputContainer}>
                <Text style={styles.outputText}>{output}</Text>
              </View>
            </Animated.View>
          )}

          
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centeredContent: {
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  challengeNumber: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  codeSection: {
    marginBottom: 25,
  },
  codeLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 10,
  },
  codeContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  codeText: {
    fontFamily: 'Courier New',
    fontSize: 14,
    color: '#00ff00',
    lineHeight: 20,
  },
  runButton: {
    marginBottom: 25,
    borderRadius: 12,
    overflow: 'hidden',
  },
  runButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  runningButton: {
    transform: [{ scale: 0.95 }],
  },
  runButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  outputSection: {
    marginBottom: 25,
  },
  outputLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 10,
  },
  outputContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  outputText: {
    fontFamily: 'Courier New',
    fontSize: 16,
    color: '#4CAF50',
    lineHeight: 24,
  },
});
