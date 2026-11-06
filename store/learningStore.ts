import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import {
  Note,
  ProgressState,
  QuizAttempt,
} from '@/types/learning';

export interface UserPersistedState {
  enrolledCourseIds: string[];
  progress: ProgressState;
  notes: Note[];
  quizAttempts: QuizAttempt[];
  streakDates: string[];
}

export interface LearningState extends UserPersistedState {
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  enrollCourse: (courseId: string) => void;
  markLessonComplete: (courseId: string, lessonId: string, completed?: boolean) => void;
  setLessonPosition: (courseId: string, lessonId: string, positionSec: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => string;
  updateNote: (noteId: string, text: string) => void;
  deleteNote: (noteId: string) => void;
  saveQuizAttempt: (attempt: Omit<QuizAttempt, 'id'>) => string;
  recordActivity: () => void;
  resetUserData: () => void;
}

const initialProgress: ProgressState = {
  lessons: {},
  courses: {},
  playbackSpeed: 1.0,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      enrolledCourseIds: ['course-nextjs-pro'],
      progress: initialProgress,
      notes: [],
      quizAttempts: [],
      streakDates: [],

      enrollCourse: (courseId: string) => {
        const { enrolledCourseIds, recordActivity } = get();
        if (!enrolledCourseIds.includes(courseId)) {
          set({ enrolledCourseIds: [...enrolledCourseIds, courseId] });
        }
        recordActivity();
      },

      markLessonComplete: (courseId: string, lessonId: string, completed = true) => {
        set((state) => {
          const currentLesson = state.progress.lessons[lessonId] || {
            completed: false,
            lastPositionSec: 0,
          };
          const currentCourse = state.progress.courses[courseId] || {};

          return {
            progress: {
              ...state.progress,
              lessons: {
                ...state.progress.lessons,
                [lessonId]: {
                  ...currentLesson,
                  completed,
                },
              },
              courses: {
                ...state.progress.courses,
                [courseId]: {
                  ...currentCourse,
                  lastLessonId: lessonId,
                },
              },
            },
          };
        });
        get().recordActivity();
      },

      setLessonPosition: (courseId: string, lessonId: string, positionSec: number) => {
        set((state) => {
          const currentLesson = state.progress.lessons[lessonId] || {
            completed: false,
            lastPositionSec: 0,
          };
          const currentCourse = state.progress.courses[courseId] || {};

          return {
            progress: {
              ...state.progress,
              lessons: {
                ...state.progress.lessons,
                [lessonId]: {
                  ...currentLesson,
                  lastPositionSec: Math.max(0, Math.floor(positionSec)),
                },
              },
              courses: {
                ...state.progress.courses,
                [courseId]: {
                  ...currentCourse,
                  lastLessonId: lessonId,
                },
              },
            },
          };
        });
      },

      setPlaybackSpeed: (speed: number) => {
        set((state) => ({
          progress: {
            ...state.progress,
            playbackSpeed: speed,
          },
        }));
      },

      addNote: (noteData) => {
        const id = nanoid();
        const newNote: Note = {
          ...noteData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
        get().recordActivity();
        return id;
      },

      updateNote: (noteId: string, text: string) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === noteId ? { ...n, text } : n)),
        }));
      },

      deleteNote: (noteId: string) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== noteId),
        }));
      },

      saveQuizAttempt: (attemptData) => {
        const id = nanoid();
        const newAttempt: QuizAttempt = {
          ...attemptData,
          id,
        };

        set((state) => ({
          quizAttempts: [newAttempt, ...state.quizAttempts],
        }));
        get().recordActivity();
        return id;
      },

      recordActivity: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { streakDates } = get();
        if (!streakDates.includes(today)) {
          set({ streakDates: [...streakDates, today].sort() });
        }
      },

      resetUserData: () => {
        set({
          enrolledCourseIds: [],
          progress: initialProgress,
          notes: [],
          quizAttempts: [],
          streakDates: [],
        });
      },
    }),
    {
      name: 'learning-platform',
      partialize: (state) => ({
        enrolledCourseIds: state.enrolledCourseIds,
        progress: state.progress,
        notes: state.notes,
        quizAttempts: state.quizAttempts,
        streakDates: state.streakDates,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

