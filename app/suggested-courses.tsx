import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { GlassCard } from "../src/components/GlassCard";
import { useStore } from "../src/store/useStore";
import { recommendationApi } from "../src/services/api";
import { CourseRecommendation } from "../src/types";
import { colors } from "../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../src/ui/Button";

export default function SuggestedCoursesScreen() {
  const router = useRouter();
  const logout = useStore((s) => s.logout);
  const enrollInCourse = useStore((s) => s.enrollInCourse);
  const [recommended, setRecommended] = useState<CourseRecommendation[]>([]);
  const [trending, setTrending] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      recommendationApi.getRecommended().then((r) => setRecommended(r.data)),
      recommendationApi.getTrending().then((r) => setTrending(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollInCourse(courseId);
      Alert.alert("Success", "Enrolled in course!");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const renderCard = (rec: CourseRecommendation, icon: string, reasonLabel: string) => (
    <GlassCard key={`${reasonLabel}-${rec.courseId}`} style={{ padding: 14, marginBottom: 10 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: rec.color + "33",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name={icon as any} size={22} color={rec.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>{rec.title}</Text>
          <Text style={{ color: "#aaa", fontSize: 12 }}>{rec.teacherName}</Text>
          {rec.category && (
            <View style={{
              alignSelf: "flex-start", backgroundColor: rec.color + "22",
              paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4,
            }}>
              <Text style={{ color: rec.color, fontSize: 11, fontWeight: "600" }}>{rec.category}</Text>
            </View>
          )}
          <Text style={{ color: "#888", fontSize: 12, marginTop: 6, lineHeight: 17 }}>{rec.reason}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
            <View style={{ flex: 1, height: 4, backgroundColor: "#1a1025", borderRadius: 2 }}>
              <View style={{ width: `${Math.round(rec.score * 100)}%`, height: 4, backgroundColor: rec.color, borderRadius: 2 }} />
            </View>
            <Text style={{ color: "#666", fontSize: 11 }}>{Math.round(rec.score * 100)}%</Text>
          </View>
          <Button title="Enroll" onPress={() => handleEnroll(rec.courseId)} variant="primary" />
        </View>
      </View>
    </GlassCard>
  );

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader onLogout={() => { logout(); router.replace("/login"); }} onProfile={() => router.push("/profile")} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.white }}>Suggested Courses</Text>
          <Text style={{ color: "#888", fontSize: 13, marginTop: -8 }}>
            AI-powered recommendations based on your profile and performance
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
          ) : (
            <>
              {recommended.length > 0 && (
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Ionicons name="sparkles" size={18} color="#f1c40f" />
                    <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>Recommended for You</Text>
                  </View>
                  {recommended.map((r) => renderCard(r, "sparkles", "rec"))}
                </View>
              )}

              {trending.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Ionicons name="trending-up" size={18} color="#e67e22" />
                    <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>Trending</Text>
                  </View>
                  {trending.map((r) => renderCard(r, "flame", "trending"))}
                </View>
              )}

              {recommended.length === 0 && trending.length === 0 && (
                <GlassCard style={{ padding: 30, alignItems: "center" }}>
                  <Ionicons name="bulb-outline" size={48} color="#333" />
                  <Text style={{ color: "#666", marginTop: 12, textAlign: "center" }}>
                    No suggestions available yet. Enroll in courses and take quizzes to get personalized recommendations.
                  </Text>
                </GlassCard>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
