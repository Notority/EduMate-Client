import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { WebView } from 'react-native-webview';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';

export default function JitsiMeetScreen() {
  const router = useRouter();
  const { url, displayName } = useLocalSearchParams<{ url: string; displayName?: string }>();
  const [loading, setLoading] = useState(true);

  const jitsiUrl = url + (url?.includes('?') ? '&' : '?') + '#config.disableDeepLinking=true';

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0714' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1a1a2e' }}>
        <Button title="Leave" variant="danger" onPress={() => router.back()} />
        <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700', marginLeft: 12, flex: 1 }} numberOfLines={1}>
          Live Session
        </Text>
      </View>
      {loading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0714', zIndex: 10 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.surfaceVariant, marginTop: 8 }}>Connecting to meeting...</Text>
        </View>
      )}
      <WebView
        source={{ uri: jitsiUrl }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}
