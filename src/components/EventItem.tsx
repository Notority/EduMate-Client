import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  tag: string;
  tagColor: string;
  title: string;
  time: string;
}

export function EventItem({ tag, tagColor, title, time }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.tag, { backgroundColor: `${tagColor}25` }]}>
        <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

export function EventSection({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.grid}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(23, 18, 33, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
  },
  title: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  time: {
    color: colors.surfaceVariant,
    fontSize: 9,
    fontWeight: '600',
  },
});
