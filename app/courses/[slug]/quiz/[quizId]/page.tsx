import Link from 'next/link';
import { notFound } from 'next/navigation';
import { courses, quizzes } from '@/data';
import { HelpCircle, ArrowLeft, Clock, Award, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

export default async function QuizPlaceholderPage({
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
      <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-6 shadow-sm">
        <HelpCircle className="h-8 w-8" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Checkpoint Assessment</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
        {quiz.title}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
        Test your mastery of key concepts covered in this module.
      </p>

      {/* Quiz metadata pills */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground my-6">
        <Badge variant="secondary" className="gap-1 font-medium">
          <HelpCircle className="h-3.5 w-3.5" />
          {quiz.questions.length} questions
        </Badge>
        {quiz.timeLimitSeconds && (
          <Badge variant="secondary" className="gap-1 font-medium">
            <Clock className="h-3.5 w-3.5" />
            {Math.round(quiz.timeLimitSeconds / 60)} min limit
          </Badge>
        )}
        <Badge variant="secondary" className="gap-1 font-medium">
          <Award className="h-3.5 w-3.5" />
          {quiz.passingScorePercent}% passing score
        </Badge>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-8 max-w-md mx-auto mb-8">
        <h4 className="font-semibold text-sm text-foreground">Interactive Quiz Runner</h4>
        <p className="text-xs text-muted-foreground mt-1">
          The full multi-choice, drag-and-drop ordering quiz engine will be activated in the next step.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button asChild variant="outline" className="gap-2 text-xs font-semibold">
          <Link href={`/courses/${course.slug}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
        </Button>
      </div>
    </div>
  );
}

