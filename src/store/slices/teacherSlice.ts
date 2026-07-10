import { teacherApi } from '../../services/api';
import { withLoading } from './storeHelpers';

export const createTeacherSlice = (set: any) => ({
  getTeacherProfile: () => withLoading(set, async () => (await teacherApi.getProfile()).data, 'Failed to load teacher profile.'),
  updateTeacherProfile: (payload: any) => withLoading(set, async () => {
    const { data } = await teacherApi.updateProfile(payload);
    set((state: any) => ({ user: { ...state.user, firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone } }));
  }, 'Failed to update teacher profile.'),
  getTeacherVerification: () => withLoading(set, async () => (await teacherApi.getVerification()).data, 'Failed to load verification status.'),
  submitTeacherVerification: (documentUrl: string) => withLoading(set, async () => {
    await teacherApi.submitVerification(documentUrl);
  }, 'Failed to submit verification.'),
});
