import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';

export default function QuizHistoryScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const quizHistory = useStore((s) => s.quizHistory);
  const getQuizHistory = useStore((s) => s.getQuizHistory);
  const logout = useStore((s) => s.logout);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await getQuizHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.emerald;
    if (score >= 60) return colors.tertiary;
    return colors.red;
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '800', 
            color: colors.white,
            marginBottom: 8
          }}>
            Quiz History
          </Text>
          
          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : quizHistory.length > 0 ? (
            quizHistory.map((attempt) => (
              <GlassCard key={attempt.id} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
                      {attempt.quizTitle}
                    </Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12, marginTop: 2 }}>
                      {attempt.courseTitle}
                    </Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 11, marginTop: 4 }}>
                      {formatDate(attempt.attemptedAt)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ 
                      color: getScoreColor(attempt.score), 
                      fontSize: 24, 
                      fontWeight: '800' 
                    }}>
                      {attempt.score}%
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))
          ) : (
            <GlassCard style={{ padding: 16 }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 12, fontStyle: 'italic' }}>
                No quiz attempts yet. Keep learning!
              </Text>
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
