import { courseApi, studentApi } from '../../services/api';
import { withLoading } from './storeHelpers';

export const createCourseSlice = (set: any) => ({
  getMyCourses: () => withLoading(set, async () => {
    const { data } = await courseApi.getMyCourses();
    set({ myCourses: data });
    return data;
  }, 'Failed to load courses.'),
  createCourse: (payload: any) => withLoading(set, async () => {
    await courseApi.createCourse(payload);
    set({ myCourses: (await courseApi.getMyCourses()).data });
  }, 'Failed to create course.'),
  updateCourse: (id: number, payload: any) => withLoading(set, async () => {
    await courseApi.updateCourse(id, payload);
    set({ myCourses: (await courseApi.getMyCourses()).data });
  }, 'Failed to update course.'),
  deleteCourse: (id: number) => withLoading(set, async () => {
    await courseApi.deleteCourse(id);
    set({ myCourses: (await courseApi.getMyCourses()).data });
  }, 'Failed to delete course.'),
  togglePublishCourse: (id: number) => withLoading(set, async () => {
    await courseApi.togglePublish(id);
    set({ myCourses: (await courseApi.getMyCourses()).data });
  }, 'Failed to update course status.'),
  getAllCourses: (_filters?: any) => withLoading(set, async () => {
    const { data } = await studentApi.getAllCourses();
    set({ courses: data });
    return data;
  }, 'Failed to load courses.'),
});
