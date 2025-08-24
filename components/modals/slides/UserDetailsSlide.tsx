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
import { UserData } from '../OnboardingModal';

interface UserDetailsSlideProps {
  onNext: () => void;
  onUserDataUpdate: (data: Partial<UserData>) => void;
  userData: Partial<UserData>;
  canProceed: boolean;
}

const AGE_RANGES = [
  { label: '8-10 years', value: 9, description: 'Visual & Block Programming' },
  { label: '11-13 years', value: 12, description: 'Mixed Visual + Text' },
  { label: '14-16 years', value: 15, description: 'Full Text Programming' },
  { label: '17+ years', value: 18, description: 'Advanced Programming' },
];

const EXPERIENCE_LEVELS = [
  { 
    id: 'beginner', 
    label: 'Complete Beginner', 
    description: 'Never coded before',
    emoji: '🌱'
  },
  { 
    id: 'some', 
    label: 'Some Experience', 
    description: 'Tried coding a bit',
    emoji: '🌿'
  },
  { 
    id: 'advanced', 
    label: 'Advanced', 
    description: 'Comfortable with coding',
    emoji: '🌳'
  },
];

export const UserDetailsSlide: React.FC<UserDetailsSlideProps> = ({
  onUserDataUpdate,
  userData,
  canProceed,
}) => {
  const [name, setName] = useState(userData.name || '');
  const [selectedAge, setSelectedAge] = useState<number | null>(userData.age || null);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(
    userData.experience || null
  );

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    onUserDataUpdate({
      name: name.trim(),
      age: selectedAge || undefined,
      experience: selectedExperience as any,
    });
  }, [name, selectedAge, selectedExperience]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tell Us About Yourself! 👋</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your learning journey
            </Text>
          </View>

          {/* Name Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What should we call you?</Text>
            <TextInput
              style={[
                styles.nameInput,
                name.trim() && styles.validInput,
              ]}
              placeholder="Enter your name..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
            />
            {name.trim() && (
              <Text style={styles.validationText}>
                ✅ Great! Nice to meet you, {name}!
              </Text>
            )}
          </View>

          {/* Age Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's your age range?</Text>
            <Text style={styles.sectionSubtitle}>
              This helps us choose the right learning style for you
            </Text>
            <View style={styles.optionsContainer}>
              {AGE_RANGES.map((range) => (
                <TouchableOpacity
                  key={range.value}
                  style={[
                    styles.optionButton,
                    selectedAge === range.value && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedAge(range.value)}
                >
                  <LinearGradient
                    colors={
                      selectedAge === range.value
                        ? ['#4A90E2', '#357ABD']
                        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                    }
                    style={styles.optionGradient}
                  >
                    <Text style={[
                      styles.optionLabel,
                      selectedAge === range.value && styles.selectedOptionLabel,
                    ]}>
                      {range.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      selectedAge === range.value && styles.selectedOptionDescription,
                    ]}>
                      {range.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Experience Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programming Experience</Text>
            <Text style={styles.sectionSubtitle}>
              How much coding have you done before?
            </Text>
            <View style={styles.experienceContainer}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.experienceButton,
                    selectedExperience === level.id && styles.selectedExperience,
                  ]}
                  onPress={() => setSelectedExperience(level.id)}
                >
                  <View style={styles.experienceContent}>
                    <Text style={styles.experienceEmoji}>{level.emoji}</Text>
                    <Text style={[
                      styles.experienceLabel,
                      selectedExperience === level.id && styles.selectedExperienceLabel,
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={[
                      styles.experienceDescription,
                      selectedExperience === level.id && styles.selectedExperienceDescription,
                    ]}>
                      {level.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Progress Indicator */}
          {canProceed && (
            <Animated.View style={styles.progressIndicator}>
              <Text style={styles.progressText}>
                ✅ Perfect! Let's set up your preferences next
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
  title: {
    fontSize: 28,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
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
  validInput: {
    borderColor: '#4CAF50',
  },
  validationText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#4A90E2',
  },
  optionGradient: {
    padding: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedOptionLabel: {
    color: 'white',
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  selectedOptionDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  experienceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  experienceButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedExperience: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
  },
  experienceContent: {
    alignItems: 'center',
  },
  experienceEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  experienceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedExperienceLabel: {
    color: 'white',
  },
  experienceDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  selectedExperienceDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressIndicator: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
});
