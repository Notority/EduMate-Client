import { View, Text, TouchableOpacity } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/theme';
import { Button } from '../../ui/Button';
import { Enrollment } from '../../types';
import { useFadeIn } from '../../hooks/useFadeIn';

export function EnrollmentList({ enrollments, onBrowse, onOpen, onAskAi, onQuizzes, onSummaries, onLeave }: {
  enrollments: Enrollment[]; onBrowse: () => void; onOpen: (enrollment: Enrollment) => void; onAskAi: (courseId: number) => void; onQuizzes: (enrollment: Enrollment) => void; onSummaries: (enrollment: Enrollment) => void; onLeave: (courseId: number) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>📚 My Courses</Text>
        <TouchableOpacity onPress={onBrowse}>
          <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '600' }}>Browse All</Text>
        </TouchableOpacity>
      </View>
      {enrollments.length ? enrollments.map((item, i) => (
        <EnrollmentCard key={item.id} enrollment={item} index={i} onOpen={onOpen} onAskAi={onAskAi} onQuizzes={onQuizzes} onSummaries={onSummaries} onLeave={onLeave} />
      )) : (
        <GlassCard style={{ padding: 16 }}>
          <Text style={{ color: colors.surfaceVariant, fontSize: 12, fontStyle: 'italic' }}>No courses enrolled yet. Browse all courses to get started!</Text>
        </GlassCard>
      )}
    </View>
  );
}

function EnrollmentCard({ enrollment, index, onOpen, onAskAi, onQuizzes, onSummaries, onLeave }: any) {
  const { opacity, translateY } = useFadeIn(100 + index * 80, 400);
  const progress = enrollment.totalMaterials > 0 ? Math.round((enrollment.materialsCompleted / enrollment.totalMaterials) * 100) : 0;

  return (
    <AnimatedCard opacity={opacity} translateY={translateY}>
      <GlassCard style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>{enrollment.course.title}</Text>
            <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{enrollment.course.teacherName}</Text>
          </View>
          <Text style={{ color: enrollment.course.color, fontSize: 16, fontWeight: '700' }}>{progress}%</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>Materials</Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>{enrollment.materialsCompleted}/{enrollment.totalMaterials}</Text>
        </View>
        <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, marginTop: 4 }}>
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: enrollment.course.color, borderRadius: 4 }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          <Button title="View Syllabus" variant="primary" onPress={() => onOpen(enrollment)} style={{ flexGrow: 1 }} />
          <Button title="Ask AI" variant="secondary" onPress={() => onAskAi(enrollment.course.id)} />
          <Button title="Quizzes" variant="secondary" onPress={() => onQuizzes(enrollment)} />
          <Button title="Summaries" variant="secondary" onPress={() => onSummaries(enrollment)} />
          <Button title="Leave" variant="danger" onPress={() => onLeave(enrollment.course.id)} />
        </View>
      </GlassCard>
    </AnimatedCard>
  );
}

import { Animated } from 'react-native';

function AnimatedCard({ children, opacity, translateY }: { children: React.ReactNode; opacity: Animated.Value; translateY: Animated.Value }) {
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
