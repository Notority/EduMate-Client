import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export function useFadeIn(delay = 0, duration = 400) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1, duration, useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0, duration, useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration, opacity, translateY]);

  return { opacity, translateY };
}

export function useFadeInScale(delay = 0, duration = 400) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1, duration, useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1, friction: 8, tension: 40, useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration, opacity, scale]);

  return { opacity, scale };
}
