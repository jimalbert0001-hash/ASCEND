---
name: ASCEND Reset All fix
description: How isDataCleared() must be threaded through static data helpers and components to make Reset All work.
---

## Rule
Every data helper function that feeds UI stats must call `isDataCleared()` and return zeros/empty early. Module-level exported array constants cannot be made dynamic — guard them at call-sites in components.

## Why
Pages import static arrays (`projectsData`, `ideasData`, `subjectsData`, `skillAreas`, `practiceSessions`, etc.) and module-level helper functions directly from data files. These bypass the Zustand store entirely, so clearing Zustand state and localStorage alone does nothing to the displayed data.

## How to apply
**Data files** — add `import { isDataCleared } from "@/lib/data-cleared"` at the very top (never mid-file), then add `if (isDataCleared()) return <zero-shape>;` at the top of every exported helper function.

Files fixed:
- `chess-data.ts` → `getChessStats()`
- `guitar-data.ts` → `getGuitarStats()`, new `getSkillAreasData()`
- `startup-data.ts` → `getProjectStats()`, `getOverallStats()`
- `academics-data.ts` → `getSubjectStats()`, `getTotalStats()`, new `getClearedSubjectsData()`

**Components** — for module-level raw array constants still read directly in JSX, add a `const cleared = isDataCleared()` at the top of the component and guard the array reference inline. Key sites:
- `StartupOverview.tsx`: `activeProjects`, `displayIdeas`, project count
- `GuitarOverview.tsx`: replaced `skillAreas` import with `getSkillAreasData()`
- `ProgressPage.tsx` (guitar): `const weekData = isDataCleared() ? [] : practiceByWeek`
- `RevisionPage.tsx`: guard at top of `getRevisionItems()`
- `AnalyticsPage.tsx`: guards in `buildDailyHours()`, `buildMockTrend()`, `buildUnderstandingHeatmap()`
- `SubjectsPage.tsx`: `useState(() => isDataCleared() ? getClearedSubjectsData() : subjectsData)`

## Academics special case
User wants "keep chapter structure, zero progress." Use `getClearedSubjectsData()` which maps all chapters to `isCompleted:false, actualHours:0, revisionCount:0, nextRevision:null, understandingLevel:1`. Do NOT return an empty array for subjects.
