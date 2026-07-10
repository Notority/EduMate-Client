import { studentApi } from '../../services/api';
import { withLoading } from './storeHelpers';

export const createStudentSlice = (set: any, get: any) => ({
  getEnrollments: () => withLoading(set, async () => {
    const { data } = await studentApi.getEnrollments();
    set({ enrollments: data });
    return data;
  }, 'Failed to load enrollments.'),
  enrollInCourse: (courseId: number) => withLoading(set, async () => {
    await studentApi.enrollInCourse(courseId);
    set({ enrollments: (await studentApi.getEnrollments()).data });
  }, 'Failed to enroll in course'),
  leaveCourse: (courseId: number) => withLoading(set, async () => {
    await studentApi.leaveCourse(courseId);
    set({ enrollments: (await studentApi.getEnrollments()).data });
  }, 'Failed to leave course'),
  getQuizHistory: () => withLoading(set, async () => {
    const { data } = await studentApi.getQuizHistory();
    set({ quizHistory: data });
    return data;
  }, 'Failed to load quiz history.'),
  getLearningProgress: () => withLoading(set, async () => {
    const { data } = await studentApi.getLearningProgress();
    set({ learningProgress: data });
    return data;
  }, 'Failed to load learning progress.'),
  toggleMaterial: async (resourceId: number, courseId: number) => {
    const { data } = await studentApi.toggleMaterialCompletion(resourceId, courseId);
    await get().refreshProfile();
    return data;
  },
});
