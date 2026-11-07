'use client';

import { useState } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const [isHovered, setIsHovered] = useState(false);
  const effectiveVolume = isMuted ? 0 : volume;

  return (
    <div
      className="relative flex items-center group/volume"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mute / Unmute Button */}
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted || volume === 0 ? 'Unmute (M)' : 'Mute (M)'}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        {isMuted || effectiveVolume === 0 ? (
          <VolumeX className="h-4 w-4" />
        ) : effectiveVolume > 0.5 ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <Volume1 className="h-4 w-4" />
        )}
      </button>

      {/* Expandable Slider on Hover/Focus */}
      <div
        className={`flex items-center overflow-hidden transition-all duration-200 ${
          isHovered ? 'w-20 pl-2 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={effectiveVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          aria-label="Volume slider"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>
    </div>
  );
}

