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
import dynamic from 'next/dynamic';
import { useHydrated } from '@/lib/useHydrated';
import { getBestAttempt } from '@/lib/selectors';
import { QuizHeader } from './QuizHeader';
import { QuestionSingle } from './QuestionSingle';
import { QuestionMulti } from './QuestionMulti';
import { FeedbackPanel } from './FeedbackPanel';
import { QuestionNavigator } from './QuestionNavigator';

const QuestionOrder = dynamic(
  () => import('./QuestionOrder').then((mod) => mod.QuestionOrder),
  {
    loading: () => (
      <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
        Loading question...
      </div>
    ),
    ssr: false,
  }
);
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
  RotateCcw,
} from 'lucide-react';

interface QuizRunnerProps {
  course: Course;
  quiz: Quiz;
  retryMode?: boolean;
  fromAttemptId?: string;
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

export function QuizRunner({
  course,
  quiz,
  retryMode = false,
  fromAttemptId,
}: QuizRunnerProps) {
  const router = useRouter();
  const isHydrated = useHydrated();

  // Store
  const saveQuizAttempt = useLearningStore((s) => s.saveQuizAttempt);
  const recordActivity = useLearningStore((s) => s.recordActivity);
  const quizAttempts = useLearningStore((s) => s.quizAttempts);
  const hasStoreHydrated = useLearningStore((s) => s.hasHydrated);

  // Look up source attempt if in retry mode
  const fromAttempt = useMemo(() => {
    if (!retryMode || !fromAttemptId || !isHydrated) return null;
    return quizAttempts.find((a) => a.id === fromAttemptId) || null;
  }, [retryMode, fromAttemptId, isHydrated, quizAttempts]);

  // Questions subset for retry mode vs full mode
  const questions = useMemo(() => {
    if (retryMode && fromAttempt) {
      const incorrectOnly = quiz.questions.filter(
        (q) => fromAttempt.perQuestionResult[q.id] === false
      );
      if (incorrectOnly.length > 0) return incorrectOnly;
    }
    return quiz.questions;
  }, [retryMode, fromAttempt, quiz.questions]);

  const sessionKey = retryMode
    ? `glynac_quiz_session_${quiz.id}_retry`
    : `glynac_quiz_session_${quiz.id}`;

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
    if (phase !== 'running') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase]);

  // Initialize order state for drag-to-order questions
  const initializeOrderQuestions = useCallback(() => {
    const initialOrders: Record<string, string[]> = {};
    questions.forEach((q) => {
      if (q.type === 'order') {
        initialOrders[q.id] = shuffleOptions(q.options, `${quiz.id}-${q.id}`);
      }
    });
    return initialOrders;
  }, [quiz.id, questions]);

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
  const currentQuestion = questions[currentIndex] || questions[0];
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

  // Answer handler for multi choice
  const handleMultiToggle = (optionIndex: number) => {
    if (checkedQuestions[currentQuestion?.id]) return;
    setAnswers((prev) => {
      const currentArr = (prev[currentQuestion.id] as number[]) || [];
      const exists = currentArr.includes(optionIndex);
      const nextArr = exists
        ? currentArr.filter((i) => i !== optionIndex)
        : [...currentArr, optionIndex];
      const next = { ...prev, [currentQuestion.id]: nextArr };
      saveSession({ answers: next });
      return next;
    });
  };

  // Answer handler for drag-to-order
  const handleOrderReorder = (newOrder: string[]) => {
    if (checkedQuestions[currentQuestion?.id]) return;
    setOrderState((prev) => ({ ...prev, [currentQuestion.id]: newOrder }));
    setAnswers((prev) => {
      const next = { ...prev, [currentQuestion.id]: newOrder };
      saveSession({ answers: next, orderState: { ...orderState, [currentQuestion.id]: newOrder } });
      return next;
    });
  };

  // Check answer button
  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    setCheckedQuestions((prev) => {
      const next = { ...prev, [currentQuestion.id]: true };
      saveSession({ checkedQuestions: next });
      return next;
    });
  };

  // Navigate question via navigator circles
  const handleNavigateQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      saveSession({ currentIndex: index });
    }
  };

  // Next question
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveSession({ currentIndex: nextIndex });
    }
  };

  // Submit and save attempt to persistent store
  const submitQuiz = useCallback(() => {
    setPhase('submitting');
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem(`glynac_quiz_session_${quiz.id}_retry`);

    const scoring = scoreQuiz({ ...quiz, questions }, answers);

    const attemptId = saveQuizAttempt({
      quizId: quiz.id,
      courseId: course.id,
      startedAt: startedAt || new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      answers,
      scorePercent: scoring.scorePercent,
      perQuestionResult: scoring.perQuestionResult,
      mode: retryMode ? 'retry-incorrect' : 'full',
    });

    recordActivity();
    router.push(`/courses/${course.slug}/quiz/${quiz.id}/result/${attemptId}`);
  }, [
    sessionKey,
    quiz,
    questions,
    answers,
    saveQuizAttempt,
    course.id,
    course.slug,
    startedAt,
    recordActivity,
    router,
    retryMode,
  ]);

  // Finish button click
  const handleFinishQuizClick = () => {
    const unansweredCount = questions.filter(
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
    questions.forEach((q, idx) => {
      if (isAnswered(q, answers[q.id])) {
        set.add(idx);
      }
    });
    return set;
  }, [questions, answers]);

  const checkedIndices = useMemo(() => {
    const set = new Set<number>();
    questions.forEach((q, idx) => {
      if (checkedQuestions[q.id]) {
        set.add(idx);
      }
    });
    return set;
  }, [questions, checkedQuestions]);

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
    totalQuestions: questions.length,
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
      totalQuestions: questions.length,
    };
  });

  // Keyboard navigation: 1-4 to select, Enter to check / go next
  useEffect(() => {
    if (phase !== 'running') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const {
        currentQuestion: cq,
        isCurrentChecked: isChecked,
        currentAnswer: ca,
        currentIndex: cIdx,
        totalQuestions: totalQ,
        handleSingleSelect: doSingle,
        handleMultiToggle: doMulti,
        handleCheckAnswer: doCheck,
        handleNextQuestion: doNext,
        handleFinishQuizClick: doFinish,
      } = runnerActionsRef.current;

      // Digits 1-4
      if (['1', '2', '3', '4'].includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const optionIdx = parseInt(e.key, 10) - 1;
        if (cq && !isChecked) {
          if (cq.type === 'single') {
            e.preventDefault();
            doSingle(optionIdx);
          } else if (cq.type === 'multi') {
            e.preventDefault();
            doMulti(optionIdx);
          }
        }
      }

      // Enter key
      if (e.key === 'Enter') {
        if (!isChecked && isAnswered(cq, ca)) {
          e.preventDefault();
          doCheck();
        } else if (isChecked) {
          e.preventDefault();
          if (cIdx === totalQ - 1) {
            doFinish();
          } else {
            doNext();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase]);

  // Loading skeleton while waiting for store hydration
  if (!isHydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded-md" />
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
              <span>{retryMode ? 'Targeted Revision' : 'Assessment Checkpoint'}</span>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Course: {course.title}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {quiz.title} {retryMode && '(Retry Mode)'}
            </h1>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border flex flex-col items-center justify-center text-center">
              <HelpCircle className="h-5 w-5 text-primary mb-1.5" />
              <span className="text-xs text-muted-foreground">Questions</span>
              <span className="font-extrabold text-lg text-foreground">
                {questions.length}
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
          {bestAttempt && !retryMode && (
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
              <Badge variant="outline" className="text-xs">
                {bestAttempt.scorePercent >= quiz.passingScorePercent ? 'Passed' : 'Needs Practice'}
              </Badge>
            </div>
          )}

          {/* Retry Mode Callout */}
          {retryMode && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-foreground">Retrying Missed Questions</h4>
                <p className="text-muted-foreground">
                  Focusing strictly on the {questions.length} questions you answered incorrectly on your previous attempt.
                </p>
              </div>
            </div>
          )}

          {/* Assessment Guidelines / Rules */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">
              Guidelines & Rules
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Select your answers and click <strong>Check Answer</strong> or press <strong>Enter</strong> to inspect explanations immediately.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  You can jump back and forth between questions anytime using the question navigator below.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Passing score is <strong>{quiz.passingScorePercent}%</strong>. Your best score will be recorded to your learning profile.
                </span>
              </li>
            </ul>
          </div>

          {/* Start CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs">
              <Link href={`/courses/${course.slug}`}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Course
              </Link>
            </Button>

            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 text-sm font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleStartQuiz}
            >
              <Play className="h-4 w-4 fill-current" />
              Start Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3: SUBMITTING / SCORING SCREEN
  if (phase === 'submitting') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <h2 className="text-xl font-bold text-foreground">Scoring Assessment...</h2>
        <p className="text-xs text-muted-foreground">
          Calculating your answers and saving your attempt history.
        </p>
      </div>
    );
  }

  // PHASE 2: RUNNING QUIZ
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Quiz Top Header & Timer */}
      <QuizHeader
        quizTitle={retryMode ? `${quiz.title} (Retry)` : quiz.title}
        courseTitle={course.title}
        timeLimitSeconds={quiz.timeLimitSeconds}
        startedAtTimestamp={startedAtTimestamp}
        onTimeUp={handleTimeUp}
        onLeaveQuiz={handleLeaveQuiz}
      />

      {/* Time Up Alert Banner */}
      {timeUpAlert && (
        <div className="p-4 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive flex items-center gap-3 animate-bounce">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-xs font-semibold">
            Time limit reached! Submitting your answers now...
          </div>
        </div>
      )}

      {/* Question Container Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md space-y-6">
        {/* Render question based on discriminated union type */}
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
            items={(currentAnswer as string[]) || orderState[currentQuestion.id] || currentQuestion.options}
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
          totalQuestions={questions.length}
          answeredIndices={answeredIndices}
          checkedIndices={checkedIndices}
          canGoNext={isAnswered(currentQuestion, currentAnswer)}
          isLastQuestion={currentIndex === questions.length - 1}
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
