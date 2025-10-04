import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  text?: string;
  subText?: string;
  compact?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = '#6366f1',
  text = 'Loading...',
  subText,
  compact = false,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderColor: `${color}20`,
            borderTopColor: color,
            marginBottom: compact ? 0 : 16,
          },
          animatedStyle,
        ]}
      />
      {text && <Text style={styles.text}>{text}</Text>}
      {subText && <Text style={styles.subText}>{subText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  compactContainer: {
    padding: 0,
  },
  spinner: {
    borderWidth: 3,
    borderRadius: 100,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
