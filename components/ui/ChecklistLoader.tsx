import React from 'react';
import { Modal, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from './LoadingSpinner';

interface ChecklistLoaderProps {
  visible: boolean;
  title?: string;
  items: string[]; // Max 5, will be sliced
  activeIndex: number; // 0..n-1, the current in-progress item
  timedOut?: boolean; // after 3 minutes, we can show a friendly message
}

export const ChecklistLoader: React.FC<ChecklistLoaderProps> = ({
  visible,
  title = 'Preparing your first lesson...',
  items,
  activeIndex,
  timedOut = false,
}) => {
  const isDark = useColorScheme() === 'dark';
  const limitedItems = items.slice(0, 5);

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: isDark ? '#0b1020' : '#ffffff' }]}>        
        <View style={styles.content}>
          <LoadingSpinner size={56} color={'#6366f1'} text={title} subText={timedOut ? 'This is taking longer than usual. Hang tight…' : 'This may take a minute.'} />

          <View style={styles.checklist}>
            {limitedItems.map((label, index) => {
              const isDone = index < activeIndex;
              const isActive = index === activeIndex;
              const color = isDone ? '#10b981' : isActive ? '#6366f1' : isDark ? '#9ca3af' : '#9ca3af';

              return (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemIcon}>
                    {isDone ? (
                      <Ionicons name="checkmark-circle" size={20} color={color} />
                    ) : isActive ? (
                      <View style={styles.inlineSpinnerWrapper}>
                        <LoadingSpinner size={20} color={color} text="" compact />
                      </View>
                    ) : (
                      <Ionicons name="ellipse-outline" size={18} color={color} />
                    )}
                  </View>
                  <Text style={[styles.itemText, { color: isDark ? '#e5e7eb' : '#111827' }]}>{label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklist: {
    marginTop: 16,
    width: '100%',
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 15,
    flexShrink: 1,
  },
  inlineSpinnerWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChecklistLoader;
