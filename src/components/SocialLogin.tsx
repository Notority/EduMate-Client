import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { socialLogos } from '../constants/images';

interface Props {
  onPress: (platform: string) => void;
  platforms?: string[];
}

export function SocialLogin({ onPress, platforms = ['Google', 'Apple'] }: Props) {
  return (
    <View style={styles.grid}>
      {platforms.map((p) => (
        <TouchableOpacity
          key={p}
          onPress={() => onPress(p)}
          style={styles.btn}
          activeOpacity={0.7}
        >
          <Image source={{ uri: socialLogos[p] }} style={styles.logo} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 20,
    height: 20,
  },
});
