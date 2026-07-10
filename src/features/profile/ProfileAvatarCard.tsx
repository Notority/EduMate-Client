import { View, Text, TouchableOpacity } from 'react-native';
import { profileStyles as styles } from './profileStyles';

export const AVATAR_OPTIONS = ['🦊', '🦉', '🦁', '🐼', '🦄', '🐙', '👽', '🤖', '🐱', '🐶', '🐯', '🐻'];

export function ProfileAvatarCard({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <View style={styles.card}><Text style={styles.cardTitle}>Choose Avatar</Text><View style={styles.avatarDisplayWrapper}><Text style={styles.currentAvatarText}>{value}</Text></View><View style={styles.avatarGrid}>{AVATAR_OPTIONS.map((item) => <TouchableOpacity key={item} style={[styles.avatarGridItem, value === item && styles.avatarGridItemActive]} onPress={() => onChange(item)}><Text style={{ fontSize: 24 }}>{item}</Text></TouchableOpacity>)}</View></View>;
}
