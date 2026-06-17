import { TextInput, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  icon?: string;
  style?: ViewStyle;
  keyboardType?: 'default' | 'email-address';
}

export function Input({ label, value, onChangeText, placeholder,
  secureTextEntry, style, keyboardType }: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.surfaceVariant}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: {
    color: colors.surfaceVariant,
    fontSize: 11,
    fontFamily: 'Fredoka',
    fontWeight: '600',
    paddingLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(17, 14, 25, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(210, 187, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
  },
});
