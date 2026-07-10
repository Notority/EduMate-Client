import { useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { useStore } from "../src/store/useStore";
import { useCatalogStore } from "../src/store/slices/catalogSlice";
import { colors } from "../src/constants/theme";
import { Button } from "../src/ui/Button";
import { CourseFilters } from "../src/features/courses/CourseFilters";
import { CourseCatalog } from "../src/features/courses/CourseCatalog";

export default function CoursesScreen() {
  const router = useRouter();
  const logout = useStore((state) => state.logout);
  const {
    loading,
    searchQuery,
    selectedCategory,
    courses,
    enrollments,
    setSearchQuery,
    setSelectedCategory,
    loadCatalog,
    enroll,
  } = useCatalogStore();

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);
  useEffect(() => {
    const timer = setTimeout(() => loadCatalog(), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, loadCatalog]);

  const handleEnroll = async (courseId: number) => {
    try {
      await enroll(courseId);
      Alert.alert("Success", "Enrolled in course successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader
          onLogout={() => {
            logout();
            router.replace("/login");
          }}
          onProfile={() => router.push("/profile")}
        />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: colors.white }}>
              Course Catalog
            </Text>
            <Button
              title="Private Offers"
              variant="ghost"
              onPress={() => router.push("/private-offers")}
            />
          </View>
          <CourseFilters
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSearch={setSearchQuery}
            onSelectCategory={setSelectedCategory}
          />
          <CourseCatalog
            loading={loading}
            courses={courses}
            enrollments={enrollments}
            onEnroll={handleEnroll}
          />
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
