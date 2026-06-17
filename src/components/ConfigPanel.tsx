import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { useStore } from '../store/useStore';
import { Toggle } from '../ui/Toggle';

export function ConfigPanel({ onClose }: { onClose: () => void }) {
  const config = useStore((s) => s.config);
  const updateConfig = useStore((s) => s.updateConfig);
  const skins = [
    { k: 'midnight', bg: '#1a172c' },
    { k: 'sunset', bg: '#ff4da6' },
    { k: 'deepforest', bg: '#111d21' },
  ] as const;

  return (
    <View style={styles.o}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.p}>
        <Text style={styles.h}>⚙️ Controls</Text>
        <Row label="Sound" val={config.soundEnabled}
          onToggle={() => updateConfig({ soundEnabled: !config.soundEnabled })} />
        <Row label="Auto-progress" val={config.autoProgress}
          onToggle={() => updateConfig({ autoProgress: !config.autoProgress })} />
        <Text style={styles.sh}>Skin</Text>
        <View style={styles.sr}>
          {skins.map((s) => (
            <TouchableOpacity key={s.k} onPress={() => updateConfig({ skinColor: s.k })}
              style={[styles.sd, { backgroundColor: s.bg },
                config.skinColor === s.k && styles.sa]} />
          ))}
        </View>
      </View>
    </View>
  );
}

function Row({ label, val, onToggle }: { label: string; val: boolean; onToggle: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.lb}>{label}</Text>
      <Toggle value={val} onToggle={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  o: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  p: {
    backgroundColor: '#14121a', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  h: { color: colors.white, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lb: { color: colors.surfaceVariant, fontSize: 13, fontWeight: '500' },
  sh: { color: colors.surfaceVariant, fontSize: 11, fontWeight: '600' },
  sr: { flexDirection: 'row', gap: 12 },
  sd: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  sa: { borderColor: colors.primaryLight, transform: [{ scale: 1.2 }] },
});
