import { Text } from 'react-native';
import { GlassCard } from './GlassCard';
import { colors } from '../constants/theme';

type Props = {
  subjects?: string;
  experienceYears?: number;
  education?: string;
};

export function TeacherProfilePreview({ subjects, experienceYears, education }: Props) {
  return (
    <GlassCard style={{ padding: 16, gap: 8 }}>
      <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Teacher Profile
      </Text>
      {subjects && (
        <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
          Subjects: {subjects}
        </Text>
      )}
      {experienceYears && (
        <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
          Experience: {experienceYears} years
        </Text>
      )}
      {education && (
        <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
          Education: {education}
        </Text>
      )}
    </GlassCard>
  );
}
