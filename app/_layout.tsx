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
      </Stack>
    </>
  );
}
