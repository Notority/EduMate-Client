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

export default function RegisterScreen() {
  const r = useRouter();
  const register = useStore((s) => s.register);
  const [n, setN] = useState('');
  const [e, setE] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [ld, setLd] = useState(false);

  const h = async () => {
    if (!n.trim() || n.trim().length < 2) { setErr('Enter your name.'); return; }
    if (!e.includes('@')) { setErr('Enter a valid email.'); return; }
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setErr(''); setLd(true);
    const parts = n.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : firstName;
    try {
      await register(firstName, lastName, e, pw);
      r.replace('/dashboard');
    } catch (ex: any) {
      setErr(ex.message);
    } finally {
      setLd(false);
    }
  };

  return (
    <PhoneFrame>
      <SparkleField />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 40, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <AnimatedLogo size={100} />
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.white }}>Start Your <Text style={{ color: colors.secondary }}>Adventure</Text></Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 10, textAlign: 'center', maxWidth: 260 }}>Join thousands of students turning study time into an epic journey.</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(23,18,35,0.75)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 20, gap: 12 }}>
          <View><Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>Create Account</Text><Text style={{ color: colors.surfaceVariant, fontSize: 10, opacity: 0.8 }}>Step into the future of learning.</Text></View>
          {err ? <Text style={{ backgroundColor: 'rgba(127,29,29,0.4)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 12, padding: 10, borderRadius: 12, textAlign: 'center' }}>{err}</Text> : null}
          <Input label="Full Name" value={n} onChangeText={setN} placeholder="Enter your name" />
          <Input label="Email" value={e} onChangeText={setE} placeholder="you@example.com" keyboardType="email-address" />
          <Input label="Password" value={pw} onChangeText={setPw} placeholder="Create a strong password" secureTextEntry />
          <Button title={ld ? 'Creating...' : 'Sign Up →'} onPress={h} disabled={ld} />
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            {['Google', 'Apple'].map((p) => (
              <View key={p} style={{ padding: 10, paddingHorizontal: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ color: colors.surfaceVariant, fontSize: 12 }} onPress={() => Alert.alert('Register', `Connecting with ${p}...`)}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ backgroundColor: colors.secondary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 999, alignSelf: 'center', shadowColor: colors.secondary, shadowOpacity: 0.5, shadowRadius: 15, elevation: 8 }}>
          <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>✨ Earn 50 bonus XP on sign up!</Text>
        </View>
        <Text style={{ textAlign: 'center', color: colors.surfaceVariant, fontSize: 12 }}>Already have an account?<Text style={{ color: colors.secondary, fontWeight: '700' }} onPress={() => r.push('/login')}> Log In</Text></Text>
      </ScrollView>
    </PhoneFrame>
  );
}
