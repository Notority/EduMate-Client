import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { summaryApi } from '../src/services/api';
import { Summary } from '../src/types';
import { colors } from '../src/constants/theme';

const SUMMARY_TYPES = [
  { key: 'SHORT', label: 'Short Summary', icon: '📝', desc: '2-3 paragraph overview' },
  { key: 'DETAILED', label: 'Detailed Summary', icon: '📚', desc: 'Comprehensive with sections' },
  { key: 'CHAPTER', label: 'Chapter Summary', icon: '📖', desc: 'Organized by chapters' },
  { key: 'EXAM', label: 'Exam Study Guide', icon: '🎯', desc: 'Key concepts + practice' },
];

export default function SummariesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId: string; courseTitle?: string }>();
  const courseId = parseInt(params.courseId);
  const courseTitle = params.courseTitle || 'Summaries';
  const logout = useStore((s) => s.logout);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadSummaries = useCallback(async () => {
    try {
      const res = await summaryApi.getByCourse(courseId);
      setSummaries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const handleGenerate = async (type: string) => {
    setGenerating(type);
    try {
      await summaryApi.generate(courseId, type);
      await loadSummaries();
    } catch (err: any) {
      Alert.alert('Generation Failed', err.message);
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await summaryApi.delete(id);
      loadSummaries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onBack={() => router.back()} onProfile={() => router.push('/profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>
            📋 AI Summaries
          </Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 13, marginTop: -8 }}>
            {courseTitle}
          </Text>

          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700', marginTop: 8 }}>
            Generate Summary
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SUMMARY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => handleGenerate(t.key)}
                disabled={generating !== null}
                style={{
                  flex: 1, minWidth: '45%', backgroundColor: 'rgba(115,46,228,0.15)',
                  padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(115,46,228,0.3)',
                  opacity: generating !== null ? 0.5 : 1,
                }}
                activeOpacity={0.7}
              >
                {generating === t.key ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{t.icon}</Text>
                    <Text style={{ color: colors.white, fontWeight: '700', fontSize: 13 }}>{t.label}</Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 11, marginTop: 2 }}>{t.desc}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700', marginTop: 8 }}>
            Saved Summaries ({summaries.length})
          </Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : summaries.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>📄</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>
                No summaries generated yet. Tap a button above to create one!
              </Text>
            </GlassCard>
          ) : (
            summaries.map((s) => {
              const isExpanded = expandedId === s.id;
              const typeInfo = SUMMARY_TYPES.find((t) => t.key === s.type);
              return (
                <TouchableOpacity key={s.id} onPress={() => setExpandedId(isExpanded ? null : s.id)} activeOpacity={0.8}>
                  <GlassCard style={{ padding: 14, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 18 }}>{typeInfo?.icon || '📄'}</Text>
                        <View>
                          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>
                            {typeInfo?.label || s.type}
                          </Text>
                          <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                            {formatDate(s.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(s.id)} style={{ padding: 4 }}>
                        <Text style={{ color: colors.red, fontSize: 12 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    {isExpanded && (
                      <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                        <Text style={{ color: colors.white, fontSize: 13, lineHeight: 20 }}>{s.content}</Text>
                      </View>
                    )}
                    {!isExpanded && (
                      <Text style={{ color: colors.surfaceVariant, fontSize: 12 }} numberOfLines={2}>
                        {s.content}
                      </Text>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
