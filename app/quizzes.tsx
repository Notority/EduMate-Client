import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { quizApi } from '../src/services/api';
import { Quiz, Question } from '../src/types';
import { colors } from '../src/constants/theme';

const QUIZ_TYPES = [
  { key: 'MCQ', label: 'Multiple Choice', icon: '✅', desc: '4-option multiple choice questions' },
  { key: 'TRUE_FALSE', label: 'True / False', icon: '⚡', desc: 'True or false statements' },
  { key: 'SHORT_ANSWER', label: 'Short Answer', icon: '✍️', desc: 'Open-ended short responses' },
];

export default function QuizzesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId: string; courseTitle?: string }>();
  const courseId = parseInt(params.courseId);
  const courseTitle = params.courseTitle || 'Quizzes';
  const logout = useStore((s) => s.logout);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Record<number, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState<Record<number, boolean>>({});

  const loadQuizzes = useCallback(async () => {
    try {
      const res = await quizApi.getByCourse(courseId);
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleGenerate = async (type: string) => {
    setGenerating(type);
    try {
      await quizApi.generate(courseId, type);
      await loadQuizzes();
    } catch (err: any) {
      Alert.alert('Generation Failed', err.message);
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await quizApi.delete(id);
      loadQuizzes();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = async (quizId: number) => {
    if (expandedQuizId === quizId) {
      setExpandedQuizId(null);
      return;
    }
    setExpandedQuizId(quizId);
    if (!questions[quizId]) {
      setLoadingQuestions((prev) => ({ ...prev, [quizId]: true }));
      try {
        const res = await quizApi.getQuestions(quizId);
        setQuestions((prev) => ({ ...prev, [quizId]: res.data }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingQuestions((prev) => ({ ...prev, [quizId]: false }));
      }
    }
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderQuestion = (q: Question, idx: number) => {
    const isMcq = q.options && q.options.length > 0;
    return (
      <View key={q.id} style={{ marginTop: 8, padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
        <Text style={{ color: colors.white, fontSize: 13, fontWeight: '600' }}>
          {idx + 1}. {q.questionText}
        </Text>
        {isMcq && (
          <View style={{ marginTop: 6, gap: 4 }}>
            {q.options.split(',').map((opt, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: opt.trim() === q.correctAnswer ? colors.emerald : colors.surfaceVariant, fontSize: 12 }}>
                  {String.fromCharCode(65 + i)}. {opt.trim()}
                </Text>
                {opt.trim() === q.correctAnswer && (
                  <Text style={{ color: colors.emerald, fontSize: 11 }}>✓</Text>
                )}
              </View>
            ))}
          </View>
        )}
        {q.type === 'TRUE_FALSE' && (
          <View style={{ marginTop: 6, flexDirection: 'row', gap: 8 }}>
            {['True', 'False'].map((opt) => (
              <Text key={opt} style={{
                color: opt === q.correctAnswer ? colors.emerald : colors.surfaceVariant,
                fontSize: 12, fontWeight: opt === q.correctAnswer ? '700' : '400',
              }}>
                {opt} {opt === q.correctAnswer ? '✓' : ''}
              </Text>
            ))}
          </View>
        )}
        {q.type === 'SHORT_ANSWER' && (
          <Text style={{ color: colors.tertiary, fontSize: 12, marginTop: 6 }}>
            Answer: {q.correctAnswer}
          </Text>
        )}
        {q.explanation && (
          <Text style={{ color: colors.surfaceVariant, fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>
            {q.explanation}
          </Text>
        )}
      </View>
    );
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onBack={() => router.back()} onProfile={() => router.push('/profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>
            🧠 AI Quizzes
          </Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 13, marginTop: -8 }}>
            {courseTitle}
          </Text>

          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700', marginTop: 8 }}>
            Generate Quiz
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {QUIZ_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => handleGenerate(t.key)}
                disabled={generating !== null}
                style={{
                  flex: 1, minWidth: '45%', backgroundColor: 'rgba(115,46,228,0.15)',
                  padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(115,46,228,0.3)',
                  opacity: generating !== null ? 0.5 : 1,
                }}
                activeOpacity={0.7}
              >
                {generating === t.key ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{t.icon}</Text>
                    <Text style={{ color: colors.white, fontWeight: '700', fontSize: 13 }}>{t.label}</Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 11, marginTop: 2 }}>{t.desc}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700', marginTop: 8 }}>
            Saved Quizzes ({quizzes.length})
          </Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : quizzes.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>🧠</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>
                No quizzes generated yet. Tap a button above to create one!
              </Text>
            </GlassCard>
          ) : (
            quizzes.map((q) => {
              const isExpanded = expandedQuizId === q.id;
              const typeInfo = QUIZ_TYPES.find((t) => t.key === q.type);
              const qLoading = loadingQuestions[q.id];
              return (
                <TouchableOpacity key={q.id} onPress={() => toggleExpand(q.id)} activeOpacity={0.8}>
                  <GlassCard style={{ padding: 14, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 18 }}>{typeInfo?.icon || '🧠'}</Text>
                        <View>
                          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>
                            {q.title || typeInfo?.label || q.type}
                          </Text>
                          <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                            {q.questionCount} questions • {formatDate(q.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(q.id)} style={{ padding: 4 }}>
                        <Text style={{ color: colors.red, fontSize: 12 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    {isExpanded && (
                      <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                        {qLoading ? (
                          <ActivityIndicator size="small" color={colors.primary} style={{ padding: 12 }} />
                        ) : (
                          questions[q.id]?.map((ques, idx) => renderQuestion(ques, idx))
                        )}
                      </View>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
