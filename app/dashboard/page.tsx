import { Metadata } from 'next';
import { courses, quizzes } from '@/data';
import { DashboardView } from '@/components/dashboard/DashboardView';

export const metadata: Metadata = {
  title: 'Progress Dashboard | Glynac Learn',
  description: 'Track your enrolled courses, lesson progress, streak activity, and assessment scores.',
};

export default function DashboardPage() {
  return <DashboardView courses={courses} quizzes={quizzes} />;
}

