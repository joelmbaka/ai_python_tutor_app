import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View, View as RNView, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  interpolate,
  runOnUI,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface CoinFlightOverlayProps {
  trigger: number; // increment to start a new animation
  targetRef: React.RefObject<RNView | null>;
  coinCount?: number;
  onDone?: () => void;
}

interface TargetRect { x: number; y: number; w: number; h: number }

const FlyingCoin: React.FC<{
  index: number;
  trigger: number;
  target: TargetRect | null;
  onDoneOne?: () => void;
}> = ({ index, trigger, target, onDoneOne }) => {
  // Shared values per coin
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const shown = useSharedValue(0);

  // Shared positions to avoid first-frame flicker
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const targetX = useSharedValue(0);
  const targetY = useSharedValue(0);

  // Gate rendering so nothing shows until animation actually starts
  const [visible, setVisible] = useState(false);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [startX.value, targetX.value]) },
      { translateY: interpolate(progress.value, [0, 1], [startY.value, targetY.value]) },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Dev logging helper (first coin only to reduce noise)
  const devLog = (msg: string, data?: any) => {
    if (__DEV__ && index === 0) console.log(`[CoinFlight] ${msg}`, data ?? '');
  };

  // Only reveal the coin once progress has started (avoids visible static frame)
  useAnimatedReaction(
    () => progress.value,
    (p) => {
      if (p > 0.02 && shown.value === 0) {
        shown.value = 1;
        runOnJS(devLog)('visible gate fired (progress>0.02)', { p });
        runOnJS(setVisible)(true);
      }
    }
  );

  useEffect(() => {
    if (!trigger || !target) return;

    // Calculate positions
    const newStartX = SCREEN_W * 0.3 + (index % 3) * 20 - 30; // spread across content width
    const newStartY = SCREEN_H * 0.75 + index * 8; // from lower content area
    const newTargetX = target.x + target.w / 2 - 8; // adjust for icon size
    const newTargetY = target.y + target.h / 2 - 8;

    // Store positions in shared values
    startX.value = newStartX;
    startY.value = newStartY;
    targetX.value = newTargetX;
    targetY.value = newTargetY;

    if (__DEV__ && index === 0) {
      console.log('[CoinFlight] start->target', { startX: newStartX, startY: newStartY, targetX: newTargetX, targetY: newTargetY, trigger });
    }

    // Reset and hide until we're ready to start
    progress.value = 0;
    opacity.value = 0; // Start invisible
    scale.value = 1.0; // Start at normal size
    setVisible(false);
    shown.value = 0;

    // Start on UI thread so movement begins before first visible frame
    runOnUI(() => {
      'worklet';
      // make visible on UI thread and start moving immediately
      opacity.value = 1;
      // Flight to target, then slight overshoot. IMPORTANT: use withSequence so we don't cancel the first leg.
      progress.value = withSequence(
        withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }),
        withTiming(1.2, { duration: 120 })
      );
      // Finish: pop then slight overshoot
      scale.value = withDelay(1200, withSpring(1.3, { damping: 14, stiffness: 160 }));
      // Then fade out so coins never hang on screen
      opacity.value = withDelay(1300, withTiming(0, { duration: 180 }));
    })();
    runOnJS(devLog)('UI anim scheduled', { trigger, index });

    // Call onDoneOne for last coin
    const totalDuration = 1380;
    const timer = setTimeout(() => onDoneOne && onDoneOne(), totalDuration);
    return () => {
      clearTimeout(timer);
      setVisible(false);
      shown.value = 0;
      devLog('cleanup', { trigger, index });
    };
  }, [trigger, target]);

  // Do not render the coin until we have a target and we're ready to show it
  if (!target || !visible) return null;

  return (
    <Animated.View style={[styles.coin, style]} pointerEvents="none">
      <Ionicons name="cash-outline" size={18} color="#fff" />
    </Animated.View>
  );
};

export const CoinFlightOverlay: React.FC<CoinFlightOverlayProps> = ({
  trigger,
  targetRef,
  coinCount = 3,
  onDone,
}) => {
  const [target, setTarget] = useState<TargetRect | null>(null);
  const [active, setActive] = useState(false);
  const coins = useMemo(() => Array.from({ length: coinCount }), [coinCount]);

  useEffect(() => {
    if (!trigger) return;
    // Mark overlay active for this run
    setActive(true);
    // Reset target so coins wait for a fresh measurement
    setTarget(null);
    // measure target position in window
    let measuredValid = false;
    const measure = (label: string) => {
      if (measuredValid) return;
      const node: any = targetRef.current as any;
      if (node && node.measureInWindow) {
        node.measureInWindow((x: number, y: number, w: number, h: number) => {
          if (__DEV__) console.log(`[CoinFlight] measure (${label})`, { x, y, w, h });
          if (w > 0 && h > 0) {
            measuredValid = true;
            setTarget({ x, y, w, h });
          } else if (typeof requestAnimationFrame === 'function') {
            // Retry to avoid measuring before layout is ready
            requestAnimationFrame(() => measure('raf-retry'));
            setTimeout(() => measure('timeout-retry'), 120);
          }
        });
      } else {
        if (__DEV__) console.warn('[CoinFlight] measure: targetRef invalid or lacks measureInWindow');
      }
    };
    // try immediately, next frame, and after a short delay
    measure('immediate');
    const rafId = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => measure('raf')) : null;
    const t = setTimeout(() => measure('timeout'), 40);
    return () => {
      if (rafId && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
      clearTimeout(t);
    };
  }, [trigger]);

  const handleDoneOne = useRef(0);
  useEffect(() => {
    handleDoneOne.current = 0;
  }, [trigger]);

  const onOneFinished = () => {
    handleDoneOne.current += 1;
    if (handleDoneOne.current >= coinCount) {
      setActive(false);
      onDone?.();
    }
  };

  // Render nothing unless a flight is active
  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {coins.map((_, i) => (
        <FlyingCoin key={`coin-${trigger}-${i}`} index={i} trigger={trigger} target={target} onDoneOne={onOneFinished} />
      ))}
    </View>
  );
};

export default CoinFlightOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  coin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f59e0b',
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0, // ensure initial frame is hidden to avoid flicker before animation applies
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
});
