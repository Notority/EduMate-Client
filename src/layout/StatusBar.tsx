import { View, Text, StyleSheet } from 'react-native';
import { useClock } from '../hooks/useClock';
import { useBattery } from '../hooks/useBattery';

export function StatusBar() {
  const time = useClock();
  const battery = useBattery();

  return (
    <View style={styles.bar}>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.right}>
        <Text style={styles.symbol}>📶</Text>
        <Text style={styles.symbol}>📶</Text>
        <Text style={styles.percent}>{battery}%</Text>
        <View style={styles.battery}>
          <View style={[styles.fill, { width: `${battery}%` }]} />
          <View style={styles.tip} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', top: 24, left: 0, right: 0, height: 24,
    paddingHorizontal: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', zIndex: 40,
  },
  time: { color: '#fafafa', fontWeight: '800', fontSize: 10 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  symbol: { fontSize: 10, color: '#f5f5f5' },
  percent: { fontWeight: '700', fontSize: 9, color: '#f5f5f5' },
  battery: {
    width: 16, height: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)', borderRadius: 2,
    padding: 1, justifyContent: 'center',
  },
  fill: { height: '100%', backgroundColor: '#fcfcfc', borderRadius: 1 },
  tip: {
    position: 'absolute', right: -2, top: 3, width: 1.5, height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
