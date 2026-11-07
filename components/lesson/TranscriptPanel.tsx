'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { TranscriptLine } from '@/types/learning';
import { getActiveLineIndex } from '@/lib/transcript';
import { formatVideoTime } from '@/components/player/SeekBar';
import { Search, X, Copy, Check, Crosshair, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TranscriptPanelProps {
  lines: TranscriptLine[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  onPlay?: () => void;
}

function HighlightMatches({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="bg-primary/25 text-foreground rounded-xs px-0.5 font-bold"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

interface LineItemProps {
  line: TranscriptLine;
  index: number;
  isActive: boolean;
  searchQuery: string;
  onSelect: (startSec: number) => void;
}

const MemoizedLineItem = React.memo(
  function LineItem({ line, isActive, searchQuery, onSelect }: LineItemProps) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(line.startSec)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(line.startSec);
          }
        }}
        aria-current={isActive ? 'true' : undefined}
        className={`group relative flex items-start gap-3.5 p-3 rounded-xl transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isActive
            ? 'bg-primary/10 text-foreground font-medium border-l-4 border-primary shadow-xs pl-3'
            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground border-l-4 border-transparent'
        }`}
      >
        <span
          className={`font-mono text-xs font-semibold shrink-0 pt-0.5 ${
            isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-primary'
          }`}
        >
          {formatVideoTime(line.startSec)}
        </span>

        <p className="text-xs sm:text-sm leading-relaxed flex-1">
          <HighlightMatches text={line.text} query={searchQuery} />
        </p>
      </div>
    );
  },
  (prev, next) =>
    prev.isActive === next.isActive &&
    prev.searchQuery === next.searchQuery &&
    prev.line.id === next.line.id &&
    prev.line.text === next.line.text &&
    prev.line.startSec === next.line.startSec
);

export function TranscriptPanel({
  lines,
  currentTime,
  onSeek,
  onPlay,
}: TranscriptPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const lineElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Binary search for active line index
  const activeIndex = useMemo(
    () => getActiveLineIndex(lines, currentTime),
    [lines, currentTime]
  );

  // Auto-scroll active line into container view (without scrolling page)
  const scrollToActiveLine = useCallback(() => {
    if (activeIndex < 0) return;
    const container = containerRef.current;
    const lineEl = lineElementsRef.current[activeIndex];
    if (container && lineEl) {
      // Check if line is outside current scroll viewport
      const offsetTop = lineEl.offsetTop - container.offsetTop;
      const targetScroll = offsetTop - container.clientHeight / 2 + lineEl.clientHeight / 2;

      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (isAutoScrollEnabled && !isUserScrollingRef.current) {
      scrollToActiveLine();
    }
  }, [activeIndex, isAutoScrollEnabled, scrollToActiveLine]);

  // Handle manual scroll detection
  const handleScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  };

  const handleWheel = () => {
    // User explicitly scrolled with mouse wheel or touch
    setIsAutoScrollEnabled(false);
  };

  const handleResumeAutoScroll = () => {
    setIsAutoScrollEnabled(true);
    scrollToActiveLine();
  };

  const handleLineClick = (startSec: number) => {
    onSeek(startSec);
    onPlay?.();
    setIsAutoScrollEnabled(true);
  };

  // Filter lines if search is provided
  const filteredIndices = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    const set = new Set<number>();
    lines.forEach((l, idx) => {
      if (l.text.toLowerCase().includes(query)) {
        set.add(idx);
      }
    });
    return set;
  }, [lines, searchQuery]);

  const matchCount = filteredIndices ? filteredIndices.size : 0;

  // Copy full transcript text
  const handleCopyTranscript = async () => {
    const fullText = lines
      .map((l) => `[${formatVideoTime(l.startSec)}] ${l.text}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!lines || lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-dashed border-border rounded-2xl bg-card">
        <FileText className="h-10 w-10 text-muted-foreground/60 mb-2" />
        <h4 className="font-semibold text-sm text-foreground">No Transcript Available</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Captions and transcript cues have not been uploaded for this lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-[460px] sm:h-[500px]">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-3 border-b border-border/80">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8 h-9 text-xs bg-background"
            aria-label="Search transcript"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons & Match count */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {searchQuery.trim() && (
            <Badge variant="secondary" className="text-[11px] h-7 px-2">
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </Badge>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyTranscript}
            className="h-9 px-2.5 text-xs font-medium gap-1.5"
            aria-label="Copy transcript to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Screen reader notification (only on search) */}
      <div className="sr-only" aria-live="polite">
        {searchQuery ? `${matchCount} transcript matches found` : ''}
      </div>

      {/* Transcript Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="flex-1 overflow-y-auto py-3 space-y-1.5 pr-2 focus-visible:outline-none"
        tabIndex={0}
        aria-label="Transcript lines container"
      >
        {lines.map((line, idx) => {
          const isMatch = filteredIndices ? filteredIndices.has(idx) : true;
          if (!isMatch) return null;

          return (
            <div
              key={line.id}
              ref={(el) => {
                lineElementsRef.current[idx] = el;
              }}
            >
              <MemoizedLineItem
                line={line}
                index={idx}
                isActive={activeIndex === idx}
                searchQuery={searchQuery}
                onSelect={handleLineClick}
              />
            </div>
          );
        })}
      </div>

      {/* Floating "Jump to current" Button */}
      {!isAutoScrollEnabled && activeIndex >= 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <Button
            type="button"
            size="sm"
            onClick={handleResumeAutoScroll}
            className="h-8 px-3 rounded-full shadow-lg bg-primary text-primary-foreground font-semibold text-xs gap-1.5 animate-in fade-in zoom-in-95 duration-150"
            aria-label="Resume auto-scroll to current speaking line"
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>Jump to current</span>
          </Button>
        </div>
      )}
    </div>
  );
}
