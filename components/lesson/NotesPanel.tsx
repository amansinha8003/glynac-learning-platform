'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Course, Lesson, Note } from '@/types/learning';
import { useLearningStore } from '@/store/learningStore';
import { useHydrated } from '@/lib/useHydrated';
import { formatVideoTime } from '@/components/player/SeekBar';
import {
  StickyNote,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Download,
  Check,
  Undo2,
  Clock,
  ExternalLink,
} from 'lucide-react';
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

interface NotesPanelProps {
  course: Course;
  currentLesson: Lesson;
  currentTime: number;
  isPlaying?: boolean;
  onSeek: (seconds: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  composerRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function NotesPanel({
  course,
  currentLesson,
  currentTime,
  isPlaying,
  onSeek,
  onPause,
  onResume,
  composerRef: externalComposerRef,
}: NotesPanelProps) {
  const isHydrated = useHydrated();
  const allNotes = useLearningStore((s) => s.notes);
  const addNote = useLearningStore((s) => s.addNote);
  const updateNote = useLearningStore((s) => s.updateNote);
  const deleteNote = useLearningStore((s) => s.deleteNote);

  // Filter view: 'current' or 'all'
  const [filterView, setFilterView] = useState<'current' | 'all'>('current');

  // Composer state
  const internalComposerRef = useRef<HTMLTextAreaElement>(null);
  const composerInputRef = externalComposerRef || internalComposerRef;
  const [composerText, setComposerText] = useState('');
  const [composerTime, setComposerTime] = useState<number | null>(null);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const wasPlayingRef = useRef(false);

  // Edit note state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Delete confirm dialog & Undo state
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [deletedNoteForUndo, setDeletedNoteForUndo] = useState<Note | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Copy & Export feedback state
  const [copied, setCopied] = useState(false);

  // Map of all lessons in this course for titles and links
  const lessonMap = useMemo(() => {
    const map = new Map<string, Lesson>();
    course.sections.forEach((sec) => {
      sec.lessons.forEach((les) => {
        map.set(les.id, les);
      });
    });
    return map;
  }, [course]);

  // Filter notes
  const displayedNotes = useMemo(() => {
    if (!isHydrated) return [];
    const courseNotes = allNotes.filter((n) => n.courseId === course.id);

    if (filterView === 'current') {
      return courseNotes
        .filter((n) => n.lessonId === currentLesson.id)
        .sort((a, b) => a.timestampSec - b.timestampSec);
    }

    return courseNotes.sort((a, b) => a.timestampSec - b.timestampSec);
  }, [allNotes, isHydrated, course.id, currentLesson.id, filterView]);

  // Closest preceding note highlighting
  const closestNoteId = useMemo(() => {
    if (filterView !== 'current') return null;
    const preceding = displayedNotes.filter((n) => n.timestampSec <= currentTime);
    if (preceding.length === 0) return null;
    return preceding[preceding.length - 1].id;
  }, [displayedNotes, currentTime, filterView]);

  // Handle composer focus (pause video if playing)
  const handleComposerFocus = () => {
    if (composerTime === null) {
      const captured = Math.floor(currentTime);
      setComposerTime(captured);
      setCustomTimeInput(formatVideoTime(captured));
    }
    if (isPlaying) {
      wasPlayingRef.current = true;
      onPause?.();
    }
  };

  // Save new note
  const handleSaveNote = () => {
    const trimmed = composerText.trim();
    if (!trimmed) return;

    const time = composerTime !== null ? composerTime : Math.floor(currentTime);

    addNote({
      courseId: course.id,
      lessonId: currentLesson.id,
      timestampSec: time,
      text: trimmed,
    });

    setComposerText('');
    setComposerTime(null);
    setIsEditingTime(false);

    if (wasPlayingRef.current) {
      wasPlayingRef.current = false;
      onResume?.();
    }
  };

  // Keyboard shortcut Ctrl/Cmd+Enter in composer
  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveNote();
    }
  };

  // Custom time adjustment
  const handleApplyCustomTime = () => {
    const parts = customTimeInput.trim().split(':');
    let totalSec = 0;
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10) || 0;
      const s = parseInt(parts[1], 10) || 0;
      totalSec = m * 60 + s;
    } else {
      totalSec = parseInt(customTimeInput, 10) || 0;
    }
    setComposerTime(Math.max(0, totalSec));
    setIsEditingTime(false);
  };

  // Inline edit handlers
  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const saveEdit = (noteId: string) => {
    if (editText.trim()) {
      updateNote(noteId, editText.trim());
    }
    setEditingNoteId(null);
  };

  // Delete & Undo handlers
  const confirmDelete = () => {
    if (!deletingNote) return;
    deleteNote(deletingNote.id);
    setDeletedNoteForUndo(deletingNote);
    setShowUndoToast(true);
    setDeletingNote(null);

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setShowUndoToast(false);
      setDeletedNoteForUndo(null);
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (!deletedNoteForUndo) return;
    addNote({
      courseId: deletedNoteForUndo.courseId,
      lessonId: deletedNoteForUndo.lessonId,
      timestampSec: deletedNoteForUndo.timestampSec,
      text: deletedNoteForUndo.text,
    });
    setShowUndoToast(false);
    setDeletedNoteForUndo(null);
  };

  // Copy notes as text
  const handleCopyNotes = async () => {
    const text = displayedNotes
      .map((n) => {
        const les = lessonMap.get(n.lessonId);
        const prefix = filterView === 'all' && les ? `[${les.title}] ` : '';
        return `${prefix}[${formatVideoTime(n.timestampSec)}] ${n.text}`;
      })
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Export notes as .md file download
  const handleExportMarkdown = () => {
    const header = `# Course Notes: ${course.title}\nExported on: ${new Date().toLocaleDateString()}\n\n---\n\n`;
    const body = displayedNotes
      .map((n) => {
        const les = lessonMap.get(n.lessonId);
        const lesTitle = les ? les.title : 'Lesson';
        return `### ${lesTitle} (${formatVideoTime(n.timestampSec)})\n${n.text}\n`;
      })
      .join('\n');

    const fullMd = `${header}${body}`;
    const blob = new Blob([fullMd], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.slug}-notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeTimestamp = composerTime !== null ? composerTime : Math.floor(currentTime);

  return (
    <div className="space-y-6">
      {/* Undo Toast */}
      {showUndoToast && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-foreground text-background text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-top-2">
          <span>Note deleted</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndoDelete}
            className="h-7 px-2 text-xs font-bold text-primary hover:bg-background/20 gap-1"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </Button>
        </div>
      )}

      {/* Composer Section */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
        {/* Timestamp Chip Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Add note at:</span>

            {/* Editable Timestamp Chip */}
            {isEditingTime ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  placeholder="mm:ss"
                  className="w-16 h-6 px-1.5 text-xs font-mono rounded border border-primary bg-background focus-visible:outline-none"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApplyCustomTime}
                  className="h-6 px-1.5 text-[11px]"
                >
                  Set
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditingTime(true);
                  setCustomTimeInput(formatVideoTime(activeTimestamp));
                }}
                title="Click to adjust timestamp"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-mono font-bold transition-colors"
              >
                <Clock className="h-3 w-3" />
                <span>{formatVideoTime(activeTimestamp)}</span>
              </button>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Press Ctrl+Enter to save
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={composerInputRef}
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          onFocus={handleComposerFocus}
          onKeyDown={handleComposerKeyDown}
          placeholder="Write key takeaways, ideas or code references..."
          rows={3}
          className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
        />

        {/* Composer Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">
            {composerText.length > 0 ? `${composerText.length} characters` : 'Video pauses while typing'}
          </span>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveNote}
            disabled={!composerText.trim()}
            className="h-8 px-3 font-semibold text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Save Note</span>
          </Button>
        </div>
      </div>

      {/* Filter Toggle and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-border/80">
        {/* Filter Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-muted/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterView('current')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterView === 'current'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            This lesson ({allNotes.filter((n) => n.lessonId === currentLesson.id).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterView('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterView === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All course notes ({allNotes.filter((n) => n.courseId === course.id).length})
          </button>
        </div>

        {/* Export & Copy Buttons */}
        {displayedNotes.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyNotes}
              className="h-8 px-2.5 text-xs font-medium gap-1.5"
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

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportMarkdown}
              className="h-8 px-2.5 text-xs font-medium gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export .md</span>
            </Button>
          </div>
        )}
      </div>

      {/* Notes List */}
      {displayedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-dashed border-border rounded-2xl bg-card">
          <StickyNote className="h-10 w-10 text-muted-foreground/60 mb-2" />
          <h4 className="font-semibold text-sm text-foreground">No Notes Yet</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
            Create timestamped bookmarks while watching to capture key insights and revisit them anytime.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotes.map((note) => {
            const isClosest = closestNoteId === note.id;
            const isCurrentLesson = note.lessonId === currentLesson.id;
            const noteLesson = lessonMap.get(note.lessonId);
            const isEditing = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isClosest
                    ? 'border-primary/50 bg-primary/5 shadow-xs'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                {/* Note Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Clickable Timestamp Chip */}
                    {isCurrentLesson ? (
                      <button
                        type="button"
                        onClick={() => onSeek(note.timestampSec)}
                        title="Jump to video timestamp"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 text-xs font-mono font-bold transition-colors"
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formatVideoTime(note.timestampSec)}</span>
                      </button>
                    ) : (
                      <Link
                        href={`/courses/${course.slug}/learn/${note.lessonId}?t=${note.timestampSec}`}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-mono font-bold transition-colors"
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formatVideoTime(note.timestampSec)}</span>
                        <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                      </Link>
                    )}

                    {/* Lesson name in 'All' view */}
                    {filterView === 'all' && noteLesson && (
                      <Badge variant="outline" className="text-[10px] truncate max-w-[160px]">
                        {noteLesson.title}
                      </Badge>
                    )}
                  </div>

                  {/* Date & Actions */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-[11px]">
                      {formatDistanceToNow(parseISO(note.createdAt), { addSuffix: true })}
                    </span>

                    <button
                      type="button"
                      onClick={() => startEditing(note)}
                      aria-label="Edit note"
                      className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingNote(note)}
                      aria-label="Delete note"
                      className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Editing or Note Text */}
                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingNoteId(null)}
                        className="h-7 px-2 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveEdit(note.id)}
                        className="h-7 px-3 text-xs font-semibold"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {note.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingNote} onOpenChange={(open) => !open && setDeletingNote(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Note?</DialogTitle>
            <DialogDescription>
              This action will remove the note from your course notebook. You can undo this right after deleting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeletingNote(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
