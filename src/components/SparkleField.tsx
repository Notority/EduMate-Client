import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { colors } from '../constants/theme';

const COLORS = ['#d2bbff', '#732ee4', '#ff4da6', '#ffffff', '#ffba27', '#6ee7b7'];
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export function SparkleField() {
  const ps = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    cx: Math.random() * SCREEN_W,
    cy: Math.random() * SCREEN_H,
    angle: Math.random() * Math.PI * 2,
    speed: Math.random() * 2.5 + 1,
    size: Math.random() * 4 + 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 3000,
    spread: Math.random() * 100 + 40,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {ps.map((p) => <Sparkle key={p.id} p={p} />)}
    </View>
  );
}

function Sparkle({ p }: { p: { id: number; cx: number; cy: number; angle: number; speed: number; size: number; color: string; delay: number; spread: number } }) {
  const a = useRef(new Animated.Value(0)).current;
  const o = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(a, {
            toValue: 1, duration: 2500 / p.speed,
            easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.parallel([
              Animated.timing(o, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
            Animated.timing(o, { toValue: 0, duration: 2200, useNativeDriver: true }),
          ]),
        ]),
      ]).start(({ finished }) => { if (finished) { a.setValue(0); scale.setValue(0); loop(); } });
    };
    loop();
  }, []);

  const dx = Math.cos(p.angle) * p.spread;
  const dy = Math.sin(p.angle) * p.spread;

  return (
    <Animated.View style={[styles.dot, {
      width: p.size, height: p.size, borderRadius: p.size / 2,
      backgroundColor: p.color, opacity: o,
      left: p.cx + a.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }),
      top: p.cy + a.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }),
      transform: [{ scale }],
    }]} />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    shadowColor: colors.primaryLight, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
});
