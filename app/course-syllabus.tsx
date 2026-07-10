import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Linking, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { studentApi } from '../src/services/api';
import { Resource, MaterialProgress } from '../src/types';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';
import api from '../src/services/api';

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'image/': '🖼️',
  'application/vnd.ms-powerpoint': '📊',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
  'text/': '📃',
};

function getFileIcon(fileType: string): string {
  for (const key of Object.keys(FILE_ICONS)) {
    if (fileType.startsWith(key)) return FILE_ICONS[key];
  }
  return '📁';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupByType(resources: Resource[]): Record<string, Resource[]> {
  const groups: Record<string, Resource[]> = {};
  for (const r of resources) {
    let type = 'Other';
    if (r.fileType.startsWith('application/pdf')) type = 'PDF Documents';
    else if (r.fileType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml')) type = 'Word Documents';
    else if (r.fileType.startsWith('image/')) type = 'Images';
    else if (r.fileType.startsWith('application/vnd.ms-powerpoint') || r.fileType.startsWith('application/vnd.openxmlformats-officedocument.presentationml')) type = 'Presentations';
    else if (r.fileType.startsWith('text/')) type = 'Text Files';
    if (!groups[type]) groups[type] = [];
    groups[type].push(r);
  }
  return groups;
}

export default function CourseSyllabusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId: string; courseTitle: string; teacherName?: string; courseColor?: string }>();
  const courseId = parseInt(params.courseId);
  const courseTitle = params.courseTitle || 'Course Syllabus';
  const teacherName = params.teacherName;
  const courseColor = params.courseColor || colors.primary;
  const logout = useStore((s) => s.logout);
  const [materials, setMaterials] = useState<Resource[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matsRes, progRes] = await Promise.all([
        studentApi.getCourseMaterials(courseId),
        studentApi.getMaterialProgress(courseId),
      ]);
      setMaterials(matsRes.data);
      const map: Record<number, boolean> = {};
      for (const p of progRes.data as MaterialProgress[]) {
        map[p.resourceId] = p.completed;
      }
      setProgressMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  const handleDownload = (url: string) => {
    Linking.openURL(url);
  };

  const handleDone = async (resourceId: number) => {
    if (toggling.has(resourceId)) return;
    setToggling((prev) => new Set(prev).add(resourceId));
    try {
      const userData = useStore.getState().user;
      let token = (userData.accessToken || '').trim();
      if (!token) {
        Alert.alert('Not logged in', 'Please log in again.');
        return;
      }
      const baseUrl = api.defaults.baseURL;
      const toggleUrl = `${baseUrl}/students/do-toggle?resourceId=${resourceId}&courseId=${courseId}`;
      const res = await fetch(toggleUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || '(empty)'}`);
      }
      const data = await res.json();
      const { completed } = data;
      setProgressMap((prev) => ({ ...prev, [resourceId]: completed }));
      if (completed) {
        await useStore.getState().refreshProfile();
        const nDone = Object.values({ ...progressMap, [resourceId]: true }).filter(Boolean).length;
        if (nDone === materials.length) {
          Alert.alert('Syllabus Complete!', 'You earned +50 XP for completing all materials!');
        }
      }
    } catch (err: any) {
      console.error('Toggle failed', err.message);
      Alert.alert('Toggle Failed', err.message);
    } finally {
      setToggling((prev) => { const next = new Set(prev); next.delete(resourceId); return next; });
    }
  };

  const completedCount = Object.values(progressMap).filter(Boolean).length;
  const totalCount = materials.length;

  const grouped = groupByType(materials);
  const groupKeys = Object.keys(grouped);

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <View style={{ width: 12, height: 40, borderRadius: 6, backgroundColor: courseColor }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }} numberOfLines={2}>
                {courseTitle}
              </Text>
              {teacherName && (
                <Text style={{ color: colors.surfaceVariant, fontSize: 13, marginTop: 2 }}>
                  Instructor: {teacherName}
                </Text>
              )}
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            <TouchableOpacity
              onPress={() => router.push(`/chat?courseId=${courseId}`)}
              style={{ flexShrink: 0, backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', gap: 2 }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>🤖</Text>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12, textAlign: 'center' }}>Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/assignments?courseId=${courseId}&courseTitle=${encodeURIComponent(courseTitle)}`)}
              style={{ flexShrink: 0, backgroundColor: 'rgba(139,92,246,0.12)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>📋</Text>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12, textAlign: 'center' }}>Assignments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/exams?courseId=${courseId}&courseTitle=${encodeURIComponent(courseTitle)}`)}
              style={{ flexShrink: 0, backgroundColor: 'rgba(6,182,212,0.12)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>📝</Text>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12, textAlign: 'center' }}>Exams</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/quizzes?courseId=${courseId}&courseTitle=${encodeURIComponent(courseTitle)}`)}
              style={{ flexShrink: 0, backgroundColor: 'rgba(255,200,50,0.12)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: 'rgba(255,200,50,0.25)' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>🧠</Text>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12, textAlign: 'center' }}>Quizzes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/summaries?courseId=${courseId}&courseTitle=${encodeURIComponent(courseTitle)}`)}
              style={{ flexShrink: 0, backgroundColor: 'rgba(255,77,166,0.15)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: 'rgba(255,77,166,0.3)' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>📋</Text>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12, textAlign: 'center' }}>Summaries</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/live-sessions?courseId=${courseId}&courseTitle=${encodeURIComponent(courseTitle)}`)}
              style={{ flexShrink: 0, backgroundColor: 'rgba(34,197,94,0.15)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>🎥</Text>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12, textAlign: 'center' }}>Live Sessions</Text>
            </TouchableOpacity>
          </View>

          {totalCount > 0 && (
            <GlassCard style={{ padding: 12, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.surfaceVariant, fontSize: 12, fontWeight: '600' }}>
                  Course Progress
                </Text>
                <Text style={{ color: colors.tertiary, fontSize: 12, fontWeight: '700' }}>
                  {completedCount}/{totalCount}
                </Text>
              </View>
              <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                <View
                  style={{
                    height: '100%',
                    width: `${(completedCount / totalCount) * 100}%`,
                    backgroundColor: colors.emerald,
                    borderRadius: 4,
                  }}
                />
              </View>
            </GlassCard>
          )}

          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginTop: 8 }}>
            📚 Course Materials
          </Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 12, marginTop: -8 }}>
            {materials.length} file{materials.length !== 1 ? 's' : ''} available
          </Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : materials.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>📂</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>
                No materials have been uploaded for this course yet.
              </Text>
            </GlassCard>
          ) : (
            groupKeys.map((group) => (
              <View key={group} style={{ gap: 6 }}>
                <Text style={{ color: colors.surfaceVariant, fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                  {group} ({grouped[group].length})
                </Text>
                {grouped[group].map((r) => {
                  const isCompleted = progressMap[r.id] ?? false;
                  const isLoading = toggling.has(r.id);
                  return (
                    <GlassCard key={r.id} style={{ padding: 12, gap: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={{ fontSize: 28 }}>{getFileIcon(r.fileType)}</Text>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }} numberOfLines={2}>
                            {r.fileName}
                          </Text>
                          <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                            {formatSize(r.fileSize)} • {formatDate(r.uploadedAt)}
                          </Text>
                        </View>
                        {isCompleted ? (
                          <View style={{ backgroundColor: 'rgba(110,231,183,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ color: colors.emerald, fontSize: 12, fontWeight: '700' }}>Done ✓</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleDone(r.id)}
                            disabled={isLoading}
                            style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, opacity: isLoading ? 0.5 : 1 }}
                          >
                            {isLoading ? (
                              <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                              <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>Done</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                      <Button
                        title="Download"
                        variant="secondary"
                        onPress={() => handleDownload(r.url)}
                        style={{ marginTop: 4 }}
                      />
                    </GlassCard>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
