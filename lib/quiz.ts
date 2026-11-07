import { Question, Quiz } from '@/types/learning';

export type QuestionAnswer = number | number[] | string[];

/**
 * Evaluates whether a given user answer for a question is completely correct.
 */
export function scoreQuestion(
  question: Question,
  answer: QuestionAnswer | undefined
): boolean {
  if (answer === undefined || answer === null) return false;

  switch (question.type) {
    case 'single':
      return typeof answer === 'number' && answer === question.correctAnswer;

    case 'multi': {
      if (!Array.isArray(answer)) return false;
      const user = [...(answer as number[])].sort((a, b) => a - b);
      const correct = [...question.correctAnswers].sort((a, b) => a - b);

      if (user.length !== correct.length) return false;
      return user.every((val, idx) => val === correct[idx]);
    }

    case 'order': {
      if (!Array.isArray(answer)) return false;
      if (answer.length !== question.correctOrder.length) return false;
      return answer.every((val, idx) => val === question.correctOrder[idx]);
    }

    default:
      return false;
  }
}

export interface QuizScoringResult {
  scorePercent: number;
  perQuestionResult: Record<string, boolean>;
  correctCount: number;
  totalCount: number;
  isPassed: boolean;
}

/**
 * Scores an entire quiz run across all questions.
 */
export function scoreQuiz(
  quiz: Quiz,
  answers: Record<string, QuestionAnswer>
): QuizScoringResult {
  const perQuestionResult: Record<string, boolean> = {};
  let correctCount = 0;

  for (const question of quiz.questions) {
    const isCorrect = scoreQuestion(question, answers[question.id]);
    perQuestionResult[question.id] = isCorrect;
    if (isCorrect) correctCount++;
  }

  const totalCount = quiz.questions.length;
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isPassed = scorePercent >= quiz.passingScorePercent;

  return {
    scorePercent,
    perQuestionResult,
    correctCount,
    totalCount,
    isPassed,
  };
}

/**
 * Checks if a question has been answered by the user.
 */
export function isAnswered(
  question: Question,
  answer: QuestionAnswer | undefined
): boolean {
  if (answer === undefined || answer === null) return false;

  switch (question.type) {
    case 'single':
      return typeof answer === 'number';

    case 'multi':
      return Array.isArray(answer) && answer.length > 0;

    case 'order':
      return Array.isArray(answer) && answer.length === question.options.length;

    default:
      return false;
  }
}

/**
 * Pure array shuffle with optional simple seed for repeatable order.
 */
export function shuffleOptions<T>(items: T[], seed?: string): T[] {
  const array = [...items];
  if (!seed) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Seeded deterministic pseudo-shuffle
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  for (let i = array.length - 1; i > 0; i--) {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    const j = Math.abs(hash) % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}
