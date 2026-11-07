'use client';

import { useState, useRef, useEffect } from 'react';
import { Gauge, Check } from 'lucide-react';

interface SpeedMenuProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function SpeedMenu({ currentSpeed, onSpeedChange }: SpeedMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Playback speed"
        aria-expanded={isOpen}
        className="flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        <Gauge className="h-3.5 w-3.5" />
        <span>{currentSpeed}x</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-28 rounded-xl border border-white/15 bg-black/90 backdrop-blur-md p-1.5 shadow-xl z-50 text-xs">
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-white/50 border-b border-white/10 mb-1">
            Speed
          </div>
          <div className="flex flex-col gap-0.5">
            {SPEEDS.map((speed) => {
              const isSelected = currentSpeed === speed;
              return (
                <button
                  key={speed}
                  type="button"
                  onClick={() => {
                    onSpeedChange(speed);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-primary text-white font-bold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{speed}x</span>
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

