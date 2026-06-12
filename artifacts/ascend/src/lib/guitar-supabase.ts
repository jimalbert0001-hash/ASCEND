import { supabase } from './supabase';
import {
  practiceSessions, songsData, chordsData, scalesData, theoryLessons, recordings, skillAreas,
  PracticeSession, Song, ChordProgress, ScaleProgress, TheoryLesson, RecordingEntry, SkillArea,
} from './guitar-data';

const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';

// ─── Practice Sessions ────────────────────────────────────────────────────────

export async function getPracticeSessions(): Promise<PracticeSession[]> {
  if (isMock) return practiceSessions;
  try {
    const { data, error } = await supabase.from('guitar_practice_sessions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as PracticeSession[]) ?? practiceSessions;
  } catch { return practiceSessions; }
}

export async function createPracticeSession(s: Omit<PracticeSession, 'id'>): Promise<PracticeSession> {
  const newS: PracticeSession = { ...s, id: crypto.randomUUID() };
  if (isMock) return newS;
  try {
    const { data, error } = await supabase.from('guitar_practice_sessions').insert({ ...s, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as PracticeSession;
  } catch { return newS; }
}

export async function updatePracticeSession(id: string, updates: Partial<PracticeSession>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_practice_sessions').update(updates).eq('id', id); } catch { }
}

export async function deletePracticeSession(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_practice_sessions').delete().eq('id', id); } catch { }
}

// ─── Songs ────────────────────────────────────────────────────────────────────

export async function getSongs(): Promise<Song[]> {
  if (isMock) return songsData;
  try {
    const { data, error } = await supabase.from('guitar_songs').select('*').order('start_date', { ascending: false });
    if (error) throw error;
    return (data as Song[]) ?? songsData;
  } catch { return songsData; }
}

export async function createSong(song: Omit<Song, 'id'>): Promise<Song> {
  const newSong: Song = { ...song, id: crypto.randomUUID() };
  if (isMock) return newSong;
  try {
    const { data, error } = await supabase.from('guitar_songs').insert({ ...song, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as Song;
  } catch { return newSong; }
}

export async function updateSong(id: string, updates: Partial<Song>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_songs').update(updates).eq('id', id); } catch { }
}

export async function deleteSong(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_songs').delete().eq('id', id); } catch { }
}

// ─── Chords ───────────────────────────────────────────────────────────────────

export async function getChords(): Promise<ChordProgress[]> {
  if (isMock) return chordsData;
  try {
    const { data, error } = await supabase.from('guitar_chords').select('*');
    if (error) throw error;
    return (data as ChordProgress[]) ?? chordsData;
  } catch { return chordsData; }
}

export async function createChord(chord: Omit<ChordProgress, 'id'>): Promise<ChordProgress> {
  const newChord: ChordProgress = { ...chord, id: crypto.randomUUID() };
  if (isMock) return newChord;
  try {
    const { data, error } = await supabase.from('guitar_chords').insert({ ...chord, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as ChordProgress;
  } catch { return newChord; }
}

export async function updateChord(id: string, updates: Partial<ChordProgress>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_chords').update(updates).eq('id', id); } catch { }
}

export async function deleteChord(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_chords').delete().eq('id', id); } catch { }
}

// ─── Scales ───────────────────────────────────────────────────────────────────

export async function getScales(): Promise<ScaleProgress[]> {
  if (isMock) return scalesData;
  try {
    const { data, error } = await supabase.from('guitar_scales').select('*');
    if (error) throw error;
    return (data as ScaleProgress[]) ?? scalesData;
  } catch { return scalesData; }
}

export async function createScale(scale: Omit<ScaleProgress, 'id'>): Promise<ScaleProgress> {
  const newScale: ScaleProgress = { ...scale, id: crypto.randomUUID() };
  if (isMock) return newScale;
  try {
    const { data, error } = await supabase.from('guitar_scales').insert({ ...scale, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as ScaleProgress;
  } catch { return newScale; }
}

export async function updateScale(id: string, updates: Partial<ScaleProgress>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_scales').update(updates).eq('id', id); } catch { }
}

export async function deleteScale(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_scales').delete().eq('id', id); } catch { }
}

// ─── Theory Lessons ───────────────────────────────────────────────────────────

export async function getTheoryLessons(): Promise<TheoryLesson[]> {
  if (isMock) return theoryLessons;
  try {
    const { data, error } = await supabase.from('guitar_theory_lessons').select('*');
    if (error) throw error;
    return (data as TheoryLesson[]) ?? theoryLessons;
  } catch { return theoryLessons; }
}

export async function updateTheoryLesson(id: string, updates: Partial<TheoryLesson>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_theory_lessons').update(updates).eq('id', id); } catch { }
}

// ─── Recordings ───────────────────────────────────────────────────────────────

export async function getRecordings(): Promise<RecordingEntry[]> {
  if (isMock) return recordings;
  try {
    const { data, error } = await supabase.from('guitar_recordings').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as RecordingEntry[]) ?? recordings;
  } catch { return recordings; }
}

export async function createRecording(rec: Omit<RecordingEntry, 'id'>): Promise<RecordingEntry> {
  const newRec: RecordingEntry = { ...rec, id: crypto.randomUUID() };
  if (isMock) return newRec;
  try {
    const { data, error } = await supabase.from('guitar_recordings').insert({ ...rec, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as RecordingEntry;
  } catch { return newRec; }
}

export async function deleteRecording(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_recordings').delete().eq('id', id); } catch { }
}

// ─── Skill Areas ──────────────────────────────────────────────────────────────

export async function getSkillAreas(): Promise<SkillArea[]> {
  if (isMock) return skillAreas;
  try {
    const { data, error } = await supabase.from('guitar_skill_areas').select('*');
    if (error) throw error;
    return (data as SkillArea[]) ?? skillAreas;
  } catch { return skillAreas; }
}

export async function updateSkillArea(id: string, updates: Partial<SkillArea>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('guitar_skill_areas').update(updates).eq('id', id); } catch { }
}
