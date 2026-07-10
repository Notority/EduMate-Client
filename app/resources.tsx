import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { resourceApi } from '../src/services/api';
import { Resource } from '../src/types';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';

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

export default function ResourcesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string; courseTitle?: string }>();
  const courseId = params.courseId ? parseInt(params.courseId) : null;
  const courseTitle = params.courseTitle || 'Resources';
  const uploadResource = useStore((s) => s.uploadResource);
  const deleteResource = useStore((s) => s.deleteResource);
  const logout = useStore((s) => s.logout);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const res = courseId
        ? await resourceApi.getByCourse(courseId)
        : await resourceApi.getAll();
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      setUploading(true);

      await uploadResource(file.uri, file.name, file.mimeType || 'application/octet-stream', courseId ?? undefined);
      await loadResources();

      Alert.alert('Success', 'File uploaded successfully!');
    } catch (err: any) {
      if (err.message !== 'Canceled') {
        Alert.alert('Error', err.message || 'Failed to upload file');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: number, fileName: string) => {
    Alert.alert('Delete File', `Delete "${fileName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteResource(id);
            setResources((prev) => prev.filter((r) => r.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleDownload = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => router.push('/teacher-profile')} />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.white }} numberOfLines={1}>
              {courseTitle}
            </Text>
            <Button
              title={uploading ? 'Uploading...' : 'Upload'}
              onPress={handleUpload}
              disabled={uploading}
            />
          </View>

          {uploading && (
            <GlassCard style={{ padding: 16, alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>Uploading file...</Text>
            </GlassCard>
          )}

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : resources.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40 }}>📂</Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>
                {courseId
                  ? 'No resources for this course yet. Tap "Upload" to add PDFs, DOCX files, or images.'
                  : 'No resources yet.'}
              </Text>
            </GlassCard>
          ) : (
            resources.map((r) => (
              <GlassCard key={r.id} style={{ padding: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 32 }}>{getFileIcon(r.fileType)}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.white, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                      {r.fileName}
                    </Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                      {formatSize(r.fileSize)} • {formatDate(r.uploadedAt)}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <Button
                    title="Download"
                    variant="secondary"
                    onPress={() => handleDownload(r.url)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Delete"
                    variant="danger"
                    onPress={() => handleDelete(r.id, r.fileName)}
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
