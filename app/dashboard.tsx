import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { WelcomeBanner } from '../src/components/WelcomeBanner';
import { StatBadge, StatBadgeRow } from '../src/components/StatBadge';
import { GlassCard } from '../src/components/GlassCard';
import { ConfigPanel } from '../src/components/ConfigPanel';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';

export default function DashboardScreen() {
  const r = useRouter();
  const user = useStore((s) => s.user);
  const enrollments = useStore((s) => s.enrollments);
  const learningProgress = useStore((s) => s.learningProgress);
  const getEnrollments = useStore((s) => s.getEnrollments);
  const getLearningProgress = useStore((s) => s.getLearningProgress);
  const logout = useStore((s) => s.logout);
  const [sc, setSc] = useState(false);
  const [loading, setLoading] = useState(true);

  // Redirect based on role
  useEffect(() => {
    if (user.role === 'TEACHER') {
      r.replace('/teacher-dashboard');
    }
  }, [user.role]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([getEnrollments(), getLearningProgress()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user.role === 'TEACHER') {
    return null;
  }

  const handleLogout = () => {
    logout();
    r.replace('/login');
  };

  const handleProfile = () => {
    r.push('/profile');
  };

  return (
    <PhoneFrame>
      {sc && <ConfigPanel onClose={() => setSc(false)} />}
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onConfig={() => setSc(true)} onProfile={handleProfile} />
        <View style={{ padding: 16, gap: 12 }}>
          <WelcomeBanner userName={`${user.firstName} ${user.lastName}`} />
          
          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : (
            <>
              <StatBadgeRow>
                <StatBadge 
                  icon="📚" 
                  label="COURSES" 
                  value={`${learningProgress?.totalCoursesEnrolled || 0}`} 
                  accent={colors.primary} 
                />
                <StatBadge 
                  icon="📝" 
                  label="QUIZZES" 
                  value={`${learningProgress?.totalQuizzesCompleted || 0}`} 
                  accent={colors.secondary} 
                />
              </StatBadgeRow>
              
              {learningProgress && (
                <GlassCard style={{ padding: 16, gap: 12 }}>
                  <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
                    Learning Progress Overview
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Average Score</Text>
                      <Text style={{ color: colors.tertiary, fontSize: 20, fontWeight: '700' }}>
                        {learningProgress.averageScore.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Modules Completed</Text>
                      <Text style={{ color: colors.emerald, fontSize: 20, fontWeight: '700' }}>
                        {learningProgress.totalModulesCompleted}/{learningProgress.totalModulesAvailable}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              )}
              
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>📚 My Courses</Text>
                  <TouchableOpacity onPress={() => r.push('/courses')}>
                    <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '600' }}>Browse All</Text>
                  </TouchableOpacity>
                </View>
                {enrollments.length > 0 ? (
                  enrollments.map((e) => (
                    <GlassCard key={e.id} style={{ padding: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
                            {e.course.title}
                          </Text>
                          <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>
                            {e.course.teacherName}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ color: e.course.color, fontSize: 16, fontWeight: '700' }}>
                            {Math.round((e.modulesCompleted / e.totalModules) * 100)}%
                          </Text>
                        </View>
                      </View>
                      <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, marginTop: 8 }}>
                        <View 
                          style={{ 
                            height: '100%', 
                            width: `${(e.modulesCompleted / e.totalModules) * 100}%`, 
                            backgroundColor: e.course.color, 
                            borderRadius: 4 
                          }} 
                        />
                      </View>
                    </GlassCard>
                  ))
                ) : (
                  <GlassCard style={{ padding: 16 }}>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12, fontStyle: 'italic' }}>
                      No courses enrolled yet. Browse all courses to get started!
                    </Text>
                  </GlassCard>
                )}
              </View>
              
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>📝 Quiz History</Text>
                  <TouchableOpacity onPress={() => r.push('/quiz-history')}>
                    <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '600' }}>View All</Text>
                  </TouchableOpacity>
                </View>
                <Button title="Browse Courses" onPress={() => r.push('/courses')} variant="primary" />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
