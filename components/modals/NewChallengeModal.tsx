import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface NewChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerateChallenge: (difficulty: number) => void;
  isLoading?: boolean;
}

export const NewChallengeModal: React.FC<NewChallengeModalProps> = ({
  visible,
  onClose,
  onGenerateChallenge,
  isLoading = false
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(3);

  const difficultyLevels = [
    { level: 1, label: 'Very Easy', description: 'Simple concepts, lots of guidance', color: '#10b981', icon: '😊' },
    { level: 2, label: 'Easy', description: 'Basic challenges with hints', color: '#06b6d4', icon: '🙂' },
    { level: 3, label: 'Medium', description: 'Balanced difficulty', color: '#f59e0b', icon: '🤔' },
    { level: 4, label: 'Hard', description: 'More complex problems', color: '#f97316', icon: '😤' },
    { level: 5, label: 'Very Hard', description: 'Advanced challenges', color: '#ef4444', icon: '🔥' }
  ];

  const handleGenerate = () => {
    onGenerateChallenge(selectedDifficulty);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!isLoading) {
          onClose();
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
                <Ionicons name="refresh" size={24} color="#6366f1" />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Start New Challenge?
                </Text>
                <Text style={[styles.modalSubtitle, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                  Choose your difficulty level
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Ionicons name="close" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              Select Difficulty Level
            </Text>
            
            {difficultyLevels.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.level}
                style={[
                  styles.difficultyOption,
                  {
                    backgroundColor: selectedDifficulty === difficulty.level 
                      ? (isDark ? '#374151' : '#f3f4f6')
                      : 'transparent',
                    borderColor: selectedDifficulty === difficulty.level 
                      ? difficulty.color 
                      : (isDark ? '#374151' : '#e5e7eb'),
                  }
                ]}
                onPress={() => setSelectedDifficulty(difficulty.level)}
                disabled={isLoading}
              >
                <View style={styles.difficultyLeft}>
                  <Text style={styles.difficultyIcon}>{difficulty.icon}</Text>
                  <View style={styles.difficultyText}>
                    <Text style={[styles.difficultyLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
                      {difficulty.label}
                    </Text>
                    <Text style={[styles.difficultyDescription, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                      {difficulty.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.difficultyRight}>
                  <View style={[styles.difficultyBadge, { backgroundColor: difficulty.color }]}>
                    <Text style={styles.difficultyNumber}>{difficulty.level}</Text>
                  </View>
                  {selectedDifficulty === difficulty.level && (
                    <Ionicons name="checkmark-circle" size={20} color={difficulty.color} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.generateButton, isLoading && styles.disabledButton]}
              onPress={handleGenerate}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#6366f1', '#4f46e5']}
                style={styles.generateButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.buttonContent}>
                    <Text style={styles.generateButtonText}>Generating...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="flash" size={18} color="#ffffff" />
                    <Text style={styles.generateButtonText}>Generate Challenge</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay} pointerEvents="auto">
              <View style={[styles.loadingBox, { backgroundColor: isDark ? '#111827' : '#ffffff' }]}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={[styles.loadingText, { color: isDark ? '#e5e7eb' : '#374151' }]}>Generating new challenge...</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  difficultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  difficultyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  difficultyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  difficultyText: {
    flex: 1,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  difficultyDescription: {
    fontSize: 14,
  },
  difficultyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '85%',
    maxWidth: 320,
    elevation: 6,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
