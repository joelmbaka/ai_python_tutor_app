import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View, View as RNView } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

const { height: SCREEN_H } = Dimensions.get('window');

interface CoinDeductToastOverlayProps {
  trigger: number; // increment to show a new toast
  targetRef: React.RefObject<RNView | null>;
  text?: string; // default '-1'
  durationMs?: number; // total visible duration
  onDone?: () => void;
}

interface TargetRect { x: number; y: number; w: number; h: number }

export const CoinDeductToastOverlay: React.FC<CoinDeductToastOverlayProps> = ({
  trigger,
  targetRef,
  text = '-1',
  durationMs = 2000,
  onDone,
}) => {
  const [target, setTarget] = useState<TargetRect | null>(null);

  const baseX = useSharedValue(0);
  const baseY = useSharedValue(SCREEN_H * 0.1);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const toastStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: baseX.value,
    top: baseY.value,
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!trigger) return;
    // Measure coin badge position
    const measure = (label: string) => {
      const node: any = targetRef.current as any;
      if (node && typeof node.measureInWindow === 'function') {
        node.measureInWindow((x: number, y: number, w: number, h: number) => {
          if (__DEV__) console.log(`[CoinDeductToast] measure (${label})`, { x, y, w, h });
          setTarget({ x, y, w, h });
          if ((w === 0 || h === 0) && typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => measure('raf-retry'));
            setTimeout(() => measure('timeout-retry'), 120);
          }
        });
      } else {
        if (__DEV__) console.warn('[CoinDeductToast] measure: invalid targetRef');
      }
    };
    measure('immediate');
    const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => measure('raf')) : null;
    const t = setTimeout(() => measure('timeout'), 40);
    return () => {
      if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [trigger]);

  useEffect(() => {
    if (!trigger || !target) return;

    // Position near left side of the badge
    const startX = target.x - 44; // shift left from badge's left edge
    const startY = target.y - 6;
    const endY = startY - 24; // float up

    baseX.value = startX;
    baseY.value = startY;
    opacity.value = 0;
    scale.value = 0.8;

    // Animate in -> hold -> fade out while moving up
    opacity.value = withSequence(
      withTiming(1, { duration: 140 }),
      withDelay(Math.max(0, durationMs - 520), withTiming(0, { duration: 280 }))
    );
    scale.value = withSequence(
      withTiming(1.1, { duration: 180 }),
      withTiming(1.0, { duration: 160 })
    );
    baseY.value = withDelay(180, withTiming(endY, { duration: Math.max(300, durationMs - 240) }));

    const timer = setTimeout(() => onDone?.(), durationMs + 50);
    return () => clearTimeout(timer);
  }, [trigger, target]);

  if (!trigger) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[styles.toast, toastStyle]}>
        <Animated.Text style={styles.toastText}>{text}</Animated.Text>
      </Animated.View>
    </View>
  );
};

export default CoinDeductToastOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
  },
  toast: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.85)', // near-black for contrast
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  toastText: {
    color: '#ef4444',
    fontSize: 30,
    fontWeight: '800',
  },
});
