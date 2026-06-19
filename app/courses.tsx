import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';

export default function CoursesScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const courses = useStore((s) => s.courses);
  const enrollments = useStore((s) => s.enrollments);
  const getAllCourses = useStore((s) => s.getAllCourses);
  const enrollInCourse = useStore((s) => s.enrollInCourse);
  const logout = useStore((s) => s.logout);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await getAllCourses();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollInCourse(courseId);
      Alert.alert('Success', 'Enrolled in course successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const isEnrolled = (courseId: number) => {
    return enrollments.some((e) => e.course.id === courseId);
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
            Course Catalog
          </Text>
          
          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : (
            courses.map((course) => (
              <GlassCard key={course.id} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
                      {course.title}
                    </Text>
                    {course.category && (
                      <View style={{ 
                        alignSelf: 'flex-start',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: 'rgba(255, 77, 166, 0.15)',
                      }}>
                        <Text style={{ 
                          fontSize: 11, 
                          fontWeight: '700', 
                          color: colors.secondary 
                        }}>
                          {course.category}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>
                      {course.teacherName}
                    </Text>
                  </View>
                  <View style={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: 4, 
                    backgroundColor: course.color 
                  }} />
                </View>
                {course.description && (
                  <Text style={{ color: colors.surfaceVariant, fontSize: 14, marginBottom: 12 }}>
                    {course.description}
                  </Text>
                )}
                {isEnrolled(course.id) ? (
                  <Button title="Already Enrolled" variant="secondary" disabled={true} />
                ) : (
                  <Button title="Enroll Now" onPress={() => handleEnroll(course.id)} variant="primary" />
                )}
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
