import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../../src/layout/PhoneFrame';
import { DashboardHeader } from '../../src/components/DashboardHeader';
import { GlassCard } from '../../src/components/GlassCard';
import { useStore } from '../../src/store/useStore';
import { chatApi } from '../../src/services/api';
import { ChatMessage } from '../../src/types';
import { colors } from '../../src/constants/theme';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = parseInt(id);
  const logout = useStore((s) => s.logout);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(sessionId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    const tempUser: ChatMessage = { id: Date.now(), sessionId, role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUser]);
    try {
      const res = await chatApi.sendMessage(sessionId, text);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => { logout(); router.replace('/login'); };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start', marginVertical: 4 }}>
        <GlassCard style={{ maxWidth: '80%', padding: 12, backgroundColor: isUser ? 'rgba(115,46,228,0.2)' : 'rgba(255,255,255,0.04)' }}>
          <Text style={{ color: colors.white, fontSize: 14, lineHeight: 20 }}>{item.content}</Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 10, marginTop: 4, textAlign: 'right' }}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </GlassCard>
      </View>
    );
  };

  return (
    <PhoneFrame>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <DashboardHeader onLogout={handleLogout} onBack={() => router.back()} onProfile={() => router.push('/profile')} />
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            style={{ flex: 1, backgroundColor: '#0d0714' }}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 8 }}>
                <Text style={{ fontSize: 40 }}>🤖</Text>
                <Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>
                  Ask a question about your course materials to get started.
                </Text>
              </View>
            }
          />
        )}
        <View style={{ flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#0d0714', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
          <TextInput
            style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12,
              paddingHorizontal: 16, paddingVertical: 12, color: colors.white,
              fontSize: 14, fontFamily: 'Fredoka',
            }}
            placeholder="Ask a question..."
            placeholderTextColor={colors.surfaceVariant}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={handleSend}
            blurOnSubmit
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || sending}
            style={{
              backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 20,
              justifyContent: 'center', opacity: !input.trim() || sending ? 0.5 : 1,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </PhoneFrame>
  );
}
