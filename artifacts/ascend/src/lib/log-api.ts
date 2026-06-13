import { apiFetch } from './api-fetch';

const LOG_BASE = '/api/log';
const DATA_BASE = '/api/data';

async function post(path: string, body: unknown) {
  const res = await apiFetch(`${LOG_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function get(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiFetch(`${DATA_BASE}${path}?${qs}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export interface StudySessionPayload {
  userId: string;
  subjectId?: string;
  chapterId?: string;
  durationMins: number;
  sessionType: 'study' | 'revision' | 'mock_prep';
  focusScore: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface ChessSessionPayload {
  userId: string;
  sessionType: 'game' | 'tactics' | 'analysis' | 'openings' | 'endgames';
  platform?: 'lichess' | 'chess.com' | 'otb';
  timeControl?: string;
  durationMins?: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  tacticsSolved?: number;
  accuracy?: number;
  focusArea?: string;
  notes?: string;
  newRating?: number;
}

export interface GuitarSessionPayload {
  userId: string;
  durationMins: number;
  focusAreas: string[];
  bpmTarget?: number;
  bpmAchieved?: number;
  qualityScore?: number;
  notes?: string;
}

export interface ReviewPayload {
  userId: string;
  moodScore: number;
  energyLevel: number;
  overallScore?: number;
  wins: string[];
  blockers: string[];
  tomorrowPriorities: string[];
  studyMins?: number;
  chessSessionDone?: boolean;
  guitarSessionDone?: boolean;
  startupTaskDone?: boolean;
  notes?: string;
}

export const logStudySession = (payload: StudySessionPayload) => post('/study', payload);
export const logChessSession = (payload: ChessSessionPayload) => post('/chess', payload);
export const logGuitarSession = (payload: GuitarSessionPayload) => post('/guitar', payload);
export const completeTask = (userId: string, taskId: string, complete = true) =>
  post('/task', { userId, taskId, complete });
export const logDailyReview = (payload: ReviewPayload) => post('/review', payload);

export const fetchAcademicsData = (userId: string) => get('/academics', { userId });
export const fetchChessData = (userId: string) => get('/chess', { userId });
export const fetchGuitarData = (userId: string) => get('/guitar', { userId });
export const fetchTasksData = (userId: string) => get('/tasks', { userId });
