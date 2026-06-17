import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  value: boolean;
  onToggle: () => void;
}

export function Toggle({ value, onToggle }: Props) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.track, value && styles.active]}
      activeOpacity={0.7}
    >
      <View style={[styles.thumb, value && styles.thumbOn]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  active: {
    backgroundColor: colors.primary,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
});
