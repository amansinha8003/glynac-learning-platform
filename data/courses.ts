import { Course } from '@/types/learning';
import { createTranscript, getVideoForIndex } from './transcripts';

let globalLessonCounter = 0;

function buildLesson(title: string, durationSeconds: number, quizId?: string) {
  const videoUrl = getVideoForIndex(globalLessonCounter);
  const transcript = createTranscript(title, durationSeconds);
  const lessonId = `les-${++globalLessonCounter}`;
  return {
    id: lessonId,
    title,
    durationSeconds,
    videoUrl,
    transcript,
    quizId,
  };
}

export const courses: Course[] = [
  // ---------------------------------------------
  // Web Development (inst-1: Alex Rivera)
  // ---------------------------------------------
  {
    id: 'course-nextjs-pro',
    title: 'Enterprise Next.js 15 & Server Actions Architecture',
    slug: 'enterprise-nextjs-15-server-actions',
    description: 'Master full-stack Next.js 15 with App Router, streaming SSR, parallel routes, React Server Components, and optimized cache invalidation.',
    category: 'Web Development',
    level: 'Advanced',
    rating: 4.94,
    ratingsCount: 1420,
    durationMinutes: 240,
    thumbnail: {
      gradient: 'from-blue-600 via-indigo-600 to-slate-900',
      emoji: '⚡',
    },
    instructorId: 'inst-1',
    tags: ['Next.js', 'React 19', 'Server Actions', 'Full-Stack', 'Performance'],
    createdAt: '2026-01-15T09:00:00Z',
    popularity: 98,
    sections: [
      {
        id: 'sec-next-1',
        title: 'App Router & RSC Mental Model',
        lessons: [
          buildLesson('Mental Model: Server Components vs Client Boundaries', 540),
          buildLesson('Streaming with Suspense & Loading Skeletons', 620),
          buildLesson('Nested Layouts, Error Boundaries & Route Groups', 480, 'quiz-nextjs-arch'),
        ],
      },
      {
        id: 'sec-next-2',
        title: 'Server Actions, Mutations & Data Fetching',
        lessons: [
          buildLesson('Type-Safe Server Actions & Form Status Hooks', 710),
          buildLesson('Fine-Grained Revalidation with revalidateTag and Path', 590),
          buildLesson('Optimistic UI Updates with useOptimistic Hook', 510),
        ],
      },
    ],
  },
  {
    id: 'course-typescript-mastery',
    title: 'Production TypeScript: Type Systems & Generics',
    slug: 'production-typescript-type-systems-generics',
    description: 'Transform your TypeScript code from loose annotations to bulletproof compile-time safety with conditional types, template literals, and mapped types.',
    category: 'Web Development',
    level: 'Intermediate',
    rating: 4.88,
    ratingsCount: 1180,
    durationMinutes: 190,
    thumbnail: {
      gradient: 'from-sky-500 via-blue-700 to-indigo-950',
      emoji: '🔷',
    },
    instructorId: 'inst-1',
    tags: ['TypeScript', 'Generics', 'Static Analysis', 'Type Safety'],
    createdAt: '2026-02-01T10:00:00Z',
    popularity: 92,
    sections: [
      {
        id: 'sec-ts-1',
        title: 'Deep Dive into Generics & Constraints',
        lessons: [
          buildLesson('Generic Functions, Constraints and Defaults', 560),
          buildLesson('Conditional Types & The Infer Keyword', 640),
          buildLesson('Type Narrowing and Discriminated Unions in Practice', 520, 'quiz-ts-mastery'),
        ],
      },
      {
        id: 'sec-ts-2',
        title: 'Advanced Utilities & Meta-Typing',
        lessons: [
          buildLesson('Template Literal Types & String Pattern Matching', 490),
          buildLesson('Building Custom Schema Validators from Scratch', 680),
        ],
      },
    ],
  },
  {
    id: 'course-tailwind-design-systems',
    title: 'Modern CSS & Tailwind CSS Architecture',
    slug: 'modern-css-tailwind-architecture',
    description: 'Architect maintainable design systems with Tailwind CSS v4, custom theme tokens, container queries, and headless UI primitives.',
    category: 'Web Development',
    level: 'Beginner',
    rating: 4.82,
    ratingsCount: 940,
    durationMinutes: 160,
    thumbnail: {
      gradient: 'from-cyan-500 via-teal-600 to-slate-900',
      emoji: '🎨',
    },
    instructorId: 'inst-1',
    tags: ['Tailwind CSS', 'CSS Architecture', 'Responsive Design', 'Design Tokens'],
    createdAt: '2026-02-14T08:30:00Z',
    popularity: 88,
    sections: [
      {
        id: 'sec-tw-1',
        title: 'Tailwind v4 Setup & CSS Variable Tokens',
        lessons: [
          buildLesson('CSS-First Theme Configurations & Design Tokens', 430),
          buildLesson('Responsive Breakpoints, Container Queries & Subgrid', 520),
        ],
      },
      {
        id: 'sec-tw-2',
        title: 'Component Architecture & Accessible Patterns',
        lessons: [
          buildLesson('Extracting Polymorphic UI Components with CVA', 580),
          buildLesson('Dark Mode Strategies and System Preference Syncing', 460, 'quiz-tailwind-css'),
        ],
      },
    ],
  },

  // ---------------------------------------------
  // Data Science (inst-2: Dr. Sophia Chen)
  // ---------------------------------------------
  {
    id: 'course-python-data-analysis',
    title: 'Python for High-Impact Data Science & Analytics',
    slug: 'python-data-science-analytics',
    description: 'Accelerate exploratory data analysis and statistical computation using NumPy, Pandas vectorization, and interactive Plotly visualizations.',
    category: 'Data Science',
    level: 'Beginner',
    rating: 4.91,
    ratingsCount: 2150,
    durationMinutes: 210,
    thumbnail: {
      gradient: 'from-emerald-500 via-teal-700 to-cyan-950',
      emoji: '🐍',
    },
    instructorId: 'inst-2',
    tags: ['Python', 'Pandas', 'NumPy', 'Data Visualization', 'Analytics'],
    createdAt: '2026-01-20T11:00:00Z',
    popularity: 96,
    sections: [
      {
        id: 'sec-py-1',
        title: 'NumPy Arrays & Vectorized Computing',
        lessons: [
          buildLesson('Vectorized Array Operations & Broadcasting Math', 510),
          buildLesson('Multidimensional Slicing & Memory Layouts', 480),
        ],
      },
      {
        id: 'sec-py-2',
        title: 'Pandas Data Wrangling & Transformations',
        lessons: [
          buildLesson('Filtering, Aggregations & Multi-Index GroupBy', 630),
          buildLesson('Cleaning Messy Data, Missing Values & Outliers', 540, 'quiz-python-data'),
          buildLesson('Time-Series Resampling and Rolling Windows', 600),
        ],
      },
    ],
  },
  {
    id: 'course-applied-machine-learning',
    title: 'Applied Machine Learning & Predictive Modeling',
    slug: 'applied-machine-learning-predictive-modeling',
    description: 'Build, evaluate, and tune production-ready ML algorithms with Scikit-Learn, gradient boosting with XGBoost, and model interpretability tools.',
    category: 'Data Science',
    level: 'Intermediate',
    rating: 4.87,
    ratingsCount: 1670,
    durationMinutes: 280,
    thumbnail: {
      gradient: 'from-violet-600 via-purple-700 to-indigo-950',
      emoji: '🤖',
    },
    instructorId: 'inst-2',
    tags: ['Machine Learning', 'Scikit-Learn', 'XGBoost', 'Feature Engineering'],
    createdAt: '2026-02-10T14:00:00Z',
    popularity: 94,
    sections: [
      {
        id: 'sec-ml-1',
        title: 'Supervised Learning & Model Validation',
        lessons: [
          buildLesson('Classification vs Regression: Metrics That Matter', 590),
          buildLesson('Cross-Validation, Stratification & Preventing Leakage', 640),
          buildLesson('Feature Engineering and Preprocessing Pipelines', 580, 'quiz-ml-foundations'),
        ],
      },
      {
        id: 'sec-ml-2',
        title: 'Tree Ensembles & Hyperparameter Tuning',
        lessons: [
          buildLesson('Random Forests and Decision Tree Splitting Criteria', 610),
          buildLesson('Gradient Boosted Trees with XGBoost & LightGBM', 730),
          buildLesson('Model Interpretability with SHAP Values', 540),
        ],
      },
    ],
  },
  {
    id: 'course-sql-data-modeling',
    title: 'Advanced SQL & Analytical Data Modeling',
    slug: 'advanced-sql-analytical-data-modeling',
    description: 'Write high-performance SQL queries with window functions, recursive CTEs, and architect dimensional star schemas for modern data warehouses.',
    category: 'Data Science',
    level: 'Advanced',
    rating: 4.79,
    ratingsCount: 890,
    durationMinutes: 175,
    thumbnail: {
      gradient: 'from-teal-600 via-emerald-800 to-slate-900',
      emoji: '📊',
    },
    instructorId: 'inst-2',
    tags: ['SQL', 'Data Warehousing', 'PostgreSQL', 'Dimensional Modeling'],
    createdAt: '2026-03-01T09:30:00Z',
    popularity: 84,
    sections: [
      {
        id: 'sec-sql-1',
        title: 'Analytical Window Functions & CTEs',
        lessons: [
          buildLesson('Window Functions: Partition By, Rank, and Moving Averages', 550),
          buildLesson('Recursive Common Table Expressions for Hierarchical Data', 590),
        ],
      },
      {
        id: 'sec-sql-2',
        title: 'Data Warehouse Schemas & Query Optimization',
        lessons: [
          buildLesson('Star Schema vs Snowflake Schema Design Principles', 530),
          buildLesson('Analyzing EXPLAIN Plans and Index Selection Strategies', 620),
        ],
      },
    ],
  },

  // ---------------------------------------------
  // Design (inst-3: Marcus Vance)
  // ---------------------------------------------
  {
    id: 'course-figma-design-systems',
    title: 'Scalable UI/UX Design Systems in Figma',
    slug: 'scalable-design-systems-in-figma',
    description: 'Design world-class design systems with Figma variables, auto-layout 5.0, responsive components, interactive states, and developer handoff.',
    category: 'Design',
    level: 'Intermediate',
    rating: 4.95,
    ratingsCount: 1890,
    durationMinutes: 220,
    thumbnail: {
      gradient: 'from-fuchsia-600 via-pink-600 to-purple-950',
      emoji: '📐',
    },
    instructorId: 'inst-3',
    tags: ['Figma', 'Design Systems', 'UI/UX', 'Design Tokens', 'Handoff'],
    createdAt: '2026-01-25T13:00:00Z',
    popularity: 97,
    sections: [
      {
        id: 'sec-ds-1',
        title: 'Design Tokens & Figma Variables',
        lessons: [
          buildLesson('Setting Up Semantic Color & Spacing Variables', 520),
          buildLesson('Multi-Brand Modes & Dark Theme Token Switches', 610),
          buildLesson('Atomic Components: Buttons, Badges, and Form Inputs', 570, 'quiz-uiux-design-systems'),
        ],
      },
      {
        id: 'sec-ds-2',
        title: 'Advanced Component Variants & Documentation',
        lessons: [
          buildLesson('Component Properties, Boolean Slots & Nested Instances', 640),
          buildLesson('Zero-Friction Developer Handoff and Style Guides', 500),
        ],
      },
    ],
  },
  {
    id: 'course-typography-visual-hierarchy',
    title: 'Visual Hierarchy, Typography & Layout Mastery',
    slug: 'visual-hierarchy-typography-layout',
    description: 'Elevate your UI craft by mastering optical alignment, modular type scales, spatial grid rhythms, and contrast balance for effortless scanning.',
    category: 'Design',
    level: 'Beginner',
    rating: 4.86,
    ratingsCount: 760,
    durationMinutes: 140,
    thumbnail: {
      gradient: 'from-amber-500 via-orange-600 to-red-950',
      emoji: '✨',
    },
    instructorId: 'inst-3',
    tags: ['Typography', 'Layout', 'Visual Design', 'Hierarchy'],
    createdAt: '2026-02-18T16:00:00Z',
    popularity: 86,
    sections: [
      {
        id: 'sec-typo-1',
        title: 'Typographic Hierarchy & Modular Scales',
        lessons: [
          buildLesson('Choosing Font Pairings & Establishing Modular Scales', 470),
          buildLesson('Line Heights, Measure, and Optical Alignment Rules', 490),
        ],
      },
      {
        id: 'sec-typo-2',
        title: 'Spatial Rhythm & Contrast Techniques',
        lessons: [
          buildLesson('The 8pt Grid System and Micro vs Macro Spacing', 510),
          buildLesson('Directing Attention with Contrast, Shadows, and Elevation', 460),
        ],
      },
    ],
  },
  {
    id: 'course-micro-interactions-motion',
    title: 'Micro-Interactions & Motion Design for Web',
    slug: 'micro-interactions-motion-design-web',
    description: 'Bring interfaces to life with purposeful motion, gesture-driven interfaces, spring physics, and fluid transitions using Framer Motion.',
    category: 'Design',
    level: 'Advanced',
    rating: 4.92,
    ratingsCount: 1120,
    durationMinutes: 195,
    thumbnail: {
      gradient: 'from-rose-500 via-red-600 to-stone-900',
      emoji: '💫',
    },
    instructorId: 'inst-3',
    tags: ['Motion Design', 'Framer Motion', 'Micro-Interactions', 'Animation'],
    createdAt: '2026-03-05T12:00:00Z',
    popularity: 91,
    sections: [
      {
        id: 'sec-motion-1',
        title: 'Animation Principles & Physics Curves',
        lessons: [
          buildLesson('12 Principles of Animation Adapted for User Interfaces', 540),
          buildLesson('Spring Physics vs Cubic Bezier Easing Curves', 500),
        ],
      },
      {
        id: 'sec-motion-2',
        title: 'Framer Motion & Interactive State Transitions',
        lessons: [
          buildLesson('Layout Animations with layoutId and AnimatePresence', 620),
          buildLesson('Drag Gestures, Kinetic Velocity, and Reordering Lists', 670),
        ],
      },
    ],
  },

  // ---------------------------------------------
  // Business (inst-4: Elena Rostova)
  // ---------------------------------------------
  {
    id: 'course-tech-product-management',
    title: 'Tech Product Management: Discovery to Launch',
    slug: 'tech-product-management-discovery-launch',
    description: 'Lead cross-functional product squads from customer discovery and problem framing to prioritized roadmaps, PRDs, and validated releases.',
    category: 'Business',
    level: 'Beginner',
    rating: 4.89,
    ratingsCount: 1530,
    durationMinutes: 215,
    thumbnail: {
      gradient: 'from-blue-700 via-indigo-800 to-neutral-950',
      emoji: '🚀',
    },
    instructorId: 'inst-4',
    tags: ['Product Management', 'Roadmaps', 'Discovery', 'Strategy'],
    createdAt: '2026-01-28T09:00:00Z',
    popularity: 95,
    sections: [
      {
        id: 'sec-pm-1',
        title: 'Customer Discovery & Problem Definition',
        lessons: [
          buildLesson('Conducting Actionable User Interviews without Bias', 530),
          buildLesson('Framing Problem Statements and Opportunity Solution Trees', 560),
        ],
      },
      {
        id: 'sec-pm-2',
        title: 'Prioritization Frameworks & Product Specs',
        lessons: [
          buildLesson('RICE vs Value vs Effort Prioritization Matrices', 490),
          buildLesson('Writing High-Clarity PRDs That Engineers Love', 610),
          buildLesson('Defining North Star Metrics and Cohort Retention KPIs', 540),
        ],
      },
    ],
  },
  {
    id: 'course-saas-growth-strategy',
    title: 'Product-Led Growth & SaaS Monetization Strategy',
    slug: 'saas-growth-monetization-strategy',
    description: 'Design viral product loops, optimize onboarding activation rates, and implement data-driven pricing experiments for compounding ARR growth.',
    category: 'Business',
    level: 'Advanced',
    rating: 4.84,
    ratingsCount: 820,
    durationMinutes: 180,
    thumbnail: {
      gradient: 'from-amber-600 via-emerald-700 to-slate-900',
      emoji: '📈',
    },
    instructorId: 'inst-4',
    tags: ['PLG', 'SaaS', 'Monetization', 'Retention', 'Growth Loops'],
    createdAt: '2026-02-22T10:30:00Z',
    popularity: 89,
    sections: [
      {
        id: 'sec-plg-1',
        title: 'Product-Led Onboarding & Time-To-Value',
        lessons: [
          buildLesson('Designing Zero-Friction First-Run Experiences', 510),
          buildLesson('Identifying Aha Moments & Shrinking Time-To-Value', 580),
        ],
      },
      {
        id: 'sec-plg-2',
        title: 'Pricing Models & Expansion Loops',
        lessons: [
          buildLesson('Usage-Based vs Seat-Based SaaS Pricing Tiers', 590),
          buildLesson('Engineering Viral Loops & Bottom-Up Enterprise Upgrades', 610),
        ],
      },
    ],
  },
  {
    id: 'course-agile-scrum-delivery',
    title: 'Agile Delivery, Sprint Cadence & Team Velocity',
    slug: 'agile-delivery-sprint-velocity',
    description: 'Streamline high-velocity software delivery with pragmatic Scrum ceremonies, story slicing, Kanban WIP limits, and blameless retrospectives.',
    category: 'Business',
    level: 'Intermediate',
    rating: 4.77,
    ratingsCount: 640,
    durationMinutes: 155,
    thumbnail: {
      gradient: 'from-orange-600 via-amber-700 to-zinc-950',
      emoji: '🎯',
    },
    instructorId: 'inst-4',
    tags: ['Agile', 'Scrum', 'Team Velocity', 'Sprint Planning'],
    createdAt: '2026-03-08T15:00:00Z',
    popularity: 83,
    sections: [
      {
        id: 'sec-agile-1',
        title: 'Sprint Planning & User Story Slicing',
        lessons: [
          buildLesson('Splitting Large Epics into Vertical End-to-End Stories', 480),
          buildLesson('Estimation Techniques: Planning Poker and Story Points', 450),
        ],
      },
      {
        id: 'sec-agile-2',
        title: 'Continuous Delivery Flow & Retrospectives',
        lessons: [
          buildLesson('Kanban WIP Limits and Eliminating Bottlenecks', 510),
          buildLesson('Running Psychological-Safety-Driven Sprint Retrospectives', 490),
        ],
      },
    ],
  },
];

