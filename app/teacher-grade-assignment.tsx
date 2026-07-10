import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { assignmentApi } from '../src/services/api';
import { Assignment, AssignmentSubmission } from '../src/types';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';
import { Input } from '../src/ui/Input';

export default function TeacherGradeAssignmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ assignmentId: string }>();
  const assignmentId = parseInt(params.assignmentId);
  const logout = useStore((s) => s.logout);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);
  const [score, setScore] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [aRes, sRes] = await Promise.all([
        assignmentApi.getById(assignmentId),
        assignmentApi.getSubmissions(assignmentId),
      ]);
      setAssignment(aRes.data);
      setSubmissions(sRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [assignmentId]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectSubmission = (sub: AssignmentSubmission) => {
    setSelectedSub(sub);
    setScore(sub.score != null ? String(sub.score) : '');
    setTeacherNotes(sub.teacherNotes || '');
  };

  const handleSave = async () => {
    if (!selectedSub) return;
    setSaving(true);
    try {
      await assignmentApi.grade(selectedSub.id, {
        score: parseInt(score) || 0,
        teacherNotes: teacherNotes.trim() || undefined,
      });
      Alert.alert('Saved', 'Grade saved successfully.');
      const res = await assignmentApi.getSubmissions(assignmentId);
      setSubmissions(res.data);
      const updated = res.data.find((s: AssignmentSubmission) => s.id === selectedSub.id);
      if (updated) setSelectedSub(updated);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatBytes = (b: number) => {
    if (b < 1024) return `${b}B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
    return `${(b / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (loading) {
    return (
      <PhoneFrame>
        <View style={{ flex: 1, backgroundColor: '#0d0714', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/teacher-profile')} onBack={() => router.back()} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.white }}>📊 Grade Assignments</Text>
          {assignment && <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>{assignment.title} — {submissions.length} submission(s)</Text>}

          {submissions.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>No submissions yet.</Text>
            </GlassCard>
          ) : (
            <>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>Submissions</Text>
              {submissions.map((s) => (
                <TouchableOpacity key={s.id} onPress={() => selectSubmission(s)} activeOpacity={0.8}>
                  <GlassCard style={{
                    padding: 12, gap: 4,
                    borderColor: selectedSub?.id === s.id ? colors.primary : 'transparent',
                    borderWidth: selectedSub?.id === s.id ? 1 : 0,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
                          {s.studentName || `Student #${s.studentId}`}
                        </Text>
                        <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>{s.fileName} ({formatBytes(s.fileSize)})</Text>
                        <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>Submitted: {formatDate(s.submittedAt)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        {s.status === 'GRADED' && <Text style={{ color: colors.emerald, fontSize: 11, fontWeight: '700' }}>GRADED</Text>}
                        <Text style={{ color: colors.tertiary, fontWeight: '700', fontSize: 14 }}>
                          {s.score != null ? `${s.score}/${assignment?.totalPoints || '?'}` : '-'}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </>
          )}

          {selectedSub && (
            <GlassCard style={{ padding: 16, gap: 10 }}>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>
                {selectedSub.studentName || `Student #${selectedSub.studentId}`}
              </Text>
              <View style={{ gap: 4 }}>
                <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>File: {selectedSub.fileName}</Text>
                <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Size: {formatBytes(selectedSub.fileSize)}</Text>
                <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Submitted: {formatDate(selectedSub.submittedAt)}</Text>
              </View>

              <Input
                label={`Score (out of ${assignment?.totalPoints || '?'})`}
                placeholder="0"
                value={score}
                onChangeText={setScore}
                keyboardType="number-pad"
              />

              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.white, marginBottom: 4 }}>Teacher Notes</Text>
                <TextInput
                  style={{ width: '100%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white, minHeight: 60, textAlignVertical: 'top' }}
                  placeholder="Optional feedback..."
                  placeholderTextColor={colors.surfaceVariant}
                  value={teacherNotes}
                  onChangeText={setTeacherNotes}
                  multiline
                />
              </View>

              <Button title="Save Grade" onPress={handleSave} disabled={saving} />
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
