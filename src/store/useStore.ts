import { create } from 'zustand';
import { AppConfig, User, Course, Event, Enrollment, QuizAttempt, LearningProgress } from '../types';
import { authApi, userApi, teacherApi, courseApi, studentApi, setAuthToken } from '../services/api';

interface AppState {
  config: AppConfig;
  user: User;
  quizzesCompleted: number;
  courses: Course[];
  myCourses: Course[];
  events: Event[];
  enrollments: Enrollment[];
  quizHistory: QuizAttempt[];
  learningProgress: LearningProgress | null;
  isLoading: boolean;
  error: string | null;

  updateConfig: (p: Partial<AppConfig>) => void;
  setUser: (u: Partial<User>) => void;
  setQuizzesCompleted: (n: number) => void;
  addXp: (a: number) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (firstName: string, lastName: string, email: string, profilePicture: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  getActivities: () => Promise<any[]>;
  deleteAccount: () => Promise<void>;
  
  // Teacher functions
  getTeacherProfile: () => Promise<any>;
  updateTeacherProfile: (data: any) => Promise<void>;
  getTeacherVerification: () => Promise<any>;
  submitTeacherVerification: (documentUrl: string) => Promise<void>;
  getMyCourses: () => Promise<Course[]>;
  createCourse: (data: any) => Promise<void>;
  updateCourse: (id: number, data: any) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  togglePublishCourse: (id: number) => Promise<void>;
  
  // Student functions
  getAllCourses: () => Promise<Course[]>;
  getEnrollments: () => Promise<Enrollment[]>;
  enrollInCourse: (courseId: number) => Promise<void>;
  getQuizHistory: () => Promise<QuizAttempt[]>;
  getLearningProgress: () => Promise<LearningProgress>;
}

const defaultConfig: AppConfig = {
  soundEnabled: true, loadSpeedMultiplier: 1.0,
  skinColor: 'midnight', glowEnabled: true, autoProgress: true,
};

const defaultUser: User = {
  id: null, firstName: '', lastName: '',
  email: '', role: null,
  xpPoints: 0, level: 1, streakDays: 0, quizzesCompleted: 0,
  profilePicture: null,
  accessToken: null, refreshToken: null,
};

export const useStore = create<AppState>((set) => ({
  config: defaultConfig,
  user: defaultUser,
  quizzesCompleted: 0,
  courses: [],
  myCourses: [],
  events: [
    { id: 1, tag: 'LIVE CLASS', tagColor: '#ff4da6', title: 'System Design Basics', time: 'Today, 5:00 PM' },
    { id: 2, tag: 'CHALLENGE', tagColor: '#ffba27', title: 'Database Normalization', time: 'Tomorrow, 10:00 AM' },
  ],
  enrollments: [],
  quizHistory: [],
  learningProgress: null,
  isLoading: false,
  error: null,

  updateConfig: (p) => set((s) => ({ config: { ...s.config, ...p } })),
  setUser: (u) => set((s) => ({ user: { ...s.user, ...u } })),
  setQuizzesCompleted: (n) => set((s) => ({ user: { ...s.user, quizzesCompleted: n }, quizzesCompleted: n })),
  addXp: (a) => set((s) => ({ user: { ...s.user, xpPoints: s.user.xpPoints + a } })),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      const d = res.data;
      const user: User = {
        id: d.id, firstName: d.firstName, lastName: d.lastName,
        email: d.email, role: d.role,
        xpPoints: 0, level: 1, streakDays: 0, quizzesCompleted: 0,
        profilePicture: d.profilePicture,
        accessToken: d.accessToken, refreshToken: d.refreshToken,
      };
      setAuthToken(d.accessToken);
      set({ user, quizzesCompleted: 0, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (firstName, lastName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(firstName, lastName, email, password);
      const d = res.data;
      const user: User = {
        id: d.id, firstName: d.firstName, lastName: d.lastName,
        email: d.email, role: d.role,
        xpPoints: 50, level: 1, streakDays: 0, quizzesCompleted: 0,
        profilePicture: d.profilePicture,
        accessToken: d.accessToken, refreshToken: d.refreshToken,
      };
      setAuthToken(d.accessToken);
      set({ user, quizzesCompleted: 0, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ user: defaultUser, quizzesCompleted: 0, error: null });
  },

  updateProfile: async (firstName, lastName, email, profilePicture) => {
    set({ isLoading: true, error: null });
    try {
      const res = await userApi.updateProfile(firstName, lastName, email, profilePicture);
      const d = res.data;
      set((s) => ({
        user: {
          ...s.user,
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          profilePicture: d.profilePicture,
        },
        isLoading: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.changePassword(oldPassword, newPassword);
      set({ isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  getActivities: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await userApi.getActivities();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load activities.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await userApi.deleteAccount();
      setAuthToken(null);
      set({ user: defaultUser, quizzesCompleted: 0, error: null, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete account.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  getTeacherProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await teacherApi.getProfile();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load teacher profile.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateTeacherProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await teacherApi.updateProfile(data);
      const d = res.data;
      set((s) => ({
        user: {
          ...s.user,
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          phone: d.phone,
        },
        isLoading: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update teacher profile.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  getTeacherVerification: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await teacherApi.getVerification();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load verification status.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  submitTeacherVerification: async (documentUrl) => {
    set({ isLoading: true, error: null });
    try {
      await teacherApi.submitVerification(documentUrl);
      set({ isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit verification.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  getMyCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await courseApi.getMyCourses();
      set({ myCourses: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load courses.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  createCourse: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await courseApi.createCourse(data);
      const res = await courseApi.getMyCourses();
      set({ myCourses: res.data, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create course.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateCourse: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await courseApi.updateCourse(id, data);
      const res = await courseApi.getMyCourses();
      set({ myCourses: res.data, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update course.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteCourse: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await courseApi.deleteCourse(id);
      const res = await courseApi.getMyCourses();
      set({ myCourses: res.data, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete course.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  togglePublishCourse: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await courseApi.togglePublish(id);
      const res = await courseApi.getMyCourses();
      set({ myCourses: res.data, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update course status.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
  
  // Student functions
  getAllCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await studentApi.getAllCourses();
      set({ courses: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load courses.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  getEnrollments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await studentApi.getEnrollments();
      set({ enrollments: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load enrollments.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  enrollInCourse: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      await studentApi.enrollInCourse(courseId);
      const res = await studentApi.getEnrollments();
      set({ enrollments: res.data, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to enroll in course.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  getQuizHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await studentApi.getQuizHistory();
      set({ quizHistory: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load quiz history.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  getLearningProgress: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await studentApi.getLearningProgress();
      set({ learningProgress: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load learning progress.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
}));
