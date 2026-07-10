import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { PhoneFrame } from "../../src/layout/PhoneFrame";
import { DashboardHeader } from "../../src/components/DashboardHeader";
import { useStore } from "../../src/store/useStore";
import { useAssignmentStore } from "../../src/store/slices/assignmentSlice";
import { AssignmentSubmitView } from "../../src/features/assignments/AssignmentSubmitView";
import { colors } from "../../src/constants/theme";

export default function AssignmentSubmitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assignmentId = Number(id);
  const logout = useStore((state) => state.logout);
  const {
    assignmentDetails,
    submissions,
    loading,
    loadAssignment,
    submitAssignment,
  } = useAssignmentStore();
  const [file, setFile] = useState<{
    name: string;
    uri: string;
    mimeType: string;
    size: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assignmentId) loadAssignment(assignmentId);
  }, [assignmentId, loadAssignment]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });
    const asset = result.canceled ? null : result.assets?.[0];
    if (asset)
      setFile({
        name: asset.name,
        uri: asset.uri,
        mimeType: asset.mimeType || "application/octet-stream",
        size: asset.size || 0,
      });
  };

  const handleSubmit = async () => {
    if (!file) return Alert.alert("Error", "Please select a file first.");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as any);
      await submitAssignment(assignmentId, formData);
      setFile(null);
      Alert.alert("Submitted!", "Your assignment has been submitted.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const assignment = assignmentDetails[assignmentId];
  if (loading && !assignment)
    return (
      <PhoneFrame>
        <View style={centerStyle}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </PhoneFrame>
    );
  if (!assignment)
    return (
      <PhoneFrame>
        <View style={centerStyle}>
          <Text style={{ color: colors.white }}>Assignment not found</Text>
        </View>
      </PhoneFrame>
    );

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
        <AssignmentSubmitView
          assignment={assignment}
          file={file}
          submitting={submitting}
          submitted={submissions[assignmentId] || null}
          onPickFile={pickFile}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </PhoneFrame>
  );
}

const centerStyle = {
  flex: 1,
  backgroundColor: "#0d0714",
  justifyContent: "center" as const,
  alignItems: "center" as const,
};
