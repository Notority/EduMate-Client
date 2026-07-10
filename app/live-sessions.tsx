import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { Button } from '../src/ui/Button';
import { useStore } from '../src/store/useStore';
import { liveSessionApi } from '../src/services/api';
import { LiveSession, SessionAttendance } from '../src/types';
import { colors } from '../src/constants/theme';

export default function LiveSessionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId: string; courseTitle?: string }>();
  const courseId = Number(params.courseId);
  const courseTitle = params.courseTitle || 'Live Sessions';
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, SessionAttendance>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [sr] = await Promise.all([
        liveSessionApi.getCourseSessions(courseId),
      ]);
      setSessions(sr.data);
      const map: Record<number, SessionAttendance> = {};
      for (const s of sr.data) {
        try {
          const ar = await liveSessionApi.getMyAttendance(s.id);
          if (ar.data) map[s.id] = ar.data;
        } catch {}
      }
      setAttendanceMap(map);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [courseId]);

  const handleJoin = async (s: LiveSession) => {
    try {
      await liveSessionApi.join(s.id);
      router.push({ pathname: '/jitsi-meet', params: { url: s.meetingUrl } });
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={() => { logout(); router.replace('/login'); }} onBack={() => router.back()} onProfile={() => router.push('/profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>🎥 {courseTitle} Sessions</Text>

          {loading ? (
            <GlassCard style={{ padding: 24 }}><Text style={{ color: colors.surfaceVariant }}>Loading...</Text></GlassCard>
          ) : sessions.length === 0 ? (
            <GlassCard style={{ padding: 16 }}><Text style={{ color: colors.surfaceVariant }}>No live sessions scheduled for this course.</Text></GlassCard>
          ) : (
            sessions.map((s) => {
              const myAttendance = attendanceMap[s.id];
              const isJoined = !!myAttendance?.joinedAt;
              return (
                <GlassCard key={s.id} style={{ padding: 14, gap: 8 }}>
                  <View style={{ gap: 4 }}>
                    <Text style={{ color: colors.white, fontSize: 17, fontWeight: '700' }}>{s.title}</Text>
                    {s.description && <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>{s.description}</Text>}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>
                      {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : 'No schedule'}
                      {s.duration ? ` · ${s.duration} min` : ''}
                    </Text>
                    <Text style={{ color: s.status === 'LIVE' ? colors.emerald : colors.secondary, fontSize: 12, fontWeight: '700' }}>
                      {s.status} · {s.attendeeCount} attending
                    </Text>
                  </View>
                  {isJoined && (
                    <Text style={{ color: colors.emerald, fontSize: 12 }}>
                      You attended · {myAttendance.status}{myAttendance.duration ? ` · ${myAttendance.duration} min` : ''}
                    </Text>
                  )}
                  {s.status === 'LIVE' && s.playbackUrl && (
                    <Button title="Watch Stream" variant="secondary" onPress={() => router.push({ pathname: '/stream-player', params: { playbackUrl: s.playbackUrl, title: s.title } })} style={{ flex: 1 }} />
                  )}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {s.status === 'LIVE' && !isJoined && (
                      <Button title="Join Now" variant="success" onPress={() => handleJoin(s)} style={{ flex: 1 }} />
                    )}
                    {s.status === 'LIVE' && isJoined && (
                      <Button title="Open Meeting" variant="primary" onPress={() => router.push({ pathname: '/jitsi-meet', params: { url: s.meetingUrl } })} style={{ flex: 1 }} />
                    )}
                  </View>
                </GlassCard>
              );
            })
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
