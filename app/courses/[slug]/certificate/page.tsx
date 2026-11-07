import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { courses, instructors, quizzes } from '@/data';
import { CertificateView } from '@/components/certificate/CertificateView';

export async function generateStaticParams() {
  return courses.map((course) => ({
    slug: course.slug,
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
    return { title: 'Certificate Not Found | Glynac Learn' };
  }

  return {
    title: `Certificate - ${course.title} | Glynac Learn`,
    description: `Official verified certificate of completion for ${course.title}.`,
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    notFound();
  }

  const instructor = instructors.find((i) => i.id === course.instructorId);

  return (
    <CertificateView
      course={course}
      instructor={instructor}
      allQuizzes={quizzes}
    />
  );
}
