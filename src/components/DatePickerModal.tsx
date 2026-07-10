import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors } from '../constants/theme';
import { Button } from '../ui/Button';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initial?: Date;
  minDate?: Date;
}

export function DatePickerModal({ visible, onClose, onConfirm, initial, minDate }: Props) {
  const today = new Date();
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [year, setYear] = useState(initial?.getFullYear() || today.getFullYear());
  const [month, setMonth] = useState(initial?.getMonth() || today.getMonth());
  const [selectedDate, setSelectedDate] = useState<number | null>(initial?.getDate() || null);
  const [hour, setHour] = useState(initial?.getHours() || 12);
  const [minute, setMinute] = useState(initial?.getMinutes() || 0);
  const [period, setPeriod] = useState<'AM' | 'PM'>(
    initial ? (initial.getHours() >= 12 ? 'PM' : 'AM') : 'PM'
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const handleDateSelect = (day: number) => {
    const d = new Date(year, month, day);
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return;
    setSelectedDate(day);
    setStep('time');
  };

  const handleConfirm = () => {
    if (!selectedDate) return;
    const h = period === 'PM' && hour !== 12 ? hour + 12 : period === 'AM' && hour === 12 ? 0 : hour;
    onConfirm(new Date(year, month, selectedDate, h, minute));
    onClose();
    setStep('date');
  };

  const handleClose = () => {
    onClose();
    setStep('date');
  };

  const renderCalendar = () => {
    const blanks: React.ReactNode[] = [];
    for (let i = 0; i < firstDay; i++) {
      blanks.push(<View key={`b${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />);
    }
    const days: React.ReactNode[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const isDisabled = minDate ? dateObj < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;
      const isSelected = d === selectedDate;
      days.push(
        <TouchableOpacity
          key={d}
          onPress={() => handleDateSelect(d)}
          disabled={isDisabled}
          style={{
            width: '14.28%', aspectRatio: 1,
            justifyContent: 'center', alignItems: 'center',
            borderRadius: 20,
            backgroundColor: isSelected ? colors.primary : 'transparent',
            opacity: isDisabled ? 0.3 : 1,
          }}
        >
          <Text style={{ color: isSelected ? colors.white : colors.white, fontSize: 15, fontWeight: isSelected ? '700' : '400' }}>{d}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 20 }}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.white, fontSize: 17, fontWeight: '700' }}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 20 }}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {DAYS.map(d => (
            <View key={d} style={{ width: '14.28%', alignItems: 'center', paddingVertical: 6 }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 12, fontWeight: '600' }}>{d}</Text>
            </View>
          ))}
          {blanks}
          {days}
        </View>
      </View>
    );
  };

  const renderTime = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    return (
      <View style={{ gap: 16 }}>
        <Text style={{ color: colors.white, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>
          Select Time — {MONTHS[month]} {selectedDate}, {year}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, maxHeight: 160 }}>
            <Text style={{ color: colors.surfaceVariant, fontSize: 11, marginBottom: 4, textAlign: 'center' }}>Hour</Text>
            <ScrollView style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
              {hours.map(h => (
                <TouchableOpacity
                  key={h} onPress={() => setHour(h)}
                  style={{ paddingVertical: 8, alignItems: 'center', backgroundColor: h === hour ? colors.primary : 'transparent' }}
                >
                  <Text style={{ color: h === hour ? colors.white : colors.surfaceVariant, fontWeight: h === hour ? '700' : '400' }}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ flex: 1, maxHeight: 160 }}>
            <Text style={{ color: colors.surfaceVariant, fontSize: 11, marginBottom: 4, textAlign: 'center' }}>Minute</Text>
            <ScrollView style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
              {minutes.map(m => (
                <TouchableOpacity
                  key={m} onPress={() => setMinute(m)}
                  style={{ paddingVertical: 8, alignItems: 'center', backgroundColor: m === minute ? colors.primary : 'transparent' }}
                >
                  <Text style={{ color: m === minute ? colors.white : colors.surfaceVariant, fontWeight: m === minute ? '700' : '400' }}>{String(m).padStart(2, '0')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ justifyContent: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setPeriod('AM')}
              style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: period === 'AM' ? colors.primary : 'rgba(255,255,255,0.05)' }}
            >
              <Text style={{ color: colors.white, fontWeight: period === 'AM' ? '700' : '400' }}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPeriod('PM')}
              style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: period === 'PM' ? colors.primary : 'rgba(255,255,255,0.05)' }}
            >
              <Text style={{ color: colors.white, fontWeight: period === 'PM' ? '700' : '400' }}>PM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View style={{ backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: '800' }}>
              {step === 'date' ? 'Pick Date' : 'Pick Time'}
            </Text>
            {step === 'time' ? (
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 50 }} />
            )}
          </View>
          <ScrollView>
            {step === 'date' ? renderCalendar() : renderTime()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
