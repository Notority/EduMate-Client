import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { examApi } from '../src/services/api';
import { Exam, ExamSubmission, ExamAnswer } from '../src/types';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';

export default function TeacherGradeExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ examId: string }>();
  const examId = parseInt(params.examId);
  const logout = useStore((s) => s.logout);
  const [exam, setExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<ExamSubmission | null>(null);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [loadingA, setLoadingA] = useState(false);
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [teacherNotes, setTeacherNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [examRes, subsRes] = await Promise.all([
        examApi.getById(examId),
        examApi.getExamSubmissions(examId),
      ]);
      setExam(examRes.data);
      setSubmissions(subsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectSubmission = async (sub: ExamSubmission) => {
    setSelectedSub(sub);
    setOverrides({});
    setTeacherNotes(sub.teacherNotes || '');
    setLoadingA(true);
    try {
      const res = await examApi.getSubmissionAnswers(sub.id);
      setAnswers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingA(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedSub) return;
    setSaving(true);
    try {
      const questions = Object.entries(overrides).map(([qId, pts]) => ({
        questionId: parseInt(qId), pointsAwarded: parseInt(pts) || 0,
      }));
      await examApi.gradeSubmission(selectedSub.id, {
        questions: questions.length > 0 ? questions : undefined,
        teacherNotes: teacherNotes.trim() || undefined,
      });
      Alert.alert('Saved', 'Grade updated successfully.');
      const res = await examApi.getExamSubmissions(examId);
      setSubmissions(res.data);
      const updated = res.data.find((s: ExamSubmission) => s.id === selectedSub.id);
      if (updated) setSelectedSub(updated);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await examApi.publishGrades(examId);
      Alert.alert('Published', 'All grades are now visible to students.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.white }}>📊 Grade Review</Text>
              {exam && <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>{exam.title}</Text>}
            </View>
            <Button title="Publish All" variant="primary" onPress={handlePublish} />
          </View>

          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14, marginTop: 4 }}>
            Submissions ({submissions.length})
          </Text>

          {submissions.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>No submissions yet.</Text>
            </GlassCard>
          ) : (
            submissions.map((sub) => (
              <TouchableOpacity key={sub.id} onPress={() => selectSubmission(sub)} activeOpacity={0.8}>
                <GlassCard style={{
                  padding: 12, gap: 4,
                  borderColor: selectedSub?.id === sub.id ? colors.primary : 'transparent',
                  borderWidth: selectedSub?.id === sub.id ? 1 : 0,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
                      {sub.studentName || `Student #${sub.studentId}`}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      {sub.status === 'GRADED' && <Text style={{ color: colors.emerald, fontSize: 11, fontWeight: '700' }}>GRADED</Text>}
                      <Text style={{ color: colors.tertiary, fontWeight: '700', fontSize: 14 }}>
                        {sub.score != null ? `${sub.score}/${exam?.totalPoints || '?'}` : '-'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                    Started: {formatDate(sub.startedAt)} {sub.submittedAt ? `• Submitted: ${formatDate(sub.submittedAt)}` : '• In Progress'}
                  </Text>
                  {sub.isAutoGraded && sub.status !== 'GRADED' && (
                    <Text style={{ color: '#facc15', fontSize: 11 }}>Auto-graded — review and adjust if needed</Text>
                  )}
                </GlassCard>
              </TouchableOpacity>
            ))
          )}

          {selectedSub && (
            <GlassCard style={{ padding: 16, gap: 10 }}>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>
                {selectedSub.studentName || `Student #${selectedSub.studentId}`} — Per-Question Review
              </Text>

              {loadingA ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ padding: 12 }} />
              ) : answers.length === 0 ? (
                <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>No answers found.</Text>
              ) : (
                answers.map((ans, i) => {
                  const isCorrect = ans.correctAnswer?.trim().toLowerCase() === ans.answerText?.trim().toLowerCase();
                  const override = overrides[ans.questionId] != null ? parseInt(overrides[ans.questionId]) : ans.pointsAwarded;
                  return (
                    <View key={ans.id} style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, gap: 4 }}>
                      <Text style={{ color: colors.white, fontSize: 13, fontWeight: '600' }}>
                        {i + 1}. {ans.questionText} ({ans.points}pt)
                      </Text>
                      {ans.options && (
                        <View style={{ gap: 1 }}>
                          {ans.options.split(',').map((opt, j) => {
                            const isUser = opt.trim() === ans.answerText?.trim();
                            const isCorrectOpt = opt.trim() === ans.correctAnswer?.trim();
                            return (
                              <Text key={j} style={{
                                color: isCorrectOpt ? colors.emerald : isUser ? colors.red : colors.surfaceVariant,
                                fontSize: 11, fontWeight: isCorrectOpt || isUser ? '700' : '400',
                              }}>
                                {String.fromCharCode(65 + j)}. {opt.trim()}
                                {isCorrectOpt ? ' ✓' : ''}{isUser && !isCorrectOpt ? ' (user)' : ''}
                              </Text>
                            );
                          })}
                        </View>
                      )}
                      {!ans.options && (
                        <Text style={{ color: isCorrect ? colors.emerald : colors.red, fontSize: 11 }}>
                          Answer: {ans.answerText || '(blank)'}
                        </Text>
                      )}
                      {!isCorrect && ans.correctAnswer && (
                        <Text style={{ color: colors.tertiary, fontSize: 11 }}>Correct: {ans.correctAnswer}</Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Points:</Text>
                        <TextInput
                          style={{ width: 60, padding: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white, textAlign: 'center', fontSize: 13 }}
                          keyboardType="number-pad"
                          value={String(override ?? '')}
                          onChangeText={(text) => setOverrides((prev) => ({ ...prev, [ans.questionId]: text }))}
                        />
                        <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>/ {ans.points}</Text>
                      </View>
                      {ans.feedback && (
                        <Text style={{ color: '#06b6d4', fontSize: 11, marginTop: 2 }}>Feedback: {ans.feedback}</Text>
                      )}
                    </View>
                  );
                })
              )}

              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.white, marginBottom: 4 }}>Teacher Notes</Text>
                <TextInput
                  style={{ width: '100%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white, minHeight: 60, textAlignVertical: 'top' }}
                  placeholder="Optional notes about this submission..."
                  placeholderTextColor={colors.surfaceVariant}
                  value={teacherNotes}
                  onChangeText={setTeacherNotes}
                  multiline
                />
              </View>

              <Button title="Save Grade" onPress={handleSaveGrade} disabled={saving} />
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
