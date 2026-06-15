import { supabase, isSupabaseConfigured } from './supabase';
import { isDataCleared } from './data-cleared';
import {
  ratingHistory, puzzleSessions, openingsData, endgameStudies, tournamentsData, trainingSessions, gameNotes,
  RatingEntry, PuzzleSession, ChessOpening, EndgameStudy, Tournament, TrainingSession, GameNote,
} from './chess-data';

const isMock = !isSupabaseConfigured;

// ─── Rating ───────────────────────────────────────────────────────────────────

export async function getRatingHistory(userId: string): Promise<RatingEntry[]> {
  if (isMock) return isDataCleared() ? [] : ratingHistory;
  try {
    const { data, error } = await supabase.from('chess_rating_history').select('*').eq('user_id', userId).order('date', { ascending: true });
    if (error) throw error;
    return (data as RatingEntry[]) ?? ratingHistory;
  } catch { return ratingHistory; }
}

export async function addRatingEntry(userId: string, entry: Omit<RatingEntry, 'id'>): Promise<RatingEntry> {
  const newEntry: RatingEntry = { ...entry, id: crypto.randomUUID() };
  if (isMock) return newEntry;
  try {
    const { data, error } = await supabase.from('chess_rating_history').insert({ ...entry, user_id: userId }).select().single();
    if (error) throw error;
    return data as RatingEntry;
  } catch { return newEntry; }
}

export async function deleteRatingEntry(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_rating_history').delete().eq('id', id); } catch { }
}

// ─── Puzzle Sessions ──────────────────────────────────────────────────────────

export async function getPuzzleSessions(userId: string): Promise<PuzzleSession[]> {
  if (isMock) return isDataCleared() ? [] : puzzleSessions;
  try {
    const { data, error } = await supabase.from('chess_puzzle_sessions').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return (data as PuzzleSession[]) ?? puzzleSessions;
  } catch { return puzzleSessions; }
}

export async function addPuzzleSession(userId: string, session: Omit<PuzzleSession, 'id'>): Promise<PuzzleSession> {
  const newSession: PuzzleSession = { ...session, id: crypto.randomUUID() };
  if (isMock) return newSession;
  try {
    const { data, error } = await supabase.from('chess_puzzle_sessions').insert({ ...session, user_id: userId }).select().single();
    if (error) throw error;
    return data as PuzzleSession;
  } catch { return newSession; }
}

export async function deletePuzzleSession(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_puzzle_sessions').delete().eq('id', id); } catch { }
}

// ─── Openings ─────────────────────────────────────────────────────────────────

export async function getOpenings(userId: string): Promise<ChessOpening[]> {
  if (isMock) return isDataCleared() ? [] : openingsData;
  try {
    const { data, error } = await supabase.from('chess_openings').select('*').eq('user_id', userId).order('games_played', { ascending: false });
    if (error) throw error;
    return (data as ChessOpening[]) ?? openingsData;
  } catch { return openingsData; }
}

export async function createOpening(userId: string, op: Omit<ChessOpening, 'id'>): Promise<ChessOpening> {
  const newOp: ChessOpening = { ...op, id: crypto.randomUUID() };
  if (isMock) return newOp;
  try {
    const { data, error } = await supabase.from('chess_openings').insert({ ...op, user_id: userId }).select().single();
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

export async function getEndgameStudies(userId: string): Promise<EndgameStudy[]> {
  if (isMock) return isDataCleared() ? [] : endgameStudies;
  try {
    const { data, error } = await supabase.from('chess_endgame_studies').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data as EndgameStudy[]) ?? endgameStudies;
  } catch { return endgameStudies; }
}

export async function updateEndgameStudy(id: string, updates: Partial<EndgameStudy>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_endgame_studies').update(updates).eq('id', id); } catch { }
}

export async function createEndgameStudy(userId: string, study: Omit<EndgameStudy, 'id'>): Promise<EndgameStudy> {
  const newStudy: EndgameStudy = { ...study, id: crypto.randomUUID() };
  if (isMock) return newStudy;
  try {
    const { data, error } = await supabase.from('chess_endgame_studies').insert({ ...study, user_id: userId }).select().single();
    if (error) throw error;
    return data as EndgameStudy;
  } catch { return newStudy; }
}

export async function deleteEndgameStudy(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('chess_endgame_studies').delete().eq('id', id); } catch { }
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export async function getTournaments(userId: string): Promise<Tournament[]> {
  if (isMock) return isDataCleared() ? [] : tournamentsData;
  try {
    const { data, error } = await supabase.from('chess_tournaments').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return (data as Tournament[]) ?? tournamentsData;
  } catch { return tournamentsData; }
}

export async function createTournament(userId: string, t: Omit<Tournament, 'id'>): Promise<Tournament> {
  const newT: Tournament = { ...t, id: crypto.randomUUID() };
  if (isMock) return newT;
  try {
    const { data, error } = await supabase.from('chess_tournaments').insert({ ...t, user_id: userId }).select().single();
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

export async function getTrainingSessions(userId: string): Promise<TrainingSession[]> {
  if (isMock) return isDataCleared() ? [] : trainingSessions;
  try {
    const { data, error } = await supabase.from('chess_training_sessions').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return (data as TrainingSession[]) ?? trainingSessions;
  } catch { return trainingSessions; }
}

export async function createTrainingSession(userId: string, s: Omit<TrainingSession, 'id'>): Promise<TrainingSession> {
  const newS: TrainingSession = { ...s, id: crypto.randomUUID() };
  if (isMock) return newS;
  try {
    const { data, error } = await supabase.from('chess_training_sessions').insert({ ...s, user_id: userId }).select().single();
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

export async function getGameNotes(userId: string): Promise<GameNote[]> {
  if (isMock) return isDataCleared() ? [] : gameNotes;
  try {
    const { data, error } = await supabase.from('chess_game_notes').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    return (data as GameNote[]) ?? gameNotes;
  } catch { return gameNotes; }
}

export async function createGameNote(userId: string, note: Omit<GameNote, 'id'>): Promise<GameNote> {
  const newNote: GameNote = { ...note, id: crypto.randomUUID() };
  if (isMock) return newNote;
  try {
    const { data, error } = await supabase.from('chess_game_notes').insert({ ...note, user_id: userId }).select().single();
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
