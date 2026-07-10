import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { GlassCard } from "../src/components/GlassCard";
import { Button } from "../src/ui/Button";
import { Input } from "../src/ui/Input";
import { useStore } from "../src/store/useStore";
import { liveSessionApi } from "../src/services/api";
import { LiveSession, SessionAttendance } from "../src/types";
import { colors } from "../src/constants/theme";

export default function TeacherLiveSessionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);
  const logout = useStore((s) => s.logout);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [attendance, setAttendance] = useState<SessionAttendance[]>([]);
  const [recordingUrl, setRecordingUrl] = useState("");

  const load = async () => {
    const [sr, ar] = await Promise.all([
      liveSessionApi.getById(sessionId),
      liveSessionApi.getAttendance(sessionId),
    ]);
    setSession(sr.data);
    setAttendance(ar.data);
    setRecordingUrl(sr.data.recordingUrl || "");
  };
  useEffect(() => { load(); }, [sessionId]);

  const handleStart = async () => {
    try { await liveSessionApi.start(sessionId); await load(); Alert.alert('Started', 'Session is now live.'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleEnd = async () => {
    try { await liveSessionApi.end(sessionId); await load(); Alert.alert('Ended', 'Session has ended.'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  const saveRecording = async () => {
    try { await liveSessionApi.update(sessionId, { recordingUrl }); Alert.alert('Saved', 'Recording URL saved.'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  if (!session) return <PhoneFrame><View style={{ flex: 1, backgroundColor: "#0d0714" }} /></PhoneFrame>;

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader onLogout={() => { logout(); router.replace("/login"); }} onBack={() => router.back()} onProfile={() => router.push("/teacher-profile")} />
        <View style={{ padding: 16, gap: 12 }}>
          <GlassCard style={{ padding: 16, gap: 8 }}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>{session.title}</Text>
            <Text style={{ color: colors.surfaceVariant }}>Status: {session.status} · {session.attendeeCount} attendees</Text>
            {session.description && <Text style={{ color: colors.surfaceVariant }}>{session.description}</Text>}

            {session.streamUrl && session.streamKey && (
              <GlassCard style={{ padding: 12, gap: 6, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>OBS Stream Config</Text>
                <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>URL: {session.streamUrl}</Text>
                <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Key: {session.streamKey}</Text>
                {session.playbackUrl && (
                  <Button title="Preview Stream" variant="secondary" onPress={() => router.push({ pathname: '/stream-player', params: { playbackUrl: session.playbackUrl, title: session.title } })} />
                )}
              </GlassCard>
            )}

            {session.meetingUrl && (
              <Button title="Open Meeting" variant="primary" onPress={() => router.push({ pathname: '/jitsi-meet', params: { url: session.meetingUrl } })} />
            )}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {session.status === 'SCHEDULED' && <Button title="Start Session" onPress={handleStart} variant="success" style={{ flex: 1 }} />}
              {session.status === 'LIVE' && <Button title="End Session" onPress={handleEnd} variant="danger" style={{ flex: 1 }} />}
            </View>
          </GlassCard>

          <GlassCard style={{ padding: 16, gap: 10 }}>
            <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}>Recording</Text>
            <Input label="Recording URL" value={recordingUrl} onChangeText={setRecordingUrl} placeholder="https://..." />
            <Button title="Save Recording" onPress={saveRecording} />
          </GlassCard>

          <GlassCard style={{ padding: 16, gap: 8 }}>
            <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}>Attendance ({attendance.length})</Text>
            {attendance.length === 0 ? (
              <Text style={{ color: colors.surfaceVariant }}>No attendance yet.</Text>
            ) : attendance.map((a) => (
              <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.surfaceVariant }}>{a.studentName || `Student #${a.studentId}`}</Text>
                <Text style={{ color: colors.surfaceVariant }}>{a.status} · {a.duration} min</Text>
              </View>
            ))}
          </GlassCard>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
