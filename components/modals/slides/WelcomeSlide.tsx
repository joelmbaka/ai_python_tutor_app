import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface WelcomeSlideProps {
  onNext: () => void;
  canProceed: boolean;
}

export const WelcomeSlide: React.FC<WelcomeSlideProps> = ({ canProceed }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

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
            <Text style={styles.logoEmoji}>🐍</Text>
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
              <Text style={styles.featureEmoji}>✨</Text>
              <Text style={styles.featureText}>Interactive Challenges</Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>🎯</Text>
              <Text style={styles.featureText}>Instant Results</Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>🚀</Text>
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
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 10,
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
