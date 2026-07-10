import { View, Text } from 'react-native';
import { colors } from '../../constants/theme';

export function AssignmentsHeader({ courseTitle }: { courseTitle: string }) {
  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>📋 Assignments</Text>
      <Text style={{ color: colors.surfaceVariant, fontSize: 13, marginTop: -8 }}>{courseTitle}</Text>
    </View>
  );
}
