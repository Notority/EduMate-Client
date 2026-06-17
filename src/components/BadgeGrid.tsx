import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

const badges = [
  { name: 'Early Bird', desc: 'Quest Starter', icon: '🥚', gradient: ['#22d3ee', '#732ee4'] },
  { name: 'Quiz Master', desc: 'Trivia Pro', icon: '✅', gradient: ['#ffba27', '#ff4da6'] },
  { name: 'Knowledge', desc: 'Fast Seeker', icon: '🚀', gradient: ['#932ee4', '#34d399'] },
];

export function BadgeGrid() {
  return (
    <View style={styles.grid}>
      {badges.map((b, i) => (
        <View key={i} style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: b.gradient[0] }]}>
            <Text style={styles.icon}>{b.icon}</Text>
          </View>
          <Text style={styles.name}>{b.name}</Text>
          <Text style={styles.desc}>{b.desc}</Text>
        </View>
      ))}
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
    backgroundColor: 'rgba(26, 18, 38, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  name: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  desc: {
    color: colors.surfaceVariant,
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
});
