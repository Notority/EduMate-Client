import { useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { useStore } from "../src/store/useStore";
import { useAssignmentStore } from "../src/store/slices/assignmentSlice";
import { AssignmentsHeader } from "../src/features/assignments/AssignmentsHeader";
import { AssignmentList } from "../src/features/assignments/AssignmentList";

export default function AssignmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courseId: string;
    courseTitle?: string;
  }>();
  const courseId = Number(params.courseId);
  const courseTitle = params.courseTitle || "Assignments";
  const logout = useStore((state) => state.logout);
  const { assignments, submissions, loading, loadAssignments } =
    useAssignmentStore();

  useEffect(() => {
    if (courseId) loadAssignments(courseId);
  }, [courseId, loadAssignments]);

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader
          onLogout={() => {
            logout();
            router.replace("/login");
          }}
          onBack={() => router.back()}
          onProfile={() => router.push("/profile")}
        />
        <View style={{ padding: 16, gap: 12 }}>
          <AssignmentsHeader courseTitle={courseTitle} />
          <AssignmentList
            assignments={assignments}
            submissions={submissions}
            loading={loading}
            onOpen={(id) => router.push(`/assignment/${id}`)}
          />
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
