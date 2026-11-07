'use client';

import { OrderQuestion } from '@/types/learning';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronUp, ChevronDown, Check, X, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionOrderProps {
  question: OrderQuestion;
  items: string[];
  isLocked: boolean;
  onReorder: (newItems: string[]) => void;
}

interface SortableOrderItemProps {
  id: string;
  text: string;
  index: number;
  total: number;
  isLocked: boolean;
  isCorrectPosition: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SortableOrderItem({
  id,
  text,
  index,
  total,
  isLocked,
  isCorrectPosition,
  onMoveUp,
  onMoveDown,
}: SortableOrderItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isLocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  let cardStyle = 'border-border bg-card text-foreground';

  if (isDragging) {
    cardStyle = 'border-primary bg-primary/10 shadow-xl opacity-90 ring-2 ring-primary';
  } else if (isLocked) {
    cardStyle = isCorrectPosition
      ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
      : 'border-destructive/80 bg-destructive/10 text-destructive';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm transition-all shadow-xs ${cardStyle}`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {/* Drag Handle */}
        {!isLocked && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            aria-label={`Drag to reorder item ${index + 1}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Step Number Badge */}
        <div
          className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border ${
            isLocked && isCorrectPosition
              ? 'bg-emerald-500 text-white border-emerald-500'
              : isLocked && !isCorrectPosition
              ? 'bg-destructive text-white border-destructive'
              : 'bg-muted border-border text-muted-foreground'
          }`}
        >
          {index + 1}
        </div>

        <span className="leading-snug font-medium select-none">{text}</span>
      </div>

      {/* Up/Down buttons (non-drag accessibility fallback) & Status */}
      <div className="shrink-0 flex items-center gap-1">
        {isLocked ? (
          isCorrectPosition ? (
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <X className="h-4 w-4 text-destructive" />
          )
        ) : (
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={index === 0}
              onClick={onMoveUp}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              aria-label={`Move item ${index + 1} up`}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={index === total - 1}
              onClick={onMoveDown}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              aria-label={`Move item ${index + 1} down`}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuestionOrder({
  question,
  items,
  isLocked,
  onReorder,
}: QuestionOrderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    onReorder(arrayMove(items, index, targetIndex));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
          {question.prompt}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
          <ArrowDown className="h-3 w-3 text-primary" />
          <span>Drag or use the up/down arrows to sequence items in the correct order.</span>
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 pt-1" role="list">
            {items.map((item, idx) => (
              <SortableOrderItem
                key={item}
                id={item}
                text={item}
                index={idx}
                total={items.length}
                isLocked={isLocked}
                isCorrectPosition={item === question.correctOrder[idx]}
                onMoveUp={() => handleMove(idx, 'up')}
                onMoveDown={() => handleMove(idx, 'down')}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* When locked, show the correct sequence side-by-side if not 100% correct */}
      {isLocked && (
        <div className="mt-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            <span>Target Correct Sequence:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs text-foreground/80 pl-1">
            {question.correctOrder.map((step, idx) => (
              <li key={idx} className="font-medium">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
