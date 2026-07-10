import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props { percent: number }

export function ProgressBar({ percent }: Props) {
  const fillWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillWidth, {
      toValue: percent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percent, fillWidth]);

  return (
    <View style={styles.w}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: fillWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.label}>
        <View style={[styles.dot, percent < 100 && { opacity: 0.7 }]} />
        <Text style={styles.text}>SYNCING YOUR BRAIN...{' '}
          <Text style={styles.pct}>{percent}%</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  w: { width: '100%', maxWidth: 280, gap: 12 },
  track: {
    height: 10, width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999, overflow: 'hidden',
  },
  fill: {
    height: '100%', borderRadius: 999,
    backgroundColor: colors.primary,
  },
  label: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  text: { fontSize: 10, fontWeight: '600', color: colors.surfaceVariant, letterSpacing: 2 },
  pct: { color: colors.secondary, fontWeight: '700' },
});
