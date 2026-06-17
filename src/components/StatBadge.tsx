import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  icon: string;
  label: string;
  value: string;
  accent?: string;
}

export function StatBadge({ icon, label, value, accent = colors.tertiary }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { borderColor: `${accent}50` }]}>
        <Text style={[styles.icon, { color: accent }]}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function StatBadgeRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(27, 20, 38, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(210, 187, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: { fontSize: 18 },
  label: {
    color: colors.surfaceVariant,
    fontSize: 9,
    fontWeight: '500',
  },
  value: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
