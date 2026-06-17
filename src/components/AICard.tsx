import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  onPress: () => void;
  claimed: boolean;
  xpReward: number;
}

export function AICard({ onPress, claimed, xpReward }: Props) {
  return (
    <View style={styles.c}>
      <Text style={styles.b}>AI RECOMMENDATION</Text>
      <Text style={styles.t}>Operating Systems: CPU Scheduling</Text>
      <Text style={styles.d}>
        Complete this 8-question module to unlock the Scheduler Overlord badge.
      </Text>
      <TouchableOpacity onPress={onPress}
        style={[styles.btn, claimed && styles.cld]} activeOpacity={0.7}>
        <Text style={[styles.bt, claimed && styles.ct]}>
          {claimed ? `✓ Claimed! (+${xpReward} XP)` : 'Start Quest →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c: {
    backgroundColor: 'rgba(17, 13, 24, 1)', borderWidth: 1,
    borderColor: 'rgba(255, 186, 39, 0.2)', borderRadius: 16, padding: 12, gap: 6,
  },
  b: { color: colors.tertiary, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  t: { color: colors.white, fontSize: 12, fontWeight: '700' },
  d: { color: colors.surfaceVariant, fontSize: 10, fontWeight: '500', lineHeight: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
  cld: { backgroundColor: 'rgba(27, 23, 36, 1)', borderWidth: 1, borderColor: 'rgba(110,231,183,0.3)' },
  bt: { color: colors.white, fontSize: 12, fontWeight: '700' },
  ct: { color: '#6ee7b7' },
});
