import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { AnimatedLogo } from './AnimatedLogo';

interface Props {
  userName: string;
}

export function WelcomeBanner({ userName }: Props) {
  const first = userName.split(' ')[0] || 'Adventurer';
  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.badge}>LEVEL 12 ADVENTURER</Text>
        <Text style={styles.greeting}>Welcome back, {first}!</Text>
        <Text style={styles.message}>
          You are completing study quests 32% faster this week. Keep up the streak!
        </Text>
      </View>
      <AnimatedLogo size={64} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 14, 212, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(210, 187, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  badge: {
    color: colors.secondaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  greeting: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    color: colors.surfaceVariant,
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 280,
  },
});
