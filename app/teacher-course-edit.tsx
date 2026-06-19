import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';
import { Input } from '../src/ui/Input';

const COURSE_CATEGORIES = ['Computer Science', 'Security', 'Data Science', 'Business', 'Design', 'Other'];

export default function TeacherCourseEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const user = useStore((s) => s.user);
  const myCourses = useStore((s) => s.myCourses);
  const createCourse = useStore((s) => s.createCourse);
  const updateCourse = useStore((s) => s.updateCourse);
  const logout = useStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#732ee4');
  const [category, setCategory] = useState('');
  const [totalModules, setTotalModules] = useState('10');

  const isEditing = !!params.id;

  useEffect(() => {
    if (isEditing && params.id && myCourses.length > 0) {
      const course = myCourses.find(c => c.id === parseInt(params.id));
      if (course) {
        setTitle(course.title);
        setDescription(course.description || '');
        setColor(course.color);
        setCategory(course.category || '');
        setTotalModules(course.totalModules.toString());
      }
    }
  }, [params.id, myCourses]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return;
    }
    setLoading(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        color,
        category: category || null,
        totalModules: parseInt(totalModules) || 10
      };
      if (isEditing && params.id) {
        await updateCourse(parseInt(params.id), data);
      } else {
        await createCourse(data);
      }
      Alert.alert('Success', isEditing ? 'Course updated!' : 'Course created!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/teacher-profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.white }}>
            {isEditing ? 'Edit Course' : 'Create Course'}
          </Text>

          <GlassCard style={{ padding: 16, gap: 12 }}>
            <Input
              label="Course Title"
              placeholder="Enter course title"
              value={title}
              onChangeText={setTitle}
            />
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white, marginBottom: 8 }}>
                Description
              </Text>
              <TextInput
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: colors.white,
                  minHeight: 100,
                  textAlignVertical: 'top'
                }}
                placeholder="Enter course description"
                placeholderTextColor={colors.surfaceVariant}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white, marginBottom: 8 }}>
                Course Color
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['#732ee4', '#ff4da6', '#ffba27', '#4ade80', '#06b6d4', '#f43f5e'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: c,
                      borderWidth: color === c ? 3 : 1,
                      borderColor: color === c ? colors.white : 'rgba(255,255,255,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {color === c && <Text style={{ fontSize: 20 }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white, marginBottom: 8 }}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setCategory('')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: !category ? colors.primary : 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: !category ? colors.primary : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <Text style={{ color: !category ? colors.white : colors.surfaceVariant, fontWeight: '600' }}>
                    None
                  </Text>
                </TouchableOpacity>
                {COURSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: category === cat ? colors.primary : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: category === cat ? colors.primary : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <Text style={{ color: category === cat ? colors.white : colors.surfaceVariant, fontWeight: '600' }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Input
              label="Total Modules"
              placeholder="10"
              value={totalModules}
              onChangeText={setTotalModules}
              keyboardType="number-pad"
            />
          </GlassCard>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => router.back()}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button
              title={isEditing ? 'Update Course' : 'Create Course'}
              onPress={handleSave}
              disabled={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
