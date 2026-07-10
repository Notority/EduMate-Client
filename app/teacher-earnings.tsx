import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { GlassCard } from "../src/components/GlassCard";
import { useStore } from "../src/store/useStore";
import { colors } from "../src/constants/theme";
import { privateCourseApi } from "../src/services/api";
import type { TeacherEarning } from "../src/types";

export default function TeacherEarningsScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const [earnings, setEarnings] = useState<TeacherEarning[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [earningsRes, totalRes] = await Promise.all([
          privateCourseApi.getEarnings(),
          privateCourseApi.getTotalEarnings(),
        ]);
        setEarnings(earningsRes.data);
        setTotal(totalRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader
          onLogout={() => { logout(); router.replace("/login"); }}
          onProfile={() => router.push("/teacher-profile")}
        />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.white }}>Earnings</Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : (
            <>
              <GlassCard style={{ padding: 20, alignItems: "center", gap: 4 }}>
                <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>Total Earnings</Text>
                <Text style={{ color: colors.secondary, fontSize: 36, fontWeight: "800" }}>
                  ${total.toFixed(2)}
                </Text>
              </GlassCard>

              {earnings.length === 0 ? (
                <GlassCard style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                    No earnings yet. Approve student enquiries to generate earnings.
                  </Text>
                </GlassCard>
              ) : (
                earnings.map((e) => (
                  <GlassCard key={e.id} style={{ padding: 12, gap: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: colors.white, fontWeight: "700", fontSize: 14, flex: 1 }}>
                        {e.courseTitle}
                      </Text>
                      <Text style={{ color: colors.emerald, fontWeight: "800", fontSize: 14 }}>
                        ${e.amount.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Source: {e.source}</Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </Text>
                  </GlassCard>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
