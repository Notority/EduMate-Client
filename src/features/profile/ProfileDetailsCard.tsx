import { View, Text } from 'react-native';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { profileStyles as styles } from './profileStyles';

export function ProfileDetailsCard({ firstName, lastName, email, error, success, loading, onFirstName, onLastName, onEmail, onSubmit }: any) {
  return <View style={styles.card}><Text style={styles.cardTitle}>Personal Details</Text>{error ? <Text style={styles.errorText}>{error}</Text> : null}{success ? <Text style={styles.successText}>{success}</Text> : null}<Input label="First Name" value={firstName} onChangeText={onFirstName} placeholder="First Name" /><Input label="Last Name" value={lastName} onChangeText={onLastName} placeholder="Last Name" /><Input label="Email Address" value={email} onChangeText={onEmail} placeholder="email@example.com" keyboardType="email-address" /><Button title={loading ? 'Saving changes...' : 'Save Profile Details'} onPress={onSubmit} disabled={loading} style={{ marginTop: 8 }} /></View>;
}
