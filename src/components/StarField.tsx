import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const STAR_COUNT = 80;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const FALL_HEIGHT = SCREEN_H + 100;

export function StarField() {
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * (SCREEN_W + 100) - 50,
    y: Math.random() * SCREEN_H,
    size: Math.random() * 2.5 + 0.5,
    speed: Math.random() * 0.6 + 0.2,
    opacity: Math.random() * 0.7 + 0.3,
    twinkleSpeed: Math.random() * 1000 + 500,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) => <StarDot key={i} s={s} />)}
    </View>
  );
}

function StarDot({ s }: { s: { x: number; y: number; size: number; speed: number; opacity: number; twinkleSpeed: number } }) {
  const y = useRef(new Animated.Value(s.y)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fall = () => {
      y.setValue(-20);
      Animated.timing(y, {
        toValue: FALL_HEIGHT, duration: FALL_HEIGHT / s.speed * 16,
        easing: Easing.linear, useNativeDriver: true,
      }).start(({ finished }) => { if (finished) fall(); });
    };
    fall();

    const tw = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: s.twinkleSpeed / 2, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: s.twinkleSpeed / 2, useNativeDriver: true }),
      ])
    );
    tw.start();
    return () => { tw.stop(); };
  }, []);

  const opacity = Animated.multiply(
    s.opacity,
    twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] })
  );

  return (
    <Animated.View style={[styles.s, {
      left: s.x, width: s.size, height: s.size,
      borderRadius: s.size / 2, opacity,
      transform: [{ translateY: y }],
    }]} />
  );
}

const styles = StyleSheet.create({
  s: { position: 'absolute', backgroundColor: '#d2bbff' },
});
