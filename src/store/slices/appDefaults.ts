import { AppConfig, Event, User } from '../../types';

export const defaultConfig: AppConfig = {
  soundEnabled: true,
  loadSpeedMultiplier: 1,
  skinColor: 'midnight',
  glowEnabled: true,
  autoProgress: true,
};

export const defaultUser: User = {
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  role: null,
  xpPoints: 0,
  level: 1,
  streakDays: 0,
  quizzesCompleted: 0,
  profilePicture: null,
  accessToken: null,
  refreshToken: null,
};

export const defaultEvents: Event[] = [
  { id: 1, tag: 'LIVE CLASS', tagColor: '#ff4da6', title: 'System Design Basics', time: 'Today, 5:00 PM' },
  { id: 2, tag: 'CHALLENGE', tagColor: '#ffba27', title: 'Database Normalization', time: 'Tomorrow, 10:00 AM' },
];
