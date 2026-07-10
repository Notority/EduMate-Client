import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { GlassCard } from "../src/components/GlassCard";
import { useStore } from "../src/store/useStore";
import { colors } from "../src/constants/theme";
import { Button } from "../src/ui/Button";
import { privateCourseApi } from "../src/services/api";
import type { Course, CourseEnquiry } from "../src/types";

export default function TeacherPrivateCoursesScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const [privateCourses, setPrivateCourses] = useState<Course[]>([]);
  const [enquiries, setEnquiries] = useState<CourseEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [coursesRes, enquiriesRes] = await Promise.all([
        privateCourseApi.getTeacherPrivateCourses(),
        privateCourseApi.getTeacherEnquiries(),
      ]);
      setPrivateCourses(coursesRes.data);
      setEnquiries(enquiriesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRespond = async (enquiryId: number, decision: "APPROVED" | "REJECTED") => {
    setResponding(enquiryId);
    try {
      await privateCourseApi.respondToEnquiry(enquiryId, decision);
      Alert.alert("Done", `Enquiry ${decision.toLowerCase()}.`);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setResponding(null);
    }
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader
          onLogout={() => { logout(); router.replace("/login"); }}
          onProfile={() => router.push("/teacher-profile")}
        />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: colors.white }}>Private Courses</Text>
            <Button title="Back" variant="ghost" onPress={() => router.back()} />
          </View>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : (
            <>
              {privateCourses.length > 0 && (
                <>
                  <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}>
                    Your Private Offers ({privateCourses.length})
                  </Text>
                  {privateCourses.map((course) => (
                    <GlassCard key={course.id} style={{ padding: 16, gap: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: course.color }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>{course.title}</Text>
                          <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{course.category}</Text>
                        </View>
                        {course.price != null && (
                          <Text style={{ color: colors.secondary, fontSize: 16, fontWeight: "800" }}>
                            ${course.price.toFixed(2)}
                          </Text>
                        )}
                      </View>
                      <View style={{
                        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start",
                        backgroundColor: course.published ? "rgba(34,197,94,0.15)" : "rgba(250,204,21,0.15)",
                      }}>
                        <Text style={{
                          fontSize: 12, fontWeight: "700",
                          color: course.published ? "#4ade80" : "#facc15",
                        }}>
                          {course.published ? "Published" : "Draft"}
                        </Text>
                      </View>
                    </GlassCard>
                  ))}
                </>
              )}

              {enquiries.length > 0 ? (
                <>
                  <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700", marginTop: 12 }}>
                    Enquiries ({enquiries.length})
                  </Text>
                  {enquiries.map((enq) => (
                    <GlassCard key={enq.id} style={{ padding: 16, gap: 8 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: colors.white, fontWeight: "700", fontSize: 14 }}>
                          {enq.courseTitle}
                        </Text>
                        <View style={{
                          paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
                          backgroundColor: enq.status === "PENDING" ? "rgba(250,204,21,0.15)" :
                            enq.status === "APPROVED" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                        }}>
                          <Text style={{
                            fontSize: 11, fontWeight: "700",
                            color: enq.status === "PENDING" ? "#facc15" :
                              enq.status === "APPROVED" ? "#4ade80" : "#fca5a5",
                          }}>
                            {enq.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>
                        From: {enq.studentName}
                      </Text>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>
                        Message: {enq.message}
                      </Text>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </Text>
                      {enq.status === "PENDING" && (
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <Button
                            title={responding === enq.id ? "..." : "Approve"}
                            variant="success"
                            onPress={() => handleRespond(enq.id, "APPROVED")}
                            disabled={responding === enq.id}
                            style={{ flex: 1 }}
                          />
                          <Button
                            title={responding === enq.id ? "..." : "Reject"}
                            variant="danger"
                            onPress={() => handleRespond(enq.id, "REJECTED")}
                            disabled={responding === enq.id}
                            style={{ flex: 1 }}
                          />
                        </View>
                      )}
                    </GlassCard>
                  ))}
                </>
              ) : (
                <GlassCard style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                    No enquiries yet.
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
