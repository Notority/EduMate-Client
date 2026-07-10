import { authApi, setAuthToken, userApi } from '../../services/api';
import { User } from '../../types';
import { defaultUser } from './appDefaults';
import { withLoading } from './storeHelpers';

const mapUser = (data: any): User => ({
  id: data.id,
  firstName: data.firstName,
  lastName: data.lastName,
  email: data.email,
  role: data.role,
  xpPoints: data.xpPoints ?? 0,
  level: data.level ?? 1,
  streakDays: 0,
  quizzesCompleted: 0,
  profilePicture: data.profilePicture,
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
});

export const createAuthSlice = (set: any) => ({
  login: (email: string, password: string) => withLoading(set, async () => {
    const { data } = await authApi.login(email, password);
    setAuthToken(data.accessToken);
    set({ user: mapUser(data), quizzesCompleted: 0 });
  }, 'Login failed. Check your credentials.'),
  register: (firstName: string, lastName: string, email: string, password: string) => withLoading(set, async () => {
    const { data } = await authApi.register(firstName, lastName, email, password);
    setAuthToken(data.accessToken);
    set({ user: mapUser(data), quizzesCompleted: 0 });
  }, 'Registration failed. Try again.'),
  logout: () => {
    setAuthToken(null);
    set({ user: defaultUser, quizzesCompleted: 0, error: null });
  },
  refreshProfile: async () => {
    try {
      const { data } = await userApi.getProfile();
      set((state: any) => ({ user: { ...state.user, firstName: data.firstName, lastName: data.lastName, email: data.email, profilePicture: data.profilePicture, xpPoints: data.xpPoints ?? state.user.xpPoints, level: data.level ?? state.user.level } }));
    } catch (error) {
      console.error('Failed to refresh profile', error);
    }
  },
});
