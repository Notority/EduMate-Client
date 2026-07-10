import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { StatBadge, StatBadgeRow } from '../../components/StatBadge';
import { colors } from '../../constants/theme';
import { LearningProgress } from '../../types';

function CountUp({ to, color, suffix = '' }: { to: number; color: string; suffix?: string }) {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState('0');

  useEffect(() => {
    animated.setValue(0);
    Animated.timing(animated, {
      toValue: to,
      duration: 800,
      useNativeDriver: false,
    }).start();

    const id = animated.addListener(({ value }) => {
      setDisplay(Math.round(value).toString());
    });
    return () => animated.removeListener(id);
  }, [to, animated]);

  return <Text style={{ color, fontSize: 20, fontWeight: '700' }}>{display}{suffix}</Text>;
}

export function DashboardStats({ progress }: { progress: LearningProgress | null }) {
  return (
    <>
      <StatBadgeRow>
        <StatBadge icon="📚" label="COURSES" value={`${progress?.totalCoursesEnrolled || 0}`} accent={colors.primary} />
        <StatBadge icon="📝" label="QUIZZES" value={`${progress?.totalQuizzesCompleted || 0}`} accent={colors.secondary} />
      </StatBadgeRow>
      {progress && (
        <GlassCard style={{ padding: 16, gap: 12 }} delay={100}>
          <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>Learning Progress Overview</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Average Score</Text>
              <CountUp to={progress.averageScore} color={colors.tertiary} suffix="%" />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Modules Completed</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <CountUp to={progress.totalModulesCompleted} color={colors.emerald} />
                <Text style={{ color: colors.emerald, fontSize: 20, fontWeight: '700' }}>/{progress.totalModulesAvailable}</Text>
              </View>
            </View>
          </View>
        </GlassCard>
      )}
    </>
  );
}
