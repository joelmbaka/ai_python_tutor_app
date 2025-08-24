import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface LessonCardProps {
  title: string;
  description?: string;
  type: 'challenge' | 'tutorial' | 'project' | 'assessment';
  duration?: number;
  difficulty?: number;
  position: number;
  totalLessons: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  onPress: () => void;
  animationDelay?: number;
}

const typeConfig = {
  challenge: {
    icon: 'flash' as const,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    darkBgColor: '#451a03',
  },
  tutorial: {
    icon: 'book' as const,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    darkBgColor: '#1e3a8a',
  },
  project: {
    icon: 'construct' as const,
    color: '#10b981',
    bgColor: '#d1fae5',
    darkBgColor: '#064e3b',
  },
  assessment: {
    icon: 'checkmark-circle' as const,
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    darkBgColor: '#4c1d95',
  },
};

export const LessonCard: React.FC<LessonCardProps> = ({
  title,
  description,
  type,
  duration,
  difficulty,
  position,
  totalLessons,
  isCompleted = false,
  isLocked = false,
  onPress,
  animationDelay = 0,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = typeConfig[type];

  const getDifficultyStars = () => {
    if (!difficulty) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= difficulty ? 'star' : 'star-outline'}
          size={12}
          color={i <= difficulty ? '#fbbf24' : '#d1d5db'}
        />
      );
    }
    return stars;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(animationDelay).springify()}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#2a2a3e' : '#ffffff',
          borderColor: isDark ? '#3a3a5e' : '#e5e7eb',
          opacity: isLocked ? 0.6 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDark ? config.darkBgColor : config.bgColor,
              },
            ]}
          >
            <Ionicons
              name={config.icon}
              size={20}
              color={config.color}
            />
          </View>
          
          <View style={styles.headerText}>
            <Text
              style={[
                styles.position,
                { color: isDark ? '#9ca3af' : '#6b7280' },
              ]}
            >
              Lesson {position} of {totalLessons}
            </Text>
            <Text
              style={[
                styles.title,
                { color: isDark ? '#ffffff' : '#111827' },
              ]}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>

          {/* Status Icon */}
          <View style={styles.statusContainer}>
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            )}
            {isLocked && (
              <Ionicons name="lock-closed" size={24} color="#6b7280" />
            )}
            {!isCompleted && !isLocked && (
              <Ionicons name="play-circle" size={24} color={config.color} />
            )}
          </View>
        </View>

        {/* Description */}
        {description && (
          <Text
            style={[
              styles.description,
              { color: isDark ? '#d1d5db' : '#4b5563' },
            ]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaLeft}>
            <View style={styles.typeTag}>
              <Text style={[styles.typeText, { color: config.color }]}>
                {type.toUpperCase()}
              </Text>
            </View>
            
            {duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <Text style={styles.metaText}>{duration} min</Text>
              </View>
            )}
          </View>

          {difficulty && (
            <View style={styles.difficultyContainer}>
              {getDifficultyStars()}
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: isDark ? '#374151' : '#f3f4f6' },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: isCompleted ? '100%' : '0%',
                  backgroundColor: config.color,
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  position: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  statusContainer: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
