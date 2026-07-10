import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../constants/theme';

export const COURSE_CATEGORIES = ['Computer Science', 'Security', 'Data Science', 'Business', 'Design', 'Other'];

export function CourseFilters({ searchQuery, selectedCategory, onSearch, onSelectCategory }: {
  searchQuery: string; selectedCategory: string | null; onSearch: (value: string) => void; onSelectCategory: (value: string | null) => void;
}) {
  return <><TextInput style={{ width: '100%', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: colors.white }} placeholder="Search courses..." placeholderTextColor={colors.surfaceVariant} value={searchQuery} onChangeText={onSearch} /><View><Text style={{ fontSize: 14, fontWeight: '600', color: colors.white, marginBottom: 8 }}>Categories</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={{ flexDirection: 'row', gap: 8 }}><CategoryChip label="All" active={!selectedCategory} onPress={() => onSelectCategory(null)} />{COURSE_CATEGORIES.map((category) => <CategoryChip key={category} label={category} active={selectedCategory === category} onPress={() => onSelectCategory(category)} />)}</View></ScrollView></View></>;
}

function CategoryChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: active ? colors.primary : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: active ? colors.primary : 'rgba(255,255,255,0.1)' }}><Text style={{ color: active ? colors.white : colors.surfaceVariant, fontWeight: '600' }}>{label}</Text></TouchableOpacity>;
}
