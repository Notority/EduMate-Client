import { View, Text } from 'react-native';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { profileStyles as styles } from './profileStyles';

export function ProfilePasswordCard({ oldPassword, newPassword, confirmPassword, error, success, loading, onOldPassword, onNewPassword, onConfirmPassword, onSubmit }: any) {
  return <View style={styles.card}><Text style={styles.cardTitle}>Change Password</Text>{error ? <Text style={styles.errorText}>{error}</Text> : null}{success ? <Text style={styles.successText}>{success}</Text> : null}<Input label="Current Password" value={oldPassword} onChangeText={onOldPassword} placeholder="••••••••" secureTextEntry /><Input label="New Password" value={newPassword} onChangeText={onNewPassword} placeholder="•••••••• (6+ chars)" secureTextEntry /><Input label="Confirm New Password" value={confirmPassword} onChangeText={onConfirmPassword} placeholder="••••••••" secureTextEntry /><Button title={loading ? 'Updating...' : 'Update Password'} onPress={onSubmit} disabled={loading} style={{ marginTop: 8 }} /></View>;
}
