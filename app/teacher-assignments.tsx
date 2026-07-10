import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { assignmentApi } from '../src/services/api';
import { Assignment } from '../src/types';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';
import { Input } from '../src/ui/Input';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#facc15', OPEN: '#4ade80', CLOSED: '#6b7280',
};

export default function TeacherAssignmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string }>();
  const courseId = params.courseId ? parseInt(params.courseId) : undefined;
  const logout = useStore((s) => s.logout);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState('100');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await assignmentApi.getTeacherAssignments(courseId);
      setAssignments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  const handleCreate = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return; }
    setCreating(true);
    try {
      await assignmentApi.create({
        title: title.trim(), description: description.trim() || undefined,
        courseId: courseId!, totalPoints: parseInt(totalPoints) || 100,
        dueDate: dueDate || undefined,
      });
      setShowCreate(false);
      setTitle(''); setDescription(''); setDueDate(''); setTotalPoints('100');
      await load();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setCreating(false); }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await assignmentApi.delete(id); load(); } catch (err: any) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  const handleToggle = async (a: Assignment) => {
    const newStatus = a.status === 'DRAFT' ? 'OPEN' : a.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await assignmentApi.update(a.id, { status: newStatus });
      load();
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  const handleGrade = (a: Assignment) => {
    router.push(`/teacher-grade-assignment?assignmentId=${a.id}`);
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/teacher-profile')} onBack={() => router.back()} />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>📋 Assignments</Text>
            <Button title="+ Create" onPress={() => setShowCreate(!showCreate)} variant="primary" />
          </View>

          {showCreate && courseId && (
            <GlassCard style={{ padding: 16, gap: 12 }}>
              <Input label="Title" placeholder="Assignment title" value={title} onChangeText={setTitle} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white, marginBottom: 8 }}>Description</Text>
                <TextInput style={{ width: '100%', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white, minHeight: 80, textAlignVertical: 'top' }}
                  placeholder="Assignment description..." placeholderTextColor={colors.surfaceVariant} value={description} onChangeText={setDescription} multiline />
              </View>
              <Input label="Total Points" placeholder="100" value={totalPoints} onChangeText={setTotalPoints} keyboardType="number-pad" />
              <Input label="Due Date (ISO, optional)" placeholder="2025-12-31T23:59:00" value={dueDate} onChangeText={setDueDate} />
              <Button title="Create Assignment" onPress={handleCreate} disabled={creating} />
            </GlassCard>
          )}

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></GlassCard>
          ) : assignments.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>No assignments yet.</Text>
            </GlassCard>
          ) : (
            assignments.map((a) => (
              <GlassCard key={a.id} style={{ padding: 14, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>{a.title}</Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12, marginTop: 2 }}>
                      {a.totalPoints} pts {a.dueDate ? `• Due: ${formatDate(a.dueDate)}` : ''}
                    </Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                      Submissions: {a.submissionCount} ({a.gradedCount} graded)
                    </Text>
                  </View>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: `${STATUS_COLORS[a.status] || '#6b7280'}22` }}>
                    <Text style={{ color: STATUS_COLORS[a.status] || '#6b7280', fontSize: 11, fontWeight: '700' }}>{a.status}</Text>
                  </View>
                </View>
                {a.description && <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{a.description}</Text>}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button title={a.status === 'DRAFT' ? 'Open' : a.status === 'OPEN' ? 'Close' : 'Reopen'} variant="secondary" onPress={() => handleToggle(a)} style={{ flex: 1 }} />
                  {a.submissionCount > 0 && <Button title="Grade" variant="secondary" onPress={() => handleGrade(a)} style={{ flex: 0.6 }} />}
                  <Button title="Delete" variant="danger" onPress={() => handleDelete(a.id)} style={{ flex: 0.5 }} />
                </View>
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
