import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f9fafb' }]}>
      <View style={styles.content}>
        <Ionicons name="compass" size={80} color="#10b981" />
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111827' }]}>
          Explore Coursework
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
          Coming Soon! Browse different learning paths, quick challenges, and specialized tracks to enhance your Python skills.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
