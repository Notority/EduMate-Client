import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../../src/layout/PhoneFrame';
import { GlassCard } from '../../src/components/GlassCard';
import { useStore } from '../../src/store/useStore';
import { examApi } from '../../src/services/api';
import { Exam, ExamQuestion, ExamSubmission } from '../../src/types';
import { colors } from '../../src/constants/theme';

export default function ExamTakingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const examId = parseInt(id);
  const logout = useStore((s) => s.logout);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ answers: Record<number, string>; score: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [examRes, questionsRes, subRes] = await Promise.all([
        examApi.getById(examId),
        examApi.getQuestions(examId),
        examApi.getSubmission(examId).catch(() => null),
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);

      if (subRes?.data) {
        const sub = subRes.data as ExamSubmission;
        setSubmission(sub);
        if (sub.status === 'SUBMITTED' || sub.status === 'GRADED') {
          setSubmitted(true);
          const ansRes = await examApi.getSubmissionAnswers(sub.id);
          const ansMap: Record<number, string> = {};
          for (const a of ansRes.data as any[]) {
            ansMap[a.questionId] = a.answerText;
          }
          setResults({ answers: ansMap, score: sub.score || 0 });
        } else if (sub.remainingSeconds != null) {
          setTimeLeft(sub.remainingSeconds);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (timeLeft != null && timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev == null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, submitted]);

  const handleAutoSubmit = async () => {
    Alert.alert('Time is up!', 'Your exam will be submitted automatically.');
    await doSubmit();
  };

  const doSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answerText: answers[q.id] || '',
      }));
      const res = await examApi.submit(examId, { answers: payload });
      setSubmission(res.data);
      setSubmitted(true);
      setResults({ answers: { ...answers }, score: res.data.score || 0 });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    const unanswered = questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      Alert.alert(
        `${unanswered.length} question(s) unanswered`,
        'Are you sure you want to submit?',
        [
          { text: 'Review', style: 'cancel' },
          { text: 'Submit', style: 'destructive', onPress: doSubmit },
        ]
      );
    } else {
      Alert.alert('Submit Exam', 'Are you sure you want to submit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: doSubmit },
      ]);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  if (loading) {
    return (
      <PhoneFrame>
        <View style={{ flex: 1, backgroundColor: '#0d0714', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </PhoneFrame>
    );
  }

  if (!exam) {
    return (
      <PhoneFrame>
        <View style={{ flex: 1, backgroundColor: '#0d0714', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.white }}>Exam not found</Text>
        </View>
      </PhoneFrame>
    );
  }

  if (submitted && results) {
    return (
      <PhoneFrame>
        <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
          <View style={{ padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>📊 Results</Text>
            <GlassCard style={{ padding: 16, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>{results.score}/{exam.totalPoints}</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>Score</Text>
            </GlassCard>
            {questions.map((q, i) => {
              const userAns = results.answers[q.id] || '(no answer)';
              const correct = q.correctAnswer.trim().toLowerCase() === userAns.trim().toLowerCase();
              const feedbackText = q.feedback;
              return (
                <GlassCard key={q.id} style={{ padding: 12, gap: 6 }}>
                  <Text style={{ color: colors.white, fontWeight: '600', fontSize: 13 }}>
                    {i + 1}. {q.questionText} {correct ? '✓' : '✕'}
                  </Text>
                  {q.options && (
                    <View style={{ gap: 2 }}>
                      {q.options.split(',').map((opt, j) => {
                        const isUser = opt.trim() === userAns.trim();
                        const isCorrect = opt.trim() === q.correctAnswer.trim();
                        return (
                          <Text key={j} style={{
                            color: isCorrect ? colors.emerald : isUser ? colors.red : colors.surfaceVariant,
                            fontSize: 12, fontWeight: isCorrect || isUser ? '700' : '400',
                          }}>
                            {String.fromCharCode(65 + j)}. {opt.trim()}
                            {isCorrect ? ' ✓' : ''}{isUser && !isCorrect ? ' (your answer)' : ''}
                          </Text>
                        );
                      })}
                    </View>
                  )}
                  {!q.options && (
                    <Text style={{ color: correct ? colors.emerald : colors.red, fontSize: 12 }}>
                      Your answer: {userAns}
                    </Text>
                  )}
                  {!correct && (
                    <Text style={{ color: colors.tertiary, fontSize: 11, marginTop: 2 }}>Correct answer: {q.correctAnswer}</Text>
                  )}
                  {feedbackText && (
                    <View style={{ marginTop: 4, padding: 8, backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 6 }}>
                      <Text style={{ color: '#06b6d4', fontSize: 11, fontWeight: '600' }}>Feedback: {feedbackText}</Text>
                    </View>
                  )}
                </GlassCard>
              );
            })}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: colors.white, fontWeight: '700' }}>Back to Exams</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.white, flex: 1 }}>{exam.title}</Text>
            {timeLeft != null && (
              <View style={{ backgroundColor: timeLeft < 120 ? 'rgba(244,63,94,0.15)' : 'rgba(6,182,212,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <Text style={{ color: timeLeft < 120 ? '#f43f5e' : '#06b6d4', fontWeight: '700', fontSize: 16 }}>
                  {formatTime(timeLeft)}
                </Text>
              </View>
            )}
          </View>
          {exam.instructions && (
            <GlassCard style={{ padding: 12 }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{exam.instructions}</Text>
            </GlassCard>
          )}

          {questions.map((q, i) => {
            const options = q.options ? q.options.split(',') : [];
            return (
              <GlassCard key={q.id} style={{ padding: 14, gap: 8 }}>
                <Text style={{ color: colors.white, fontWeight: '600', fontSize: 13 }}>
                  {i + 1}. {q.questionText} ({q.points}pt)
                </Text>
                {options.length > 1 ? (
                  <View style={{ gap: 6 }}>
                    {options.map((opt, j) => {
                      const selected = answers[q.id] === opt.trim();
                      return (
                        <TouchableOpacity
                          key={j}
                          onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.trim() }))}
                          style={{
                            padding: 10, borderRadius: 8, borderWidth: 1,
                            borderColor: selected ? colors.primary : 'rgba(255,255,255,0.08)',
                            backgroundColor: selected ? 'rgba(115,46,228,0.12)' : 'rgba(255,255,255,0.03)',
                          }}
                        >
                          <Text style={{ color: selected ? colors.white : colors.surfaceVariant, fontSize: 13 }}>
                            {String.fromCharCode(65 + j)}. {opt.trim()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={{ width: '100%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white, minHeight: 60, textAlignVertical: 'top' }}
                    placeholder="Type your answer..."
                    placeholderTextColor={colors.surfaceVariant}
                    value={answers[q.id] || ''}
                    onChangeText={(text) => setAnswers((prev) => ({ ...prev, [q.id]: text }))}
                    multiline
                  />
                )}
              </GlassCard>
            );
          })}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{ backgroundColor: colors.emerald, padding: 16, borderRadius: 12, alignItems: 'center', opacity: submitting ? 0.5 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>Submit Exam</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
