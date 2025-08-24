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
import { UserData } from '../OnboardingModal';

interface PreferencesSlideProps {
  onNext: () => void;
  onUserDataUpdate: (data: Partial<UserData>) => void;
  userData: Partial<UserData>;
  canProceed: boolean;
}

const LEARNING_STYLES = [
  {
    id: 'visual',
    title: 'Visual Learning',
    description: 'Drag & drop blocks, visual programming',
    emoji: '🎨',
    color: ['#FF6B6B', '#FF5252'],
  },
  {
    id: 'text',
    title: 'Text-Based',
    description: 'Direct code writing, like real programmers',
    emoji: '⌨️',
    color: ['#4ECDC4', '#26A69A'],
  },
  {
    id: 'mixed',
    title: 'Mixed Approach',
    description: 'Best of both worlds',
    emoji: '🔄',
    color: ['#45B7D1', '#3498DB'],
  },
];

const INTERESTS = [
  { id: 'games', label: 'Games & Animation', emoji: '🎮' },
  { id: 'websites', label: 'Websites & Apps', emoji: '🌐' },
  { id: 'data', label: 'Data & Analysis', emoji: '📊' },
  { id: 'robots', label: 'Robots & Hardware', emoji: '🤖' },
  { id: 'art', label: 'Digital Art & Graphics', emoji: '🎨' },
  { id: 'music', label: 'Music & Sound', emoji: '🎵' },
  { id: 'science', label: 'Science & Math', emoji: '🔬' },
  { id: 'stories', label: 'Stories & Writing', emoji: '📚' },
];

export const PreferencesSlide: React.FC<PreferencesSlideProps> = ({
  onUserDataUpdate,
  userData,
  canProceed,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(
    userData.preferredStyle || null
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    userData.interests || []
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
      preferredStyle: selectedStyle as any,
      interests: selectedInterests,
    });
  }, [selectedStyle, selectedInterests]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const getRecommendedStyle = () => {
    const age = userData.age || 12;
    if (age <= 10) return 'visual';
    if (age <= 13) return 'mixed';
    return 'text';
  };

  const getStyleRecommendation = (styleId: string) => {
    const recommended = getRecommendedStyle();
    if (styleId === recommended) {
      return ' (Recommended for your age)';
    }
    return '';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Customize Your Experience! ⚙️</Text>
            <Text style={styles.subtitle}>
              Let's set up the perfect learning environment for you
            </Text>
          </View>

          {/* Learning Style Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How do you like to learn?</Text>
            <Text style={styles.sectionSubtitle}>
              Choose your preferred programming style
            </Text>
            
            <View style={styles.stylesContainer}>
              {LEARNING_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleButton,
                    selectedStyle === style.id && styles.selectedStyleButton,
                  ]}
                  onPress={() => setSelectedStyle(style.id)}
                >
                  <LinearGradient
                    colors={
                      selectedStyle === style.id
                        ? (style.color as [string, string])
                        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                    }
                    style={styles.styleGradient}
                  >
                    <Text style={styles.styleEmoji}>{style.emoji}</Text>
                    <Text style={[
                      styles.styleTitle,
                      selectedStyle === style.id && styles.selectedStyleTitle,
                    ]}>
                      {style.title}
                      <Text style={styles.recommendation}>
                        {getStyleRecommendation(style.id)}
                      </Text>
                    </Text>
                    <Text style={[
                      styles.styleDescription,
                      selectedStyle === style.id && styles.selectedStyleDescription,
                    ]}>
                      {style.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What interests you?</Text>
            <Text style={styles.sectionSubtitle}>
              Select all that apply - we'll use this to create personalized projects
            </Text>
            
            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestButton,
                    selectedInterests.includes(interest.id) && styles.selectedInterest,
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                >
                  <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                  <Text style={[
                    styles.interestLabel,
                    selectedInterests.includes(interest.id) && styles.selectedInterestLabel,
                  ]}>
                    {interest.label}
                  </Text>
                  {selectedInterests.includes(interest.id) && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          {canProceed && (
            <Animated.View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>🎉 You're All Set!</Text>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Name:</Text> {userData.name}
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Age:</Text> {userData.age} years old
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Experience:</Text> {userData.experience}
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Learning Style:</Text> {selectedStyle}
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Interests:</Text> {selectedInterests.length} selected
                </Text>
              </View>
              <Text style={styles.readyText}>
                Ready to start your Python journey! 🚀
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
    marginBottom: 20,
  },
  stylesContainer: {
    gap: 12,
  },
  styleButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStyleButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  styleGradient: {
    padding: 20,
    alignItems: 'center',
  },
  styleEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  styleTitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  selectedStyleTitle: {
    color: 'white',
  },
  styleDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  selectedStyleDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  recommendation: {
    fontSize: 12,
    color: '#FFD700',
    fontStyle: 'italic',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    position: 'relative',
  },
  selectedInterest: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
  },
  interestEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedInterestLabel: {
    color: 'white',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summarySection: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  summaryTitle: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  summaryContent: {
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: '600',
    color: '#4A90E2',
  },
  readyText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
  },
});
