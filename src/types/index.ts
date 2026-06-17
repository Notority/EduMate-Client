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
  accessToken: string | null;
  refreshToken: string | null;
}

export interface Course {
  id: number;
  title: string;
  subtitle: string;
  progress: number;
  color: string;
}

export interface Event {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  time: string;
}
