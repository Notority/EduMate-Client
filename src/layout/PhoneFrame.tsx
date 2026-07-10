import { View, StyleSheet, ViewStyle } from 'react-native';
import { skinGradients } from '../constants/theme';
import { useStore } from '../store/useStore';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  overlay?: React.ReactNode;
}

export function PhoneFrame({ children, style, overlay }: Props) {
  const config = useStore((s) => s.config);
  const [bg] = skinGradients[config.skinColor] || skinGradients.midnight;

  return (
    <View style={[styles.screen, { backgroundColor: bg }, style]}>
      <View style={styles.content}>
        {children}
      </View>
      {overlay && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none" collapsable={false}>
          {overlay}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, width: '100%', height: '100%',
  },
  content: {
    flex: 1,
  },
});
