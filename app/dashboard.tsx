import { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { WelcomeBanner } from "../src/components/WelcomeBanner";
import { GlassCard } from "../src/components/GlassCard";
import { ConfigPanel } from "../src/components/ConfigPanel";
import { HamburgerMenu } from "../src/components/HamburgerMenu";
import { useStore } from "../src/store/useStore";
import { colors } from "../src/constants/theme";
import { DashboardStats } from "../src/features/dashboard/DashboardStats";
import { EnrollmentList } from "../src/features/dashboard/EnrollmentList";
import { useFadeIn } from "../src/hooks/useFadeIn";

export default function DashboardScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const enrollments = useStore((state) => state.enrollments);
  const learningProgress = useStore((state) => state.learningProgress);
  const getEnrollments = useStore((state) => state.getEnrollments);
  const getLearningProgress = useStore((state) => state.getLearningProgress);
  const leaveCourse = useStore((state) => state.leaveCourse);
  const logout = useStore((state) => state.logout);
  const [showConfig, setShowConfig] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === "TEACHER") router.replace("/teacher-dashboard");
  }, [router, user.role]);
  useEffect(() => {
    Promise.all([getEnrollments(), getLearningProgress()]).finally(() =>
      setLoading(false),
    );
  }, [getEnrollments, getLearningProgress]);
  if (user.role === "TEACHER") return null;

  const confirmLeave = (courseId: number) =>
    Alert.alert(
      "Leave Course",
      "Are you sure you want to leave this course? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveCourse(courseId);
              await getLearningProgress();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
    );

  return (
    <PhoneFrame
      overlay={
        <>
          {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}
          <HamburgerMenu
            visible={menuOpen}
            onClose={() => setMenuOpen(false)}
            onNavigate={(route) => router.push(route as any)}
          />
        </>
      }
    >
      <ScrollView style={{ flex: 1, backgroundColor: "transparent" }}>
        <DashboardHeader
          onLogout={() => {
            logout();
            router.replace("/login");
          }}
          onConfig={() => setShowConfig(true)}
          onProfile={() => router.push("/profile")}
          onMenuToggle={() => setMenuOpen(true)}
        />
        <View style={{ padding: 16, gap: 12 }}>
          <WelcomeBanner
            userName={`${user.firstName} ${user.lastName}`}
            xpPoints={user.xpPoints}
            level={user.level}
          />
          <AnimSection delay={200}>
          {loading && (
            <GlassCard style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          )}
          </AnimSection>
          <AnimSection delay={250}>
          {!loading && <DashboardStats progress={learningProgress} />}
          </AnimSection>
          <AnimSection delay={350}>
          {!loading && (
            <EnrollmentList
              enrollments={enrollments}
              onBrowse={() => router.push("/courses")}
              onOpen={(item) =>
                router.push({
                  pathname: "/course-syllabus",
                  params: {
                    courseId: item.course.id,
                    courseTitle: item.course.title,
                    teacherName: item.course.teacherName || "",
                    courseColor: item.course.color,
                  },
                })
              }
              onAskAi={(courseId) =>
                router.push(`/chat?courseId=${courseId}`)
              }
              onQuizzes={(item) =>
                router.push(
                  `/quizzes?courseId=${item.course.id}&courseTitle=${encodeURIComponent(item.course.title)}`,
                )
              }
              onSummaries={(item) =>
                router.push(
                  `/summaries?courseId=${item.course.id}&courseTitle=${encodeURIComponent(item.course.title)}`,
                )
              }
              onLeave={confirmLeave}
            />
          )}
          </AnimSection>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}

function AnimSection({ children, delay }: { children: React.ReactNode; delay: number }) {
  const { opacity, translateY } = useFadeIn(delay, 500);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
