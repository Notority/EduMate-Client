import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'success';
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, variant === 'ghost' && styles.ghostText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  success: {
    backgroundColor: colors.emerald,
  },
  disabled: { opacity: 0.5 },
  text: {
    color: colors.white,
    fontFamily: 'Fredoka',
    fontWeight: '700',
    fontSize: 13,
  },
  ghostText: {
    color: colors.surfaceVariant,
  },
});
