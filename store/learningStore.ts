import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import { courses } from '@/data/courses';
import {
  Note,
  ProgressState,
  QuizAttempt,
} from '@/types/learning';

export interface UserPersistedState {
  displayName: string;
  enrolledCourseIds: string[];
  progress: ProgressState;
  notes: Note[];
  quizAttempts: QuizAttempt[];
  streakDates: string[];
  activityByDate: Record<string, number>;
  celebratedCertificates: string[];
}

export interface LearningState extends UserPersistedState {
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  setDisplayName: (name: string) => void;
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
  seedDemoData: () => void;
  markCertificateCelebrated: (courseId: string) => void;
  setCourseCompletedAt: (courseId: string, completedAt?: string) => void;
}

const inMemoryStorage: Record<string, string> = {};

const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(name);
    } catch {
      return inMemoryStorage[name] ?? null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(name, value);
      }
    } catch {
      inMemoryStorage[name] = value;
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(name);
      }
    } catch {
      delete inMemoryStorage[name];
    }
  },
};

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

      displayName: 'Learner',
      enrolledCourseIds: ['course-nextjs-pro'],
      progress: initialProgress,
      notes: [],
      quizAttempts: [],
      streakDates: [],
      activityByDate: {},
      celebratedCertificates: [],

      setDisplayName: (name: string) => set({ displayName: name.trim() || 'Learner' }),

      markCertificateCelebrated: (courseId: string) =>
        set((state) => ({
          celebratedCertificates: state.celebratedCertificates.includes(courseId)
            ? state.celebratedCertificates
            : [...state.celebratedCertificates, courseId],
        })),

      setCourseCompletedAt: (courseId: string, completedAt = new Date().toISOString()) =>
        set((state) => {
          const currentCourse = state.progress.courses[courseId] || {};
          if (currentCourse.completedAt) return state; // preserve initial completion timestamp
          return {
            progress: {
              ...state.progress,
              courses: {
                ...state.progress.courses,
                [courseId]: {
                  ...currentCourse,
                  completedAt,
                },
              },
            },
          };
        }),

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
        const { streakDates, activityByDate = {} } = get();
        const nextDates = streakDates.includes(today) ? streakDates : [...streakDates, today].sort();
        const nextActivity = {
          ...activityByDate,
          [today]: (activityByDate[today] || 0) + 1,
        };
        set({
          streakDates: nextDates,
          activityByDate: nextActivity,
        });
      },

      resetUserData: () => {
        set({
          displayName: 'Learner',
          enrolledCourseIds: [],
          progress: initialProgress,
          notes: [],
          quizAttempts: [],
          streakDates: [],
          activityByDate: {},
          celebratedCertificates: [],
        });
      },

      seedDemoData: () => {
        const nextCourse = courses.find((c) => c.id === 'course-nextjs-pro');
        const tsCourse = courses.find((c) => c.id === 'course-typescript-mastery');
        const twCourse = courses.find((c) => c.id === 'course-tailwind-design-systems');

        const lessonsState: Record<string, { completed: boolean; lastPositionSec: number }> = {};

        // 1. Fully complete course-nextjs-pro
        if (nextCourse) {
          nextCourse.sections.flatMap((s) => s.lessons).forEach((l) => {
            lessonsState[l.id] = { completed: true, lastPositionSec: l.durationSeconds };
          });
        }

        // 2. In-progress course-typescript-mastery (complete first 2 lessons)
        if (tsCourse) {
          const tsLessons = tsCourse.sections.flatMap((s) => s.lessons);
          if (tsLessons[0]) lessonsState[tsLessons[0].id] = { completed: true, lastPositionSec: tsLessons[0].durationSeconds };
          if (tsLessons[1]) lessonsState[tsLessons[1].id] = { completed: true, lastPositionSec: tsLessons[1].durationSeconds };
          if (tsLessons[2]) lessonsState[tsLessons[2].id] = { completed: false, lastPositionSec: 120 };
        }

        // 3. Perfect quiz attempt for course-nextjs-pro
        const demoQuizAttempt: QuizAttempt = {
          id: 'demo-attempt-1',
          quizId: 'quiz-nextjs-arch',
          courseId: 'course-nextjs-pro',
          scorePercent: 100,
          perQuestionResult: {
            q1: true,
            q2: true,
            q3: true,
          },
          answers: {
            q1: 1,
            q2: [0, 1, 3],
            q3: [
              'HTTP request arrives at Next.js server route',
              'React renders Server Components into RSC payload stream',
              'Next.js streams HTML shell with RSC payload to client',
              'Browser reconciles UI and hydrates Client Components',
            ],
          },
          startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          finishedAt: new Date(Date.now() - 86400000 * 2 + 180000).toISOString(),
          mode: 'full',
        };

        // 4. Streak dates for past 5 days
        const streakDates: string[] = [];
        const activityByDate: Record<string, number> = {};
        for (let i = 4; i >= 0; i--) {
          const d = format(new Date(Date.now() - i * 86400000), 'yyyy-MM-dd');
          streakDates.push(d);
          activityByDate[d] = 2 + (i % 3);
        }

        // 5. Sample note
        const sampleNote: Note = {
          id: 'demo-note-1',
          courseId: 'course-nextjs-pro',
          lessonId: nextCourse?.sections[0]?.lessons[0]?.id || 'les-1',
          timestampSec: 145,
          text: 'Remember: Server Components cannot use hooks like useState or useEffect.',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        };

        set({
          displayName: 'Alex Rivers',
          enrolledCourseIds: [
            'course-nextjs-pro',
            'course-typescript-mastery',
            twCourse ? twCourse.id : 'course-tailwind-design-systems',
          ],
          progress: {
            lessons: lessonsState,
            courses: {
              'course-nextjs-pro': {
                completedAt: new Date(Date.now() - 86400000).toISOString(),
              },
            },
            playbackSpeed: 1.0,
          },
          notes: [sampleNote],
          quizAttempts: [demoQuizAttempt],
          streakDates,
          activityByDate,
          celebratedCertificates: [],
        });
      },
    }),
    {
      name: 'learning-platform',
      version: 3,
      storage: createJSONStorage(() => safeLocalStorage),
      migrate: (persistedState: unknown, version: number) => {
        let state = (persistedState || {}) as Record<string, unknown>;
        if (version < 2) {
          state = {
            ...state,
            displayName: (state.displayName as string) || 'Learner',
            activityByDate: (state.activityByDate as Record<string, number>) || {},
          };
        }
        if (version < 3) {
          state = {
            ...state,
            celebratedCertificates: (state.celebratedCertificates as string[]) || [],
          };
        }
        return state;
      },
      partialize: (state) => ({
        displayName: state.displayName,
        enrolledCourseIds: state.enrolledCourseIds,
        progress: state.progress,
        notes: state.notes,
        quizAttempts: state.quizAttempts,
        streakDates: state.streakDates,
        activityByDate: state.activityByDate,
        celebratedCertificates: state.celebratedCertificates,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
