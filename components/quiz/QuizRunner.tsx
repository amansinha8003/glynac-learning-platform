'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Course, Quiz } from '@/types/learning';
import {
  scoreQuiz,
  scoreQuestion,
  isAnswered,
  shuffleOptions,
  QuestionAnswer,
} from '@/lib/quiz';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { getBestAttempt } from '@/lib/selectors';
import { QuizHeader } from './QuizHeader';
import { QuestionSingle } from './QuestionSingle';
import { QuestionMulti } from './QuestionMulti';
import { QuestionOrder } from './QuestionOrder';
import { FeedbackPanel } from './FeedbackPanel';
import { QuestionNavigator } from './QuestionNavigator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Play,
  HelpCircle,
  Clock,
  Award,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface QuizRunnerProps {
  course: Course;
  quiz: Quiz;
}

type QuizPhase = 'intro' | 'running' | 'submitting';

interface QuizSessionData {
  startedAt: string;
  startedAtTimestamp: number;
  currentIndex: number;
  answers: Record<string, QuestionAnswer>;
  checkedQuestions: Record<string, boolean>;
  orderState: Record<string, string[]>;
}

function getSavedSession(key: string): QuizSessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    // Storage fallback
  }
  return null;
}

export function QuizRunner({ course, quiz }: QuizRunnerProps) {
  const router = useRouter();
  const isHydrated = useHydrated();

  // Store
  const saveQuizAttempt = useLearningStore((s) => s.saveQuizAttempt);
  const recordActivity = useLearningStore((s) => s.recordActivity);
  const quizAttempts = useLearningStore((s) => s.quizAttempts);
  const hasStoreHydrated = useLearningStore((s) => s.hasHydrated);

  const sessionKey = `glynac_quiz_session_${quiz.id}`;

  // Restore in-progress session lazily without cascading effect sets
  const initialSession = useMemo(() => getSavedSession(sessionKey), [sessionKey]);

  // State
  const [phase, setPhase] = useState<QuizPhase>(() =>
    initialSession ? 'running' : 'intro'
  );
  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    initialSession?.currentIndex ?? 0
  );
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>(() =>
    initialSession?.answers ?? {}
  );
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>(() =>
    initialSession?.checkedQuestions ?? {}
  );
  const [orderState, setOrderState] = useState<Record<string, string[]>>(() =>
    initialSession?.orderState ?? {}
  );
  const [startedAt, setStartedAt] = useState<string>(() =>
    initialSession?.startedAt ?? ''
  );
  const [startedAtTimestamp, setStartedAtTimestamp] = useState<number>(() =>
    initialSession?.startedAtTimestamp ?? 0
  );

  // Dialogs
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [timeUpAlert, setTimeUpAlert] = useState(false);

  // Previous best attempt from store
  const bestAttempt = useMemo(() => {
    if (!isHydrated || !hasStoreHydrated) return undefined;
    return getBestAttempt(quizAttempts, quiz.id);
  }, [quizAttempts, quiz.id, isHydrated, hasStoreHydrated]);

  // Persist session while running
  const saveSession = useCallback(
    (updates: Partial<QuizSessionData>) => {
      try {
        const sessionData: QuizSessionData = {
          startedAt,
          startedAtTimestamp,
          currentIndex,
          answers,
          checkedQuestions,
          orderState,
          ...updates,
        };
        sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
      } catch {
        // Storage fallback
      }
    },
    [sessionKey, startedAt, startedAtTimestamp, currentIndex, answers, checkedQuestions, orderState]
  );

  // Beforeunload warning while running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === 'running') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase]);

  // Initialize order state for drag-to-order questions
  const initializeOrderQuestions = useCallback(() => {
    const initialOrders: Record<string, string[]> = {};
    quiz.questions.forEach((q) => {
      if (q.type === 'order') {
        initialOrders[q.id] = shuffleOptions(q.options, `${quiz.id}-${q.id}`);
      }
    });
    return initialOrders;
  }, [quiz]);

  // Start Quiz
  const handleStartQuiz = () => {
    const nowIso = new Date().toISOString();
    const nowTs = Date.now();
    const initialOrders = initializeOrderQuestions();

    setStartedAt(nowIso);
    setStartedAtTimestamp(nowTs);
    setAnswers(initialOrders);
    setOrderState(initialOrders);
    setCheckedQuestions({});
    setCurrentIndex(0);
    setPhase('running');

    saveSession({
      startedAt: nowIso,
      startedAtTimestamp: nowTs,
      answers: initialOrders,
      orderState: initialOrders,
      checkedQuestions: {},
      currentIndex: 0,
    });
  };

  // Leave Quiz
  const handleLeaveQuiz = () => {
    sessionStorage.removeItem(sessionKey);
    setPhase('intro');
    router.push(`/courses/${course.slug}`);
  };

  // Active question
  const currentQuestion = quiz.questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];
  const isCurrentChecked = checkedQuestions[currentQuestion?.id] === true;
  const isCurrentCorrect = isCurrentChecked
    ? scoreQuestion(currentQuestion, currentAnswer)
    : false;

  // Answer handler for single choice
  const handleSingleSelect = (optionIndex: number) => {
    if (checkedQuestions[currentQuestion?.id]) return;
    setAnswers((prev) => {
      const next = { ...prev, [currentQuestion.id]: optionIndex };
      saveSession({ answers: next });
      return next;
    });
  };

  // Answer handler for multi select
  const handleMultiToggle = (optionIndex: number) => {
    if (checkedQuestions[currentQuestion?.id]) return;
    setAnswers((prev) => {
      const currentList = (prev[currentQuestion.id] as number[]) || [];
      const nextList = currentList.includes(optionIndex)
        ? currentList.filter((idx) => idx !== optionIndex)
        : [...currentList, optionIndex].sort((a, b) => a - b);

      const next = { ...prev, [currentQuestion.id]: nextList };
      saveSession({ answers: next });
      return next;
    });
  };

  // Answer handler for drag order
  const handleOrderReorder = (newItems: string[]) => {
    if (isCurrentChecked) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: newItems };
    const nextOrders = { ...orderState, [currentQuestion.id]: newItems };
    setAnswers(nextAnswers);
    setOrderState(nextOrders);
    saveSession({ answers: nextAnswers, orderState: nextOrders });
  };

  // Check Answer for current question
  const handleCheckAnswer = () => {
    if (!isAnswered(currentQuestion, currentAnswer)) return;
    const nextChecked = { ...checkedQuestions, [currentQuestion.id]: true };
    setCheckedQuestions(nextChecked);
    saveSession({ checkedQuestions: nextChecked });
  };

  // Navigate to Question
  const handleNavigateQuestion = (index: number) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentIndex(index);
      saveSession({ currentIndex: index });
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      handleNavigateQuestion(currentIndex + 1);
    }
  };

  // Finish Submission logic
  const submitQuiz = useCallback(() => {
    setPhase('submitting');
    sessionStorage.removeItem(sessionKey);

    const scoring = scoreQuiz(quiz, answers);

    const attemptId = saveQuizAttempt({
      quizId: quiz.id,
      courseId: course.id,
      startedAt: startedAt || new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      answers,
      scorePercent: scoring.scorePercent,
      perQuestionResult: scoring.perQuestionResult,
    });

    recordActivity();
    router.push(`/courses/${course.slug}/quiz/${quiz.id}/result/${attemptId}`);
  }, [sessionKey, quiz, answers, saveQuizAttempt, course.id, startedAt, recordActivity, router, course.slug]);

  // Finish button click
  const handleFinishQuizClick = () => {
    const unansweredCount = quiz.questions.filter(
      (q) => !isAnswered(q, answers[q.id])
    ).length;

    if (unansweredCount > 0) {
      setIsFinishConfirmOpen(true);
    } else {
      submitQuiz();
    }
  };

  // Auto-submit on time up
  const handleTimeUp = useCallback(() => {
    setTimeUpAlert(true);
    setTimeout(() => {
      submitQuiz();
    }, 1500);
  }, [submitQuiz]);

  // Sets for QuestionNavigator
  const answeredIndices = useMemo(() => {
    const set = new Set<number>();
    quiz.questions.forEach((q, idx) => {
      if (isAnswered(q, answers[q.id])) {
        set.add(idx);
      }
    });
    return set;
  }, [quiz.questions, answers]);

  const checkedIndices = useMemo(() => {
    const set = new Set<number>();
    quiz.questions.forEach((q, idx) => {
      if (checkedQuestions[q.id]) {
        set.add(idx);
      }
    });
    return set;
  }, [quiz.questions, checkedQuestions]);

  // Ref to hold keyboard action handlers to avoid dependency recreation
  const runnerActionsRef = useRef({
    handleSingleSelect,
    handleMultiToggle,
    handleCheckAnswer,
    handleNextQuestion,
    handleFinishQuizClick,
    currentQuestion,
    isCurrentChecked,
    currentAnswer,
    currentIndex,
    totalQuestions: quiz.questions.length,
  });

  useEffect(() => {
    runnerActionsRef.current = {
      handleSingleSelect,
      handleMultiToggle,
      handleCheckAnswer,
      handleNextQuestion,
      handleFinishQuizClick,
      currentQuestion,
      isCurrentChecked,
      currentAnswer,
      currentIndex,
      totalQuestions: quiz.questions.length,
    };
  });

  // Keyboard navigation: 1-4 to select, Enter to check / go next
  useEffect(() => {
    if (phase !== 'running') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const actions = runnerActionsRef.current;

      // Keys 1-4 for options
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1;
        if (actions.currentQuestion && optionIdx < actions.currentQuestion.options.length) {
          e.preventDefault();
          if (actions.currentQuestion.type === 'single') {
            actions.handleSingleSelect(optionIdx);
          } else if (actions.currentQuestion.type === 'multi') {
            actions.handleMultiToggle(optionIdx);
          }
        }
      }

      // Enter key checks or advances
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!actions.isCurrentChecked && isAnswered(actions.currentQuestion, actions.currentAnswer)) {
          actions.handleCheckAnswer();
        } else if (actions.isCurrentChecked) {
          if (actions.currentIndex < actions.totalQuestions - 1) {
            actions.handleNextQuestion();
          } else {
            actions.handleFinishQuizClick();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase]);

  // Loading skeleton during initial store hydration
  if (!isHydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="h-64 w-full bg-muted/60 rounded-3xl" />
        <div className="h-12 w-32 bg-muted rounded-xl" />
      </div>
    );
  }

  // PHASE 1: INTRO SCREEN
  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-lg relative overflow-hidden space-y-8">
          {/* Decorative ambient gradient */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          {/* Intro Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assessment Checkpoint</span>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Course: {course.title}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {quiz.title}
            </h1>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border flex flex-col items-center justify-center text-center">
              <HelpCircle className="h-5 w-5 text-primary mb-1.5" />
              <span className="text-xs text-muted-foreground">Questions</span>
              <span className="font-extrabold text-lg text-foreground">
                {quiz.questions.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-muted/50 border border-border flex flex-col items-center justify-center text-center">
              <Clock className="h-5 w-5 text-primary mb-1.5" />
              <span className="text-xs text-muted-foreground">Time Limit</span>
              <span className="font-extrabold text-lg text-foreground">
                {quiz.timeLimitSeconds ? `${Math.round(quiz.timeLimitSeconds / 60)} mins` : 'No limit'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-muted/50 border border-border flex flex-col items-center justify-center text-center">
              <Award className="h-5 w-5 text-primary mb-1.5" />
              <span className="text-xs text-muted-foreground">Passing Score</span>
              <span className="font-extrabold text-lg text-foreground">
                {quiz.passingScorePercent}%
              </span>
            </div>
          </div>

          {/* Best Previous Attempt (if exists) */}
          {bestAttempt && (
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {bestAttempt.scorePercent}%
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">Previous Best Score</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {bestAttempt.scorePercent >= quiz.passingScorePercent
                      ? 'Passed previously'
                      : 'Attempted previously'}
                  </p>
                </div>
              </div>
              <Badge variant={bestAttempt.scorePercent >= quiz.passingScorePercent ? 'default' : 'secondary'} className="text-xs">
                {bestAttempt.scorePercent >= quiz.passingScorePercent ? 'Passed' : 'Needs Practice'}
              </Badge>
            </div>
          )}

          {/* Rules List */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-foreground">Assessment Guidelines:</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Instant feedback is provided upon checking each response.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Multi-select questions require all correct options for full score.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Order challenges can be rearranged using drag & drop or up/down arrows.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>You can review locked questions at any time before final submission.</span>
              </li>
            </ul>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <Link href={`/courses/${course.slug}`}>
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Course</span>
              </Link>
            </Button>

            <Button
              size="lg"
              onClick={handleStartQuiz}
              className="font-bold text-sm gap-2 shadow-md px-6"
            >
              <Play className="h-4 w-4 fill-current ml-0.5" />
              <span>Start Quiz</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2: RUNNING & SUBMITTING
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Time Up Alert Banner */}
      {timeUpAlert && (
        <div className="p-4 rounded-2xl bg-destructive text-white text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl animate-bounce">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Time&apos;s up! Automatically scoring and submitting your quiz attempt...</span>
        </div>
      )}

      {/* Quiz Top Header */}
      <QuizHeader
        quizTitle={quiz.title}
        courseTitle={course.title}
        timeLimitSeconds={quiz.timeLimitSeconds}
        startedAtTimestamp={startedAtTimestamp}
        onTimeUp={handleTimeUp}
        onLeaveQuiz={handleLeaveQuiz}
      />

      {/* Main Question Card Container */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        {/* Render Question by Type */}
        {currentQuestion.type === 'single' && (
          <QuestionSingle
            question={currentQuestion}
            selectedAnswer={currentAnswer as number | undefined}
            isLocked={isCurrentChecked}
            onSelect={handleSingleSelect}
          />
        )}

        {currentQuestion.type === 'multi' && (
          <QuestionMulti
            question={currentQuestion}
            selectedAnswers={(currentAnswer as number[]) || []}
            isLocked={isCurrentChecked}
            onToggle={handleMultiToggle}
          />
        )}

        {currentQuestion.type === 'order' && (
          <QuestionOrder
            question={currentQuestion}
            items={orderState[currentQuestion.id] || currentQuestion.options}
            isLocked={isCurrentChecked}
            onReorder={handleOrderReorder}
          />
        )}

        {/* Instant Feedback Panel (revealed after Check Answer) */}
        {isCurrentChecked && (
          <FeedbackPanel
            isCorrect={isCurrentCorrect}
            explanation={currentQuestion.explanation}
          />
        )}

        {/* Bottom Navigator and Progress Bar */}
        <QuestionNavigator
          currentIndex={currentIndex}
          totalQuestions={quiz.questions.length}
          answeredIndices={answeredIndices}
          checkedIndices={checkedIndices}
          canGoNext={isAnswered(currentQuestion, currentAnswer)}
          isLastQuestion={currentIndex === quiz.questions.length - 1}
          isCheckedCurrent={isCurrentChecked}
          onNavigate={handleNavigateQuestion}
          onCheckAnswer={handleCheckAnswer}
          onNextQuestion={handleNextQuestion}
          onFinishQuiz={handleFinishQuizClick}
        />
      </div>

      {/* Unanswered Finish Confirmation Dialog */}
      <Dialog open={isFinishConfirmOpen} onOpenChange={setIsFinishConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Submit Incomplete Quiz?</DialogTitle>
            <DialogDescription>
              You have unanswered questions. Any unanswered questions will be marked as incorrect upon submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsFinishConfirmOpen(false)}>
              Continue Answering
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => {
                setIsFinishConfirmOpen(false);
                submitQuiz();
              }}
            >
              Submit Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
