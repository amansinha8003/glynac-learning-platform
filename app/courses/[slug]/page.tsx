import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { courses, instructors } from '@/data';
import { CourseDetailView } from '@/components/course/CourseDetailView';

export async function generateStaticParams() {
  return courses.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    return {
      title: 'Course Not Found | Glynac Learn',
      description: 'The requested course does not exist in our catalog.',
    };
  }

  return {
    title: `${course.title} | Glynac Learn`,
    description: course.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    notFound();
  }

  const instructor =
    instructors.find((i) => i.id === course.instructorId) || instructors[0];

  const relatedCourses = courses
    .filter((c) => c.category === course.category && c.id !== course.id)
    .slice(0, 3);

  const instructorCourseCount = courses.filter(
    (c) => c.instructorId === instructor.id
  ).length;

  return (
    <CourseDetailView
      course={course}
      instructor={instructor}
      relatedCourses={relatedCourses}
      instructorCourseCount={instructorCourseCount}
    />
  );
}

