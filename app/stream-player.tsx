import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { colors } from '../src/constants/theme';

export default function StreamPlayerScreen() {
  const router = useRouter();
  const { playbackUrl, title } = useLocalSearchParams<{ playbackUrl: string; title?: string }>();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ paddingTop: 50, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ color: colors.white, fontSize: 18 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700', flex: 1 }} numberOfLines={1}>
          {title || 'Live Stream'}
        </Text>
      </View>

      <Video
        ref={videoRef}
        source={{ uri: playbackUrl }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onPlaybackStatusUpdate={setStatus}
        style={{ flex: 1 }}
      />

      {status?.error && (
        <View style={{ position: 'absolute', bottom: 100, left: 16, right: 16, padding: 12, backgroundColor: 'rgba(255,0,0,0.8)', borderRadius: 8 }}>
          <Text style={{ color: colors.white, fontSize: 13, textAlign: 'center' }}>
            Stream unavailable. The broadcast may not have started yet.
          </Text>
        </View>
      )}
    </View>
  );
}
