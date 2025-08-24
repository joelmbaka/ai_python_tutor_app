import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f9fafb' }]}>
      <View style={styles.content}>
        <Ionicons name="person" size={80} color="#8b5cf6" />
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111827' }]}>
          Your Profile
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
          Coming Soon! Manage your account, view certificates, customize settings, and connect with the community.
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
