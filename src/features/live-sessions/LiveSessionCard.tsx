import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../ui/Button';
import { colors } from '../../constants/theme';

interface LiveSessionCardProps {
  session: {
    id: number;
    title: string;
    description?: string;
    scheduledAt?: string;
    status?: string;
    meetingUrl?: string;
    attendeeCount?: number;
    duration?: number;
  };
  mode?: 'teacher' | 'student';
  onOpen: () => void;
}

export function LiveSessionCard({ session, mode = 'student', onOpen }: LiveSessionCardProps) {
  const router = useRouter();

  return (
    <GlassCard style={{ padding: 16, gap: 10 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.white, fontSize: 17, fontWeight: '700' }}>{session.title}</Text>
        {session.description ? <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>{session.description}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>
          {session.scheduledAt ? `Scheduled: ${new Date(session.scheduledAt).toLocaleString()}` : 'Schedule pending'}
          {session.duration ? ` · ${session.duration} min` : ''}
        </Text>
        <Text style={{ color: session.status === 'LIVE' ? colors.emerald : colors.secondary, fontSize: 12, fontWeight: '700' }}>
          {session.status || 'SCHEDULED'}
        </Text>
      </View>
      {session.status === 'LIVE' && session.meetingUrl && (
        <Button title="Join Now" variant="success" onPress={() => router.push({ pathname: '/jitsi-meet', params: { url: session.meetingUrl } })} />
      )}
      <Button title={mode === 'teacher' ? 'Manage Session' : 'View Details'} onPress={onOpen} variant="primary" />
    </GlassCard>
  );
}
