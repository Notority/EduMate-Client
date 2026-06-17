import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { SparkleField } from '../src/components/SparkleField';
import { AnimatedLogo } from '../src/components/AnimatedLogo';
import { Input } from '../src/ui/Input';
import { Button } from '../src/ui/Button';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';

export default function LoginScreen() {
  const r = useRouter();
  const user = useStore((s) => s.user);
  const login = useStore((s) => s.login);
  const [e, setE] = useState(user.email);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [ld, setLd] = useState(false);

  const h = async () => {
    if (!e.includes('@')) { setErr('Enter a valid email.'); return; }
    if (pw.length < 5) { setErr('Password must be 5+ chars.'); return; }
    setErr(''); setLd(true);
    try {
      await login(e, pw);
      // Check user role from store
      const userRole = useStore.getState().user.role;
      if (userRole === 'TEACHER') {
        r.replace('/teacher-dashboard');
      } else {
        r.replace('/dashboard');
      }
    } catch (ex: any) {
      setErr(ex.message);
    } finally {
      setLd(false);
    }
  };

  return (
    <PhoneFrame>
      <SparkleField />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 48, gap: 20 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <AnimatedLogo size={120} />
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primaryLight, textShadowColor: 'rgba(115,46,228,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 12 }}>EduMate</Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 12, fontWeight: '500', opacity: 0.8 }}>Your friendly AI study companion</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(23,18,35,0.75)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 20, gap: 16 }}>
          {err ? <Text style={{ backgroundColor: 'rgba(127,29,29,0.4)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 12, padding: 10, borderRadius: 12, textAlign: 'center' }}>{err}</Text> : null}
          <Input label="Email" value={e} onChangeText={setE} placeholder="student@university.edu" keyboardType="email-address" />
          <Input label="Password" value={pw} onChangeText={setPw} placeholder="••••••••" secureTextEntry />
          <Button title={ld ? 'Signing in...' : 'Log In →'} onPress={h} disabled={ld} />
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            {['Google', 'Apple'].map((p) => (
              <View key={p} style={{ padding: 10, paddingHorizontal: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: colors.surfaceVariant, fontSize: 12 }} onPress={() => Alert.alert('Login', `Connecting with ${p}...`)}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={{ textAlign: 'center', color: colors.surfaceVariant, fontSize: 12 }}>New to EduMate?<Text style={{ color: colors.secondary, fontWeight: '700' }} onPress={() => r.push('/register')}> Create account</Text></Text>
      </ScrollView>
    </PhoneFrame>
  );
}
