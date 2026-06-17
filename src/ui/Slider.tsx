import { View, Text, StyleSheet } from 'react-native';
import SliderNative from '@react-native-community/slider';
import { colors } from '../constants/theme';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export function Slider({ label, value, min, max, step, onChange, suffix }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}{suffix}</Text>
      </View>
      <SliderNative
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor="#334155"
        thumbTintColor={colors.primaryLight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.surfaceVariant,
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  slider: { width: '100%', height: 28 },
});
