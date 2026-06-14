# ASCEND — API & State Management Architecture

## Data Fetching Strategy

ASCEND uses **two layers** for data:

| Layer | Tool | What It Handles |
|---|---|---|
| Server state | TanStack React Query | All Supabase reads/writes, caching, background refetch |
| Client state | Zustand | UI state, timer, offline queue, AI context |

There is no Express/REST backend. The React app talks directly to Supabase via the JS client. Edge Functions handle server-side compute (AI, spaced repetition scheduling, achievement computation).

---

## React Query Setup

```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 min — Supabase data doesn't change every second
      gcTime: 1000 * 60 * 30,          // 30 min in memory
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,         // Crucial for PWA offline recovery
    },
    mutations: {
      retry: 1,
    },
  },
});
```

---

## Query Key Factory (type-safe, hierarchical)

```typescript
// src/api/queryKeys.ts
export const queryKeys = {
  // Core
  goals:        (userId: string) => ['goals', userId] as const,
  goal:         (id: string)     => ['goals', 'detail', id] as const,
  tasks:        (userId: string, filters?: object) => ['tasks', userId, filters] as const,
  habits:       (userId: string) => ['habits', userId] as const,

  // Academics
  subjects:     (userId: string) => ['subjects', userId] as const,
  chapters:     (subjectId: string) => ['chapters', subjectId] as const,
  revisionsDue: (userId: string) => ['revisions', 'due', userId] as const,
  studySessions:(userId: string) => ['study-sessions', userId] as const,
  mockTests:    (userId: string) => ['mock-tests', userId] as const,

  // Startup
  projects:     (userId: string) => ['startup-projects', userId] as const,
  features:     (projectId: string) => ['startup-features', projectId] as const,
  metrics:      (projectId: string, name?: string) => ['startup-metrics', projectId, name] as const,

  // Chess
  chessSessions:(userId: string) => ['chess-sessions', userId] as const,
  chessRatings: (userId: string, platform?: string) => ['chess-ratings', userId, platform] as const,

  // Guitar
  guitarSessions:(userId: string) => ['guitar-sessions', userId] as const,
  songs:        (userId: string) => ['guitar-songs', userId] as const,

  // Reviews
  dailyReviews: (userId: string) => ['daily-reviews', userId] as const,
  dailyReview:  (userId: string, date: string) => ['daily-reviews', userId, date] as const,
  weeklyReviews:(userId: string) => ['weekly-reviews', userId] as const,

  // Cross-domain
  achievements: (userId: string) => ['achievements', userId] as const,
  notifications:(userId: string) => ['notifications', userId] as const,
  aiConvos:     (userId: string, convId: string) => ['ai-conversations', userId, convId] as const,
} as const;
```

---

## API Hook Patterns

### Read (useQuery)

```typescript
// src/api/academics/chapters.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { queryKeys } from '@/api/queryKeys';
import type { Chapter } from '@/types';

export function useChapters(subjectId: string) {
  return useQuery({
    queryKey: queryKeys.chapters(subjectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*, revisions(id, scheduled_date, completed_at, stage, next_due_date)')
        .eq('subject_id', subjectId)
        .order('chapter_number', { ascending: true });

      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!subjectId,
  });
}
```

### Write (useMutation + optimistic update)

```typescript
export function useCompleteChapter() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterId, subjectId }: { chapterId: string; subjectId: string }) => {
      const { data, error } = await supabase
        .from('chapters')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', chapterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Optimistic update — UI feels instant
    onMutate: async ({ chapterId, subjectId }) => {
      await qc.cancelQueries({ queryKey: queryKeys.chapters(subjectId) });
      const previous = qc.getQueryData(queryKeys.chapters(subjectId));

      qc.setQueryData(queryKeys.chapters(subjectId), (old: Chapter[] | undefined) =>
        old?.map(c => c.id === chapterId ? { ...c, isCompleted: true } : c)
      );

      return { previous, subjectId };
    },

    onError: (_err, _vars, context) => {
      qc.setQueryData(queryKeys.chapters(context!.subjectId), context!.previous);
    },

    onSettled: (_data, _err, { subjectId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.chapters(subjectId) });
    },
  });
}
```

### Realtime subscription hook

```typescript
// src/hooks/use-realtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export function useRealtimeNotifications(userId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ['notifications', userId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, qc]);
}
```

---

## Zustand Stores

### Auth Store

```typescript
// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Profile } from '@/types';

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, profile: null }),
    }),
    { name: 'ascend-auth' }
  )
);
```

### UI Store

```typescript
// src/stores/ui.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Domain } from '@/types';

interface UIStore {
  sidebarOpen: boolean;
  activeDomain: Domain | 'dashboard';
  commandPaletteOpen: boolean;
  theme: 'dark' | 'light' | 'system';
  setSidebarOpen: (v: boolean) => void;
  setActiveDomain: (d: Domain | 'dashboard') => void;
  setCommandPalette: (v: boolean) => void;
  setTheme: (t: 'dark' | 'light' | 'system') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeDomain: 'dashboard',
      commandPaletteOpen: false,
      theme: 'dark',
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setActiveDomain: (d) => set({ activeDomain: d }),
      setCommandPalette: (v) => set({ commandPaletteOpen: v }),
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'ascend-ui' }
  )
);
```

### Timer Store

```typescript
// src/stores/timer.store.ts
import { create } from 'zustand';
import type { Domain, TimerState } from '@/types';

interface TimerStore extends TimerState {
  start: (config: { domain: Domain; entityId?: string; mode?: 'pomodoro' | 'free' }) => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;   // Writes session to DB via React Query mutation
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  isRunning: false,
  startedAt: null,
  elapsed: 0,
  mode: 'pomodoro',
  pomodoroLength: 25,
  breakLength: 5,
  domain: null,
  entityId: null,

  start: ({ domain, entityId, mode = 'pomodoro' }) =>
    set({ isRunning: true, startedAt: Date.now(), elapsed: 0, domain, entityId, mode }),

  pause: () => set({ isRunning: false }),
  resume: () => set({ isRunning: true }),

  tick: () => set(s => ({ elapsed: s.elapsed + 1 })),

  stop: async () => {
    const { elapsed, domain, entityId } = get();
    set({ isRunning: false, startedAt: null, elapsed: 0, domain: null, entityId: null });
    // caller should use the mutation returned by useCreateStudySession / useCreateGuitarSession
    // passing elapsed to avoid circular dependency
    return;
  },
}));
```

### Offline Queue Store

```typescript
// src/stores/offline-queue.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QueuedWrite {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  queuedAt: number;
}

interface OfflineQueueStore {
  queue: QueuedWrite[];
  enqueue: (write: Omit<QueuedWrite, 'id' | 'queuedAt'>) => void;
  dequeue: (id: string) => void;
  flush: () => Promise<void>;   // Called on reconnect
}

export const useOfflineQueue = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      enqueue: (write) =>
        set(s => ({
          queue: [...s.queue, { ...write, id: crypto.randomUUID(), queuedAt: Date.now() }],
        })),
      dequeue: (id) =>
        set(s => ({ queue: s.queue.filter(w => w.id !== id) })),
      flush: async () => {
        // Replay each write against Supabase in order
        // Implementation calls supabase.from(table)[operation](payload) for each
      },
    }),
    { name: 'ascend-offline-queue' }
  )
);
```

---

## Edge Functions (Supabase Deno)

| Function | Trigger | What it does |
|---|---|---|
| `ai-chat` | HTTP POST | Calls OpenAI, appends to `ai_conversations`, returns response |
| `compute-achievements` | DB trigger (after insert) | Evaluates rules, inserts into `achievements`, creates notification |
| `spaced-repetition` | pg_cron daily 00:00 IST | Runs SM-2 over pending `revisions`, schedules next revision |
| `weekly-digest` | pg_cron Sunday 20:00 IST | Aggregates the week, creates `weekly_reviews` draft, sends push notification |
| `embed-conversation` | DB trigger after insert on `ai_conversations` | Calls OpenAI embeddings API, writes `vector(1536)` back |

---

## PWA Offline Strategy

| Data | Strategy | TTL |
|---|---|---|
| Goals / Habits / Subjects | Cache-first + background sync | Stale after 5 min |
| Today's tasks | Network-first (must be fresh) | No cache |
| Study sessions (writes while offline) | Queue in Zustand persist store; replay on reconnect | Until flushed |
| Assets (icons, fonts) | Cache-first permanent | Until app update |

```
Service Worker registration → navigator.serviceWorker.register('/sw.js')
Workbox InjectManifest → precaches static assets
Runtime caching → supabase API responses (StaleWhileRevalidate strategy)
Background sync → offline write queue flush on reconnect
```
