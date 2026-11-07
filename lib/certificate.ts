import { Course, Lesson, Quiz, QuizAttempt, ProgressState, Instructor } from '@/types/learning';
import { format } from 'date-fns';

export interface CourseCompletionStatus {
  isComplete: boolean;
  isEnrolled: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
  remainingLessons: Lesson[];
  passedQuizzesCount: number;
  totalQuizzesCount: number;
  unpassedQuizzes: Quiz[];
  completedAt?: string;
}

export interface CertificateData {
  certificateId: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  courseLevel: string;
  instructorName: string;
  instructorTitle: string;
  learnerName: string;
  completedAt: string;
  formattedDate: string;
  totalDurationFormatted: string;
  totalLessons: number;
  averageQuizScore: number;
}

/**
 * Checks whether a course has been 100% completed:
 * 1. User must be enrolled.
 * 2. Every lesson in the course must be marked completed.
 * 3. Every quiz in the course must have at least one passing attempt.
 */
export function isCourseComplete(
  course: Course,
  enrolledCourseIds: string[],
  progress: ProgressState,
  quizAttempts: QuizAttempt[],
  allQuizzes: Quiz[]
): CourseCompletionStatus {
  const isEnrolled = enrolledCourseIds.includes(course.id);
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const totalLessonsCount = allLessons.length;

  const remainingLessons = allLessons.filter(
    (lesson) => !progress.lessons[lesson.id]?.completed
  );
  const completedLessonsCount = totalLessonsCount - remainingLessons.length;

  // Identify all quizzes that belong to this course
  const quizIdSet = new Set(allLessons.map((l) => l.quizId).filter(Boolean) as string[]);
  const courseQuizzes = allQuizzes.filter((q) => quizIdSet.has(q.id));
  const totalQuizzesCount = courseQuizzes.length;

  const unpassedQuizzes = courseQuizzes.filter((quiz) => {
    const hasPassed = quizAttempts.some(
      (att) => att.quizId === quiz.id && att.scorePercent >= quiz.passingScorePercent
    );
    return !hasPassed;
  });

  const passedQuizzesCount = totalQuizzesCount - unpassedQuizzes.length;

  const isComplete =
    isEnrolled &&
    totalLessonsCount > 0 &&
    remainingLessons.length === 0 &&
    unpassedQuizzes.length === 0;

  const completedAt = progress.courses[course.id]?.completedAt;

  return {
    isComplete,
    isEnrolled,
    completedLessonsCount,
    totalLessonsCount,
    remainingLessons,
    passedQuizzesCount,
    totalQuizzesCount,
    unpassedQuizzes,
    completedAt,
  };
}

/**
 * Generates a deterministic certificate ID from course id, learner name, and completion date.
 * Formatted like "CERT-7F3A-92B1".
 */
export function buildCertificateId(
  courseId: string,
  learnerName: string,
  completedAt: string
): string {
  const normalized = `${courseId}:${learnerName.trim().toLowerCase()}:${completedAt}`;
  let hash1 = 5381;
  let hash2 = 52711;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = ((hash2 << 5) + hash2) ^ char;
  }

  const part1 = Math.abs(hash1 % 65536)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
  const part2 = Math.abs(hash2 % 65536)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');

  return `CERT-${part1}-${part2}`;
}

/**
 * Gathers and formats all official certificate metadata for display and printing.
 */
export function getCertificateData(
  course: Course,
  instructor: Instructor | undefined,
  learnerName: string,
  completedAt: string,
  quizAttempts: QuizAttempt[],
  allQuizzes: Quiz[]
): CertificateData {
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const totalSeconds = allLessons.reduce((acc, l) => acc + l.durationSeconds, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalDurationFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Quiz scores across best attempts for quizzes in this course
  const quizIdSet = new Set(allLessons.map((l) => l.quizId).filter(Boolean) as string[]);
  const courseQuizzes = allQuizzes.filter((q) => quizIdSet.has(q.id));

  let averageQuizScore = 100;
  if (courseQuizzes.length > 0) {
    let totalScore = 0;
    courseQuizzes.forEach((q) => {
      const attempts = quizAttempts.filter((a) => a.quizId === q.id);
      const best = attempts.length > 0 ? Math.max(...attempts.map((a) => a.scorePercent)) : 100;
      totalScore += best;
    });
    averageQuizScore = Math.round(totalScore / courseQuizzes.length);
  }

  let formattedDate = 'Recently';
  try {
    formattedDate = format(new Date(completedAt), 'd MMMM yyyy');
  } catch {
    formattedDate = format(new Date(), 'd MMMM yyyy');
  }

  const certificateId = buildCertificateId(course.id, learnerName, completedAt);

  return {
    certificateId,
    courseId: course.id,
    courseTitle: course.title,
    courseCategory: course.category,
    courseLevel: course.level,
    instructorName: instructor?.name || 'Lead Instructor',
    instructorTitle: instructor?.title || 'Course Director',
    learnerName: learnerName.trim() || 'Learner',
    completedAt,
    formattedDate,
    totalDurationFormatted,
    totalLessons: allLessons.length,
    averageQuizScore,
  };
}

