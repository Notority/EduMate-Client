import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props { percent: number }

export function ProgressBar({ percent }: Props) {
  return (
    <View style={styles.w}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
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
