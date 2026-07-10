import { create } from "zustand";
import {
  AppConfig,
  Course,
  Enrollment,
  Event,
  LearningProgress,
  MaterialProgress,
  QuizAttempt,
  Resource,
  User,
} from "../types";
import { createAuthSlice } from "./slices/authSlice";
import { createCourseSlice } from "./slices/courseSlice";
import {
  defaultConfig,
  defaultEvents,
  defaultUser,
} from "./slices/appDefaults";
import { createProfileSlice } from "./slices/profileSlice";
import { createResourceSlice } from "./slices/resourceSlice";
import { createStudentSlice } from "./slices/studentSlice";
import { createTeacherSlice } from "./slices/teacherSlice";

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
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  updateConfig: (payload: Partial<AppConfig>) => void;
  setUser: (payload: Partial<User>) => void;
  setQuizzesCompleted: (count: number) => void;
  addXp: (amount: number) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (
    firstName: string,
    lastName: string,
    email: string,
    profilePicture: string,
  ) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  getActivities: () => Promise<any[]>;
  deleteAccount: () => Promise<void>;
  getTeacherProfile: () => Promise<any>;
  updateTeacherProfile: (data: any) => Promise<void>;
  getTeacherVerification: () => Promise<any>;
  submitTeacherVerification: (documentUrl: string) => Promise<void>;
  getMyCourses: () => Promise<Course[]>;
  createCourse: (data: any) => Promise<void>;
  updateCourse: (id: number, data: any) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  togglePublishCourse: (id: number) => Promise<void>;
  getAllCourses: (filters?: {
    search?: string;
    category?: string;
    published?: boolean;
  }) => Promise<Course[]>;
  getEnrollments: () => Promise<Enrollment[]>;
  enrollInCourse: (courseId: number) => Promise<void>;
  leaveCourse: (courseId: number) => Promise<void>;
  getQuizHistory: () => Promise<QuizAttempt[]>;
  getLearningProgress: () => Promise<LearningProgress>;
  refreshProfile: () => Promise<void>;
  toggleMaterial: (
    resourceId: number,
    courseId: number,
  ) => Promise<MaterialProgress>;
  uploadResource: (
    fileUri: string,
    fileName: string,
    fileType: string,
    courseId?: number,
  ) => Promise<void>;
  getResources: () => Promise<Resource[]>;
  deleteResource: (id: number) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  config: defaultConfig,
  user: defaultUser,
  quizzesCompleted: 0,
  courses: [],
  myCourses: [],
  events: defaultEvents,
  enrollments: [],
  quizHistory: [],
  learningProgress: null,
  resources: [],
  isLoading: false,
  error: null,
  updateConfig: (payload) =>
    set((state) => ({ config: { ...state.config, ...payload } })),
  setUser: (payload) =>
    set((state) => ({ user: { ...state.user, ...payload } })),
  setQuizzesCompleted: (count) =>
    set((state) => ({
      user: { ...state.user, quizzesCompleted: count },
      quizzesCompleted: count,
    })),
  addXp: (amount) =>
    set((state) => {
      const xpPoints = state.user.xpPoints + amount;
      return {
        user: {
          ...state.user,
          xpPoints,
          level: Math.floor(xpPoints / 100) + 1,
        },
      };
    }),
  ...createAuthSlice(set),
  ...createProfileSlice(set),
  ...createTeacherSlice(set),
  ...createCourseSlice(set),
  ...createStudentSlice(set, get),
  ...createResourceSlice(set),
}));
