import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

const MENU_WIDTH = Dimensions.get('window').width * 0.7;

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: '📅', label: 'Planner', route: '/study-planner' },
  { icon: '🔍', label: 'Search', route: '/global-search' },
  { icon: '✨', label: 'Suggested Courses', route: '/suggested-courses' },
  { icon: '📚', label: 'Browse Courses', route: '/courses' },
  { icon: '🎯', label: 'Private Offers', route: '/private-offers' },
  { icon: '📊', label: 'Progress', route: '/progress-dashboard' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export function HamburgerMenu({ visible, onClose, onNavigate }: Props) {
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0, friction: 9, tension: 65, useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH, duration: 200, useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0, duration: 200, useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>
      <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.items}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.route}
              style={styles.item}
              onPress={() => { onClose(); setTimeout(() => onNavigate(item.route), 250); }}
              activeOpacity={0.6}
            >
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  menu: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#110a1e',
    borderRightWidth: 2,
    borderRightColor: 'rgba(255,255,255,0.1)',
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 30,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    color: '#fff', fontSize: 24, fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
  items: { gap: 4, paddingHorizontal: 12 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 16 },
  label: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3, flexShrink: 1 },
});
