import { StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export const profileStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(23, 17, 34, 0.8)' },
  backBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontWeight: '700', fontSize: 16 },
  card: { backgroundColor: 'rgba(25, 20, 45, 0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 18, gap: 12 },
  cardTitle: { color: colors.white, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  errorText: { backgroundColor: 'rgba(127,29,29,0.4)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 12, padding: 8, borderRadius: 12, textAlign: 'center' },
  successText: { backgroundColor: 'rgba(6,78,59,0.4)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', color: colors.emerald, fontSize: 12, padding: 8, borderRadius: 12, textAlign: 'center' },
  avatarDisplayWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 8 },
  currentAvatarText: { fontSize: 40 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginVertical: 4 },
  avatarGridItem: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  avatarGridItemActive: { backgroundColor: 'rgba(115,46,228,0.25)', borderColor: colors.primary },
  timeline: { gap: 12, paddingLeft: 4, marginVertical: 4 },
  timelineItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary, marginTop: 5 },
  timelineContent: { flex: 1 },
  timelineDesc: { color: colors.white, fontSize: 12, fontWeight: '600' },
  timelineTime: { color: colors.surfaceVariant, fontSize: 9, marginTop: 2 },
  emptyActivityText: { color: colors.surfaceVariant, fontSize: 11, fontStyle: 'italic', textAlign: 'center' },
  dangerCard: { borderColor: 'rgba(239,68,68,0.2)' },
  dangerDesc: { color: colors.surfaceVariant, fontSize: 11, lineHeight: 16 },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#fca5a5', fontWeight: '700', fontSize: 12 },
});
