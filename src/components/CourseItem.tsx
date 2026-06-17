import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  title: string;
  subtitle: string;
  progress: number;
  color: string;
}

export function CourseItem({ title, subtitle, progress, color }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Text style={[styles.percent, { color }]}>{progress}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(23, 18, 33, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.surfaceVariant,
    fontSize: 10,
    fontWeight: '500',
  },
  percent: {
    fontSize: 11,
    fontWeight: '800',
  },
  track: {
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
