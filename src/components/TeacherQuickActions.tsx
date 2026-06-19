import { View } from 'react-native';
import { GlassCard } from './GlassCard';
import { Button } from '../ui/Button';
import { Text } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  onEditProfile: () => void;
  onMyCourses: () => void;
};

export function TeacherQuickActions({ onEditProfile, onMyCourses }: Props) {
  return (
    <GlassCard style={{ padding: 16, gap: 8 }}>
      <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
        Quick Actions
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button title="Edit Profile" onPress={onEditProfile} style={{ flex: 1 }} />
        <Button title="My Courses" onPress={onMyCourses} style={{ flex: 1 }} />
      </View>
    </GlassCard>
  );
}
