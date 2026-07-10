export interface SearchResultItem {
  id: number;
  type: "course" | "resource" | "teacher";
  title: string;
  description?: string;
  matchField?: string;
  url?: string;
  subtitle?: string;
  imageUrl?: string;
  color?: string;
  category?: string;
  courseId?: number;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  courses: SearchResultItem[];
  resources: SearchResultItem[];
  teachers: SearchResultItem[];
}

export interface CourseRecommendation {
  courseId: number;
  title: string;
  description?: string;
  color: string;
  category?: string;
  teacherName: string;
  reason: string;
  score: number;
}

export type ActiveScreen = "splash" | "login" | "register" | "dashboard";

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface AppConfig {
  soundEnabled: boolean;
  loadSpeedMultiplier: number;
  skinColor: "indigo" | "midnight" | "sunset" | "deepforest" | "light" | "neon";
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
  phone?: string | null;
  bio?: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  color: string;
  category?: string;
  published?: boolean;
  teacherId?: number;
  teacherName?: string;
  totalModules?: number;
  isPrivate?: boolean;
  price?: number;
  approvalRequired?: boolean;
}

export interface Enrollment {
  id: number;
  course: Course;
  enrolledAt: string;
  modulesCompleted: number;
  totalModules: number;
  materialsCompleted: number;
  totalMaterials: number;
}

export interface QuizAttempt {
  id: number;
  quizTitle: string;
  courseTitle: string;
  score: number;
  attemptedAt: string;
}

export interface LearningProgress {
  totalCoursesEnrolled: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  totalModulesCompleted: number;
  totalModulesAvailable: number;
  totalStudyTimeMinutes: number;
  completedCourses: number;
  currentStreak: number;
  quizzesByCourse: number;
}

export interface Event {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  time: string;
}

export interface MaterialProgress {
  id: number;
  studentId: number;
  resourceId: number;
  courseId: number;
  completed: boolean;
  completedAt: string | null;
}

export interface Summary {
  id: number;
  courseId: number;
  userId: number;
  type: "SHORT" | "DETAILED" | "CHAPTER" | "EXAM";
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: number;
  userId: number;
  courseId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  options: string;
  correctAnswer: string;
  explanation: string;
  createdAt: string;
}

export interface Quiz {
  id: number;
  courseId: number;
  userId: number;
  title: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  questionCount: number;
  createdAt: string;
}

export type ExamStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "COMPLETED";
export type SubmissionStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";

export interface Exam {
  id: number;
  title: string;
  instructions?: string;
  courseId: number;
  teacherId: number;
  scheduledAt?: string;
  duration: number;
  totalPoints: number;
  status: ExamStatus;
  questionCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ExamQuestion {
  id: number;
  examId: number;
  questionText: string;
  options?: string;
  correctAnswer: string;
  points: number;
  orderIndex: number;
  feedback?: string;
  createdAt: string;
}

export interface ExamSubmission {
  id: number;
  examId: number;
  studentId: number;
  studentName?: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  status: SubmissionStatus;
  remainingSeconds?: number;
  gradedAt?: string;
  teacherNotes?: string;
  isAutoGraded?: boolean;
}

export interface ExamAnswer {
  id: number;
  submissionId: number;
  questionId: number;
  questionText?: string;
  options?: string;
  correctAnswer?: string;
  feedback?: string;
  answerText?: string;
  points?: number;
  pointsAwarded?: number;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  teacherId: number;
  dueDate?: string;
  totalPoints: number;
  status: string;
  submissionCount: number;
  gradedCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  submittedAt: string;
  score?: number;
  status: string;
  gradedAt?: string;
  teacherNotes?: string;
}

export interface Resource {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  publicId: string;
  userId: number;
  userFullName: string;
  courseId: number | null;
  uploadedAt: string;
}

export interface LiveSession {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  teacherId: number;
  meetingUrl: string;
  streamUrl?: string;
  streamKey?: string;
  playbackUrl?: string;
  recordingUrl?: string;
  scheduledAt?: string;
  duration: number;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  startedAt?: string;
  endedAt?: string;
  attendeeCount: number;
  createdAt: string;
}

export interface SessionAttendance {
  id: number;
  sessionId: number;
  studentId: number;
  studentName?: string;
  joinedAt?: string;
  leftAt?: string;
  duration: number;
  status: string;
}

export type EnquiryStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CourseEnquiry {
  id: number;
  courseId: number;
  courseTitle: string;
  studentId: number;
  studentName: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface TeacherEarning {
  id: number;
  courseId: number;
  courseTitle: string;
  amount: number;
  source: string;
  createdAt: string;
}

export interface StudySession {
  id: number;
  courseId: number;
  courseTitle: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
}

export interface CourseProgress {
  courseId: number;
  courseTitle: string;
  courseColor: string;
  teacherName: string;
  syllabusCompleted: boolean;
  modulesCompleted: number;
  totalModules: number;
  materialsCompleted: number;
  totalMaterials: number;
  averageQuizScore: number;
  quizzesCompleted: number;
  totalStudyTimeMinutes: number;
  overallProgressPercent: number;
}

export interface StudyGoal {
  id: number;
  courseId?: number;
  courseTitle?: string;
  courseColor?: string;
  title: string;
  description?: string;
  targetHoursPerWeek?: number;
  startDate: string;
  endDate?: string;
  status: string;
  createdAt: string;
}

export interface ExamSchedule {
  id: number;
  courseId?: number;
  courseTitle?: string;
  title: string;
  examDate: string;
  weight?: string;
  notes?: string;
  createdAt: string;
}

export interface StudyTask {
  id: number;
  courseId?: number;
  courseTitle?: string;
  courseColor?: string;
  studyGoalId?: number;
  title: string;
  description?: string;
  taskDate: string;
  startTime?: string;
  durationMinutes?: number;
  completed: boolean;
  category?: string;
  createdAt: string;
}

export interface WeeklyPlan {
  weekStart: string;
  weekEnd: string;
  tasks: StudyTask[];
  totalMinutes: number;
  completedTasks: number;
  totalTasks: number;
}
