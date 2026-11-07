import { Star } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
}

const REVIEW_TEMPLATES: Record<string, ReviewItem[]> = {
  default: [
    {
      id: 'rev-1',
      author: 'Sarah Lin',
      role: 'Staff Systems Architect',
      rating: 5,
      date: '2 weeks ago',
      comment:
        'The mental models and architectural patterns taught here are incredible. Clean, production-ready code examples without fluff.',
    },
    {
      id: 'rev-2',
      author: 'David Kowalski',
      role: 'Senior Full-Stack Engineer',
      rating: 5,
      date: '1 month ago',
      comment:
        'Finally a course that goes beyond beginner tutorials and tackles real engineering trade-offs. The quizzes reinforced every concept.',
    },
    {
      id: 'rev-3',
      author: 'Amara Okafor',
      role: 'Technical Lead',
      rating: 5,
      date: '1 month ago',
      comment:
        'Outstanding curriculum. Our team integrated several patterns straight into our latest sprint. Worth every minute.',
    },
    {
      id: 'rev-4',
      author: 'Liam Evans',
      role: 'Principal Consultant',
      rating: 4,
      date: '2 months ago',
      comment:
        'Great pacing and deep technical rigor. The synchronized lesson transcripts made reviewing specific concepts effortless.',
    },
  ],
};

export function ReviewsList({
  courseId,
  courseRating,
  ratingsCount,
}: {
  courseId: string;
  courseRating: number;
  ratingsCount: number;
}) {
  const reviews = REVIEW_TEMPLATES[courseId] || REVIEW_TEMPLATES.default;

  return (
    <div className="space-y-6">
      {/* Top Rating Summary */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="text-4xl font-extrabold text-foreground">
            {courseRating.toFixed(1)}
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(courseRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Course rating based on {ratingsCount.toLocaleString()} student reviews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
          <span>98% positive satisfaction rate</span>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-colors"
          >
            <div>
              {/* Reviewer Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {rev.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground leading-tight">
                      {rev.author}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">{rev.role}</p>
                  </div>
                </div>

                <span className="text-[11px] text-muted-foreground">{rev.date}</span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 text-amber-400 my-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < rev.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {/* Comment text */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
