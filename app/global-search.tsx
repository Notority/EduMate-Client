import { useState, useCallback } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { GlassCard } from "../src/components/GlassCard";
import { useStore } from "../src/store/useStore";
import { searchApi } from "../src/services/api";
import { SearchResponse, SearchResultItem } from "../src/types";
import { colors } from "../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

type FilterType = "all" | "courses" | "resources" | "teachers";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "courses", label: "Courses" },
  { key: "resources", label: "Materials" },
  { key: "teachers", label: "Teachers" },
];

export default function GlobalSearchScreen() {
  const router = useRouter();
  const logout = useStore((s) => s.logout);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchApi.global(query.trim());
      setResults(res.data);
    } catch { }
    setLoading(false);
  }, [query]);

  const items = (): { title: string; icon: string; color: string; data: SearchResultItem[] }[] => {
    if (!results) return [];
    const sections: any[] = [];
    if (filter === "all" || filter === "courses") {
      sections.push({ title: "Courses", icon: "book", color: "#732ee4", data: results.courses });
    }
    if (filter === "all" || filter === "resources") {
      sections.push({ title: "Materials", icon: "document", color: "#e67e22", data: results.resources });
    }
    if (filter === "all" || filter === "teachers") {
      sections.push({ title: "Teachers", icon: "person", color: "#2ecc71", data: results.teachers });
    }
    return sections;
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader onLogout={() => { logout(); router.replace("/login"); }} onProfile={() => router.push("/profile")} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.white }}>Search</Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              style={{
                flex: 1, backgroundColor: "#1a1025", borderRadius: 12, padding: 12,
                color: colors.white, fontSize: 16, borderWidth: 1, borderColor: "#2a1a3a",
              }}
              placeholder="Search courses, materials, teachers..."
              placeholderTextColor="#666"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={doSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={doSearch}
              style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 12, justifyContent: "center" }}
            >
              <Ionicons name="search" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: filter === f.key ? colors.primary : "#1a1025",
                  borderWidth: 1, borderColor: filter === f.key ? colors.primary : "#2a1a3a",
                }}
              >
                <Text style={{ color: filter === f.key ? colors.white : "#999", fontWeight: "600", fontSize: 13 }}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />}

          {!loading && results && results.totalResults === 0 && (
            <GlassCard style={{ padding: 24, alignItems: "center" }}>
              <Ionicons name="search-outline" size={40} color="#555" />
              <Text style={{ color: "#888", marginTop: 8, textAlign: "center" }}>No results found for "{query}"</Text>
            </GlassCard>
          )}

          {!loading && items().map((section) =>
            section.data.length > 0 ? (
              <View key={section.title}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, marginTop: 4 }}>
                  <Ionicons name={section.icon as any} size={16} color={section.color} />
                  <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}>
                    {section.title} ({section.data.length})
                  </Text>
                </View>
                {section.data.map((item) => (
                  <TouchableOpacity
                    key={`${item.type}-${item.id}`}
                    onPress={() => {
                      if (item.type === "course") router.push({ pathname: "/course-syllabus", params: { courseId: item.id, courseTitle: item.title } });
                    }}
                  >
                    <GlassCard style={{ padding: 14, marginBottom: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View style={{
                          width: 40, height: 40, borderRadius: 10,
                          backgroundColor: item.color || section.color + "33",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <Ionicons name={section.icon as any} size={20} color={item.color || section.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>{item.title}</Text>
                          {item.description && (
                            <Text style={{ color: "#999", fontSize: 12, marginTop: 2 }} numberOfLines={2}>
                              {item.description}
                            </Text>
                          )}
                          {item.subtitle && (
                            <Text style={{ color: "#666", fontSize: 11, marginTop: 2 }}>
                              {item.subtitle}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#555" />
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          )}

          {!loading && !results && (
            <GlassCard style={{ padding: 40, alignItems: "center" }}>
              <Ionicons name="search" size={48} color="#333" />
              <Text style={{ color: "#666", marginTop: 12, textAlign: "center", fontSize: 14 }}>
                Search across courses, materials, and teachers
              </Text>
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
