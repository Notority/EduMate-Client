import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { ProgressBar } from '../src/components/ProgressBar';
import { StarField } from '../src/components/StarField';
import { SparkleField } from '../src/components/SparkleField';
import { AnimatedLogo } from '../src/components/AnimatedLogo';
import { Button } from '../src/ui/Button';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';

export default function SplashScreen() {
  const r = useRouter();
  const config = useStore((s) => s.config);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const ms = Math.max(20, 70 / config.loadSpeedMultiplier);
    const id = setInterval(() => setPct((p) => {
      const n = Math.min(p + Math.floor(Math.random() * 3) + 1, 100);
      if (n >= 100) { clearInterval(id); if (config.autoProgress) setTimeout(() => r.replace('/login'), 600); }
      return n;
    }), ms);
    return () => clearInterval(id);
  }, []);

  return (
    <PhoneFrame>
      <View style={styles.c}>
        <StarField />
        <SparkleField />
        <View style={{ alignItems: 'flex-end', zIndex: 10 }}>
          <Button title="Skip →" variant="ghost" onPress={() => r.replace('/login')} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AnimatedLogo size={160} />
        </View>
        <View style={{ alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <Text style={styles.title}>EduMate</Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 14, fontWeight: '500', letterSpacing: 2 }}>
            Learn. Play. Succeed.
          </Text>
        </View>
        <View style={{ alignItems: 'center', paddingBottom: 32 }}>
          <ProgressBar percent={pct} />
        </View>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: 'transparent', padding: 24 },
  title: {
    fontSize: 36, fontWeight: '700', color: colors.primaryLight,
    textShadowColor: 'rgba(115,46,228,0.6)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 16,
  },
});
