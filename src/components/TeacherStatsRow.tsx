import { View } from 'react-native';
import { StatBadge, StatBadgeRow } from './StatBadge';
import { colors } from '../constants/theme';

type Props = {
  totalStudents: number;
  totalCourses: number;
  averageRating?: number;
};

export function TeacherStatsRow({ totalStudents, totalCourses, averageRating }: Props) {
  return (
    <StatBadgeRow>
      <StatBadge
        icon="👥"
        label="Students"
        value={totalStudents?.toString() || "0"}
        accent={colors.primary}
      />
      <StatBadge
        icon="📚"
        label="Courses"
        value={totalCourses?.toString() || "0"}
        accent={colors.secondary}
      />
      <StatBadge
        icon="⭐"
        label="Rating"
        value={averageRating?.toFixed(1) || "-"}
        accent={colors.tertiary}
      />
    </StatBadgeRow>
  );
}
