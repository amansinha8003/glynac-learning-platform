'use client';

import { Play, Pause, RotateCcw, RotateCw, Subtitles, Tv2, Maximize, Minimize } from 'lucide-react';
import { SeekBar, formatVideoTime } from './SeekBar';
import { VolumeControl } from './VolumeControl';
import { SpeedMenu } from './SpeedMenu';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  volume: number;
  isMuted: boolean;
  speed: number;
  isCaptionsOn: boolean;
  hasCaptions: boolean;
  isFullscreen: boolean;
  isPipSupported: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSkip: (offsetSeconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleCaptions: () => void;
  onTogglePip: () => void;
  onToggleFullscreen: () => void;
}

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  bufferedEnd,
  volume,
  isMuted,
  speed,
  isCaptionsOn,
  hasCaptions,
  isFullscreen,
  isPipSupported,
  onTogglePlay,
  onSeek,
  onSkip,
  onVolumeChange,
  onToggleMute,
  onSpeedChange,
  onToggleCaptions,
  onTogglePip,
  onToggleFullscreen,
}: PlayerControlsProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-4 text-white">
      {/* Seek Bar Row */}
      <div className="w-full mb-2">
        <SeekBar
          currentTime={currentTime}
          duration={duration}
          bufferedEnd={bufferedEnd}
          onSeek={onSeek}
        />
      </div>

      {/* Main Buttons Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Play/Pause, Skips, Volume, Time */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause (Space/K)' : 'Play (Space/K)'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Skip Back 10s */}
          <button
            type="button"
            onClick={() => onSkip(-10)}
            aria-label="Rewind 10 seconds (J)"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Skip Forward 10s */}
          <button
            type="button"
            onClick={() => onSkip(10)}
            aria-label="Forward 10 seconds (L)"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Volume Control */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />

          {/* Time Display */}
          <div className="ml-2 font-mono text-[11px] sm:text-xs text-white/80 select-none">
            <span>{formatVideoTime(currentTime)}</span>
            <span className="mx-1 text-white/40">/</span>
            <span>{formatVideoTime(duration)}</span>
          </div>
        </div>

        {/* Right Side: Speed, Captions, PiP, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Speed Menu */}
          <SpeedMenu currentSpeed={speed} onSpeedChange={onSpeedChange} />

          {/* Closed Captions CC */}
          {hasCaptions && (
            <button
              type="button"
              onClick={onToggleCaptions}
              aria-label={isCaptionsOn ? 'Disable subtitles (C)' : 'Enable subtitles (C)'}
              aria-pressed={isCaptionsOn}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                isCaptionsOn
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Subtitles className="h-4 w-4" />
            </button>
          )}

          {/* Picture in Picture */}
          {isPipSupported && (
            <button
              type="button"
              onClick={onTogglePip}
              aria-label="Picture in Picture"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <Tv2 className="h-4 w-4" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit full screen (F)' : 'Full screen (F)'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

