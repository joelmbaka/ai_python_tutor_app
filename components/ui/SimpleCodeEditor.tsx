import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/api';
import { useDispatch } from 'react-redux';
 import { addCoins, spendCoins } from '../../store/slices/coinsSlice';

interface SimpleCodeEditorProps {
  initialCode: string;
  hints: string[];
  solutionCode: string;
  problemDescription: string;
  explanation: string;
  onCodeChange?: (code: string) => void;
  onRunCode?: (code: string, meta?: { success: boolean; hadErrors: boolean }) => void;
}

export const SimpleCodeEditor: React.FC<SimpleCodeEditorProps> = ({
  initialCode,
  hints,
  solutionCode,
  problemDescription,
  explanation,
  onCodeChange,
  onRunCode,
}) => {
  const [code, setCode] = useState(initialCode);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isDark = useColorScheme() === 'dark';
  const dispatch = useDispatch();
  const runAbortRef = useRef<AbortController | null>(null);

  // Reset editor state when challenge props change
  useEffect(() => {
    // Abort any in-flight execution from the previous challenge
    try {
      runAbortRef.current?.abort();
    } catch {}

    // Reset code editor content to starter code
    setCode(initialCode || '');
    // Reset UI state: hints, solution visibility, and terminal output
    setShowHints(false);
    setRevealedHints(0);
    setShowSolution(false);
    setOutput('');
    setIsRunning(false);
    setShowConfirmModal(false);
  }, [initialCode, hints, solutionCode, problemDescription]);

  // Cleanup on unmount to avoid setting state after unmount and to cancel pending requests
  useEffect(() => {
    return () => {
      try {
        runAbortRef.current?.abort();
      } catch {}
    };
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleRevealNextHint = () => {
    if (revealedHints < hints.length) {
      setRevealedHints(prev => prev + 1);
      setShowHints(true);
    }
  };

  const handleRevealSolution = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmReveal = () => {
    setShowConfirmModal(false);
    setShowSolution(true);
    setCode(solutionCode);
    onCodeChange?.(solutionCode);
  };

  const handleCancelReveal = () => {
    setShowConfirmModal(false);
  };

  const handleRunCode = async () => {
    // Cancel any previous run
    try { runAbortRef.current?.abort(); } catch {}

    const controller = new AbortController();
    runAbortRef.current = controller;

    setIsRunning(true);
    setOutput('Running your code...');
    let hadErrors = false;
    let aborted = false;
    
    try {
      // Execute code using backend API with a dummy test case to capture output
      const result = await apiService.executeCode(
        {
          student_code: code,
          lesson_id: 'solution_execution',
          test_cases: [{
            input: "",  // No input needed
            expected_output: "",  // We don't care about expected output
          }],
          timeout_seconds: 10,
        },
        { signal: controller.signal, propagateAbort: true }
      );
      
      // Debug: Log the full result to see what we're getting
      console.log('Execution result:', JSON.stringify(result, null, 2));
      
      // Show errors first; if both error and output exist, show both (error first)
      if (result.test_results && result.test_results.length > 0) {
        const testResult = result.test_results[0];
        console.log('First test result:', JSON.stringify(testResult, null, 2));

        const errors: string[] = [];
        if (testResult.error_message && testResult.error_message.trim()) {
          errors.push(testResult.error_message.trim());
        }
        if (Array.isArray(result.runtime_errors) && result.runtime_errors.length > 0) {
          errors.push(
            ...result.runtime_errors
              .filter(Boolean)
              .map(e => `${e}`.trim())
              .filter(e => e.length > 0)
          );
        }
        if (Array.isArray(result.syntax_errors) && result.syntax_errors.length > 0) {
          errors.push(
            ...result.syntax_errors
              .filter(Boolean)
              .map(e => `${e}`.trim())
              .filter(e => e.length > 0)
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
        const syntaxErrors = Array.isArray(result.syntax_errors) ? result.syntax_errors : [];
        if (runtimeErrors.length > 0 || syntaxErrors.length > 0) {
          const allErrors = [...runtimeErrors, ...syntaxErrors].filter(Boolean).map(e => `${e}`.trim()).filter(e => e.length > 0);
          setOutput(`Error: ${allErrors.join('\n')}`);
          hadErrors = true;
        } else if (result.overall_output && `${result.overall_output}`.trim()) {
          setOutput(result.overall_output);
        } else {
          setOutput('Code executed successfully but no output was captured');
        }
      }
      
      // Determine success
      const runSuccessful = result?.success === true && !hadErrors;

      // Coins: +1 on success, -1 on error/failure
      if (runSuccessful) {
        try {
          dispatch(addCoins(1));
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

      // Notify parent with meta
      onRunCode?.(code, { success: runSuccessful, hadErrors });
      
    } catch (error: any) {
      if (error && (error.name === 'AbortError' || `${error?.message ?? ''}`.includes('aborted'))) {
        aborted = true;
        // Do not change coins or call onRunCode on abort; just clear any transient output
        setOutput('');
      } else {
        setOutput(`Error executing code: ${error}`);
      }
    } finally {
      setIsRunning(false);
      // Clear the controller reference; if we aborted intentionally, it's already signaled
      runAbortRef.current = null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Problem Description */}
      <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb" size={20} color="#f59e0b" />
          <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Challenge
          </Text>
        </View>
        <Text style={[styles.problemText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
          {problemDescription}
        </Text>
        <Text style={[styles.explanationText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          {explanation}
        </Text>
      </View>

      {/* Code Editor */}
      <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="code" size={20} color="#3b82f6" />
          <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Your Code
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
            numberOfLines={8}
            placeholder="Write your Python code here..."
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
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { opacity: revealedHints >= hints.length ? 0.5 : 1 }]}
            onPress={handleRevealNextHint}
            disabled={revealedHints >= hints.length || isRunning}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.gradientButton}
            >
              <Ionicons name="help-circle" size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>
                {revealedHints === 0 ? 'Get Hint' : revealedHints < hints.length ? 'Next Hint' : 'All Hints Shown'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.runCodeButton}
            onPress={handleRunCode}
            disabled={isRunning}
          >
            <LinearGradient
              colors={isRunning ? ['#6b7280', '#4b5563'] : ['#3b82f6', '#2563eb']}
              style={styles.gradientButton}
            >
              <Ionicons name={isRunning ? "hourglass" : "play"} size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>
                {isRunning ? 'Running...' : 'Run Code'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Reveal Solution Link */}
        {!showSolution && (
          <TouchableOpacity
            style={styles.revealSolutionLink}
            onPress={handleRevealSolution}
          >
            <Ionicons name="eye-outline" size={16} color={isDark ? '#93c5fd' : '#3b82f6'} />
            <Text style={[styles.revealSolutionText, { color: isDark ? '#93c5fd' : '#3b82f6' }]}>
              Reveal Solution
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Output Section */}
      {output && (
        <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="terminal" size={20} color="#3b82f6" />
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

      {/* Hints Section */}
      {showHints && revealedHints > 0 && (
        <View style={[styles.card, { backgroundColor: isDark ? '#2a2a3e' : '#ffffff' }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={20} color="#10b981" />
            <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              Hints
            </Text>
          </View>
          {hints.slice(0, revealedHints).map((hint, index) => (
            <View key={index} style={styles.hintItem}>
              <View style={styles.hintNumber}>
                <Text style={styles.hintNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.hintText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                {hint}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Solution Revealed Notice */}
      {showSolution && (
        <View style={[styles.card, styles.solutionCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.solutionTitle}>Solution Revealed! 🎉</Text>
          </View>
          <Text style={styles.solutionText}>
            Great job working through this challenge! The solution is now in your code editor. 
            Take time to understand how it works.
          </Text>
        </View>
      )}

      {/* Custom Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelReveal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>🤔</Text>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Reveal Solution?
              </Text>
            </View>
            
            <Text style={[styles.modalMessage, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
              Are you sure you want to see the solution? Try getting more hints first - it's more rewarding to figure it out yourself!
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelReveal}
              >
                <Text style={[styles.buttonText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                  Keep Trying
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmReveal}
              >
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.gradientButton}
                >
                  <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                    Yes, Show Solution
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  problemText: {
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
    minHeight: 120,
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  runCodeButton: {
    flex: 1,
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
  hintItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  hintNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  hintNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  solutionCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#15803d',
    marginLeft: 8,
  },
  solutionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#166534',
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
  revealSolutionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  revealSolutionText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    // LinearGradient will handle the background
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SimpleCodeEditor;
