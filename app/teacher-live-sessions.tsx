import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { Button } from '../src/ui/Button';
import { Input } from '../src/ui/Input';
import { DatePickerModal } from '../src/components/DatePickerModal';
import { useStore } from '../src/store/useStore';
import { liveSessionApi } from '../src/services/api';
import { LiveSession } from '../src/types';
import { colors } from '../src/constants/theme';

export default function TeacherLiveSessionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string }>();
  const courseId = params.courseId ? Number(params.courseId) : undefined;
  const logout = useStore((s) => s.logout);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.jit.si/');
  const [duration, setDuration] = useState('60');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const load = async () => setSessions((await liveSessionApi.getTeacherSessions(courseId)).data);
  useEffect(() => { load(); }, [courseId]);

  const formatSchedule = () => {
    if (!scheduledDate) return '';
    return scheduledDate.toLocaleDateString() + ' ' + scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const createSession = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return; }
    if (!meetingUrl.trim()) { Alert.alert('Error', 'Meeting URL is required'); return; }
    try {
      await liveSessionApi.create({
        title, description, courseId: courseId!, meetingUrl,
        duration: parseInt(duration) || 60,
        scheduledAt: scheduledDate?.toISOString().replace('Z', ''),
      });
      setTitle(''); setDescription(''); setDuration('60'); setScheduledDate(null);
      setMeetingUrl('https://meet.jit.si/');
      await load();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={() => { logout(); router.replace('/login'); }} onProfile={() => router.push('/teacher-profile')} onBack={() => router.back()} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>Live Sessions</Text>

          <GlassCard style={{ padding: 16, gap: 10 }}>
            <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>Schedule Live Session</Text>
            <Input label="Title" value={title} onChangeText={setTitle} placeholder="Weekly live class" />
            <Input label="Description" value={description} onChangeText={setDescription} placeholder="What will be covered" />
            <Input label="Meeting URL" value={meetingUrl} onChangeText={setMeetingUrl} placeholder="https://meet.jit.si/room-name" />
            <Input label="Duration (min)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />

            <Button
              title={scheduledDate ? `Schedule: ${formatSchedule()}` : 'Pick Date & Time'}
              variant="secondary"
              onPress={() => setShowPicker(true)}
            />

            <DatePickerModal
              visible={showPicker}
              onClose={() => setShowPicker(false)}
              onConfirm={(d) => setScheduledDate(d)}
              initial={scheduledDate || undefined}
              minDate={new Date()}
            />

            <Button title="Create Session" onPress={createSession} />
          </GlassCard>

          {sessions.length === 0 ? (
            <GlassCard style={{ padding: 16 }}><Text style={{ color: colors.surfaceVariant }}>No sessions yet.</Text></GlassCard>
          ) : sessions.map((s) => (
            <GlassCard key={s.id} style={{ padding: 14, gap: 6 }}>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>{s.title}</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>
                {s.status} · {s.duration} min · {s.attendeeCount} attendees
                {s.scheduledAt ? ` · ${new Date(s.scheduledAt).toLocaleString()}` : ''}
              </Text>
              <Button title="Manage" onPress={() => router.push({ pathname: '/teacher-live-session-detail', params: { id: s.id } })} variant="primary" />
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
