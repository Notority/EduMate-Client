import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { Input } from '../src/ui/Input';
import { Button } from '../src/ui/Button';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';

export default function TeacherVerificationScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const getTeacherVerification = useStore((s) => s.getTeacherVerification);
  const submitTeacherVerification = useStore((s) => s.submitTeacherVerification);
  
  const [documentUrl, setDocumentUrl] = useState('');
  const [verification, setVerification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const loadVerification = async () => {
    setIsFetching(true);
    try {
      const data = await getTeacherVerification();
      setVerification(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVerification();
    }, [])
  );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSubmit = async () => {
    if (!documentUrl) {
      Alert.alert('Error', 'Please enter document URL');
      return;
    }
    setIsLoading(true);
    try {
      await submitTeacherVerification(documentUrl);
      Alert.alert('Success', 'Verification submitted!');
      setDocumentUrl('');
      loadVerification();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit verification');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return colors.emerald;
      case 'REJECTED': return colors.red;
      default: return colors.tertiary;
    }
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={handleProfile} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '800', 
            color: colors.white,
            marginBottom: 8
          }}>
            Teacher Verification
          </Text>

          {isFetching ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : verification && (
            <GlassCard style={{ padding: 16, gap: 12 }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
                  Status
                </Text>
                <View style={{ 
                  backgroundColor: `${getStatusColor(verification.status)}20`,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20
                }}>
                  <Text style={{ 
                    color: getStatusColor(verification.status), 
                    fontSize: 14, 
                    fontWeight: '700' 
                  }}>
                    {verification.status}
                  </Text>
                </View>
              </View>
              {verification.documentUrl && (
                <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                  Document: {verification.documentUrl}
                </Text>
              )}
              {verification.notes && (
                <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                  Notes: {verification.notes}
                </Text>
              )}
            </GlassCard>
          )}

          {(!isFetching && (!verification || verification.status === 'PENDING' || verification.status === 'REJECTED')) && (
            <GlassCard style={{ padding: 16, gap: 12 }}>
              <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
                {verification?.status === 'REJECTED' ? 'Resubmit Verification' : 'Submit Verification'}
              </Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                Upload your ID/Degree document URL for verification
              </Text>
              <Input
                label="Document URL"
                placeholder="https://example.com/document.pdf"
                value={documentUrl}
                onChangeText={setDocumentUrl}
                style={{ marginTop: 8 }}
              />
              <Button
                title={isLoading ? 'Submitting...' : 'Submit Verification'}
                onPress={handleSubmit}
                disabled={isLoading}
              />
            </GlassCard>
          )}

          <Button title="Back to Dashboard" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
