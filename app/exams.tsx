import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { examApi } from '../src/services/api';
import { Exam, ExamSubmission } from '../src/types';
import { colors } from '../src/constants/theme';

export default function ExamsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId: string; courseTitle?: string }>();
  const courseId = parseInt(params.courseId);
  const courseTitle = params.courseTitle || 'Exams';
  const logout = useStore((s) => s.logout);
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, ExamSubmission>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [examsRes, subsRes] = await Promise.all([
        examApi.getAvailable(courseId),
        examApi.getMySubmissions(),
      ]);
      setExams(examsRes.data);
      const subMap: Record<number, ExamSubmission> = {};
      for (const s of subsRes.data as ExamSubmission[]) {
        subMap[s.examId] = s;
      }
      setSubmissions(subMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  const handleStart = async (exam: Exam) => {
    if (submissions[exam.id]) {
      const sub = submissions[exam.id];
      if (sub.status === 'IN_PROGRESS') {
        router.push(`/exam/${exam.id}`);
        return;
      }
      Alert.alert('Already Submitted', `You scored ${sub.score}/${exam.totalPoints}`);
      return;
    }
    try {
      await examApi.start(exam.id);
      router.push(`/exam/${exam.id}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return 'No date set';
    return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onBack={() => router.back()} onProfile={() => router.push('/profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>📝 Exams</Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 13, marginTop: -8 }}>{courseTitle}</Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></GlassCard>
          ) : exams.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>📝</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>No exams available for this course yet.</Text>
            </GlassCard>
          ) : (
            exams.map((exam) => {
              const sub = submissions[exam.id];
              const isSubmitted = sub?.status === 'SUBMITTED' || sub?.status === 'GRADED';
              return (
                <GlassCard key={exam.id} style={{ padding: 14, gap: 8 }}>
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>{exam.title}</Text>
                  {exam.instructions && <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{exam.instructions}</Text>}
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>⏱ {exam.duration} min</Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>❓ {exam.questionCount} questions</Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>🎯 {exam.totalPoints} pts</Text>
                  </View>
                  {exam.scheduledAt && (
                    <Text style={{ color: colors.tertiary, fontSize: 11 }}>Scheduled: {formatDate(exam.scheduledAt)}</Text>
                  )}
                  {sub && (
                    <Text style={{ color: isSubmitted ? colors.emerald : '#facc15', fontSize: 12, fontWeight: '600' }}>
                      {isSubmitted ? `✓ Submitted — Score: ${sub.score}/${exam.totalPoints}` : '⏳ In Progress'}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => handleStart(exam)}
                    style={{ backgroundColor: isSubmitted ? 'rgba(110,231,183,0.15)' : colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: colors.white, fontWeight: '700', fontSize: 13 }}>
                      {isSubmitted ? 'View Results' : sub?.status === 'IN_PROGRESS' ? 'Continue' : 'Start Exam'}
                    </Text>
                  </TouchableOpacity>
                </GlassCard>
              );
            })
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
