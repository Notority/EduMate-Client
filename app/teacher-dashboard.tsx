import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { WelcomeBanner } from '../src/components/WelcomeBanner';
import { StatBadge, StatBadgeRow } from '../src/components/StatBadge';
import { GlassCard } from '../src/components/GlassCard';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';
import { Button } from '../src/ui/Button';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const getTeacherVerification = useStore((s) => s.getTeacherVerification);
  
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<{ status: VerificationStatus; documentUrl?: string; notes?: string } | null>(null);

  const fetchVerification = async () => {
    try {
      const data = await getTeacherVerification();
      setVerification(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleVerification = () => {
    router.push('/teacher-verification');
  };

  const getStatusColor = (status: VerificationStatus) => {
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
          <WelcomeBanner userName={`${user.firstName} ${user.lastName}`} />
          
          <StatBadgeRow>
            <StatBadge icon="👥" label="Students" value="0" accent={colors.primary} />
            <StatBadge icon="📚" label="Courses" value="0" accent={colors.secondary} />
            <StatBadge icon="⭐" label="Rating" value="-" accent={colors.tertiary} />
          </StatBadgeRow>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : (
            <GlassCard style={{ padding: 16, gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
                  Verification Status
                </Text>
                {verification?.status && (
                  <View style={{
                    backgroundColor: `${getStatusColor(verification.status)}20`,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20
                  }}>
                    <Text style={{
                      color: getStatusColor(verification.status),
                      fontSize: 12,
                      fontWeight: '700'
                    }}>
                      {verification.status}
                    </Text>
                  </View>
                )}
              </View>
              {verification?.status === 'APPROVED' ? (
                <Text style={{ color: colors.emerald, fontSize: 14, fontWeight: '600' }}>
                  ✓ You're verified! You can start teaching now!
                </Text>
              ) : (
                <>
                  <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                    {verification?.status === 'REJECTED' 
                      ? `Verification rejected: ${verification.notes || 'Please resubmit your documents.'}`
                      : 'Complete your verification to start teaching!'}
                  </Text>
                  <Button title="Go to Verification" onPress={handleVerification} />
                </>
              )}
            </GlassCard>
          )}

          <GlassCard style={{ padding: 16, gap: 8 }}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title="Edit Profile" onPress={handleProfile} style={{ flex: 1 }} />
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
