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
} from 'react-native';

interface ChallengeSlide1Props {
  onNext: () => void;
  onChallengeComplete: () => void;
  canProceed: boolean;
}

export const ChallengeSlide1: React.FC<ChallengeSlide1Props> = ({
  onChallengeComplete,
  canProceed,
}) => {
  const [userName, setUserName] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

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

  const runCode = () => {
    if (!userName.trim()) {
      setOutput('⚠️ Please enter your name first!');
      return;
    }

    setIsRunning(true);
    
    // Simulate code execution
    setTimeout(() => {
      const generatedOutput = `🎉 Welcome to Python, ${userName}!\n🌟 ${userName} is going to be an amazing programmer!\n✨ You just ran your first Python code!`;
      setOutput(generatedOutput);
      setHasRun(true);
      setIsRunning(false);
      
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
        setShowExplanation(true);
      }, 1000);
    }, 1500);
  };

  const getCodePreview = () => {
    const name = userName || 'Your Name';
    return `name = "${name}"
print(f"🎉 Welcome to Python, {name}!")
print(f"🌟 {name} is going to be an amazing programmer!")`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.challengeNumber}>Challenge 1</Text>
            <Text style={styles.title}>Create Your Welcome Message! 🎉</Text>
            <Text style={styles.subtitle}>
              Let's make Python say hello to you personally
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What's your name?</Text>
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

          {/* Explanation */}
          {showExplanation && (
            <Animated.View
              style={[
                styles.explanationSection,
                { opacity: outputAnim },
              ]}
            >
              <Text style={styles.explanationTitle}>🎊 Congratulations!</Text>
              <Text style={styles.explanationText}>
                You just wrote your first Python program! Here's what happened:
                {'\n\n'}
                • <Text style={styles.highlight}>Variables</Text>: You stored your name in a "box" called `name`
                {'\n'}
                • <Text style={styles.highlight}>Print Function</Text>: You used `print()` to display messages
                {'\n'}
                • <Text style={styles.highlight}>F-strings</Text>: You inserted your name into the text with `{userName}`
                {'\n\n'}
                You're already thinking like a programmer! 🚀
              </Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    padding: 20,
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
  explanationSection: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  explanationTitle: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  explanationText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  highlight: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});
