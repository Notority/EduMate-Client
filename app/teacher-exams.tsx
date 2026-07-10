import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { examApi } from '../src/services/api';
import { Exam, ExamQuestion } from '../src/types';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';
import { Input } from '../src/ui/Input';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#facc15', SCHEDULED: '#4ade80', ACTIVE: '#06b6d4', COMPLETED: '#6b7280',
};

export default function TeacherExamsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string }>();
  const courseId = params.courseId ? parseInt(params.courseId) : undefined;
  const logout = useStore((s) => s.logout);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState('60');
  const [totalPoints, setTotalPoints] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [showAddQ, setShowAddQ] = useState(false);
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState('');
  const [qAnswer, setQAnswer] = useState('');
  const [qPoints, setQPoints] = useState('1');
  const [qFeedback, setQFeedback] = useState('');

  const loadExams = useCallback(async () => {
    try {
      const res = await examApi.getTeacherExams(courseId);
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadExams(); }, [loadExams]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  const handleCreate = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Exam title is required'); return; }
    setCreating(true);
    try {
      await examApi.create({
        title: title.trim(), instructions: instructions.trim() || undefined,
        courseId: courseId!, duration: parseInt(duration) || 60,
        totalPoints: parseInt(totalPoints) || 0,
        scheduledAt: scheduledAt || undefined,
      });
      setShowCreate(false);
      setTitle(''); setInstructions(''); setDuration('60'); setTotalPoints(''); setScheduledAt('');
      await loadExams();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Delete Exam', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await examApi.delete(id); loadExams(); } catch (err: any) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  const handleSchedule = async (exam: Exam) => {
    try {
      await examApi.update(exam.id, { status: 'SCHEDULED', scheduledAt: exam.scheduledAt });
      loadExams();
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  const selectExam = async (exam: Exam) => {
    setSelectedExam(exam);
    setShowAddQ(false);
    setLoadingQ(true);
    try {
      const res = await examApi.getQuestions(exam.id);
      setQuestions(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingQ(false); }
  };

  const handleAddQuestion = async () => {
    if (!qText.trim() || !qAnswer.trim()) { Alert.alert('Error', 'Question and answer are required'); return; }
    try {
      await examApi.addQuestion(selectedExam!.id, {
        questionText: qText.trim(), options: qOptions.trim() || undefined,
        correctAnswer: qAnswer.trim(), points: parseInt(qPoints) || 1,
        feedback: qFeedback.trim() || undefined,
      });
      setShowAddQ(false);
      setQText(''); setQOptions(''); setQAnswer(''); setQPoints('1'); setQFeedback('');
      const res = await examApi.getQuestions(selectedExam!.id);
      setQuestions(res.data);
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await examApi.deleteQuestion(selectedExam!.id, questionId);
      const res = await examApi.getQuestions(selectedExam!.id);
      setQuestions(res.data);
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/teacher-profile')} onBack={() => router.back()} />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>📝 Exams</Text>
            <Button title="+ Create" onPress={() => setShowCreate(!showCreate)} variant="primary" />
          </View>

          {showCreate && courseId && (
            <GlassCard style={{ padding: 16, gap: 12 }}>
              <Input label="Title" placeholder="Exam title" value={title} onChangeText={setTitle} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white, marginBottom: 8 }}>Instructions</Text>
                <TextInput style={{ width: '100%', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white, minHeight: 80, textAlignVertical: 'top' }}
                  placeholder="Exam instructions..." placeholderTextColor={colors.surfaceVariant} value={instructions} onChangeText={setInstructions} multiline />
              </View>
              <Input label="Duration (minutes)" placeholder="60" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
              <Input label="Total Points" placeholder="0" value={totalPoints} onChangeText={setTotalPoints} keyboardType="number-pad" />
              <Input label="Schedule (ISO date, optional)" placeholder="2025-12-31T10:00:00" value={scheduledAt} onChangeText={setScheduledAt} />
              <Button title="Create Exam" onPress={handleCreate} disabled={creating} />
            </GlassCard>
          )}

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></GlassCard>
          ) : exams.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>📝</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>No exams yet. Create one to get started!</Text>
            </GlassCard>
          ) : (
            exams.map((exam) => (
              <TouchableOpacity key={exam.id} onPress={() => selectExam(exam)} activeOpacity={0.8}>
                <GlassCard style={{ padding: 14, gap: 6, borderColor: selectedExam?.id === exam.id ? colors.primary : 'transparent', borderWidth: selectedExam?.id === exam.id ? 1 : 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>{exam.title}</Text>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 12, marginTop: 2 }}>
                        {exam.questionCount} questions • {exam.duration} min • {exam.totalPoints} pts
                      </Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: `${STATUS_COLORS[exam.status]}22` }}>
                      <Text style={{ color: STATUS_COLORS[exam.status], fontSize: 11, fontWeight: '700' }}>{exam.status}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    {exam.status === 'DRAFT' && (
                      <Button title="Schedule" variant="secondary" onPress={() => handleSchedule(exam)} style={{ flex: 1 }} />
                    )}
                    {(exam.status === 'SCHEDULED' || exam.status === 'COMPLETED') && (
                      <Button title="Grade" variant="secondary" onPress={() => router.push(`/teacher-grade-exam?examId=${exam.id}`)} style={{ flex: 1 }} />
                    )}
                    {exam.status !== 'COMPLETED' && (
                      <Button title="Publish" variant="secondary" onPress={async () => {
                        try { await examApi.publishGrades(exam.id); loadExams(); Alert.alert('Grades Published', 'Results are now visible to students.'); } catch (err: any) { Alert.alert('Error', err.message); }
                      }} style={{ flex: 0.6 }} />
                    )}
                    <Button title="Delete" variant="danger" onPress={() => handleDelete(exam.id)} style={{ flex: 0.4 }} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          )}

          {selectedExam && (
            <GlassCard style={{ padding: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>Questions</Text>
                <Button title="+ Add" variant="primary" onPress={() => setShowAddQ(!showAddQ)} />
              </View>

              {showAddQ && (
                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.white, marginBottom: 4 }}>Question</Text>
                    <TextInput style={{ width: '100%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white, textAlignVertical: 'top' }}
                      placeholder="Question text" placeholderTextColor={colors.surfaceVariant} value={qText} onChangeText={setQText} multiline />
                  </View>
                  <Input label="Options (comma-separated, for MCQ)" placeholder="opt1,opt2,opt3,opt4" value={qOptions} onChangeText={setQOptions} />
                  <Input label="Correct Answer (use | for multiple answers)" placeholder="OOP|Object-Oriented Programming" value={qAnswer} onChangeText={setQAnswer} />
                  <Input label="Points" placeholder="1" value={qPoints} onChangeText={setQPoints} keyboardType="number-pad" />
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.white, marginBottom: 4 }}>Feedback (shown after grading)</Text>
                    <TextInput style={{ width: '100%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white, textAlignVertical: 'top', minHeight: 60 }}
                      placeholder="Explain the correct answer..." placeholderTextColor={colors.surfaceVariant} value={qFeedback} onChangeText={setQFeedback} multiline />
                  </View>
                  <Button title="Add Question" onPress={handleAddQuestion} />
                </View>
              )}

              {loadingQ ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ padding: 12 }} />
              ) : questions.length === 0 ? (
                <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>No questions yet.</Text>
              ) : (
                questions.map((q, i) => (
                  <View key={q.id} style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.white, fontSize: 13, fontWeight: '600', flex: 1 }}>
                        {i + 1}. {q.questionText} ({q.points}pt)
                      </Text>
                      <TouchableOpacity onPress={() => handleDeleteQuestion(q.id)}><Text style={{ color: colors.red, fontSize: 12 }}>✕</Text></TouchableOpacity>
                    </View>
                    {q.options && <Text style={{ color: colors.surfaceVariant, fontSize: 11, marginTop: 4 }}>Options: {q.options}</Text>}
                    <Text style={{ color: colors.tertiary, fontSize: 11, marginTop: 2 }}>Answer: {q.correctAnswer}</Text>
                  </View>
                ))
              )}
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
