import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    let msg = "Connection failed. Make sure the backend server is running.";
    if (data) {
      if (typeof data === "string") msg = data;
      else if (data.message) msg = data.message;
      else if (data.error) msg = data.error;
    }
    err.message = msg;
    return Promise.reject(err);
  },
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => api.post("/auth/register", { firstName, lastName, email, password }),
};

export const userApi = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (
    firstName: string,
    lastName: string,
    email: string,
    profilePicture: string,
  ) =>
    api.patch("/user/profile", { firstName, lastName, email, profilePicture }),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post("/user/change-password", { oldPassword, newPassword }),
  getActivities: () => api.get("/user/activities"),
  deleteAccount: () => api.delete("/user"),
};

export const teacherApi = {
  getProfile: () => api.get("/teachers/profile"),
  updateProfile: (data: any) => api.put("/teachers/profile", data),
  getVerification: () => api.get("/teachers/verification"),
  submitVerification: (documentUrl: string) =>
    api.post("/teachers/verification/submit", { documentUrl }),
  getPublicProfile: (id: number) => api.get(`/teachers/public/${id}`),
};

export const courseApi = {
  getMyCourses: () => api.get("/courses/my-courses"),
  getAllCourses: (filters?: {
    search?: string;
    category?: string;
    published?: boolean;
  }) => api.get("/courses", { params: filters }),
  getCourseById: (id: number) => api.get(`/courses/${id}`),
  createCourse: (data: any) => api.post("/courses", data),
  updateCourse: (id: number, data: any) => api.put(`/courses/${id}`, data),
  deleteCourse: (id: number) => api.delete(`/courses/${id}`),
  togglePublish: (id: number) => api.patch(`/courses/${id}/toggle-publish`),
};

export const studentApi = {
  getAllCourses: () => api.get("/students/courses"),
  getEnrollments: () => api.get("/students/enrollments"),
  enrollInCourse: (courseId: number) =>
    api.post(`/students/enroll/${courseId}`),
  leaveCourse: (courseId: number) => api.delete(`/students/enroll/${courseId}`),
  getQuizHistory: () => api.get("/students/quiz-history"),
  getLearningProgress: () => api.get("/students/progress"),
  getCourseMaterials: (courseId: number) =>
    api.get(`/students/courses/${courseId}/materials`),
  toggleMaterialCompletion: (resourceId: number, courseId: number) =>
    api.post(
      `/students/do-toggle?resourceId=${resourceId}&courseId=${courseId}`,
    ),
  getMaterialProgress: (courseId: number) =>
    api.get(`/students/courses/${courseId}/materials/progress`),
};

export const resourceApi = {
  upload: (formData: FormData) =>
    api.post("/resources/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: () => api.get("/resources"),
  getByCourse: (courseId: number) => api.get(`/resources/course/${courseId}`),
  getById: (id: number) => api.get(`/resources/${id}`),
  delete: (id: number) => api.delete(`/resources/${id}`),
  getCount: () => api.get("/resources/count"),
};

export const chatApi = {
  getSessions: (courseId?: number) =>
    api.get("/chat/sessions", { params: courseId ? { courseId } : {} }),
  createSession: (courseId: number, title?: string) =>
    api.post("/chat/sessions", { courseId, title }),
  deleteSession: (id: number) => api.delete(`/chat/sessions/${id}`),
  getMessages: (sessionId: number) =>
    api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: number, message: string) =>
    api.post(`/chat/sessions/${sessionId}/messages`, { message }),
};

export const summaryApi = {
  generate: (courseId: number, type: string) =>
    api.post("/summaries/generate", { courseId, type }),
  getByCourse: (courseId: number) =>
    api.get("/summaries", { params: { courseId } }),
  getById: (id: number) => api.get(`/summaries/${id}`),
  delete: (id: number) => api.delete(`/summaries/${id}`),
};

export const quizApi = {
  generate: (courseId: number, type: string) =>
    api.post("/quizzes/generate", { courseId, type }),
  getByCourse: (courseId: number) =>
    api.get("/quizzes", { params: { courseId } }),
  getById: (id: number) => api.get(`/quizzes/${id}`),
  getQuestions: (id: number) => api.get(`/quizzes/${id}/questions`),
  delete: (id: number) => api.delete(`/quizzes/${id}`),
};

export const examApi = {
  create: (data: {
    title: string;
    instructions?: string;
    courseId: number;
    scheduledAt?: string;
    duration?: number;
    totalPoints?: number;
  }) => api.post("/exams", data),
  getTeacherExams: (courseId?: number) =>
    api.get("/exams/teacher", { params: courseId ? { courseId } : {} }),
  getCourseExams: (courseId: number) => api.get(`/exams/course/${courseId}`),
  getAvailable: (courseId: number) =>
    api.get("/exams/available", { params: { courseId } }),
  getById: (id: number) => api.get(`/exams/${id}`),
  update: (id: number, data: any) => api.put(`/exams/${id}`, data),
  delete: (id: number) => api.delete(`/exams/${id}`),
  addQuestion: (
    examId: number,
    data: {
      questionText: string;
      options?: string;
      correctAnswer: string;
      points?: number;
      orderIndex?: number;
      feedback?: string;
    },
  ) => api.post(`/exams/${examId}/questions`, data),
  getQuestions: (examId: number) => api.get(`/exams/${examId}/questions`),
  updateQuestion: (examId: number, questionId: number, data: any) =>
    api.put(`/exams/${examId}/questions/${questionId}`, data),
  deleteQuestion: (examId: number, questionId: number) =>
    api.delete(`/exams/${examId}/questions/${questionId}`),
  start: (examId: number) => api.post(`/exams/${examId}/start`),
  submit: (
    examId: number,
    data: { answers: { questionId: number; answerText: string }[] },
  ) => api.post(`/exams/${examId}/submit`, data),
  getSubmission: (examId: number) => api.get(`/exams/${examId}/submission`),
  getMySubmissions: () => api.get("/exams/submissions"),
  getSubmissionAnswers: (submissionId: number) =>
    api.get(`/exams/submissions/${submissionId}/answers`),
  getExamSubmissions: (examId: number) =>
    api.get(`/exams/${examId}/submissions`),
  gradeSubmission: (
    submissionId: number,
    data: {
      questions?: { questionId: number; pointsAwarded: number }[];
      teacherNotes?: string;
    },
  ) => api.put(`/exams/submissions/${submissionId}/grade`, data),
  publishGrades: (examId: number) =>
    api.post(`/exams/${examId}/publish-grades`),
};

export const assignmentApi = {
  create: (data: {
    title: string;
    description?: string;
    courseId: number;
    dueDate?: string;
    totalPoints?: number;
  }) => api.post("/assignments", data),
  getTeacherAssignments: (courseId?: number) =>
    api.get("/assignments/teacher", { params: courseId ? { courseId } : {} }),
  getCourseAssignments: (courseId: number) =>
    api.get(`/assignments/course/${courseId}`),
  getOpen: (courseId: number) =>
    api.get("/assignments/open", { params: { courseId } }),
  getById: (id: number) => api.get(`/assignments/${id}`),
  update: (id: number, data: any) => api.put(`/assignments/${id}`, data),
  delete: (id: number) => api.delete(`/assignments/${id}`),
  submit: (assignmentId: number, formData: FormData) =>
    api.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getSubmission: (assignmentId: number) =>
    api.get(`/assignments/${assignmentId}/submission`),
  getSubmissions: (assignmentId: number) =>
    api.get(`/assignments/${assignmentId}/submissions`),
  getMySubmissions: () => api.get("/assignments/submissions"),
  grade: (
    submissionId: number,
    data: { score: number; teacherNotes?: string },
  ) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
};

export const liveSessionApi = {
  create: (data: { title: string; description?: string; courseId: number; meetingUrl: string; streamUrl?: string; streamKey?: string; playbackUrl?: string; scheduledAt?: string; duration?: number }) =>
    api.post('/live-sessions', data),
  getTeacherSessions: (courseId?: number) =>
    api.get('/live-sessions/teacher', { params: courseId ? { courseId } : {} }),
  getCourseSessions: (courseId: number) =>
    api.get(`/live-sessions/course/${courseId}`),
  getUpcoming: (courseId: number) =>
    api.get('/live-sessions/upcoming', { params: { courseId } }),
  getById: (id: number) =>
    api.get(`/live-sessions/${id}`),
  update: (id: number, data: any) =>
    api.put(`/live-sessions/${id}`, data),
  delete: (id: number) =>
    api.delete(`/live-sessions/${id}`),
  start: (id: number) =>
    api.post(`/live-sessions/${id}/start`),
  end: (id: number) =>
    api.post(`/live-sessions/${id}/end`),
  join: (sessionId: number) =>
    api.post(`/live-sessions/${sessionId}/join`),
  leave: (sessionId: number) =>
    api.post(`/live-sessions/${sessionId}/leave`),
  getAttendance: (sessionId: number) =>
    api.get(`/live-sessions/${sessionId}/attendance`),
  getMyAttendance: (sessionId: number) =>
    api.get(`/live-sessions/${sessionId}/my-attendance`),
};

export const privateCourseApi = {
  getOffers: () => api.get("/private-courses/offers"),
  getTeacherPrivateCourses: () => api.get("/private-courses/teacher"),
  sendEnquiry: (data: { courseId: number; message: string }) =>
    api.post("/private-courses/enquiries", data),
  getMyEnquiries: () => api.get("/private-courses/enquiries/mine"),
  getTeacherEnquiries: () => api.get("/private-courses/enquiries/teacher"),
  respondToEnquiry: (id: number, decision: "APPROVED" | "REJECTED") =>
    api.post(`/private-courses/enquiries/${id}/respond`, { decision }),
  getEarnings: () => api.get("/private-courses/earnings"),
  getTotalEarnings: () => api.get("/private-courses/earnings/total"),
};

export const progressApi = {
  getLearningProgress: () => api.get("/students/progress"),
  getCourseProgress: (courseId: number) =>
    api.get(`/students/courses/${courseId}/progress`),
  startStudySession: (courseId: number) =>
    api.post("/students/study/start", { courseId }),
  endStudySession: (sessionId: number) =>
    api.put(`/students/study/${sessionId}/end`),
  getStudySessions: () => api.get("/students/study/sessions"),
};

export const plannerApi = {
  getGoals: () => api.get("/planner/goals"),
  createGoal: (data: {
    title: string; description?: string; targetHoursPerWeek?: number;
    startDate: string; endDate?: string; courseId?: number;
  }) => api.post("/planner/goals", data),
  updateGoalStatus: (id: number, status: string) =>
    api.patch(`/planner/goals/${id}/status`, { status }),
  deleteGoal: (id: number) => api.delete(`/planner/goals/${id}`),

  getExams: () => api.get("/planner/exams"),
  createExam: (data: {
    title: string; courseId?: number; examDate: string; weight?: string; notes?: string;
  }) => api.post("/planner/exams", data),
  deleteExam: (id: number) => api.delete(`/planner/exams/${id}`),

  getTasks: (startDate?: string, endDate?: string) =>
    api.get("/planner/tasks", { params: { startDate, endDate } }),
  getDailyTasks: (date: string) => api.get("/planner/tasks/daily", { params: { date } }),
  createTask: (data: {
    title: string; description?: string; courseId?: number; studyGoalId?: number;
    taskDate: string; durationMinutes?: number; category?: string;
  }) => api.post("/planner/tasks", data),
  toggleTask: (id: number) => api.patch(`/planner/tasks/${id}/toggle`),
  deleteTask: (id: number) => api.delete(`/planner/tasks/${id}`),

  generateSchedule: (goalId: number) =>
    api.post(`/planner/goals/${goalId}/generate`),
  getWeeklyPlan: (weekStart: string) =>
    api.get("/planner/weekly", { params: { weekStart } }),
};

export const searchApi = {
  global: (q: string) => api.get("/search", { params: { q } }),
  courses: (q: string) => api.get("/search/courses", { params: { q } }),
  resources: (q: string) => api.get("/search/resources", { params: { q } }),
  teachers: (q: string) => api.get("/search/teachers", { params: { q } }),
};

export const recommendationApi = {
  getRecommended: () => api.get("/recommendations/courses"),
  getTrending: () => api.get("/recommendations/trending"),
};

export default api;
