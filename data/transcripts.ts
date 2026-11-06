import { TranscriptLine } from '@/types/learning';

export const sampleVideos = [
  '/videos/lesson-1.mp4',
  '/videos/lesson-2.mp4',
  '/videos/lesson-3.mp4',
] as const;

export function getVideoForIndex(index: number): string {
  return sampleVideos[index % sampleVideos.length];
}

export function createTranscript(topic: string, durationSeconds: number): TranscriptLine[] {
  const steps = [
    `Welcome to this lesson! Today we are exploring core concepts of ${topic}.`,
    `First, let's understand why ${topic} is fundamental to modern production workflows.`,
    `When designing reliable systems, we always start by laying solid foundations.`,
    `Let us examine the architecture and key building blocks required here.`,
    `Notice how each component isolates its responsibilities cleanly without side effects.`,
    `Now let's dive into practical implementation and inspect the working code.`,
    `Pay close attention to error handling and performance trade-offs in this section.`,
    `Here is a common pitfall that developers encounter and how you can prevent it.`,
    `Let's run our test suite to verify that everything behaves as intended.`,
    `Finally, let's review our key takeaways and best practices before wrapping up.`,
  ];

  const interval = Math.floor(durationSeconds / steps.length);
  return steps.map((text, idx) => ({
    id: `tr-${idx + 1}`,
    startSec: idx * interval,
    endSec: Math.min((idx + 1) * interval - 1, durationSeconds),
    text,
  }));
}

