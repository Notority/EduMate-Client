import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { WelcomeBanner } from '../src/components/WelcomeBanner';
import { StatBadge, StatBadgeRow } from '../src/components/StatBadge';
import { CourseItem } from '../src/components/CourseItem';
import { BadgeGrid } from '../src/components/BadgeGrid';
import { AICard } from '../src/components/AICard';
import { ConfigPanel } from '../src/components/ConfigPanel';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';

export default function DashboardScreen() {
  const r = useRouter();
  const user = useStore((s) => s.user);
  const quizzesCompleted = useStore((s) => s.quizzesCompleted);
  const courses = useStore((s) => s.courses);
  const events = useStore((s) => s.events);
  const addXp = useStore((s) => s.addXp);
  const setQuizzesCompleted = useStore((s) => s.setQuizzesCompleted);
  const logout = useStore((s) => s.logout);
  const [os, setOs] = useState(false);
  const [sc, setSc] = useState(false);

  // Redirect based on role
  useEffect(() => {
    if (user.role === 'TEACHER') {
      r.replace('/teacher-dashboard');
    }
  }, [user.role]);

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

  const handleQuest = () => {
    if (!os) {
      setOs(true);
      addXp(150);
      setQuizzesCompleted(quizzesCompleted + 1);
    }
  };

  return (
    <PhoneFrame>
      {sc && <ConfigPanel onClose={() => setSc(false)} />}
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onConfig={() => setSc(true)} onProfile={handleProfile} />
        <View style={{ padding: 16, gap: 12 }}>
          <WelcomeBanner userName={`${user.firstName} ${user.lastName}`} />
          <StatBadgeRow>
            <StatBadge icon="🔥" label="STUDY STREAK" value={`${user.streakDays} Days`} accent={colors.tertiary} />
            <StatBadge icon="📊" label="LEVEL QUEST" value={`XP ${user.xpPoints}/3000`} accent={colors.secondary} />
          </StatBadgeRow>
          <StatBadgeRow>
            <StatBadge icon="📝" label="QUIZZES" value={`${quizzesCompleted} Done`} accent={colors.secondary} />
            <StatBadge icon="🏆" label="RANK" value="Gold III" accent={colors.tertiary} />
          </StatBadgeRow>
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>📚 Continue Learning</Text>
            {courses.length > 0
              ? courses.map((c) => <CourseItem key={c.id} {...c} />)
              : <Text style={{ color: colors.surfaceVariant, fontSize: 12, fontStyle: 'italic' }}>No courses yet. Start learning!</Text>
            }
          </View>
          <AICard onPress={handleQuest} claimed={os} xpReward={150} />
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>📅 Upcoming Events</Text>
            {events.length > 0
              ? <View style={{ flexDirection: 'row', gap: 10 }}>
                  {events.map((e) => (
                    <View key={e.id} style={{ flex: 1, backgroundColor: 'rgba(23,18,33,1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, gap: 4 }}>
                      <View style={{ alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: `${e.tagColor}25` }}>
                        <Text style={{ fontSize: 8, fontWeight: '700', color: e.tagColor }}>{e.tag}</Text>
                      </View>
                      <Text style={{ color: colors.white, fontSize: 11, fontWeight: '700' }}>{e.title}</Text>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 9, fontWeight: '600' }}>{e.time}</Text>
                    </View>
                  ))}
                </View>
              : <Text style={{ color: colors.surfaceVariant, fontSize: 12, fontStyle: 'italic' }}>No upcoming events.</Text>
            }
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>✨ Achievements</Text>
            <BadgeGrid />
          </View>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
