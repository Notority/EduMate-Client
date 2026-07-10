import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../../src/layout/PhoneFrame';
import { DashboardHeader } from '../../src/components/DashboardHeader';
import { GlassCard } from '../../src/components/GlassCard';
import { useStore } from '../../src/store/useStore';
import { chatApi, courseApi } from '../../src/services/api';
import { ChatSession, Course } from '../../src/types';
import { colors } from '../../src/constants/theme';

export default function ChatListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string }>();
  const courseIdParam = params.courseId ? parseInt(params.courseId) : undefined;
  const logout = useStore((s) => s.logout);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [courseMap, setCourseMap] = useState<Record<number, Course>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const autoCreated = useRef(false);

  const loadSessions = useCallback(async () => {
    try {
      const res = await chatApi.getSessions(courseIdParam);
      setSessions(res.data);
      if (courseIdParam && res.data.length === 0 && !autoCreated.current) {
        autoCreated.current = true;
        const created = await chatApi.createSession(courseIdParam);
        router.replace(`/chat/${created.data.id}`);
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseIdParam]);

  useEffect(() => {
    loadSessions();
    loadCourses();
  }, [loadSessions]);

  const loadCourses = async () => {
    try {
      const res = await courseApi.getMyCourses();
      const map: Record<number, Course> = {};
      for (const c of res.data as Course[]) map[c.id] = c;
      setCourseMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  const grouped: Record<string, ChatSession[]> = {};
  for (const s of sessions) {
    const key = courseMap[s.courseId]?.title || `Course #${s.courseId}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  const handleNewChat = async (cId: number) => {
    try {
      const res = await chatApi.createSession(cId);
      const session: ChatSession = res.data;
      router.push(`/chat/${session.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await chatApi.deleteSession(id);
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PhoneFrame>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0d0714' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSessions(); }} />}
      >
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>AI Study Assistant</Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 13, marginTop: -8 }}>
            Ask questions about your course materials
          </Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : Object.keys(grouped).length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>🤖</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>
                No conversations yet. Tap below to start one!
              </Text>
            </GlassCard>
          ) : (
            Object.entries(grouped).map(([courseTitle, courseSessions]) => (
              <View key={courseTitle} style={{ gap: 8 }}>
                <Text style={{ color: colors.surfaceVariant, fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                  {courseTitle} ({courseSessions.length})
                </Text>
                {courseSessions.map((s) => (
                  <TouchableOpacity key={s.id} onPress={() => router.push(`/chat/${s.id}`)}>
                    <GlassCard style={{ padding: 14, gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: colors.white, fontSize: 15, fontWeight: '700', flex: 1 }} numberOfLines={1}>
                          {s.title}
                        </Text>
                        <TouchableOpacity onPress={() => handleDelete(s.id)} style={{ paddingLeft: 8 }}>
                          <Text style={{ color: colors.red, fontSize: 12 }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                        {formatDate(s.updatedAt)}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
          {courseIdParam && !loading && (
            <TouchableOpacity
              onPress={() => handleNewChat(courseIdParam)}
              style={{ backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 }}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 15 }}>+ New Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
