import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

export default function TeacherCoursesScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const myCourses = useStore((s) => s.myCourses);
  const getMyCourses = useStore((s) => s.getMyCourses);
  const getTeacherVerification = useStore((s) => s.getTeacherVerification);
  const togglePublishCourse = useStore((s) => s.togglePublishCourse);
  const deleteCourse = useStore((s) => s.deleteCourse);
  const logout = useStore((s) => s.logout);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<{ status: VerificationStatus } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vData] = await Promise.all([
        getTeacherVerification(),
        getMyCourses(),
      ]);
      setVerification(vData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isVerified = verification?.status === 'APPROVED';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handlePublish = async (id: number) => {
    try {
      await togglePublishCourse(id);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourse(id);
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/teacher-profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.white }}>My Courses</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Button
                title="Private"
                variant="ghost"
                onPress={() => router.push('/teacher-private-courses')}
              />
              <Button
                title="Create"
                onPress={() => router.push('/teacher-course-edit')}
                disabled={!isVerified}
              />
            </View>
          </View>

          {!isVerified && !loading && (
            <GlassCard style={{ padding: 12, gap: 4, borderColor: 'rgba(250,204,21,0.3)' }}>
              <Text style={{ color: '#facc15', fontSize: 13, fontWeight: '700' }}>
                ⚠️ Verification Required
              </Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>
                You must be verified before you can create courses.{' '}
                <Text
                  style={{ color: colors.secondary, fontWeight: '700' }}
                  onPress={() => router.push('/teacher-verification')}
                >
                  Go to Verification
                </Text>
              </Text>
            </GlassCard>
          )}

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : myCourses.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                {isVerified
                  ? 'No courses yet. Create your first course!'
                  : 'No courses yet. Get verified to start creating courses.'}
              </Text>
            </GlassCard>
          ) : (
            myCourses.map((course) => (
              <GlassCard key={course.id} style={{ padding: 16, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: course.color }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
                        {course.title}
                      </Text>
                      {course.category && (
                        <Text style={{ color: colors.surfaceVariant, fontSize: 12, marginTop: 2 }}>
                          {course.category}
                        </Text>
                      )}
                    </View>
                    <View style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: course.published ? 'rgba(34, 197, 94, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: course.published ? '#4ade80' : '#facc15',
                      }}>
                        {course.published ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                  </View>
                </View>
                {course.description && (
                  <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                    {course.description}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  <Button
                    title="Edit"
                    variant="secondary"
                    onPress={() => router.push({
                      pathname: '/teacher-course-edit',
                      params: { id: course.id }
                    })}
                    style={{ flexShrink: 0 }}
                  />
                  <Button
                    title="Assignments"
                    variant="secondary"
                    onPress={() => router.push({
                      pathname: '/teacher-assignments',
                      params: { courseId: course.id }
                    })}
                    style={{ flexShrink: 0 }}
                  />
                  <Button
                    title="Exams"
                    variant="secondary"
                    onPress={() => router.push({
                      pathname: '/teacher-exams',
                      params: { courseId: course.id }
                    })}
                    style={{ flexShrink: 0 }}
                  />
                  <Button
                    title="Resources"
                    variant="secondary"
                    onPress={() => router.push({
                      pathname: '/resources',
                      params: { courseId: course.id, courseTitle: course.title }
                    })}
                    style={{ flexShrink: 0 }}
                  />
                  <Button
                    title="Live Sessions"
                    variant="secondary"
                    onPress={() => router.push({
                      pathname: '/teacher-live-sessions',
                      params: { courseId: course.id }
                    })}
                    style={{ flexShrink: 0 }}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    title={course.published ? 'Unpublish' : 'Publish'}
                    variant="secondary"
                    onPress={() => handlePublish(course.id)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Delete"
                    variant="danger"
                    onPress={() => handleDelete(course.id)}
                    style={{ flex: 1 }}
                  />
                </View>
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
