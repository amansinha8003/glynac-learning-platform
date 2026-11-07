import { notFound } from 'next/navigation';
import { courses, quizzes } from '@/data';
import { QuizResultView } from '@/components/quiz/QuizResultView';

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ slug: string; quizId: string; attemptId: string }>;
}) {
  const { slug, quizId, attemptId } = await params;
  const course = courses.find((c) => c.slug === slug);
  const quiz = quizzes.find((q) => q.id === quizId);

  if (!course || !quiz) {
    notFound();
  }

  return (
    <QuizResultView
      course={course}
      quiz={quiz}
      attemptId={attemptId}
    />
  );
}

