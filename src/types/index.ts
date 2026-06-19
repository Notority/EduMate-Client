export type ActiveScreen = 'splash' | 'login' | 'register' | 'dashboard';

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AppConfig {
  soundEnabled: boolean;
  loadSpeedMultiplier: number;
  skinColor: 'indigo' | 'midnight' | 'sunset' | 'deepforest';
  glowEnabled: boolean;
  autoProgress: boolean;
}

export interface User {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  role: Role | null;
  xpPoints: number;
  level: number;
  streakDays: number;
  quizzesCompleted: number;
  profilePicture?: string | null;
  phone?: string | null;
  bio?: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  color: string;
  category?: string;
  published?: boolean;
  teacherId?: number;
  teacherName?: string;
  totalModules?: number;
}

export interface Enrollment {
  id: number;
  course: Course;
  enrolledAt: string;
  modulesCompleted: number;
  totalModules: number;
}

export interface QuizAttempt {
  id: number;
  quizTitle: string;
  courseTitle: string;
  score: number;
  attemptedAt: string;
}

export interface LearningProgress {
  totalCoursesEnrolled: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  totalModulesCompleted: number;
  totalModulesAvailable: number;
}

export interface Event {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  time: string;
}
