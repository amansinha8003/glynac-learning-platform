import { TranscriptLine } from '@/types/learning';

function formatVttTimestamp(seconds: number): string {
  const totalMs = Math.floor(seconds * 1000);
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  const hh = hrs.toString().padStart(2, '0');
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  const mmm = ms.toString().padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mmm}`;
}

export function buildWebVTT(lines: TranscriptLine[]): string {
  if (!lines || lines.length === 0) {
    return 'WEBVTT\n\n';
  }

  const vttBlocks = lines.map((line, index) => {
    const start = formatVttTimestamp(line.startSec);
    const end = formatVttTimestamp(line.endSec);
    return `${index + 1}\n${start} --> ${end}\n${line.text}`;
  });

  return `WEBVTT\n\n${vttBlocks.join('\n\n')}\n`;
}

