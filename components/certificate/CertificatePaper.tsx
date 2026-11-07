'use client';

import { CertificateData } from '@/lib/certificate';
import { Caveat } from 'next/font/google';
import { Award, Check } from 'lucide-react';

const cursiveFont = Caveat({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  fallback: ['cursive', 'serif'],
});

interface CertificatePaperProps {
  data: CertificateData;
}

export function CertificatePaper({ data }: CertificatePaperProps) {
  const accessibleLabel = `Certificate of Completion for ${data.learnerName}, certifying successful completion of ${data.courseTitle}. Issued on ${data.formattedDate}. Certificate ID: ${data.certificateId}.`;

  return (
    <div
      role="img"
      aria-label={accessibleLabel}
      className="print-certificate-paper aspect-[297/210] w-full max-w-[980px] mx-auto bg-white text-zinc-900 border-8 border-double border-violet-600 rounded-2xl relative overflow-hidden shadow-xl flex flex-col justify-between p-6 sm:p-10 md:p-12 select-none"
    >
      {/* Subtle Background Geometric Pattern (Inline SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="cert-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z" fill="none" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="20" cy="20" r="4" fill="#7c3aed" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cert-pattern)" />
      </svg>

      {/* Decorative Corner Ornaments */}
      <svg className="absolute top-3 left-3 w-12 h-12 text-violet-600/40 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M 10 90 L 10 10 L 90 10" />
        <path d="M 22 90 L 22 22 L 90 22" />
        <circle cx="22" cy="22" r="5" fill="currentColor" />
      </svg>
      <svg className="absolute top-3 right-3 w-12 h-12 text-violet-600/40 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M 90 90 L 90 10 L 10 10" />
        <path d="M 78 90 L 78 22 L 10 22" />
        <circle cx="78" cy="22" r="5" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-3 left-3 w-12 h-12 text-violet-600/40 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M 10 10 L 10 90 L 90 90" />
        <path d="M 22 10 L 22 78 L 90 78" />
        <circle cx="22" cy="78" r="5" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-3 right-3 w-12 h-12 text-violet-600/40 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
        <path d="M 90 10 L 90 90 L 10 90" />
        <path d="M 78 10 L 78 78 L 10 78" />
        <circle cx="78" cy="78" r="5" fill="currentColor" />
      </svg>

      {/* Top Header Section */}
      <div className="relative text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-6 w-6 rounded-md bg-violet-600 text-white flex items-center justify-center shadow-xs">
            <Award className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-violet-700">
            Glynac Learning Academy
          </span>
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 font-serif">
          Certificate of Completion
        </h1>
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-medium pt-0.5">
          This is to certify that
        </p>
      </div>

      {/* Learner Name Section */}
      <div className="relative text-center py-2 sm:py-3 border-b border-zinc-200/80 max-w-xl mx-auto w-full">
        <div className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-950 tracking-tight font-serif capitalize">
          {data.learnerName}
        </div>
      </div>

      {/* Course Mastery Section */}
      <div className="relative text-center space-y-1 sm:space-y-2">
        <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">
          has successfully completed all lectures, curriculum modules, and assessments for
        </p>
        <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-violet-700 tracking-tight">
          {data.courseTitle}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-zinc-600 font-medium pt-1">
          <span>Date: <strong className="text-zinc-900 font-bold">{data.formattedDate}</strong></span>
          <span>•</span>
          <span>Curriculum: <strong className="text-zinc-900 font-bold">{data.totalLessons} Lessons ({data.totalDurationFormatted})</strong></span>
          <span>•</span>
          <span>Assessment Score: <strong className="text-zinc-900 font-bold">{data.averageQuizScore}%</strong></span>
        </div>
      </div>

      {/* Signatures & Seal Section */}
      <div className="relative grid grid-cols-3 items-end pt-3 sm:pt-6 border-t border-zinc-200/80">
        {/* Left: Instructor Signature */}
        <div className="text-left space-y-0.5">
          <div className={`${cursiveFont.className} text-xl sm:text-3xl md:text-4xl text-zinc-900 font-bold -rotate-3 select-none`}>
            {data.instructorName}
          </div>
          <div className="h-0.5 w-32 sm:w-44 bg-zinc-300" />
          <div className="text-[10px] sm:text-xs font-bold text-zinc-800">{data.instructorName}</div>
          <div className="text-[9px] sm:text-[10px] text-zinc-500">{data.instructorTitle}</div>
        </div>

        {/* Center: Official Seal Badge (Laurel SVG) */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-14 w-14 sm:h-20 sm:w-20 rounded-full border-2 border-violet-600/80 bg-violet-50 flex items-center justify-center text-violet-700 shadow-sm">
            {/* Circular Laurel Star Ring */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <Check className="h-5 w-5 sm:h-7 sm:w-7 stroke-[3] text-violet-700" />
              <span className="text-[7px] sm:text-[9px] uppercase font-black tracking-widest text-violet-800">
                VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Right: Academic Director Signature */}
        <div className="text-right space-y-0.5">
          <div className={`${cursiveFont.className} text-xl sm:text-3xl md:text-4xl text-zinc-900 font-bold rotate-2 select-none`}>
            Dr. Evelyn Vance
          </div>
          <div className="h-0.5 w-32 sm:w-44 bg-zinc-300 ml-auto" />
          <div className="text-[10px] sm:text-xs font-bold text-zinc-800">Academic Committee</div>
          <div className="text-[9px] sm:text-[10px] text-zinc-500">Board of Curriculum Certification</div>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="relative pt-2 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] sm:text-[10px] text-zinc-400 border-t border-zinc-100">
        <div>
          Certificate ID: <span className="font-mono font-bold text-zinc-600">{data.certificateId}</span> (Demo Verification)
        </div>
        <div>
          Issued by Glynac Learning Academy (demo certificate)
        </div>
      </div>
    </div>
  );
}

