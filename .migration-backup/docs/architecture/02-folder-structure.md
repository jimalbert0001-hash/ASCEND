# ASCEND — Folder Structure

```
ascend/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker (Workbox generated)
│   ├── icons/                     # PWA icons (192, 512, maskable)
│   └── offline.html               # Offline fallback page
│
├── src/
│   │
│   ├── main.tsx                   # Entry point, React root
│   ├── App.tsx                    # Router + providers
│   ├── index.css                  # Tailwind directives + CSS vars
│   ├── vite-env.d.ts
│   ├── vite.config.ts
│   │
│   ├── config/
│   │   ├── supabase.ts            # createClient (singleton)
│   │   ├── queryClient.ts         # TanStack QueryClient config
│   │   └── constants.ts           # App-wide magic values
│   │
│   ├── types/
│   │   ├── database.ts            # Auto-generated Supabase types (supabase gen types)
│   │   ├── api.ts                 # Domain-specific mapped types (from DB types)
│   │   ├── forms.ts               # Zod schemas for all forms
│   │   └── index.ts               # Re-export barrel
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── auth.ts            # signIn, signOut, getSession helpers
│   │   │   ├── queries.ts         # Reusable select builders
│   │   │   └── mutations.ts       # Reusable insert/update/delete builders
│   │   ├── utils.ts               # cn(), formatDate(), etc.
│   │   ├── date.ts                # Date math helpers (dayjs or date-fns)
│   │   └── analytics.ts           # analytics_events insert helper
│   │
│   ├── hooks/
│   │   ├── use-auth.ts            # Current user, session
│   │   ├── use-realtime.ts        # Generic Supabase realtime subscription
│   │   ├── use-offline.ts         # navigator.onLine + queue
│   │   ├── use-streak.ts          # Streak calculation from habits
│   │   └── use-timer.ts           # Pomodoro / session timer
│   │
│   ├── stores/                    # Zustand stores (client-only state)
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts            # Sidebar open, active domain, theme
│   │   ├── timer.store.ts         # Active session timer state
│   │   ├── offline-queue.store.ts # Pending writes while offline
│   │   └── ai.store.ts            # Active AI conversation context
│   │
│   ├── api/                       # React Query hooks wrapping Supabase
│   │   ├── academics/
│   │   │   ├── subjects.ts
│   │   │   ├── chapters.ts
│   │   │   ├── revisions.ts
│   │   │   ├── study-sessions.ts
│   │   │   └── mock-tests.ts
│   │   ├── startup/
│   │   │   ├── projects.ts
│   │   │   ├── features.ts
│   │   │   └── metrics.ts
│   │   ├── chess/
│   │   │   ├── sessions.ts
│   │   │   └── ratings.ts
│   │   ├── guitar/
│   │   │   ├── sessions.ts
│   │   │   └── songs.ts
│   │   ├── core/
│   │   │   ├── goals.ts
│   │   │   ├── tasks.ts
│   │   │   ├── habits.ts
│   │   │   ├── achievements.ts
│   │   │   ├── daily-reviews.ts
│   │   │   └── weekly-reviews.ts
│   │   └── ai/
│   │       └── conversations.ts
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives (untouched)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (all shadcn components)
│   │   │
│   │   ├── shared/                # Cross-domain reusable components
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx       # Sidebar + topbar + outlet
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── data/
│   │   │   │   ├── DataTable.tsx      # Generic TanStack Table wrapper
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   ├── forms/
│   │   │   │   ├── FormField.tsx      # Label + input + error wrapper
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   ├── TagInput.tsx
│   │   │   │   └── RichTextEditor.tsx
│   │   │   ├── charts/
│   │   │   │   ├── LineChart.tsx      # Recharts wrapper
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── HeatmapCalendar.tsx  # GitHub-style activity grid
│   │   │   │   └── RadarChart.tsx     # Domain balance radar
│   │   │   ├── goals/
│   │   │   │   ├── GoalCard.tsx
│   │   │   │   ├── GoalProgress.tsx
│   │   │   │   └── GoalCreateModal.tsx
│   │   │   ├── habits/
│   │   │   │   ├── HabitRow.tsx
│   │   │   │   ├── HabitStreak.tsx
│   │   │   │   └── HabitCheckIn.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── TaskCreateModal.tsx
│   │   │   │   └── TaskKanban.tsx
│   │   │   ├── timer/
│   │   │   │   ├── SessionTimer.tsx   # Pomodoro / free timer
│   │   │   │   └── TimerControls.tsx
│   │   │   ├── ai/
│   │   │   │   ├── AIChat.tsx
│   │   │   │   └── AISuggestion.tsx
│   │   │   └── notifications/
│   │   │       ├── NotificationBell.tsx
│   │   │       └── NotificationList.tsx
│   │   │
│   │   ├── academics/             # Domain-specific components
│   │   │   ├── SubjectCard.tsx
│   │   │   ├── ChapterAccordion.tsx
│   │   │   ├── RevisionSchedule.tsx   # Spaced repetition calendar
│   │   │   ├── MockTestCard.tsx
│   │   │   └── StudySessionTimer.tsx
│   │   │
│   │   ├── startup/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── FeatureBoard.tsx       # Kanban for features
│   │   │   ├── MetricChart.tsx
│   │   │   └── MilestoneTimeline.tsx
│   │   │
│   │   ├── chess/
│   │   │   ├── RatingChart.tsx
│   │   │   ├── SessionLogForm.tsx
│   │   │   └── OpeningLibrary.tsx
│   │   │
│   │   └── guitar/
│   │       ├── SongLibrary.tsx
│   │       ├── PracticeLog.tsx
│   │       └── TechniqueProgress.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── OnboardingPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx      # Cross-domain overview
│   │   ├── academics/
│   │   │   ├── AcademicsPage.tsx      # Subject list
│   │   │   ├── SubjectDetailPage.tsx
│   │   │   └── MockTestPage.tsx
│   │   ├── startup/
│   │   │   ├── StartupPage.tsx
│   │   │   └── ProjectDetailPage.tsx
│   │   ├── chess/
│   │   │   └── ChessPage.tsx
│   │   ├── guitar/
│   │   │   └── GuitarPage.tsx
│   │   ├── goals/
│   │   │   └── GoalsPage.tsx
│   │   ├── habits/
│   │   │   └── HabitsPage.tsx
│   │   ├── reviews/
│   │   │   ├── DailyReviewPage.tsx
│   │   │   └── WeeklyReviewPage.tsx
│   │   ├── achievements/
│   │   │   └── AchievementsPage.tsx
│   │   └── settings/
│   │       └── SettingsPage.tsx
│   │
│   └── providers/
│       ├── AuthProvider.tsx       # Session context
│       ├── QueryProvider.tsx      # TanStack QueryClient
│       ├── ThemeProvider.tsx      # Dark/light mode
│       └── PWAProvider.tsx        # Service worker registration + update prompt
│
├── supabase/
│   ├── migrations/                # Versioned SQL migration files
│   │   └── 001_initial_schema.sql
│   ├── functions/                 # Supabase Edge Functions (Deno)
│   │   ├── ai-chat/
│   │   │   └── index.ts           # Calls OpenAI, stores in ai_conversations
│   │   ├── compute-achievements/
│   │   │   └── index.ts           # Triggered by DB events
│   │   ├── weekly-digest/
│   │   │   └── index.ts           # pg_cron → weekly email
│   │   └── spaced-repetition/
│   │       └── index.ts           # Compute next revision dates
│   └── seed.sql                   # Dev seed data
│
├── docs/
│   └── architecture/              # This document and siblings
│
├── .env.local                     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```
