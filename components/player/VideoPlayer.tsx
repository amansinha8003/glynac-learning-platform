'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { buildWebVTT } from '@/lib/vtt';
import { PlayerControls } from './PlayerControls';
import { formatVideoTime } from './SeekBar';
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface VideoPlayerProps {
  courseId: string;
  courseSlug: string;
  lesson: Lesson;
  nextLesson?: Lesson;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  function VideoPlayer(
    { courseId, courseSlug, lesson, nextLesson, initialTime, onTimeUpdate, onPlayStateChange },
    ref
  ) {
    const router = useRouter();
    const isHydrated = useHydrated();

    // Store state and actions
    const hasStoreHydrated = useLearningStore((s) => s.hasHydrated);
    const playbackSpeed = useLearningStore((s) => s.progress.playbackSpeed || 1);
    const setPlaybackSpeed = useLearningStore((s) => s.setPlaybackSpeed);
    const setLessonPosition = useLearningStore((s) => s.setLessonPosition);
    const markLessonComplete = useLearningStore((s) => s.markLessonComplete);
    const recordActivity = useLearningStore((s) => s.recordActivity);
    const progress = useLearningStore((s) => s.progress);

    // Refs
    const wrapperRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastSavedTimeRef = useRef(0);
    const currentTimeRef = useRef(0);
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const simTimerRef = useRef<NodeJS.Timeout | null>(null);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(lesson.durationSeconds || 60);
    const [bufferedEnd, setBufferedEnd] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isCaptionsOn, setIsCaptionsOn] = useState(true);
    const [vttUrl, setVttUrl] = useState<string | null>(null);
    const [playFlash, setPlayFlash] = useState<'play' | 'pause' | null>(null);
    const [showResumeToast, setShowResumeToast] = useState(false);
    const [resumePosition, setResumePosition] = useState(0);
    const [showCompletionBanner, setShowCompletionBanner] = useState(false);
    const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isPipSupported, setIsPipSupported] = useState(false);
    const [isSimulatedMode, setIsSimulatedMode] = useState(false);

    // WebVTT Captions generation
    useEffect(() => {
      if (!lesson.transcript || lesson.transcript.length === 0) {
        setVttUrl(null);
        return;
      }

      const vttString = buildWebVTT(lesson.transcript);
      const blob = new Blob([vttString], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);
      setVttUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }, [lesson.transcript]);

    // Check PiP support
    useEffect(() => {
      if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
        setIsPipSupported(true);
      }
    }, []);

    // Load volume and captions settings from localStorage
    useEffect(() => {
      try {
        const savedVol = localStorage.getItem('glynac_player_vol');
        if (savedVol !== null) setVolume(parseFloat(savedVol));

        const savedCaptions = localStorage.getItem('glynac_player_captions');
        if (savedCaptions !== null) setIsCaptionsOn(savedCaptions === 'true');
      } catch {
        // Storage access fallback
      }
    }, []);

    // Sync TextTracks mode with isCaptionsOn
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !video.textTracks || video.textTracks.length === 0) return;
      const track = video.textTracks[0];
      if (track) {
        track.mode = isCaptionsOn ? 'showing' : 'hidden';
      }
    }, [isCaptionsOn, vttUrl]);

    // Sync playback speed
    useEffect(() => {
      if (videoRef.current && hasStoreHydrated) {
        videoRef.current.playbackRate = playbackSpeed;
      }
    }, [playbackSpeed, hasStoreHydrated]);

    // Track Fullscreen state
    useEffect(() => {
      const onFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', onFullscreenChange);
      return () => {
        document.removeEventListener('fullscreenchange', onFullscreenChange);
      };
    }, []);

    // Expose ref API
    useImperativeHandle(ref, () => ({
      seekTo: (sec: number) => {
        handleSeek(sec);
      },
      play: () => {
        playVideo();
      },
      pause: () => {
        pauseVideo();
      },
      getCurrentTime: () => currentTimeRef.current,
      getDuration: () => duration,
    }));

    // Save position to Zustand store (throttled)
    const commitPosition = useCallback(
      (timeSec: number) => {
        setLessonPosition(courseId, lesson.id, timeSec);
        lastSavedTimeRef.current = timeSec;
      },
      [courseId, lesson.id, setLessonPosition]
    );

    // Clean up on unmount and save final position
    useEffect(() => {
      return () => {
        commitPosition(currentTimeRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      };
    }, [commitPosition]);

    // Notify play state change
    useEffect(() => {
      onPlayStateChange?.(isPlaying);
    }, [isPlaying, onPlayStateChange]);

    // Restore position on load (after hydration or deep link)
    useEffect(() => {
      if (!isHydrated || !hasStoreHydrated) return;

      if (initialTime !== undefined && initialTime > 0) {
        if (videoRef.current) {
          videoRef.current.currentTime = initialTime;
        }
        setCurrentTime(initialTime);
        currentTimeRef.current = initialTime;
        return;
      }

      const savedSec = progress.lessons[lesson.id]?.lastPositionSec || 0;
      if (savedSec > 5 && savedSec < (lesson.durationSeconds || 60) - 5) {
        setResumePosition(savedSec);
        setShowResumeToast(true);

        if (videoRef.current) {
          videoRef.current.currentTime = savedSec;
        }
        setCurrentTime(savedSec);
        currentTimeRef.current = savedSec;
      }
    }, [isHydrated, hasStoreHydrated, lesson.id, lesson.durationSeconds, progress.lessons, initialTime]);

    // Playback control functions
    const playVideo = () => {
      if (isEnded) setIsEnded(false);

      if (isSimulatedMode) {
        setIsPlaying(true);
        triggerFlash('play');
        return;
      }

      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // If video file cannot play, offer simulated playback mode
          setIsSimulatedMode(true);
          setIsPlaying(true);
        });
        setIsPlaying(true);
        triggerFlash('play');
      }
    };

    const pauseVideo = () => {
      if (videoRef.current && !isSimulatedMode) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      triggerFlash('pause');
      commitPosition(currentTimeRef.current);
    };

    const togglePlay = () => {
      if (isPlaying) {
        pauseVideo();
      } else {
        playVideo();
      }
    };

    const triggerFlash = (type: 'play' | 'pause') => {
      setPlayFlash(type);
      setTimeout(() => setPlayFlash(null), 500);
    };

    // Seek handler
    const handleSeek = (targetSec: number) => {
      const clamped = Math.max(0, Math.min(targetSec, duration));
      if (videoRef.current && !isSimulatedMode) {
        videoRef.current.currentTime = clamped;
      }
      setCurrentTime(clamped);
      currentTimeRef.current = clamped;
      onTimeUpdate?.(clamped);

      // Check completion threshold on seek
      checkCompletion(clamped, duration);
    };

    // Skip offset handler
    const handleSkip = (offsetSec: number) => {
      handleSeek(currentTimeRef.current + offsetSec);
    };

    // Check 90% completion
    const checkCompletion = useCallback(
      (time: number, totalDur: number) => {
        if (totalDur > 0 && time / totalDur >= 0.9 && !hasMarkedComplete) {
          setHasMarkedComplete(true);
          markLessonComplete(courseId, lesson.id, true);
          recordActivity();
          setShowCompletionBanner(true);
          setTimeout(() => setShowCompletionBanner(false), 4500);
        }
      },
      [courseId, lesson.id, hasMarkedComplete, markLessonComplete, recordActivity]
    );

    // Video event handlers
    const handleVideoTimeUpdate = () => {
      if (!videoRef.current) return;
      const now = videoRef.current.currentTime;
      setCurrentTime(now);
      currentTimeRef.current = now;
      onTimeUpdate?.(now);

      // Throttle store update every 3s
      if (Math.abs(now - lastSavedTimeRef.current) >= 3) {
        commitPosition(now);
      }

      // Check 90% completion
      checkCompletion(now, videoRef.current.duration || duration);

      // Update buffered range
      if (videoRef.current.buffered.length > 0) {
        for (let i = 0; i < videoRef.current.buffered.length; i++) {
          if (
            videoRef.current.buffered.start(i) <= now &&
            now <= videoRef.current.buffered.end(i)
          ) {
            setBufferedEnd(videoRef.current.buffered.end(i));
            break;
          }
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        const d = videoRef.current.duration || lesson.durationSeconds || 60;
        setDuration(d);
        setHasError(false);
      }
    };

    const handleEnded = useCallback(() => {
      setIsPlaying(false);
      setIsEnded(true);
      commitPosition(duration);
      markLessonComplete(courseId, lesson.id, true);
      recordActivity();

      // Start 5-second countdown if nextLesson exists
      if (nextLesson) {
        setCountdown(5);
        countdownTimerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
              router.push(`/courses/${courseSlug}/learn/${nextLesson.id}`);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, [commitPosition, duration, markLessonComplete, courseId, lesson.id, recordActivity, nextLesson, courseSlug, router]);

    // Simulated playback loop (fallback when mock .mp4 is not decoded)
    useEffect(() => {
      if (!isSimulatedMode || !isPlaying) {
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        return;
      }

      simTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.25 * playbackSpeed;
          currentTimeRef.current = next;
          onTimeUpdate?.(next);

          if (Math.abs(next - lastSavedTimeRef.current) >= 3) {
            commitPosition(next);
          }
          checkCompletion(next, duration);

          if (next >= duration) {
            handleEnded();
            return duration;
          }
          return next;
        });
      }, 250);

      return () => {
        if (simTimerRef.current) clearInterval(simTimerRef.current);
      };
    }, [isSimulatedMode, isPlaying, playbackSpeed, duration, checkCompletion, commitPosition, onTimeUpdate, handleEnded]);

    // Volume & Mute handlers
    const handleVolumeChange = (newVol: number) => {
      const clamped = Math.max(0, Math.min(1, newVol));
      setVolume(clamped);
      if (clamped > 0 && isMuted) setIsMuted(false);
      if (videoRef.current) videoRef.current.volume = clamped;
      try {
        localStorage.setItem('glynac_player_vol', clamped.toString());
      } catch {
        // Storage fallback
      }
    };

    const handleToggleMute = () => {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      if (videoRef.current) {
        videoRef.current.muted = nextMuted;
      }
    };

    const handleSpeedChange = (newSpeed: number) => {
      setPlaybackSpeed(newSpeed);
      if (videoRef.current) {
        videoRef.current.playbackRate = newSpeed;
      }
    };

    const handleToggleCaptions = () => {
      const next = !isCaptionsOn;
      setIsCaptionsOn(next);
      try {
        localStorage.setItem('glynac_player_captions', next.toString());
      } catch {
        // Storage fallback
      }
    };

    const handleTogglePip = async () => {
      if (!videoRef.current) return;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch {
        // PiP not supported or rejected
      }
    };

    const handleToggleFullscreen = () => {
      if (!wrapperRef.current) return;
      if (!document.fullscreenElement) {
        wrapperRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };

    // Auto-hide controls after 2.5s mouse inactivity
    const resetControlsTimer = useCallback(() => {
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      if (isPlaying) {
        hideTimerRef.current = setTimeout(() => {
          setShowControls(false);
        }, 2500);
      }
    }, [isPlaying]);

    // Keyboard Shortcuts (only when wrapper is hovered/focused and not typing)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          resetControlsTimer();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          handleSkip(-5);
          resetControlsTimer();
          break;

        case 'ArrowRight':
          e.preventDefault();
          handleSkip(5);
          resetControlsTimer();
          break;

        case 'j':
        case 'J':
          e.preventDefault();
          handleSkip(-10);
          resetControlsTimer();
          break;

        case 'l':
        case 'L':
          e.preventDefault();
          handleSkip(10);
          resetControlsTimer();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          handleToggleMute();
          resetControlsTimer();
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFullscreen();
          resetControlsTimer();
          break;

        case 'c':
        case 'C':
          e.preventDefault();
          handleToggleCaptions();
          resetControlsTimer();
          break;
      }
    };

    return (
      <div
        ref={wrapperRef}
        tabIndex={0}
        role="region"
        aria-label="Video player"
        onMouseMove={resetControlsTimer}
        onMouseEnter={resetControlsTimer}
        onFocus={resetControlsTimer}
        onKeyDown={handleKeyDown}
        className="group/player relative aspect-video w-full rounded-2xl sm:rounded-3xl bg-black overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xl"
      >
        {/* Native Video Element */}
        <video
          ref={videoRef}
          src={lesson.videoUrl}
          playsInline
          controls={false}
          onClick={togglePlay}
          onTimeUpdate={handleVideoTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onError={() => {
            setHasError(true);
            setIsBuffering(false);
          }}
          onEnded={handleEnded}
          className="h-full w-full object-contain cursor-pointer"
        >
          {vttUrl && (
            <track
              kind="subtitles"
              label="English"
              srcLang="en"
              default={isCaptionsOn}
              src={vttUrl}
            />
          )}
        </video>

        {/* Big Center Play Button when Paused */}
        {!isPlaying && !isEnded && !hasError && (
          <button
            type="button"
            onClick={playVideo}
            aria-label="Play video"
            className="absolute inset-0 m-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
          >
            <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current ml-1" />
          </button>
        )}

        {/* Play/Pause Center Flash Animation */}
        <AnimatePresence>
          {playFlash && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.9 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center pointer-events-none z-10"
            >
              {playFlash === 'play' ? (
                <Play className="h-10 w-10 fill-current ml-1" />
              ) : (
                <Pause className="h-10 w-10 fill-current" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buffering Indicator */}
        {isBuffering && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none z-10">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        )}

        {/* Error State with Retry & Simulated Demo fallback */}
        {hasError && !isSimulatedMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-white text-center z-20">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
            <h4 className="font-bold text-base sm:text-lg">Video Stream Unavailable</h4>
            <p className="text-xs text-white/70 max-w-sm mt-1 mb-4">
              The video source could not be decoded. You can retry loading or launch the demo simulation mode to explore full controls.
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setHasError(false);
                  if (videoRef.current) videoRef.current.load();
                }}
                className="gap-1.5 text-xs font-semibold text-black bg-white hover:bg-white/90"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retry Video
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsSimulatedMode(true);
                  setHasError(false);
                  playVideo();
                }}
                className="gap-1.5 text-xs font-semibold shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Run Demo Simulation
              </Button>
            </div>
          </div>
        )}

        {/* Resume Position Toast */}
        <AnimatePresence>
          {showResumeToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 z-30 flex items-center gap-3 rounded-xl bg-black/85 backdrop-blur-md px-3.5 py-2 text-xs text-white border border-white/15 shadow-lg"
            >
              <span>Resumed from {formatVideoTime(resumePosition)}</span>
              <button
                type="button"
                onClick={() => {
                  handleSeek(0);
                  setShowResumeToast(false);
                }}
                className="font-bold text-primary hover:underline"
              >
                Start over
              </button>
              <button
                type="button"
                onClick={() => setShowResumeToast(false)}
                className="text-white/60 hover:text-white"
                aria-label="Dismiss toast"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lesson Completed Floating Banner */}
        <AnimatePresence>
          {showCompletionBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-4 z-30 flex items-center gap-2 rounded-xl bg-emerald-600/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-emerald-400/30"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Lesson completed (+ streak updated)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* End-Screen Overlay */}
        {isEnded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-white text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Lesson Completed!
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-white/70 max-w-sm">
              Great work! You have mastered the concepts in this section.
            </p>

            {/* Actions: Take Quiz or Next Lesson */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {lesson.quizId ? (
                <Button asChild size="default" className="font-semibold gap-1.5 shadow-md">
                  <Link href={`/courses/${courseSlug}/quiz/${lesson.quizId}`}>
                    <HelpCircle className="h-4 w-4" />
                    <span>Take Checkpoint Quiz</span>
                  </Link>
                </Button>
              ) : nextLesson ? (
                <Button
                  onClick={() => router.push(`/courses/${courseSlug}/learn/${nextLesson.id}`)}
                  size="default"
                  className="font-semibold gap-1.5 shadow-md"
                >
                  <span>Next Lesson</span>
                  {countdown !== null && <span>({countdown}s)</span>}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : null}

              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setIsEnded(false);
                  handleSeek(0);
                  playVideo();
                }}
                className="text-white border-white/20 hover:bg-white/10 gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Replay Lesson</span>
              </Button>
            </div>

            {/* Cancel auto-advance countdown button */}
            {countdown !== null && (
              <button
                type="button"
                onClick={() => {
                  if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                  setCountdown(null);
                }}
                className="mt-4 text-xs text-white/60 hover:text-white underline"
              >
                Cancel auto-advance
              </button>
            )}
          </div>
        )}

        {/* Player Controls Bar */}
        <div
          className={`transition-opacity duration-300 ${
            showControls || !isPlaying || isEnded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <PlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            bufferedEnd={bufferedEnd}
            volume={volume}
            isMuted={isMuted}
            speed={playbackSpeed}
            isCaptionsOn={isCaptionsOn}
            hasCaptions={!!vttUrl}
            isFullscreen={isFullscreen}
            isPipSupported={isPipSupported}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onSkip={handleSkip}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onSpeedChange={handleSpeedChange}
            onToggleCaptions={handleToggleCaptions}
            onTogglePip={handleTogglePip}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>
      </div>
    );
  }
);
