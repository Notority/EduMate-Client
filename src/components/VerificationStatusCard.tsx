import { View, Text, ActivityIndicator } from 'react-native';
import { GlassCard } from './GlassCard';
import { Button } from '../ui/Button';
import { colors } from '../constants/theme';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;
type Props = {
  loading: boolean;
  verification: { status: VerificationStatus; documentUrl?: string; notes?: string } | null;
  onGoToVerification: () => void;
};

export function VerificationStatusCard({ loading, verification, onGoToVerification }: Props) {
  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'APPROVED': return colors.emerald;
      case 'REJECTED': return colors.red;
      default: return colors.tertiary;
    }
  };

  if (loading) {
    return (
      <GlassCard style={{ padding: 24, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </GlassCard>
    );
  }

  return (
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
          <Button title="Go to Verification" onPress={onGoToVerification} />
        </>
      )}
    </GlassCard>
  );
}
