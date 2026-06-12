import { supabase } from './supabase';
import {
  ratingHistory, puzzleSessions, openingsData, endgameStudies, tournamentsData, trainingSessions, gameNotes,
  RatingEntry, PuzzleSession, ChessOpening, EndgameStudy, Tournament, TrainingSession, GameNote,
} from './chess-data';

const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';

// ─── Rating ───────────────────────────────────────────────────────────────────

export async function getRatingHistory(): Promise<RatingEntry[]> {
  if (isMock) return ratingHistory;
  try {
    const { data, error } = await supabase.from('chess_rating_history').select('*').order('date', { ascending: true });
    if (error) throw error;
    return (data as RatingEntry[]) ?? ratingHistory;
  } catch { return ratingHistory; }
}

export async function addRatingEntry(entry: Omit<RatingEntry, 'id'>): Promise<RatingEntry> {
  const newEntry: RatingEntry = { ...entry, id: crypto.randomUUID() };
  if (isMock) return newEntry;
  try {
    const { data, error } = await supabase.from('chess_rating_history').insert({ ...entry, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as RatingEntry;
  } catch { return newEntry; }
}

export async function deleteRatingEntry(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_rating_history').delete().eq('id', id); } catch { }
}

// ─── Puzzle Sessions ──────────────────────────────────────────────────────────

export async function getPuzzleSessions(): Promise<PuzzleSession[]> {
  if (isMock) return puzzleSessions;
  try {
    const { data, error } = await supabase.from('chess_puzzle_sessions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as PuzzleSession[]) ?? puzzleSessions;
  } catch { return puzzleSessions; }
}

export async function addPuzzleSession(session: Omit<PuzzleSession, 'id'>): Promise<PuzzleSession> {
  const newSession: PuzzleSession = { ...session, id: crypto.randomUUID() };
  if (isMock) return newSession;
  try {
    const { data, error } = await supabase.from('chess_puzzle_sessions').insert({ ...session, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as PuzzleSession;
  } catch { return newSession; }
}

export async function deletePuzzleSession(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_puzzle_sessions').delete().eq('id', id); } catch { }
}

// ─── Openings ─────────────────────────────────────────────────────────────────

export async function getOpenings(): Promise<ChessOpening[]> {
  if (isMock) return openingsData;
  try {
    const { data, error } = await supabase.from('chess_openings').select('*').order('games_played', { ascending: false });
    if (error) throw error;
    return (data as ChessOpening[]) ?? openingsData;
  } catch { return openingsData; }
}

export async function createOpening(op: Omit<ChessOpening, 'id'>): Promise<ChessOpening> {
  const newOp: ChessOpening = { ...op, id: crypto.randomUUID() };
  if (isMock) return newOp;
  try {
    const { data, error } = await supabase.from('chess_openings').insert({ ...op, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as ChessOpening;
  } catch { return newOp; }
}

export async function updateOpening(id: string, updates: Partial<ChessOpening>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_openings').update(updates).eq('id', id); } catch { }
}

export async function deleteOpening(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_openings').delete().eq('id', id); } catch { }
}

// ─── Endgame Studies ──────────────────────────────────────────────────────────

export async function getEndgameStudies(): Promise<EndgameStudy[]> {
  if (isMock) return endgameStudies;
  try {
    const { data, error } = await supabase.from('chess_endgame_studies').select('*');
    if (error) throw error;
    return (data as EndgameStudy[]) ?? endgameStudies;
  } catch { return endgameStudies; }
}

export async function updateEndgameStudy(id: string, updates: Partial<EndgameStudy>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_endgame_studies').update(updates).eq('id', id); } catch { }
}

export async function createEndgameStudy(study: Omit<EndgameStudy, 'id'>): Promise<EndgameStudy> {
  const newStudy: EndgameStudy = { ...study, id: crypto.randomUUID() };
  if (isMock) return newStudy;
  try {
    const { data, error } = await supabase.from('chess_endgame_studies').insert({ ...study, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as EndgameStudy;
  } catch { return newStudy; }
}

export async function deleteEndgameStudy(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_endgame_studies').delete().eq('id', id); } catch { }
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export async function getTournaments(): Promise<Tournament[]> {
  if (isMock) return tournamentsData;
  try {
    const { data, error } = await supabase.from('chess_tournaments').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as Tournament[]) ?? tournamentsData;
  } catch { return tournamentsData; }
}

export async function createTournament(t: Omit<Tournament, 'id'>): Promise<Tournament> {
  const newT: Tournament = { ...t, id: crypto.randomUUID() };
  if (isMock) return newT;
  try {
    const { data, error } = await supabase.from('chess_tournaments').insert({ ...t, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as Tournament;
  } catch { return newT; }
}

export async function updateTournament(id: string, updates: Partial<Tournament>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_tournaments').update(updates).eq('id', id); } catch { }
}

export async function deleteTournament(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_tournaments').delete().eq('id', id); } catch { }
}

// ─── Training Sessions ────────────────────────────────────────────────────────

export async function getTrainingSessions(): Promise<TrainingSession[]> {
  if (isMock) return trainingSessions;
  try {
    const { data, error } = await supabase.from('chess_training_sessions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as TrainingSession[]) ?? trainingSessions;
  } catch { return trainingSessions; }
}

export async function createTrainingSession(s: Omit<TrainingSession, 'id'>): Promise<TrainingSession> {
  const newS: TrainingSession = { ...s, id: crypto.randomUUID() };
  if (isMock) return newS;
  try {
    const { data, error } = await supabase.from('chess_training_sessions').insert({ ...s, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as TrainingSession;
  } catch { return newS; }
}

export async function updateTrainingSession(id: string, updates: Partial<TrainingSession>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_training_sessions').update(updates).eq('id', id); } catch { }
}

export async function deleteTrainingSession(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_training_sessions').delete().eq('id', id); } catch { }
}

// ─── Game Notes ───────────────────────────────────────────────────────────────

export async function getGameNotes(): Promise<GameNote[]> {
  if (isMock) return gameNotes;
  try {
    const { data, error } = await supabase.from('chess_game_notes').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as GameNote[]) ?? gameNotes;
  } catch { return gameNotes; }
}

export async function createGameNote(note: Omit<GameNote, 'id'>): Promise<GameNote> {
  const newNote: GameNote = { ...note, id: crypto.randomUUID() };
  if (isMock) return newNote;
  try {
    const { data, error } = await supabase.from('chess_game_notes').insert({ ...note, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as GameNote;
  } catch { return newNote; }
}

export async function updateGameNote(id: string, updates: Partial<GameNote>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_game_notes').update(updates).eq('id', id); } catch { }
}

export async function deleteGameNote(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_game_notes').delete().eq('id', id); } catch { }
}
