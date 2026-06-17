import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, skinGradients } from '../constants/theme';
import { useStore } from '../store/useStore';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function PhoneFrame({ children, style }: Props) {
  const config = useStore((s) => s.config);
  const [bg] = skinGradients[config.skinColor] || skinGradients.midnight;

  return (
    <View style={[styles.screen, { backgroundColor: bg }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, width: '100%', height: '100%',
  },
});
