import { Course, Quiz, QuizAttempt } from '@/types/learning';

export interface QuestionTypeAccuracy {
  type: 'single' | 'multi' | 'order';
  label: string;
  total: number;
  correct: number;
  percent: number;
}

export interface ReviewLesson {
  id: string;
  title: string;
  sectionTitle: string;
}

/**
 * Calculates accuracy breakdown grouped by question type (single, multi, order).
 */
export function getAccuracyByType(
  quiz: Quiz,
  perQuestionResult: Record<string, boolean>
): QuestionTypeAccuracy[] {
  const groups: Record<'single' | 'multi' | 'order', { total: number; correct: number }> = {
    single: { total: 0, correct: 0 },
    multi: { total: 0, correct: 0 },
    order: { total: 0, correct: 0 },
  };

  quiz.questions.forEach((q) => {
    const isCorrect = perQuestionResult[q.id] === true;
    if (groups[q.type]) {
      groups[q.type].total += 1;
      if (isCorrect) groups[q.type].correct += 1;
    }
  });

  const labels: Record<'single' | 'multi' | 'order', string> = {
    single: 'Single Choice',
    multi: 'Multi-Select',
    order: 'Drag to Order',
  };

  return (['single', 'multi', 'order'] as const)
    .filter((t) => groups[t].total > 0)
    .map((type) => {
      const g = groups[type];
      const percent = g.total > 0 ? Math.round((g.correct / g.total) * 100) : 0;
      return {
        type,
        label: labels[type],
        total: g.total,
        correct: g.correct,
        percent,
      };
    });
}

/**
 * Identifies lessons to review based on the quiz and missed questions.
 */
export function getReviewLessons(
  course: Course,
  quiz: Quiz,
  perQuestionResult: Record<string, boolean>
): ReviewLesson[] {
  const hasWrongAnswers = Object.values(perQuestionResult).some((v) => v === false);
  if (!hasWrongAnswers) return [];

  const reviewList: ReviewLesson[] = [];

  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      if (lesson.quizId === quiz.id) {
        reviewList.push({
          id: lesson.id,
          title: lesson.title,
          sectionTitle: section.title,
        });
      }
    }
  }

  // If no direct quiz lesson found, recommend the first lesson of the first section
  if (reviewList.length === 0 && course.sections[0]?.lessons[0]) {
    const l = course.sections[0].lessons[0];
    reviewList.push({
      id: l.id,
      title: l.title,
      sectionTitle: course.sections[0].title,
    });
  }

  return reviewList;
}

/**
 * Calculates score delta compared with the previous attempt.
 */
export function getScoreDelta(
  currentAttempt: QuizAttempt,
  previousAttempt?: QuizAttempt
): number | null {
  if (!previousAttempt) return null;
  return currentAttempt.scorePercent - previousAttempt.scorePercent;
}

/**
 * Formats duration between startedAt and finishedAt.
 */
export function formatAttemptDuration(startedAt: string, finishedAt: string): string {
  try {
    const start = new Date(startedAt).getTime();
    const end = new Date(finishedAt).getTime();
    const diffSec = Math.max(0, Math.floor((end - start) / 1000));
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  } catch {
    return '0:00';
  }
}

/**
 * Returns a motivating summary message according to score band.
 */
export function getMotivatingMessage(
  scorePercent: number,
  passingScorePercent: number
): string {
  if (scorePercent === 100) {
    return 'Perfection! You have mastered every single concept in this assessment.';
  }
  if (scorePercent >= passingScorePercent + 15) {
    return 'Superb work! You passed with high distinction and solid conceptual mastery.';
  }
  if (scorePercent >= passingScorePercent) {
    return 'Congratulations! You met the passing benchmark and are ready to continue advancing.';
  }
  if (scorePercent >= passingScorePercent - 15) {
    return 'So close! A quick review of the highlighted lessons will get you across the finish line.';
  }
  return 'Good effort! Review the lesson explanations below and retake the quiz to solidify your understanding.';
}

