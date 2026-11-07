import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { courses, quizzes } from '@/data';
import { QuizRunner } from '@/components/quiz/QuizRunner';

export async function generateStaticParams() {
  const params: { slug: string; quizId: string }[] = [];
  for (const course of courses) {
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.quizId) {
          params.push({ slug: course.slug, quizId: lesson.quizId });
        }
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}): Promise<Metadata> {
  const { slug, quizId } = await params;
  const course = courses.find((c) => c.slug === slug);
  const quiz = quizzes.find((q) => q.id === quizId);

  if (!course || !quiz) {
    return { title: 'Quiz Not Found | Glynac Learn' };
  }

  return {
    title: `${quiz.title} | ${course.title} | Glynac Learn`,
    description: `Test your skills in the ${course.title} quiz assessment.`,
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const { slug, quizId } = await params;
  const course = courses.find((c) => c.slug === slug);
  const quiz = quizzes.find((q) => q.id === quizId);

  if (!course || !quiz) {
    notFound();
  }

  return <QuizRunner course={course} quiz={quiz} />;
}
