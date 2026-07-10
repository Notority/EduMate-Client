import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, Modal, TextInput, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { DashboardHeader } from "../src/components/DashboardHeader";
import { GlassCard } from "../src/components/GlassCard";
import { useStore } from "../src/store/useStore";
import { colors } from "../src/constants/theme";
import { Button } from "../src/ui/Button";
import { plannerApi, courseApi } from "../src/services/api";
import type { StudyGoal, ExamSchedule, StudyTask, WeeklyPlan, Course } from "../src/types";

export default function StudyPlannerScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [goalHours, setGoalHours] = useState("");
  const [goalCourseId, setGoalCourseId] = useState<number | undefined>();
  const [goalStart, setGoalStart] = useState("");
  const [goalEnd, setGoalEnd] = useState("");

  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examWeight, setExamWeight] = useState("");
  const [examCourseId, setExamCourseId] = useState<number | undefined>();

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskDuration, setTaskDuration] = useState("");
  const [taskCategory, setTaskCategory] = useState("READING");

  const getWeekStart = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset * 7);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
  };

  const loadData = async () => {
    try {
      const [goalsRes, examsRes, coursesRes] = await Promise.all([
        plannerApi.getGoals(),
        plannerApi.getExams(),
        courseApi.getAllCourses(),
      ]);
      setGoals(goalsRes.data);
      setExams(examsRes.data);
      setCourses(coursesRes.data);
      const ws = getWeekStart(weekOffset);
      const planRes = await plannerApi.getWeeklyPlan(ws);
      setWeeklyPlan(planRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [weekOffset]));

  const handleCreateGoal = async () => {
    if (!goalTitle.trim() || !goalStart.trim()) { Alert.alert("Error", "Title and start date required"); return; }
    try {
      await plannerApi.createGoal({
        title: goalTitle.trim(), description: goalDesc.trim() || undefined,
        targetHoursPerWeek: goalHours ? parseFloat(goalHours) : undefined,
        startDate: goalStart.trim(), endDate: goalEnd.trim() || undefined,
        courseId: goalCourseId,
      });
      setShowGoalModal(false); resetGoalForm(); loadData();
    } catch (err: any) { Alert.alert("Error", err.message); }
  };

  const handleCreateExam = async () => {
    if (!examTitle.trim() || !examDate.trim()) { Alert.alert("Error", "Title and date required"); return; }
    try {
      await plannerApi.createExam({
        title: examTitle.trim(), examDate: examDate.trim(),
        weight: examWeight.trim() || undefined, courseId: examCourseId,
      });
      setShowExamModal(false); resetExamForm(); loadData();
    } catch (err: any) { Alert.alert("Error", err.message); }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !taskDate.trim()) { Alert.alert("Error", "Title and date required"); return; }
    try {
      await plannerApi.createTask({
        title: taskTitle.trim(), description: taskDesc.trim() || undefined,
        taskDate: taskDate.trim(), durationMinutes: taskDuration ? parseInt(taskDuration) : undefined,
        category: taskCategory,
      });
      setShowTaskModal(false); resetTaskForm(); loadData();
    } catch (err: any) { Alert.alert("Error", err.message); }
  };

  const handleGenerate = async (goalId: number) => {
    try {
      await plannerApi.generateSchedule(goalId);
      Alert.alert("Done", "Schedule generated! Check your weekly plan.");
      loadData();
    } catch (err: any) { Alert.alert("Error", err.message); }
  };

  const handleToggleTask = async (taskId: number) => {
    try { await plannerApi.toggleTask(taskId); loadData(); }
    catch (err: any) { Alert.alert("Error", err.message); }
  };

  const handleDeleteGoal = (id: number) => {
    Alert.alert("Delete Goal", "Sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await plannerApi.deleteGoal(id); loadData(); } catch (err: any) { Alert.alert("Error", err.message); }
      }},
    ]);
  };

  const resetGoalForm = () => { setGoalTitle(""); setGoalDesc(""); setGoalHours(""); setGoalCourseId(undefined); setGoalStart(""); setGoalEnd(""); };
  const resetExamForm = () => { setExamTitle(""); setExamDate(""); setExamWeight(""); setExamCourseId(undefined); };
  const resetTaskForm = () => { setTaskTitle(""); setTaskDesc(""); setTaskDate(""); setTaskDuration(""); setTaskCategory("READING"); };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: "#0d0714" }}>
        <DashboardHeader
          onLogout={() => { logout(); router.replace("/login"); }}
          onProfile={() => router.push("/profile")}
        />
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: colors.white }}>Study Planner</Text>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Button title="Goal" variant="ghost" onPress={() => setShowGoalModal(true)} />
              <Button title="Exam" variant="ghost" onPress={() => setShowExamModal(true)} />
              <Button title="Task" variant="ghost" onPress={() => setShowTaskModal(true)} />
            </View>
          </View>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : (
            <>
              {/* WEEKLY PLAN */}
              <GlassCard style={{ padding: 16, gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Button title="<" variant="ghost" onPress={() => setWeekOffset(w => w - 1)} />
                  <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}>
                    {weeklyPlan?.weekStart || ""} — {weeklyPlan?.weekEnd || ""}
                  </Text>
                  <Button title=">" variant="ghost" onPress={() => setWeekOffset(w => w + 1)} />
                </View>
                {weeklyPlan && (
                  <>
                    <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
                      <Chip label={`${weeklyPlan.totalTasks} tasks`} />
                      <Chip label={`${weeklyPlan.completedTasks} done`} color="#4ade80" />
                      <Chip label={`${Math.round(weeklyPlan.totalMinutes / 60 * 10) / 10}h planned`} color="#67e8f9" />
                    </View>
                    {weeklyPlan.tasks.length === 0 ? (
                      <Text style={{ color: colors.surfaceVariant, fontSize: 13, textAlign: "center", marginTop: 4 }}>
                        No tasks this week. Create a goal and generate a schedule!
                      </Text>
                    ) : (
                      weeklyPlan.tasks.map((t) => (
                        <TouchableOpacity key={t.id} onPress={() => handleToggleTask(t.id)}
                          style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" }}>
                          <View style={{
                            width: 18, height: 18, borderRadius: 9, borderWidth: 2,
                            borderColor: t.completed ? "#4ade80" : colors.surfaceVariant,
                            backgroundColor: t.completed ? "#4ade80" : "transparent",
                            alignItems: "center", justifyContent: "center",
                          }}>
                            {t.completed && <Text style={{ color: "#000", fontSize: 11, fontWeight: "800" }}>✓</Text>}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.white, fontSize: 13, fontWeight: "600", textDecorationLine: t.completed ? "line-through" : "none", textDecorationColor: colors.surfaceVariant }}>
                              {t.title}
                            </Text>
                            <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>
                              {t.taskDate} {t.durationMinutes ? `· ${t.durationMinutes}min` : ""} {t.category ? `· ${t.category}` : ""}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </>
                )}
              </GlassCard>

              {/* STUDY GOALS */}
              <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}>
                Study Goals ({goals.length})
              </Text>
              {goals.length === 0 ? (
                <GlassCard style={{ padding: 16, alignItems: "center" }}>
                  <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>No goals yet. Create one!</Text>
                </GlassCard>
              ) : goals.map((g) => (
                <GlassCard key={g.id} style={{ padding: 12, gap: 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: colors.white, fontWeight: "700", fontSize: 14, flex: 1 }}>{g.title}</Text>
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
                      backgroundColor: g.status === "ACTIVE" ? "rgba(34,197,94,0.15)" : "rgba(250,204,21,0.15)",
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: g.status === "ACTIVE" ? "#4ade80" : "#facc15" }}>
                        {g.status}
                      </Text>
                    </View>
                  </View>
                  {g.courseTitle && <Text style={{ color: colors.primaryLight, fontSize: 12 }}>{g.courseTitle}</Text>}
                  {g.targetHoursPerWeek && <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>{g.targetHoursPerWeek}h/week</Text>}
                  <Text style={{ color: colors.surfaceVariant, fontSize: 11 }}>{g.startDate} → {g.endDate || "ongoing"}</Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                    <Button title="Generate Schedule" variant="primary" onPress={() => handleGenerate(g.id)} style={{ flex: 1 }} />
                    <Button title="Delete" variant="danger" onPress={() => handleDeleteGoal(g.id)} />
                  </View>
                </GlassCard>
              ))}

              {/* EXAM DATES */}
              <Text style={{ color: colors.white, fontSize: 16, fontWeight: "700", marginTop: 8 }}>
                Exam Dates ({exams.length})
              </Text>
              {exams.length === 0 ? (
                <GlassCard style={{ padding: 16, alignItems: "center" }}>
                  <Text style={{ color: colors.surfaceVariant, fontSize: 13 }}>No exams scheduled.</Text>
                </GlassCard>
              ) : exams.map((e) => (
                <GlassCard key={e.id} style={{ padding: 12, gap: 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: colors.white, fontWeight: "700", fontSize: 14 }}>{e.title}</Text>
                    <Text style={{ color: colors.secondary, fontWeight: "700", fontSize: 14 }}>{e.examDate}</Text>
                  </View>
                  {e.courseTitle && <Text style={{ color: colors.primaryLight, fontSize: 12 }}>{e.courseTitle}</Text>}
                  {e.weight && <Text style={{ color: colors.surfaceVariant, fontSize: 12 }}>Weight: {e.weight}</Text>}
                </GlassCard>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* CREATE GOAL MODAL */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}>
          <GlassCard style={{ padding: 20, gap: 12 }}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>New Study Goal</Text>
            <Input placeholder="Title" value={goalTitle} onChangeText={setGoalTitle} />
            <Input placeholder="Description (optional)" value={goalDesc} onChangeText={setGoalDesc} multiline />
            <Input placeholder="Target hours/week" value={goalHours} onChangeText={setGoalHours} keyboardType="numeric" />
            <Input placeholder="Start date (YYYY-MM-DD)" value={goalStart} onChangeText={setGoalStart} />
            <Input placeholder="End date (YYYY-MM-DD, optional)" value={goalEnd} onChangeText={setGoalEnd} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Cancel" variant="ghost" onPress={() => { setShowGoalModal(false); resetGoalForm(); }} style={{ flex: 1 }} />
              <Button title="Create" onPress={handleCreateGoal} style={{ flex: 1 }} />
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* CREATE EXAM MODAL */}
      <Modal visible={showExamModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}>
          <GlassCard style={{ padding: 20, gap: 12 }}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>New Exam Date</Text>
            <Input placeholder="Exam title" value={examTitle} onChangeText={setExamTitle} />
            <Input placeholder="Date (YYYY-MM-DD)" value={examDate} onChangeText={setExamDate} />
            <Input placeholder="Weight (e.g. Final 60%)" value={examWeight} onChangeText={setExamWeight} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Cancel" variant="ghost" onPress={() => { setShowExamModal(false); resetExamForm(); }} style={{ flex: 1 }} />
              <Button title="Create" onPress={handleCreateExam} style={{ flex: 1 }} />
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* CREATE TASK MODAL */}
      <Modal visible={showTaskModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}>
          <GlassCard style={{ padding: 20, gap: 12 }}>
            <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>New Task</Text>
            <Input placeholder="Task title" value={taskTitle} onChangeText={setTaskTitle} />
            <Input placeholder="Description" value={taskDesc} onChangeText={setTaskDesc} />
            <Input placeholder="Date (YYYY-MM-DD)" value={taskDate} onChangeText={setTaskDate} />
            <Input placeholder="Duration (minutes)" value={taskDuration} onChangeText={setTaskDuration} keyboardType="numeric" />
            <Input placeholder="Category (READING/PRACTICE/REVIEW)" value={taskCategory} onChangeText={setTaskCategory} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Cancel" variant="ghost" onPress={() => { setShowTaskModal(false); resetTaskForm(); }} style={{ flex: 1 }} />
              <Button title="Create" onPress={handleCreateTask} style={{ flex: 1 }} />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </PhoneFrame>
  );
}

function Input({ placeholder, value, onChangeText, multiline, keyboardType }: any) {
  return (
    <TextInput
      style={{
        backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12,
        color: colors.white, fontSize: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
        minHeight: multiline ? 60 : undefined, textAlignVertical: multiline ? "top" : undefined,
      }}
      placeholder={placeholder} placeholderTextColor={colors.surfaceVariant}
      value={value} onChangeText={onChangeText} multiline={multiline} keyboardType={keyboardType || "default"}
    />
  );
}

function Chip({ label, color: chipColor }: { label: string; color?: string }) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)" }}>
      <Text style={{ color: chipColor || colors.surfaceVariant, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
