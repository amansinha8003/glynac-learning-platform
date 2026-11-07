# Glynac Learn - Online Learning Platform

A modern, full-featured online learning platform built with Next.js 16 (App Router), React 19, TypeScript strict mode, Tailwind CSS v4, shadcn/ui, Zustand, Framer Motion, and `@dnd-kit`.

---

## 🌟 Tech Stack & Architectural Decisions

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19 Server Components, streaming SSR, and static parameter pre-generation (`generateStaticParams`).
- **Language**: TypeScript with strict mode enabled across all components, store actions, and data models.
- **Styling**: Tailwind CSS v4 with custom semantic CSS variable tokens (violet accent `#7c3aed`), dark/light theme switching via `next-themes`, and zero hardcoded color values.
- **UI Primitives**: [shadcn/ui](https://ui.shadcn.com/) powered by Radix UI (Dialog, DropdownMenu, Tabs, Progress, Accordion, Tooltip).
- **Client State**: [Zustand](https://github.com/pmndrs/zustand) with versioned persistent storage (`localStorage`), automatic schema migrations, and a graceful in-memory storage fallback.
- **Interactions & Drag-and-Drop**: Framer Motion for smooth layout animations (with full `prefers-reduced-motion` compliance) and `@dnd-kit` for drag-to-reorder questions.
- **Zero Remote Asset Dependencies**: Thumbnails, avatars, and certificates are generated with pure CSS gradients, inline SVGs, initials, and emojis for complete offline stability and privacy.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Clone or navigate to the repository
cd glynac-learning

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking & Linting

```bash
# Run ESLint validation
npm run lint

# Run strict TypeScript checks
npx tsc --noEmit
```

### Production Build

```bash
npm run build
npm run start
```

---

## 📁 Project Architecture & Directory Structure

```text
glynac-learning/
├── app/                                # Next.js 16 App Router routes
│   ├── layout.tsx                      # Root layout, theme provider, skip-link & global footer
│   ├── page.tsx                        # Root redirect to /courses
│   ├── error.tsx                       # Global client error boundary with retry
│   ├── loading.tsx                     # Global skeleton loading state
│   ├── not-found.tsx                   # Global 404 page with navigation actions
│   ├── certificates/                   # Gallery of earned course certificates
│   ├── courses/                        # Course Catalog with URL query synchronization
│   │   └── [slug]/                     # Course detail overview & curriculum
│   │       ├── certificate/            # Verifiable printable completion certificate
│   │       ├── learn/[lessonId]/       # Interactive video lesson & transcript player
│   │       └── quiz/[quizId]/          # Assessment engine & timed question runner
│   │           └── result/[attemptId]/ # Detailed quiz score breakdown & review
│   └── dashboard/                      # Learner progress overview, activity heatmaps & stats
├── components/
│   ├── certificate/                    # Certificate paper, toolbar, confetti & locked views
│   ├── courses/                        # Course cards, filter bars, pagination & skeletons
│   ├── dashboard/                      # Streak calendar, rings, charts, and continue cards
│   ├── lesson/                         # Video player controls, transcript viewer & notes
│   ├── quiz/                           # Single, multi & drag-to-order question runners
│   ├── ui/                             # Reusable accessible Radix/shadcn primitives
│   ├── navbar.tsx                      # Navigation bar with user avatar, demo seed & reset
│   └── footer.tsx                      # Site-wide responsive footer
├── data/                               # Typed mock datasets (courses, quizzes, transcripts)
├── lib/                                # Pure utilities & helpers
│   ├── certificate.ts                  # Course completion verification & certificate generation
│   ├── format.ts                       # Unified duration, date, and score formatters
│   ├── quiz.ts                         # Question scoring engines & attempt calculations
│   ├── selectors.ts                    # Zustand memoized computed selectors
│   ├── streak.ts                       # Daily activity calculation & streak algorithms
│   └── transcript.ts                   # Fast binary-search active subtitle matcher
├── store/
│   └── learningStore.ts                # Zustand store with migrations & safe storage fallback
└── types/
    └── learning.ts                     # Strict TypeScript interfaces & discriminated unions
```

---

## 💡 Key Features Walkthrough

1. **Course Catalog & Filtering (`/courses`)**:
   - Instant search across titles, descriptions, instructors, and tags.
   - Multi-select filters for Category, Difficulty Level (Beginner, Intermediate, Advanced), and Duration.
   - Real-time two-way synchronization between URL search parameters and filter state.
   - Mobile filter drawer and responsive grid layout.

2. **Custom Video Player (`/courses/[slug]/learn/[lessonId]`)**:
   - Native HTML5 `<video>` element with custom controls: Play/Pause, Seekbar with hover tooltips, Volume, Speed selector (0.75x to 2x), Subtitles toggle, and Fullscreen.
   - Resumes playback from the exact second saved in localStorage.
   - Built-in simulation fallback mode when video media files are inaccessible.

3. **Interactive Synchronized Transcript**:
   - Real-time active line highlighting computed via efficient binary search.
   - Auto-scroll lock with option to toggle following playback.
   - Click any transcript line to instantly seek the video to that exact timestamp.

4. **Timestamped Notes with Search & Filter**:
   - Auto-pauses video on note composer focus and saves the current timestamp.
   - Filter notes by current lesson or view all notes across the entire course.
   - Full search over note contents and one-click timestamp seeking.

5. **Quiz Engine & Assessment Runner (`/courses/[slug]/quiz/[quizId]`)**:
   - Supports 3 question types: Single Choice, Multiple Choice, and Drag-and-Drop Ordering (`@dnd-kit`).
   - Countdown timer with optional time limit, auto-submit, and confirmation dialog for unattempted questions.
   - Immediate feedback mode and retry-incorrect question workflow.

6. **Quiz Results & Detailed Breakdown**:
   - Animated SVG score ring displaying completion percentage.
   - Question-by-question review with explanations and student response comparison.
   - History of all attempts with best score tracking.

7. **Progress Dashboard (`/dashboard`)**:
   - Visual stat cards: Enrolled Courses, Total Watch Time, Completed Lessons, and Quizzes Passed.
   - Interactive streak calendar showing consecutive learning days.
   - 7-day weekly activity bar chart and course completion rings.
   - "Continue Learning" carousel resuming the latest in-progress course.

8. **Printable Certificate of Completion (`/courses/[slug]/certificate`)**:
   - Strict eligibility enforcement: every lesson completed and passing quiz score achieved.
   - Elegant SVG ornamental border and geometric background pattern in violet.
   - Optimized print stylesheet (`@page { size: A4 landscape; margin: 0; }`) rendering clean black-and-white on white paper regardless of dark mode.
   - One-click PDF download trigger, clipboard verification link copy, and celebratory confetti.

---

## ⌨️ Video Player Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` or `k` | Play / Pause video playback |
| `←` / `→` | Seek backward / forward 5 seconds |
| `j` / `l` | Seek backward / forward 10 seconds |
| `↑` / `↓` | Adjust volume up / down 10% |
| `m` | Toggle mute / unmute |
| `c` | Toggle closed captions / subtitles |
| `f` | Toggle fullscreen mode |
| `0` - `9` | Seek to 0% - 90% of video duration |
| `>` / `<` | Increase / decrease playback speed |
| `n` | Focus notes composer with auto-pause |

---

## 🧪 Demo Data Quality & Quick Testing

- **Preset Demo Data**: Click the user initials in the navbar and select **Load Demo Data** to instantly seed the store with:
  - 1 Completed course (`Enterprise Next.js 15 & Server Actions Architecture`) with an unlocked certificate.
  - 1 In-progress course (`Production TypeScript: Type Systems & Generics`).
  - 1 Enrolled course with a locked certificate.
  - 5-day active learning streak and sample timestamped notes.
- **Reset Progress**: Select **Reset Progress** from the user menu to clear all stored localStorage data after confirming in the dialog.

---

## 🎨 Design Philosophy & Accessibility

- **Theme Palette**: Deep violet primary (`#7c3aed`), calm neutral cards (`#ffffff` light, `#12101c` dark), and high-contrast text meeting WCAG AA guidelines.
- **Accessibility**:
  - Logical heading hierarchy (`h1` through `h4`) on every page.
  - Screen reader landmarks (`header`, `nav`, `main id="main-content"`, `aside`, `footer`).
  - Prominent "Skip to content" keyboard link.
  - Focus rings with `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden`.
  - All icon buttons include explicit `aria-label` tags.
  - Motion transitions automatically disabled when `prefers-reduced-motion` is detected.
