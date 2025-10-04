import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Reanimated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, Easing } from 'react-native-reanimated';

interface WelcomeSlideProps {
  onNext: () => void;
  canProceed: boolean;
}

export const WelcomeSlide: React.FC<WelcomeSlideProps> = ({ canProceed }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const { width } = useWindowDimensions();

  // Reanimated shared values for feature icons
  const starY = useSharedValue(0);
  const targetScale = useSharedValue(1);
  const rocketRotate = useSharedValue(0);
  const snakeX = useSharedValue(0);

  // Animated styles
  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: starY.value }],
  }));

  const targetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetScale.value }],
  }));

  const rocketAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rocketRotate.value}deg` }],
  }));

  const snakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: snakeX.value }],
  }));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Start snake animation across full width
  React.useEffect(() => {
    const emojiOffset = 60; // approximate width of the 60pt emoji
    const distance = width + emojiOffset * 2; // travel from off-right to off-left
    const pxPerSecond = 100; // speed
    const duration = Math.max(3000, Math.round((distance / pxPerSecond) * 1000));

    snakeX.value = width + emojiOffset;
    snakeX.value = withRepeat(
      withSequence(
        withTiming(-emojiOffset, { duration, easing: Easing.linear }),
        withTiming(width + emojiOffset, { duration: 0 })
      ),
      -1,
      false
    );
  }, [width]);

  // Start icon animations (looping with slight delays)
  React.useEffect(() => {
    // ✨ Float
    starY.value = withDelay(
      0,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );

    // 🎯 Pulse
    targetScale.value = withDelay(
      200,
      withRepeat(
        withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      )
    );

    // 🚀 Wiggle
    rocketRotate.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming(6, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.snakeTrack}>
              <Reanimated.Text style={[styles.logoEmoji, snakeAnimatedStyle]}>🐍</Reanimated.Text>
            </View>
            <Text style={styles.logoText}>PythonKids</Text>
          </View>

          {/* Welcome Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Welcome to Your</Text>
            <Text style={styles.subtitle}>Coding Adventure!</Text>
            
            <Text style={styles.description}>
              Ready to discover the magic of programming? 
              {'\n\n'}
              In just 2 minutes, you'll create your first Python programs 
              and see how fun coding can be!
            </Text>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Reanimated.Text style={[styles.featureEmoji, starAnimatedStyle]}>✨</Reanimated.Text>
              <Text style={styles.featureText}>Interactive Challenges</Text>
            </View>
            
            <View style={styles.feature}>
              <Reanimated.Text style={[styles.featureEmoji, targetAnimatedStyle]}>🎯</Reanimated.Text>
              <Text style={styles.featureText}>Instant Results</Text>
            </View>
            
            <View style={styles.feature}>
              <Reanimated.Text style={[styles.featureEmoji, rocketAnimatedStyle]}>🚀</Reanimated.Text>
              <Text style={styles.featureText}>Real Python Code</Text>
            </View>
          </View>

          <Text style={styles.callToAction}>
            Let's start with something amazing...
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 0,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  snakeTrack: {
    width: '100%',
    height: 60, // match emoji font size
    overflow: 'hidden',
    marginBottom: 10,
    // Extend into gradient padding so the snake travels edge-to-edge
    marginHorizontal: -30,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  callToAction: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
