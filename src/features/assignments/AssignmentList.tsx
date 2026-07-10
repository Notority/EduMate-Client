import { View, Text, ActivityIndicator } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/theme';
import { Button } from '../../ui/Button';
import { Assignment, AssignmentSubmission } from '../../types';
import { formatBytes, formatDate } from './utils';

interface Props {
  assignments: Assignment[];
  submissions: Record<number, AssignmentSubmission>;
  loading: boolean;
  onOpen: (id: number) => void;
}

export function AssignmentList({ assignments, submissions, loading, onOpen }: Props) {
  if (loading) return <GlassCard style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></GlassCard>;
  if (!assignments.length) return <GlassCard style={{ padding: 24, alignItems: 'center', gap: 8 }}><Text style={{ fontSize: 40 }}>📋</Text><Text style={{ color: colors.surfaceVariant, fontSize: 14, textAlign: 'center' }}>No open assignments.</Text></GlassCard>;

  return assignments.map((assignment) => {
    const submission = submissions[assignment.id];
    return (
      <GlassCard key={assignment.id} style={{ padding: 14, gap: 8 }}>
        <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>{assignment.title}</Text>
        {assignment.description && <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{assignment.description}</Text>}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>🎯 {assignment.totalPoints} pts</Text>
          {assignment.dueDate && <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>⏰ Due: {formatDate(assignment.dueDate)}</Text>}
        </View>
        {submission ? <SubmittedState submission={submission} points={assignment.totalPoints} /> : <Button title="Submit Assignment" variant="primary" onPress={() => onOpen(assignment.id)} />}
      </GlassCard>
    );
  });
}

function SubmittedState({ submission, points }: { submission: AssignmentSubmission; points: number }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.emerald, fontSize: 12, fontWeight: '600' }}>✓ Submitted — {submission.fileName} ({formatBytes(submission.fileSize)})</Text>
      {submission.status === 'GRADED' && <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Text style={{ color: colors.tertiary, fontWeight: '700', fontSize: 14 }}>Score: {submission.score}/{points}</Text>{submission.teacherNotes && <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>Note: {submission.teacherNotes}</Text>}</View>}
    </View>
  );
}
