import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, TextInput, Modal, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { GlassCard } from "../src/components/GlassCard";
import { useStore } from "../src/store/useStore";
import { colors } from "../src/constants/theme";
import { Button } from "../src/ui/Button";
import { privateCourseApi } from "../src/services/api";
import type { Course, CourseEnquiry } from "../src/types";

export default function PrivateOffersScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const [offers, setOffers] = useState<Course[]>([]);
  const [myEnquiries, setMyEnquiries] = useState<CourseEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    try {
      const [offersRes, enquiriesRes] = await Promise.all([
        privateCourseApi.getOffers(),
        privateCourseApi.getMyEnquiries(),
      ]);
      setOffers(offersRes.data);
      setMyEnquiries(enquiriesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSendEnquiry = async () => {
    if (!selectedCourse || !message.trim()) return;
    setSending(true);
    try {
      await privateCourseApi.sendEnquiry({ courseId: selectedCourse.id, message: message.trim() });
      Alert.alert("Sent", "Your enquiry has been sent to the teacher.");
      setShowModal(false);
      setMessage("");
      setSelectedCourse(null);
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSending(false);
    }
  };

  const enquiryMap = new Map(myEnquiries.map((e) => [e.courseId, e]));

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader
          onLogout={() => { logout(); router.replace("/login"); }}
          onProfile={() => router.push("/profile")}
        />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.white }}>Private Offers</Text>
          <Text style={{ color: colors.surfaceVariant, fontSize: 14, marginTop: -8 }}>
            Browse private courses and contact teachers if interested
          </Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : offers.length === 0 ? (
            <GlassCard style={{ padding: 24, alignItems: "center" }}>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>No private offers available yet.</Text>
            </GlassCard>
          ) : (
            offers.map((course) => {
              const enquiry = enquiryMap.get(course.id);
              return (
                <GlassCard key={course.id} style={{ padding: 16, gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: course.color }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>{course.title}</Text>
                      <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>
                        {course.teacherName || "Unknown Teacher"}
                      </Text>
                    </View>
                    {course.price != null && (
                      <Text style={{ color: colors.secondary, fontSize: 16, fontWeight: "800" }}>
                        ${course.price.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  {course.description && (
                    <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>{course.description}</Text>
                  )}
                  {course.category && (
                    <Text style={{ color: colors.primaryLight, fontSize: 12 }}>{course.category}</Text>
                  )}
                  {enquiry ? (
                    <View style={{
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: "flex-start",
                      backgroundColor: enquiry.status === "APPROVED" ? "rgba(34,197,94,0.15)" :
                        enquiry.status === "REJECTED" ? "rgba(239,68,68,0.15)" : "rgba(250,204,21,0.15)",
                    }}>
                      <Text style={{
                        fontSize: 12, fontWeight: "700",
                        color: enquiry.status === "APPROVED" ? "#4ade80" :
                          enquiry.status === "REJECTED" ? "#fca5a5" : "#facc15",
                      }}>
                        {enquiry.status === "PENDING" ? "Enquiry Pending" :
                          enquiry.status === "APPROVED" ? "Approved" : "Rejected"}
                      </Text>
                    </View>
                  ) : (
                    <Button
                      title="Contact Teacher"
                      onPress={() => {
                        setSelectedCourse(course);
                        setShowModal(true);
                      }}
                      variant="secondary"
                    />
                  )}
                </GlassCard>
              );
            })
          )}

          {myEnquiries.length > 0 && (
            <>
              <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700", marginTop: 12 }}>My Enquiries</Text>
              {myEnquiries.map((e) => (
                <GlassCard key={e.id} style={{ padding: 12, gap: 4 }}>
                  <Text style={{ color: colors.white, fontWeight: "700", fontSize: 14 }}>{e.courseTitle}</Text>
                  <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Message: {e.message}</Text>
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    <Text style={{
                      fontSize: 12, fontWeight: "700",
                      color: e.status === "APPROVED" ? "#4ade80" :
                        e.status === "REJECTED" ? "#fca5a5" : "#facc15",
                    }}>
                      {e.status}
                    </Text>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </GlassCard>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}
          activeOpacity={1}
          onPress={() => { setShowModal(false); setMessage(""); setSelectedCourse(null); }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <GlassCard style={{ padding: 20, gap: 12 }}>
              <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>
                Contact Teacher
              </Text>
              <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                Send a message to the teacher about "{selectedCourse?.title}"
              </Text>
              <TextInput
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12,
                  color: colors.white, fontSize: 14, minHeight: 100, textAlignVertical: "top",
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
                }}
                placeholder="Write your message here..."
                placeholderTextColor={colors.surfaceVariant}
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => { setShowModal(false); setMessage(""); setSelectedCourse(null); }}
                  style={{ flex: 1 }}
                />
                <Button
                  title={sending ? "Sending..." : "Send Enquiry"}
                  onPress={handleSendEnquiry}
                  disabled={sending || !message.trim()}
                  style={{ flex: 1 }}
                />
              </View>
            </GlassCard>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </PhoneFrame>
  );
}
