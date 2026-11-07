export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseThumbnail {
  gradient: string;
  emoji: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  rating: number;
  studentsCount: number;
}

export interface TranscriptLine {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationSeconds: number;
  videoUrl: string;
  captionsUrl?: string;
  transcript: TranscriptLine[];
  quizId?: string;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: CourseLevel;
  rating: number;
  ratingsCount: number;
  durationMinutes: number;
  thumbnail: CourseThumbnail;
  instructorId: string;
  tags: string[];
  sections: Section[];
  createdAt: string;
  popularity: number;
}

export interface BaseQuestion {
  id: string;
  prompt: string;
  options: string[];
  explanation: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  correctAnswer: number;
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi';
  correctAnswers: number[];
}

export interface OrderQuestion extends BaseQuestion {
  type: 'order';
  correctOrder: string[];
}

export type Question = SingleChoiceQuestion | MultiChoiceQuestion | OrderQuestion;

export interface Quiz {
  id: string;
  title: string;
  timeLimitSeconds?: number;
  passingScorePercent: number;
  questions: Question[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  startedAt: string;
  finishedAt: string;
  answers: Record<string, number | number[] | string[]>;
  scorePercent: number;
  perQuestionResult: Record<string, boolean>;
  mode?: 'full' | 'retry-incorrect';
}

export interface Note {
  id: string;
  courseId: string;
  lessonId: string;
  timestampSec: number;
  text: string;
  createdAt: string;
}

export interface LessonProgress {
  completed: boolean;
  lastPositionSec: number;
}

export interface CourseProgress {
  lastLessonId?: string;
  completedAt?: string;
}

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  courses: Record<string, CourseProgress>;
  playbackSpeed: number;
}

