import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChallengeSlide2Props {
  onNext: () => void;
  onChallengeComplete: () => void;
  canProceed: boolean;
}

const EMOJIS = [
  { emoji: '🐍', name: 'Snake' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '❤️', name: 'Heart' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '🎯', name: 'Target' },
  { emoji: '🌟', name: 'Sparkle' },
  { emoji: '🔥', name: 'Fire' },
  { emoji: '💎', name: 'Diamond' },
];

export const ChallengeSlide2: React.FC<ChallengeSlide2Props> = ({
  onChallengeComplete,
  canProceed,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [patternSize, setPatternSize] = useState(5);
  const [hasRun, setHasRun] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const outputAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const generatePattern = () => {
    let pattern = '';
    for (let i = 1; i <= patternSize; i++) {
      pattern += selectedEmoji.emoji.repeat(i) + '\n';
    }
    return pattern.trim();
  };

  const runCode = () => {
    setIsRunning(true);
    
    // Simulate code execution
    setTimeout(() => {
      const pattern = generatePattern();
      setOutput(pattern);
      setHasRun(true);
      setIsRunning(false);
      
      // Animate output appearance
      Animated.timing(outputAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Mark challenge as complete
      setTimeout(() => {
        onChallengeComplete();
        setShowExplanation(true);
      }, 1000);
    }, 1500);
  };

  const getCodePreview = () => {
    return `emoji = "${selectedEmoji.emoji}"
size = ${patternSize}

for i in range(size):
    print(emoji * (i + 1))`;
  };

  const getSizeButtons = () => {
    return [3, 4, 5, 6, 7].map((size) => (
      <TouchableOpacity
        key={size}
        style={[
          styles.sizeButton,
          patternSize === size && styles.selectedSizeButton,
        ]}
        onPress={() => setPatternSize(size)}
      >
        <Text
          style={[
            styles.sizeButtonText,
            patternSize === size && styles.selectedSizeButtonText,
          ]}
        >
          {size}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.challengeNumber}>Challenge 2</Text>
            <Text style={styles.title}>Create Your Art Pattern! 🎨</Text>
            <Text style={styles.subtitle}>
              Use loops to make beautiful emoji art
            </Text>
          </View>

          {/* Emoji Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.sectionLabel}>Choose Your Emoji:</Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.emojiButton,
                    selectedEmoji.name === item.name && styles.selectedEmoji,
                  ]}
                  onPress={() => setSelectedEmoji(item)}
                >
                  <Text style={styles.emojiText}>{item.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Size Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.sectionLabel}>Pattern Size:</Text>
            <View style={styles.sizeContainer}>
              {getSizeButtons()}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>Preview:</Text>
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>{generatePattern()}</Text>
            </View>
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
              isRunning && styles.runningButton,
            ]}
            onPress={runCode}
            disabled={isRunning}
          >
            <LinearGradient
              colors={
                isRunning
                  ? ['#FFA726', '#FF7043']
                  : ['#9C27B0', '#7B1FA2']
              }
              style={styles.runButtonGradient}
            >
              <Text style={styles.runButtonText}>
                {isRunning ? '⚡ Creating Art...' : '🎨 CREATE ART'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Output Section */}
          {output && (
            <Animated.View
              style={[
                styles.outputSection,
                { opacity: outputAnim, transform: [{ scale: outputAnim }] },
              ]}
            >
              <Text style={styles.outputLabel}>Your Beautiful Creation:</Text>
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
              <Text style={styles.explanationTitle}>🎉 Amazing Work!</Text>
              <Text style={styles.explanationText}>
                You just created art with code! Here's the magic:
                {'\n\n'}
                • <Text style={styles.highlight}>Loops</Text>: You used `for i in range()` to repeat actions
                {'\n'}
                • <Text style={styles.highlight}>String Multiplication</Text>: `emoji * (i + 1)` repeats the emoji
                {'\n'}
                • <Text style={styles.highlight}>Pattern Logic</Text>: Each line has one more emoji than the last
                {'\n\n'}
                This is how programmers create complex patterns with simple rules! 🌟
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
    marginBottom: 25,
  },
  challengeNumber: {
    fontSize: 16,
    color: '#9C27B0',
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
  selectionSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 10,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmoji: {
    borderColor: '#9C27B0',
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
  },
  emojiText: {
    fontSize: 24,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSizeButton: {
    borderColor: '#9C27B0',
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
  },
  sizeButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSizeButtonText: {
    color: 'white',
  },
  previewSection: {
    marginBottom: 20,
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
  },
  codeSection: {
    marginBottom: 20,
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
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  runButtonGradient: {
    padding: 18,
    alignItems: 'center',
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
    marginBottom: 20,
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
    padding: 20,
    borderWidth: 2,
    borderColor: '#9C27B0',
    alignItems: 'center',
  },
  outputText: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  explanationSection: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
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
    color: '#9C27B0',
    fontWeight: 'bold',
  },
});
