import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="teacher-dashboard" />
        <Stack.Screen name="teacher-verification" />
        <Stack.Screen name="teacher-profile" />
        <Stack.Screen name="teacher-courses" />
        <Stack.Screen name="teacher-course-edit" />
        <Stack.Screen name="courses" />
        <Stack.Screen name="quiz-history" />
        <Stack.Screen name="resources" />
        <Stack.Screen name="summaries" />
        <Stack.Screen name="quizzes" />
        <Stack.Screen name="course-syllabus" />
        <Stack.Screen name="exams" />
        <Stack.Screen name="exam/[id]" />
        <Stack.Screen name="teacher-exams" />
        <Stack.Screen name="teacher-grade-exam" />
        <Stack.Screen name="teacher-assignments" />
        <Stack.Screen name="teacher-grade-assignment" />
        <Stack.Screen name="assignments" />
        <Stack.Screen name="assignment/[id]" />
        <Stack.Screen name="chat/index" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="teacher-live-sessions" />
        <Stack.Screen name="teacher-live-session-detail" />
        <Stack.Screen name="live-sessions" />
        <Stack.Screen name="jitsi-meet" />
        <Stack.Screen name="stream-player" />
        <Stack.Screen name="private-offers" />
        <Stack.Screen name="teacher-private-courses" />
        <Stack.Screen name="teacher-earnings" />
        <Stack.Screen name="progress-dashboard" />
        <Stack.Screen name="study-planner" />
        <Stack.Screen name="global-search" />
        <Stack.Screen name="suggested-courses" />
      </Stack>
    </>
  );
}
