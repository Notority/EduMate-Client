import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { colors } from '../constants/theme';
import { AnimatedLogo } from './AnimatedLogo';

interface Props {
  onLogout: () => void;
  onConfig?: () => void;
  onProfile: () => void;
  onBack?: () => void;
  onMenuToggle?: () => void;
}

export function DashboardHeader({ onLogout, onConfig, onProfile, onBack, onMenuToggle }: Props) {
  const user = useStore((s) => s.user);
  const avatar = user.profilePicture || '👤';

  return (
    <View style={styles.h}>
      <View style={styles.l}>
        {onMenuToggle && (
          <TouchableOpacity onPress={onMenuToggle} style={styles.menuBtn} activeOpacity={0.7}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        )}
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.bIcon}>←</Text>
          </TouchableOpacity>
        )}
        <AnimatedLogo size={32} />
        <View>
          <Text style={styles.title}>EduMate</Text>
          <Text style={styles.sub}>STUDY SUITE</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onProfile} style={styles.btn} activeOpacity={0.7}>
          <Text style={styles.bIcon}>{avatar}</Text>
        </TouchableOpacity>
        {onConfig && (
          <TouchableOpacity onPress={onConfig} style={styles.btn} activeOpacity={0.7}>
            <Text style={styles.bIcon}>⚙️</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onLogout} style={styles.btn} activeOpacity={0.7}>
          <Text style={styles.bIcon}>⏻</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(23, 17, 34, 0.8)',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  l: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBtn: { marginRight: 2 },
  menuIcon: { fontSize: 20, color: colors.white },
  backBtn: { marginRight: 4 },
  title: { color: colors.white, fontWeight: '700', fontSize: 14 },
  sub: { color: colors.surfaceVariant, fontSize: 8, fontWeight: '600', letterSpacing: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  bIcon: { fontSize: 14 },
});
