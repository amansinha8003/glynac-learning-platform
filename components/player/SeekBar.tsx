'use client';

import { useState, useRef, useCallback } from 'react';

interface SeekBarProps {
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  onSeek: (seconds: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
}

export function formatVideoTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function SeekBar({
  currentTime,
  duration,
  bufferedEnd,
  onSeek,
  onScrubStart,
  onScrubEnd,
}: SeekBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const safeDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));
  const bufferedPercent = Math.min(100, Math.max(0, (bufferedEnd / safeDuration) * 100));
  const hoverPercent = hoverPosition !== null ? Math.min(100, Math.max(0, hoverPosition * 100)) : 0;
  const hoverTime = (hoverPercent / 100) * safeDuration;

  const calculateRatio = useCallback((clientX: number): number => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return rect.width > 0 ? clampedX / rect.width : 0;
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    onScrubStart?.();
    const ratio = calculateRatio(e.clientX);
    onSeek(ratio * safeDuration);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ratio = calculateRatio(e.clientX);
    setHoverPosition(ratio);
    if (isDragging) {
      onSeek(ratio * safeDuration);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      onScrubEnd?.();
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(Math.min(safeDuration, currentTime + 5));
    } else if (e.key === 'j' || e.key === 'J') {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - 10));
    } else if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      onSeek(Math.min(safeDuration, currentTime + 10));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSeek(safeDuration);
    }
  };

  return (
    <div
      ref={barRef}
      role="slider"
      tabIndex={0}
      aria-label="Video seek position"
      aria-valuemin={0}
      aria-valuemax={safeDuration}
      aria-valuenow={currentTime}
      aria-valuetext={`${formatVideoTime(currentTime)} of ${formatVideoTime(safeDuration)}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverPosition(null);
      }}
      onKeyDown={handleKeyDown}
      className="group relative flex items-center h-5 w-full cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
    >
      {/* Hover Time Tooltip */}
      {(isHovered || isDragging) && (
        <div
          className="absolute -top-7 -translate-x-1/2 rounded bg-black/90 px-1.5 py-0.5 text-[11px] font-mono text-white pointer-events-none shadow-md z-30 whitespace-nowrap border border-white/10"
          style={{ left: `${hoverPercent}%` }}
        >
          {formatVideoTime(hoverTime)}
        </div>
      )}

      {/* Track Background */}
      <div className="relative h-1.5 group-hover:h-2 w-full rounded-full bg-white/20 transition-all overflow-hidden">
        {/* Buffered Range Bar */}
        <div
          className="absolute left-0 top-0 h-full bg-white/40 transition-[width] duration-150"
          style={{ width: `${bufferedPercent}%` }}
        />

        {/* Played Progress Bar */}
        <div
          className="absolute left-0 top-0 h-full bg-primary"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Scrubber Thumb */}
      <div
        className={`absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-md border-2 border-primary transition-transform ${
          isHovered || isDragging ? 'scale-100' : 'scale-0'
        }`}
        style={{ left: `${progressPercent}%` }}
      />
    </div>
  );
}

