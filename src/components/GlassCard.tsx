import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useFadeIn } from '../hooks/useFadeIn';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export function GlassCard({ children, style, delay = 0 }: Props) {
  const { opacity, translateY } = useFadeIn(delay, 450);
  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(23, 18, 35, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    overflow: 'hidden',
  },
});
