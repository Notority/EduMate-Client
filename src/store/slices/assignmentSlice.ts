import { create } from 'zustand';
import { assignmentApi } from '../../services/api';
import { Assignment, AssignmentSubmission } from '../../types';

interface AssignmentState {
  assignments: Assignment[];
  submissions: Record<number, AssignmentSubmission>;
  assignmentDetails: Record<number, Assignment>;
  loading: boolean;
  loadAssignments: (courseId: number) => Promise<void>;
  loadAssignment: (assignmentId: number) => Promise<Assignment | null>;
  submitAssignment: (assignmentId: number, formData: FormData) => Promise<AssignmentSubmission>;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [], submissions: {}, assignmentDetails: {}, loading: false,
  loadAssignments: async (courseId) => {
    set({ loading: true });
    try {
      const [assignRes, subsRes] = await Promise.all([
        assignmentApi.getOpen(courseId),
        assignmentApi.getMySubmissions().catch(() => ({ data: [] })),
      ]);
      const submissions = Object.fromEntries((subsRes.data as AssignmentSubmission[]).map((item) => [item.assignmentId, item]));
      set({ assignments: assignRes.data, submissions, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  loadAssignment: async (assignmentId) => {
    const cached = get().assignmentDetails[assignmentId];
    if (cached) return cached;
    set({ loading: true });
    try {
      const [assignmentRes, submissionRes] = await Promise.all([
        assignmentApi.getById(assignmentId),
        assignmentApi.getSubmission(assignmentId).catch(() => null),
      ]);
      set((state) => ({
        assignmentDetails: { ...state.assignmentDetails, [assignmentId]: assignmentRes.data },
        submissions: submissionRes?.data ? { ...state.submissions, [assignmentId]: submissionRes.data } : state.submissions,
        loading: false,
      }));
      return assignmentRes.data;
    } catch (error) {
      set({ loading: false });
      return null;
    }
  },
  submitAssignment: async (assignmentId, formData) => {
    const response = await assignmentApi.submit(assignmentId, formData);
    set((state) => ({ submissions: { ...state.submissions, [assignmentId]: response.data } }));
    return response.data;
  },
}));
