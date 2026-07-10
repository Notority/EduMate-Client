import { create } from 'zustand';
import { Course, Enrollment } from '../../types';
import { useStore } from '../useStore';

interface CatalogState {
  loading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  courses: Course[];
  enrollments: Enrollment[];
  setSearchQuery: (value: string) => void;
  setSelectedCategory: (value: string | null) => void;
  loadCatalog: () => Promise<void>;
  enroll: (courseId: number) => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  loading: true,
  searchQuery: '',
  selectedCategory: null,
  courses: [],
  enrollments: [],
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  loadCatalog: async () => {
    const { searchQuery, selectedCategory } = get();
    const filters: any = { published: true };
    if (searchQuery) filters.search = searchQuery;
    if (selectedCategory) filters.category = selectedCategory;
    set({ loading: true });
    const appStore = useStore.getState();
    const [courses, enrollments] = await Promise.all([
      appStore.getAllCourses(filters),
      appStore.getEnrollments(),
    ]);
    set({ courses, enrollments, loading: false });
  },
  enroll: async (courseId) => {
    const appStore = useStore.getState();
    await appStore.enrollInCourse(courseId);
    set({ enrollments: await appStore.getEnrollments() });
  },
}));
