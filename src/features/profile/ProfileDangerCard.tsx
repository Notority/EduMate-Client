import { View, Text, TouchableOpacity } from 'react-native';
import { profileStyles as styles } from './profileStyles';

export function ProfileDangerCard({ onDelete }: { onDelete: () => void }) {
  return <View style={[styles.card, styles.dangerCard]}><Text style={[styles.cardTitle, { color: '#fca5a5' }]}>Danger Zone</Text><Text style={styles.dangerDesc}>Deleting your account will permanently remove all your data. This action is irreversible.</Text><TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.7}><Text style={styles.deleteBtnText}>Delete Account Permanently</Text></TouchableOpacity></View>;
}
