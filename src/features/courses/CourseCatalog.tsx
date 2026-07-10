import { View, Text, ActivityIndicator } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/theme';
import { Button } from '../../ui/Button';
import { Course, Enrollment } from '../../types';

export function CourseCatalog({ loading, courses, enrollments, onEnroll }: { loading: boolean; courses: Course[]; enrollments: Enrollment[]; onEnroll: (courseId: number) => void }) {
  if (loading) return <GlassCard style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></GlassCard>;
  if (!courses.length) return <GlassCard style={{ padding: 24, alignItems: 'center' }}><Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>No courses found for your search.</Text></GlassCard>;
  return courses.map((course) => <GlassCard key={course.id} style={{ padding: 16 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}><View style={{ flex: 1, gap: 4 }}><Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>{course.title}</Text>{course.category && <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255, 77, 166, 0.15)' }}><Text style={{ fontSize: 11, fontWeight: '700', color: colors.secondary }}>{course.category}</Text></View>}<Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{course.teacherName}</Text></View><View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: course.color }} /></View>{course.description && <Text style={{ color: colors.surfaceVariant, fontSize: 14, marginBottom: 12 }}>{course.description}</Text>}<Button title={enrollments.some((item) => item.course.id === course.id) ? 'Already Enrolled' : 'Enroll Now'} onPress={() => onEnroll(course.id)} variant={enrollments.some((item) => item.course.id === course.id) ? 'secondary' : 'primary'} disabled={enrollments.some((item) => item.course.id === course.id)} /></GlassCard>);
}
