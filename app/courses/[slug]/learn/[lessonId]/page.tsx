import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { courses } from '@/data';
import { LessonClientView } from '@/components/lesson/LessonClientView';

export async function generateStaticParams() {
  const params: { slug: string; lessonId: string }[] = [];
  for (const course of courses) {
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        params.push({ slug: course.slug, lessonId: lesson.id });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { slug, lessonId } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) {
    return { title: 'Lesson Not Found | Glynac Learn' };
  }

  const lesson = course.sections
    .flatMap((s) => s.lessons)
    .find((l) => l.id === lessonId);

  if (!lesson) {
    return { title: 'Lesson Not Found | Glynac Learn' };
  }

  return {
    title: `${lesson.title} | ${course.title} | Glynac Learn`,
    description: `Watch ${lesson.title} in the ${course.title} curriculum.`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    notFound();
  }

  const section = course.sections.find((s) =>
    s.lessons.some((l) => l.id === lessonId)
  );

  const lesson = section?.lessons.find((l) => l.id === lessonId);

  if (!section || !lesson) {
    notFound();
  }

  // Determine previous and next lessons
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : undefined;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : undefined;

  return (
    <LessonClientView
      course={course}
      section={section}
      lesson={lesson}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
