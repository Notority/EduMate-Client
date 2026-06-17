import { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../constants/theme';

export function Mascot({ size = 144, animated = true }: { size?: number; animated?: boolean }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1, duration: 3000,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, duration: 3000,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated]);

  const translateY = animated
    ? floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] })
    : 0;

  return (
    <Animated.View
      style={[styles.wrapper, {
        width: size, height: size,
        transform: [{ translateY }],
      }]}
    >
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Animated.Text style={{ fontSize: size * 0.5 }}>🦉</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center', justifyContent: 'center',
  },
  circle: {
    backgroundColor: 'rgba(115, 46, 228, 0.15)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 10,
  },
});
