import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/api';
import { useDispatch } from 'react-redux';
import { addCoins, spendCoins } from '../../store/slices/coinsSlice';

interface TestCase {
  input?: string;
  expected_output: string;
}

interface TestResult {
  test_id: number;
  passed: boolean;
  input_data?: string;
  expected_output: string;
  actual_output?: string;
  execution_time_ms?: number;
  error_message?: string;
}

interface CodeEditorProps {
  initialCode: string;
  testCases: TestCase[];
  onCodeChange?: (code: string) => void;
  onRunCode?: (code: string, results: TestResult[]) => void;
  lessonId: string;
  studentId?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  testCases,
  onCodeChange,
  onRunCode,
  lessonId,
  studentId = 'demo_student',
}) => {
  const dispatch = useDispatch();
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [output, setOutput] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const runCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please write some code first!');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setTestResults([]);

    try {
      const result = await apiService.executeCode({
        student_code: code,
        lesson_id: lessonId,
        test_cases: testCases,
        timeout_seconds: 10,
      });

      setTestResults(result.test_results || []);
      const fallbackErrors = (result.runtime_errors && result.runtime_errors.length > 0)
        ? result.runtime_errors.join('\n')
        : (result.syntax_errors && result.syntax_errors.length > 0)
          ? result.syntax_errors.join('\n')
          : '';
      setOutput(result.overall_output || fallbackErrors);
      setHasRun(true);

      // Scroll to results
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Determine error presence from test and runtime diagnostics
      let hadErrors = false;
      const runtimeErrors = Array.isArray(result.runtime_errors) ? result.runtime_errors.filter(Boolean) : [];
      const syntaxErrors = Array.isArray(result.syntax_errors) ? result.syntax_errors.filter(Boolean) : [];
      if (runtimeErrors.length > 0 || syntaxErrors.length > 0) {
        hadErrors = true;
      }
      const tr = Array.isArray(result.test_results) ? result.test_results : [];
      if (tr.some((t: any) => (t?.error_message || '').toString().trim().length > 0)) {
        hadErrors = true;
      }

      const runSuccessful = result && (result as any).success === true && !hadErrors;
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

      // Notify parent
      onRunCode?.(code, result.test_results || []);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to execute code. Please try again.');
      console.error('Code execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!hasRun) {
      Alert.alert('Run First', 'Please run your code to see the results before submitting.');
      return;
    }

    try {
      const result = await apiService.submitCode({
        student_id: studentId,
        lesson_id: lessonId,
        submitted_code: code,
        test_cases: testCases,
      });

      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          `Great job! You passed ${result.passed_tests}/${result.total_tests} tests with a score of ${result.score}%`
        );
      } else {
        Alert.alert(
          'Keep Trying! 💪',
          `You passed ${result.passed_tests}/${result.total_tests} tests. Review the failed tests and try again!`
        );
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit code. Please try again.');
      console.error('Code submission error:', error);
    }
  };

  const getTestStatusIcon = (passed: boolean) => {
    return passed ? '✅' : '❌';
  };

  const getTestStatusColor = (passed: boolean) => {
    return passed ? '#4CAF50' : '#F44336';
  };

  return (
    <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Code Editor */}
      <View style={styles.editorSection}>
        <Text style={styles.sectionTitle}>Your Code:</Text>
        <View style={styles.editorContainer}>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={handleCodeChange}
            multiline
            placeholder="Write your Python code here..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isRunning && styles.disabledButton]}
          onPress={runCode}
          disabled={isRunning}
        >
          <LinearGradient
            colors={isRunning ? ['#FFA726', '#FF7043'] : ['#2196F3', '#1976D2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {isRunning ? '⚡ Running...' : '▶️ Run Code'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {hasRun && (
          <TouchableOpacity style={styles.actionButton} onPress={submitCode}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>✅ Submit Solution</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <View
              key={index}
              style={[
                styles.testResult,
                { borderLeftColor: getTestStatusColor(result.passed) },
              ]}
            >
              <View style={styles.testHeader}>
                <Text style={styles.testTitle}>
                  {getTestStatusIcon(result.passed)} Test {result.test_id + 1}
                </Text>
                {result.execution_time_ms && (
                  <Text style={styles.executionTime}>
                    {result.execution_time_ms.toFixed(1)}ms
                  </Text>
                )}
              </View>
              
              {result.input_data && (
                <View style={styles.testDetail}>
                  <Text style={styles.detailLabel}>Input:</Text>
                  <Text style={styles.detailValue}>{result.input_data}</Text>
                </View>
              )}
              
              <View style={styles.testDetail}>
                <Text style={styles.detailLabel}>Expected:</Text>
                <Text style={styles.detailValue}>{result.expected_output}</Text>
              </View>
              
              {result.actual_output && (
                <View style={styles.testDetail}>
                  <Text style={styles.detailLabel}>Your Output:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: result.passed ? '#4CAF50' : '#F44336' }
                  ]}>
                    {result.actual_output}
                  </Text>
                </View>
              )}
              
              {result.error_message && (
                <View style={styles.testDetail}>
                  <Text style={styles.errorLabel}>Error:</Text>
                  <Text style={styles.errorMessage}>{result.error_message}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Overall Output */}
      {output && (
        <View style={styles.outputSection}>
          <Text style={styles.sectionTitle}>Program Output:</Text>
          <View style={styles.outputContainer}>
            <Text style={styles.outputText}>{output}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  editorSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  editorContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  codeInput: {
    fontFamily: 'Courier New',
    fontSize: 14,
    color: '#00ff00',
    padding: 16,
    minHeight: 200,
    maxHeight: 400,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  resultsSection: {
    marginBottom: 20,
  },
  testResult: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  executionTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  testDetail: {
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Courier New',
  },
  errorLabel: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 12,
    color: '#F44336',
    fontFamily: 'Courier New',
  },
  outputSection: {
    marginBottom: 20,
  },
  outputContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  outputText: {
    fontFamily: 'Courier New',
    fontSize: 14,
    color: '#4CAF50',
    lineHeight: 20,
  },
});
