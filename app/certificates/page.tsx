import { Metadata } from 'next';
import { courses, quizzes } from '@/data';
import { AllCertificatesView } from '@/components/certificate/AllCertificatesView';

export const metadata: Metadata = {
  title: 'Earned Certificates | Glynac Learn',
  description: 'View and print all of your official course completion certificates.',
};

export default function CertificatesPage() {
  return <AllCertificatesView courses={courses} allQuizzes={quizzes} />;
}

