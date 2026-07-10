import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../constants/theme';
import { Assignment } from '../../types';
import { formatBytes, formatDate } from './utils';

interface FileAsset { name: string; uri: string; mimeType: string; size: number }
interface Submitted { fileName: string; score?: number; status: string; teacherNotes?: string }

export function AssignmentSubmitView({ assignment, file, submitting, submitted, onPickFile, onSubmit }: {
  assignment: Assignment; file: FileAsset | null; submitting: boolean; submitted: Submitted | null; onPickFile: () => void; onSubmit: () => void;
}) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>{assignment.title}</Text>
      {assignment.description && <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>{assignment.description}</Text>}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>🎯 {assignment.totalPoints} pts</Text>
        {assignment.dueDate && <Text style={{ color: new Date(assignment.dueDate) < new Date() ? '#f43f5e' : colors.surfaceVariant, fontSize: 12 }}>⏰ Due: {formatDate(assignment.dueDate)}</Text>}
      </View>
      {submitted ? <SubmittedCard submitted={submitted} totalPoints={assignment.totalPoints} /> : <UploadActions file={file} submitting={submitting} onPickFile={onPickFile} onSubmit={onSubmit} />}
    </View>
  );
}

function SubmittedCard({ submitted, totalPoints }: { submitted: Submitted; totalPoints: number }) {
  return <GlassCard style={{ padding: 16, gap: 8 }}><Text style={{ color: colors.emerald, fontWeight: '700', fontSize: 16 }}>✓ Submitted</Text><Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>{submitted.fileName}</Text>{submitted.status === 'GRADED' && <><Text style={{ color: colors.tertiary, fontWeight: '700', fontSize: 18 }}>Score: {submitted.score}/{totalPoints}</Text>{submitted.teacherNotes && <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Note: {submitted.teacherNotes}</Text>}</>}{submitted.status === 'SUBMITTED' && <Text style={{ color: '#facc15', fontSize: 12 }}>Awaiting grading...</Text>}</GlassCard>;
}

function UploadActions({ file, submitting, onPickFile, onSubmit }: { file: FileAsset | null; submitting: boolean; onPickFile: () => void; onSubmit: () => void }) {
  return <><TouchableOpacity onPress={onPickFile} style={{ padding: 24, borderRadius: 12, borderWidth: 2, borderColor: file ? colors.primary : 'rgba(255,255,255,0.1)', borderStyle: 'dashed', alignItems: 'center', gap: 8, backgroundColor: file ? 'rgba(115,46,228,0.08)' : 'rgba(255,255,255,0.03)' }}><Text style={{ fontSize: 32 }}>{file ? '📄' : '📎'}</Text><Text style={{ color: file ? colors.white : colors.surfaceVariant, fontWeight: '600', fontSize: 14 }}>{file ? file.name : 'Tap to select a file'}</Text>{file && <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{formatBytes(file.size)}</Text>}</TouchableOpacity><TouchableOpacity onPress={onSubmit} disabled={!file || submitting} style={{ backgroundColor: file ? colors.primary : 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, alignItems: 'center', opacity: !file || submitting ? 0.5 : 1 }}>{submitting ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>{file ? 'Submit Assignment' : 'Select a file first'}</Text>}</TouchableOpacity></>;
}
