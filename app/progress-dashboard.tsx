import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { GlassCard } from "../src/components/GlassCard";
import { useStore } from "../src/store/useStore";
import { colors } from "../src/constants/theme";
import { Button } from "../src/ui/Button";
import { progressApi, studentApi } from "../src/services/api";
import type { LearningProgress, CourseProgress, Enrollment, QuizAttempt } from "../src/types";

export default function ProgressDashboardScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [progRes, enrollRes, quizRes] = await Promise.all([
        progressApi.getLearningProgress(),
        studentApi.getEnrollments(),
        studentApi.getQuizHistory(),
      ]);
      setProgress(progRes.data);
      setEnrollments(enrollRes.data);
      setQuizHistory(quizRes.data);

      const cps = await Promise.all(
        enrollRes.data.map((e: Enrollment) =>
          progressApi.getCourseProgress(e.course.id).then((r) => r.data)
        )
      );
      setCourseProgress(cps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader
          onLogout={() => { logout(); router.replace("/login"); }}
          onProfile={() => router.push("/profile")}
        />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.white }}>
            Progress Dashboard
          </Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : (
            <>
              <GlassCard style={{ padding: 20, gap: 16 }}>
                <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>
                  Overall Stats
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  <StatBox label="Enrolled" value={`${progress?.totalCoursesEnrolled || 0}`} color={colors.primary} />
                  <StatBox label="Completed" value={`${progress?.completedCourses || 0}`} color={colors.emerald} />
                  <StatBox label="Avg Score" value={`${(progress?.averageScore || 0).toFixed(1)}%`} color={colors.tertiary} />
                  <StatBox label="Quizzes" value={`${progress?.totalQuizzesCompleted || 0}`} color={colors.secondary} />
                  <StatBox label="Courses Quizzed" value={`${progress?.quizzesByCourse || 0}`} color="#a78bfa" />
                  <StatBox label="Study Time" value={formatTime(progress?.totalStudyTimeMinutes || 0)} color="#67e8f9" />
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1, alignItems: "center", padding: 12, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Modules</Text>
                    <Text style={{ color: colors.emerald, fontSize: 22, fontWeight: "800" }}>
                      {progress?.totalModulesCompleted || 0}/{progress?.totalModulesAvailable || 0}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: "center", padding: 12, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                    <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Streak</Text>
                    <Text style={{ color: colors.tertiary, fontSize: 22, fontWeight: "800" }}>
                      {progress?.currentStreak || 0} days
                    </Text>
                  </View>
                </View>
              </GlassCard>

              {courseProgress.length > 0 && (
                <>
                  <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}>
                    Course Details
                  </Text>
                  {courseProgress.map((cp) => (
                    <GlassCard key={cp.courseId} style={{ padding: 16, gap: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: cp.courseColor }} />
                        <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700", flex: 1 }}>
                          {cp.courseTitle}
                        </Text>
                        <Text style={{ color: colors.emerald, fontSize: 18, fontWeight: "800" }}>
                          {cp.overallProgressPercent.toFixed(0)}%
                        </Text>
                      </View>
                      <View style={{ height: 8, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                        <View style={{ height: "100%", width: `${Math.min(cp.overallProgressPercent, 100)}%`, backgroundColor: cp.courseColor, borderRadius: 4 }} />
                      </View>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                        <Chip label={`Materials: ${cp.materialsCompleted}/${cp.totalMaterials}`} />
                        <Chip label={`Modules: ${cp.modulesCompleted}/${cp.totalModules}`} />
                        <Chip label={`Quiz Avg: ${cp.averageQuizScore.toFixed(1)}%`} />
                        <Chip label={`Study: ${formatTime(cp.totalStudyTimeMinutes)}`} />
                        {cp.syllabusCompleted && <Chip label="Completed" color="#4ade80" />}
                      </View>
                    </GlassCard>
                  ))}
                </>
              )}

              {quizHistory.length > 0 && (
                <>
                  <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700", marginTop: 8 }}>
                    Recent Quiz Scores
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: -16, paddingLeft: 16 }}>
                    <View style={{ flexDirection: "row", gap: 8, paddingRight: 16 }}>
                      {quizHistory.slice(0, 10).map((q) => (
                        <GlassCard key={q.id} style={{ padding: 12, minWidth: 120, alignItems: "center" }}>
                          <Text style={{ color: q.score >= 70 ? colors.emerald : q.score >= 40 ? colors.tertiary : "#fca5a5", fontSize: 24, fontWeight: "800" }}>
                            {q.score}%
                          </Text>
                          <Text style={{ color: colors.surfaceVariant, fontSize: 10, textAlign: "center", marginTop: 4 }} numberOfLines={2}>
                            {q.quizTitle}
                          </Text>
                          <Text style={{ color: colors.surfaceVariant, fontSize: 9, marginTop: 2 }}>
                            {new Date(q.attemptedAt).toLocaleDateString()}
                          </Text>
                        </GlassCard>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {enrollments.length === 0 && (
                <GlassCard style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: colors.surfaceVariant, fontSize: 14 }}>
                    Enroll in courses to start tracking your progress.
                  </Text>
                  <Button
                    title="Browse Courses"
                    onPress={() => router.push("/courses")}
                    variant="primary"
                    style={{ marginTop: 12 }}
                  />
                </GlassCard>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, minWidth: "30%", alignItems: "center", padding: 10, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
      <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>{label}</Text>
      <Text style={{ color, fontSize: 20, fontWeight: "800" }}>{value}</Text>
    </View>
  );
}

function Chip({ label, color: chipColor }: { label: string; color?: string }) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)" }}>
      <Text style={{ color: chipColor || colors.surfaceVariant, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
