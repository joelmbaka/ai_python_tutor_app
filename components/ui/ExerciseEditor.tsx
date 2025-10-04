import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import { apiService, TestResult } from '../../services/api';
import { useDispatch } from 'react-redux';
import { addCoins, spendCoins } from '../../store/slices/coinsSlice';

interface ExerciseEditorProps {
  question: string;
  explanation: string;
  starterCode: string;
  lessonId: string;
  onCodeChange?: (code: string) => void;
  onRunCode?: (code: string, results?: TestResult[]) => void;
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  question,
  explanation,
  starterCode,
  lessonId,
  onCodeChange,
  onRunCode,
}) => {
  const dispatch = useDispatch();
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please write some code first!');
      return;
    }

    setIsRunning(true);
    setOutput('Running your code...');
    let hadErrors = false;

    try {
      const result = await apiService.executeCode({
        student_code: code,
        lesson_id: lessonId,
        test_cases: [
          {
            input: '',
            expected_output: '',
          },
        ],
        timeout_seconds: 10,
      });

      // Prefer showing errors first, then any output
      if (result.test_results && result.test_results.length > 0) {
        const testResult = result.test_results[0];

        const errors: string[] = [];
        if (testResult.error_message && testResult.error_message.trim()) {
          errors.push(testResult.error_message.trim());
        }
        if (Array.isArray(result.runtime_errors) && result.runtime_errors.length > 0) {
          errors.push(
            ...result.runtime_errors
              .filter(Boolean)
              .map((e) => `${e}`.trim())
              .filter((e) => e.length > 0)
          );
        }

        if (errors.length > 0) {
          const parts: string[] = [`Error:\n${errors.join('\n')}`];
          if (testResult.actual_output && testResult.actual_output.trim()) {
            parts.push(`\nOutput:\n${testResult.actual_output}`);
          } else if (result.overall_output && `${result.overall_output}`.trim()) {
            parts.push(`\nOutput:\n${result.overall_output}`);
          }
          setOutput(parts.join('\n'));
          hadErrors = true;
        } else if (testResult.actual_output && testResult.actual_output.trim()) {
          setOutput(testResult.actual_output);
        } else if (result.overall_output && `${result.overall_output}`.trim()) {
          setOutput(result.overall_output);
        } else {
          setOutput('Code executed successfully but no output was captured');
        }
      } else {
        const runtimeErrors = Array.isArray(result.runtime_errors) ? result.runtime_errors : [];
        if (runtimeErrors.length > 0) {
          setOutput(`Error: ${runtimeErrors.join('\n')}`);
          hadErrors = true;
        } else if (result.overall_output && `${result.overall_output}`.trim()) {
          setOutput(result.overall_output);
        } else {
          setOutput('Code executed successfully but no output was captured');
        }
      }

      // Determine success and award/deduct coins
      const runSuccessful = result && result.success === true && !hadErrors;
      if (runSuccessful) {
        try {
          dispatch(addCoins(5));
        } catch (e) {
          console.warn('Failed to award coins:', e);
        }
      } else {
        try {
          dispatch(spendCoins(1));
        } catch (e) {
          console.warn('Failed to deduct coins:', e);
        }
      }

      // Notify parent with results
      onRunCode?.(code, result.test_results || []);
    } catch (error) {
      setOutput(`Error executing code: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearCode = () => {
    setCode(starterCode);
    setOutput('');
    onCodeChange?.(starterCode);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Exercise Question */}
      <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="create" size={20} color="#8b5cf6" />
          <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Practice Exercise
          </Text>
        </View>
        <Text style={[styles.questionText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
          {question}
        </Text>
        <Text style={[styles.explanationText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          {explanation}
        </Text>
      </View>

      {/* Code Editor */}
      <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="code-slash" size={20} color="#3b82f6" />
          <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Your Practice Space
          </Text>
        </View>
        <View style={[styles.codeInputContainer, { borderColor: isDark ? '#4b5563' : '#d1d5db' }]}>
          <TextInput
            style={[
              styles.codeInput,
              { 
                color: isDark ? '#ffffff' : '#111827',
                backgroundColor: isDark ? '#1f2937' : '#f9fafb'
              }
            ]}
            value={code}
            onChangeText={handleCodeChange}
            multiline
            numberOfLines={10}
            placeholder="Write your Python code here and experiment..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            textAlignVertical="top"
            scrollEnabled={false}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { flex: 2 }]}
          onPress={handleRunCode}
          disabled={isRunning}
        >
          <LinearGradient
            colors={isRunning ? ['#6b7280', '#4b5563'] : ['#10b981', '#059669']}
            style={styles.gradientButton}
          >
            <Ionicons name={isRunning ? "hourglass" : "play"} size={18} color="#ffffff" />
            <Text style={styles.actionButtonText}>
              {isRunning ? 'Running...' : 'Run Code'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { flex: 1 }]}
          onPress={handleClearCode}
        >
          <LinearGradient
            colors={['#6b7280', '#4b5563']}
            style={styles.gradientButton}
          >
            <Ionicons name="refresh" size={18} color="#ffffff" />
            <Text style={styles.actionButtonText}>Reset</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Output Section */}
      {output && (
        <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="terminal" size={20} color="#f59e0b" />
            <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              Output
            </Text>
          </View>
          <View style={[styles.outputContainer, { backgroundColor: isDark ? '#1f2937' : '#f9fafb' }]}>
            <Text style={[styles.outputText, { color: isDark ? '#e5e7eb' : '#374151' }]}>
              {output}
            </Text>
          </View>
        </View>
      )}

      {/* Encouragement Section */}
      <View style={[styles.card, styles.encouragementCard]}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart" size={20} color="#ec4899" />
          <Text style={styles.encouragementTitle}>Keep Experimenting! 💪</Text>
        </View>
        <Text style={styles.encouragementText}>
          This is your practice space! Try different approaches, make mistakes, and learn. 
          There's no wrong way to experiment with code.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  codeInputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  codeInput: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    minHeight: 160,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  outputContainer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  encouragementCard: {
    backgroundColor: '#fef7ff',
    borderColor: '#ec4899',
    borderWidth: 1,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#be185d',
    marginLeft: 8,
  },
  encouragementText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9d174d',
  },
});
