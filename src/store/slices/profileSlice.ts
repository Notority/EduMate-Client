import { userApi } from '../../services/api';
import { defaultUser } from './appDefaults';
import { withLoading } from './storeHelpers';

export const createProfileSlice = (set: any) => ({
  updateProfile: (firstName: string, lastName: string, email: string, profilePicture: string) => withLoading(set, async () => {
    const { data } = await userApi.updateProfile(firstName, lastName, email, profilePicture);
    set((state: any) => ({ user: { ...state.user, firstName: data.firstName, lastName: data.lastName, email: data.email, profilePicture: data.profilePicture } }));
  }, 'Failed to update profile.'),
  changePassword: (oldPassword: string, newPassword: string) => withLoading(set, async () => {
    await userApi.changePassword(oldPassword, newPassword);
  }, 'Failed to change password.'),
  getActivities: () => withLoading(set, async () => (await userApi.getActivities()).data, 'Failed to load activities.'),
  deleteAccount: () => withLoading(set, async () => {
    await userApi.deleteAccount();
    set({ user: defaultUser, quizzesCompleted: 0, error: null });
  }, 'Failed to delete account.'),
});
