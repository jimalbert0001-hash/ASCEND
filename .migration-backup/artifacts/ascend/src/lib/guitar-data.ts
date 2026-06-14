// ─── Types ───────────────────────────────────────────────────────────────────

export type SongStatus = 'wish_list' | 'learning' | 'repertoire' | 'polished' | 'on_hold';
export type PracticeFocus = 'chords' | 'scales' | 'songs' | 'theory' | 'fingerpicking' | 'improvisation' | 'strumming' | 'technique';
export type PracticeIntensity = 'casual' | 'focused' | 'intensive';
export type ChordCategory = 'open' | 'barre' | 'power' | 'jazz' | 'sus';
export type ScaleStatus = 'not_started' | 'learning' | 'comfortable' | 'mastered';
export type TheoryStatus = 'not_started' | 'in_progress' | 'completed';
export type TheoryCategory = 'music_theory' | 'harmony' | 'rhythm' | 'ear_training' | 'reading';

export type PracticeSession = {
  id: string;
  date: string;
  durationMins: number;
  focus: PracticeFocus;
  bpm?: number;
  notes: string;
  intensity: PracticeIntensity;
  songsWorked?: string[];
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  status: SongStatus;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tempo: number;
  chords: string[];
  startDate: string;
  masteredDate?: string;
  notes: string;
};

export type ChordProgress = {
  id: string;
  name: string;
  category: ChordCategory;
  mastered: boolean;
  notes: string;
  dateAdded: string;
  dateMastered?: string;
};

export type ScaleProgress = {
  id: string;
  name: string;
  positions: number;
  positionsMastered: number;
  modes: string[];
  status: ScaleStatus;
  notes: string;
};

export type TheoryLesson = {
  id: string;
  title: string;
  category: TheoryCategory;
  status: TheoryStatus;
  notes: string;
  completedAt?: string;
};

export type RecordingEntry = {
  id: string;
  date: string;
  title: string;
  durationSecs: number;
  type: 'cover' | 'original' | 'exercise';
  notes: string;
};

export type SkillArea = {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  lastPracticed: string;
  color: string;
};

// ─── Sample Data ──────────────────────────────────────────────────────────────

export const practiceSessions: PracticeSession[] = [
  { id: 'gp1', date: '2026-06-12', durationMins: 45, focus: 'songs', notes: 'Worked on "Wonderwall" chord transitions and "Hotel California" intro', intensity: 'focused', songsWorked: ['Wonderwall', 'Hotel California'] },
  { id: 'gp2', date: '2026-06-10', durationMins: 30, focus: 'fingerpicking', notes: 'Travis picking patterns at 80 BPM. Getting cleaner.', intensity: 'focused', bpm: 80 },
  { id: 'gp3', date: '2026-06-08', durationMins: 60, focus: 'scales', notes: 'Pentatonic minor all 5 positions. Position 2 and 4 still shaky.', intensity: 'intensive', bpm: 100 },
  { id: 'gp4', date: '2026-06-06', durationMins: 20, focus: 'chords', notes: 'Barre chord F and B♭ clean-up. Wrist position adjustment helping.', intensity: 'casual' },
  { id: 'gp5', date: '2026-06-04', durationMins: 50, focus: 'theory', notes: 'Studied CAGED system and how it connects chord shapes across fretboard.', intensity: 'focused' },
  { id: 'gp6', date: '2026-06-02', durationMins: 40, focus: 'improvisation', notes: 'Improvised over A minor backing track using pentatonic minor.', intensity: 'focused', bpm: 90 },
  { id: 'gp7', date: '2026-05-30', durationMins: 35, focus: 'technique', notes: 'Hammer-ons and pull-offs exercises. Legato exercises from JustinGuitar.', intensity: 'focused', bpm: 70 },
  { id: 'gp8', date: '2026-05-28', durationMins: 55, focus: 'songs', notes: "Full run-through of 'Wish You Were Here' and 'Blackbird' — recorded attempt", intensity: 'intensive', songsWorked: ['Wish You Were Here', 'Blackbird'] },
  { id: 'gp9', date: '2026-05-26', durationMins: 25, focus: 'strumming', notes: 'Reggae and folk strumming patterns. New pattern with percussive muting.', intensity: 'casual' },
  { id: 'gp10', date: '2026-05-24', durationMins: 45, focus: 'fingerpicking', notes: 'Classical guitar etude — "Study in E minor" by Sor. Very challenging.', intensity: 'intensive', bpm: 60 },
];

export const songsData: Song[] = [
  { id: 'sg1', title: 'Wish You Were Here', artist: 'Pink Floyd', genre: 'Rock', status: 'polished', difficulty: 2, tempo: 66, chords: ['G', 'C', 'D', 'Am', 'Em'], startDate: '2025-11-01', masteredDate: '2026-01-15', notes: 'First song I fully polished. The intro fingerpicking is iconic.' },
  { id: 'sg2', title: 'Blackbird', artist: 'The Beatles', genre: 'Folk/Rock', status: 'repertoire', difficulty: 3, tempo: 96, chords: ['G', 'Am', 'C', 'G7', 'F'], startDate: '2026-01-20', masteredDate: '2026-03-10', notes: 'Challenging fingerpicking pattern but worth it. Play it clean now.' },
  { id: 'sg3', title: 'Wonderwall', artist: 'Oasis', genre: 'Britpop', status: 'repertoire', difficulty: 2, tempo: 87, chords: ['Em7', 'G', 'Dsus4', 'A7sus4', 'Cadd9'], startDate: '2026-02-05', masteredDate: '2026-03-20', notes: 'Classic beginner song but with beautiful chord voicings. Great crowd pleaser.' },
  { id: 'sg4', title: 'Hotel California', artist: 'Eagles', genre: 'Rock', status: 'learning', difficulty: 4, tempo: 75, chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em'], startDate: '2026-04-10', notes: 'The solo is way beyond me but the rhythm part is coming along well.' },
  { id: 'sg5', title: 'Stairway to Heaven', artist: 'Led Zeppelin', genre: 'Rock', status: 'wish_list', difficulty: 5, tempo: 75, chords: ['Am', 'G', 'F', 'C', 'D'], startDate: '2026-06-01', notes: 'Ultimate goal song. Need to get the arpeggio intro down first.' },
  { id: 'sg6', title: 'Classical Gas', artist: 'Mason Williams', genre: 'Classical', status: 'wish_list', difficulty: 5, tempo: 120, chords: ['Am', 'G', 'F', 'E7'], startDate: '2026-05-15', notes: 'Heard this and HAD to learn it. Will take months but the journey is worth it.' },
  { id: 'sg7', title: 'House of the Rising Sun', artist: 'The Animals', genre: 'Folk/Blues', status: 'repertoire', difficulty: 2, tempo: 72, chords: ['Am', 'C', 'D', 'F', 'E'], startDate: '2026-03-01', masteredDate: '2026-04-05', notes: 'Perfect arpeggiated chord song for developing right hand independence.' },
  { id: 'sg8', title: 'Tears in Heaven', artist: 'Eric Clapton', genre: 'Pop/Blues', status: 'learning', difficulty: 3, tempo: 80, chords: ['A', 'E', 'F#m', 'C#m', 'D'], startDate: '2026-05-20', notes: 'Beautiful song. Fingerpicking intro is tricky at tempo. Practicing slowly.' },
];

export const chordsData: ChordProgress[] = [
  { id: 'ch1', name: 'Am', category: 'open', mastered: true, notes: 'Very natural now', dateAdded: '2025-09-01', dateMastered: '2025-09-15' },
  { id: 'ch2', name: 'Em', category: 'open', mastered: true, notes: 'First chord learned', dateAdded: '2025-09-01', dateMastered: '2025-09-08' },
  { id: 'ch3', name: 'G', category: 'open', mastered: true, notes: 'Big stretch but clean now', dateAdded: '2025-09-05', dateMastered: '2025-10-01' },
  { id: 'ch4', name: 'C', category: 'open', mastered: true, notes: 'Good transitions to Am and F', dateAdded: '2025-09-05', dateMastered: '2025-09-25' },
  { id: 'ch5', name: 'D', category: 'open', mastered: true, notes: '', dateAdded: '2025-09-10', dateMastered: '2025-10-05' },
  { id: 'ch6', name: 'F', category: 'barre', mastered: true, notes: 'Took 3 months to clean up. Wrist position key.', dateAdded: '2025-10-15', dateMastered: '2026-01-10' },
  { id: 'ch7', name: 'Bm', category: 'barre', mastered: false, notes: 'Still slightly buzzing on B string', dateAdded: '2026-01-20' },
  { id: 'ch8', name: 'B♭', category: 'barre', mastered: false, notes: 'Working on this — similar to F but one fret up', dateAdded: '2026-02-01' },
  { id: 'ch9', name: 'E5', category: 'power', mastered: true, notes: 'Power chords are easy but useful for rock riffs', dateAdded: '2025-11-01', dateMastered: '2025-11-10' },
  { id: 'ch10', name: 'A5', category: 'power', mastered: true, notes: '', dateAdded: '2025-11-01', dateMastered: '2025-11-10' },
  { id: 'ch11', name: 'Cadd9', category: 'open', mastered: true, notes: 'Love this chord — sounds amazing', dateAdded: '2026-02-15', dateMastered: '2026-03-01' },
  { id: 'ch12', name: 'Dmaj7', category: 'jazz', mastered: false, notes: 'Started exploring jazz voicings', dateAdded: '2026-05-01' },
  { id: 'ch13', name: 'Em7', category: 'open', mastered: true, notes: 'Used in Wonderwall — beautiful open voicing', dateAdded: '2026-02-10', dateMastered: '2026-02-20' },
  { id: 'ch14', name: 'Dsus4', category: 'sus', mastered: true, notes: 'Suspension chords add great color', dateAdded: '2026-02-10', dateMastered: '2026-03-01' },
];

export const scalesData: ScaleProgress[] = [
  { id: 'sc1', name: 'Pentatonic Minor', positions: 5, positionsMastered: 3, modes: ['Phrygian'], status: 'comfortable', notes: 'Position 1 is solid. Still working on 4 and 5.' },
  { id: 'sc2', name: 'Natural Minor (Aeolian)', positions: 7, positionsMastered: 2, modes: ['Aeolian', 'Dorian', 'Phrygian'], status: 'learning', notes: 'Learning the parent modes. Two positions memorized.' },
  { id: 'sc3', name: 'Major Scale', positions: 7, positionsMastered: 1, modes: ['Ionian', 'Lydian', 'Mixolydian'], status: 'learning', notes: 'Position 1 only. Will expand after pentatonic is solid.' },
  { id: 'sc4', name: 'Blues Scale', positions: 5, positionsMastered: 1, modes: [], status: 'learning', notes: 'Position 1 in A. Great for improvising over blues tracks.' },
  { id: 'sc5', name: 'Harmonic Minor', positions: 7, positionsMastered: 0, modes: ['Phrygian Dominant'], status: 'not_started', notes: 'Will start after mastering natural minor.' },
  { id: 'sc6', name: 'Chromatic Scale', positions: 1, positionsMastered: 1, modes: [], status: 'mastered', notes: 'Used as a warm-up exercise. Helps with dexterity.' },
];

export const theoryLessons: TheoryLesson[] = [
  { id: 'tl1', title: 'CAGED System', category: 'music_theory', status: 'in_progress', notes: 'Understanding how the 5 chord shapes connect across the neck. Mind-blowing concept.' },
  { id: 'tl2', title: 'Intervals & Ear Training', category: 'ear_training', status: 'in_progress', notes: 'Practicing interval recognition via Tenuto app. Up to 6ths.' },
  { id: 'tl3', title: 'The Circle of Fifths', category: 'harmony', status: 'completed', notes: 'Memorized it. Helps understand key signatures and chord progressions.', completedAt: '2026-03-20' },
  { id: 'tl4', title: 'Basic Rhythm & Time Signatures', category: 'rhythm', status: 'completed', notes: 'Can count and feel 4/4, 3/4, and 6/8 confidently.', completedAt: '2026-01-30' },
  { id: 'tl5', title: 'Reading Standard Notation (Intro)', category: 'reading', status: 'not_started', notes: 'Might skip in favour of tab + ear. Decide after finishing CAGED.' },
];

export const recordings: RecordingEntry[] = [
  { id: 'rc1', date: '2026-06-05', title: 'Wish You Were Here - Full Take', durationSecs: 223, type: 'cover', notes: 'Best take so far. Small flub on the chorus transition but overall clean.' },
  { id: 'rc2', date: '2026-05-28', title: 'Blackbird - Practice Run', durationSecs: 135, type: 'cover', notes: 'Tempo slows on the high-note section. Need more practice at speed.' },
  { id: 'rc3', date: '2026-05-10', title: 'Am Improv over Backing Track', durationSecs: 180, type: 'original', notes: 'First improv recording! Very basic pentatonic runs but I created something.' },
];

export const skillAreas: SkillArea[] = [
  { id: 'sa1', name: 'Chord Transitions', level: 7, maxLevel: 10, lastPracticed: '2026-06-12', color: 'text-violet-400' },
  { id: 'sa2', name: 'Fingerpicking', level: 5, maxLevel: 10, lastPracticed: '2026-06-10', color: 'text-emerald-400' },
  { id: 'sa3', name: 'Strumming Patterns', level: 6, maxLevel: 10, lastPracticed: '2026-05-29', color: 'text-sky-400' },
  { id: 'sa4', name: 'Lead / Soloing', level: 3, maxLevel: 10, lastPracticed: '2026-06-02', color: 'text-orange-400' },
  { id: 'sa5', name: 'Music Theory', level: 4, maxLevel: 10, lastPracticed: '2026-06-04', color: 'text-pink-400' },
  { id: 'sa6', name: 'Ear Training', level: 4, maxLevel: 10, lastPracticed: '2026-06-08', color: 'text-amber-400' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export type GuitarStats = {
  totalHours: number;
  thisMonthMins: number;
  thisMonthHours: number;
  longestSessionMins: number;
  totalSessions: number;
  songsLearned: number;
  songsRepertoire: number;
  chordsMastered: number;
  totalChords: number;
  currentLevel: number;
  avgSkillLevel: number;
  scalesMastered: number;
  lessonsCompleted: number;
  totalRecordings: number;
};

export function getGuitarStats(): GuitarStats {
  const currentMonth = '2026-06';
  const thisMonthSessions = practiceSessions.filter(s => s.date.startsWith(currentMonth));
  const thisMonthMins = thisMonthSessions.reduce((s, p) => s + p.durationMins, 0);
  const totalMins = practiceSessions.reduce((s, p) => s + p.durationMins, 0);
  const songsLearned = songsData.filter(s => ['repertoire', 'polished'].includes(s.status)).length;
  const songsRepertoire = songsData.filter(s => s.status === 'polished').length;
  const chordsMastered = chordsData.filter(c => c.mastered).length;
  const avgLevel = Math.round(skillAreas.reduce((s, a) => s + a.level, 0) / skillAreas.length);
  return {
    totalHours: Math.round(totalMins / 60),
    thisMonthMins,
    thisMonthHours: Math.round(thisMonthMins / 60),
    longestSessionMins: Math.max(...practiceSessions.map(s => s.durationMins)),
    totalSessions: practiceSessions.length,
    songsLearned,
    songsRepertoire,
    chordsMastered,
    totalChords: chordsData.length,
    currentLevel: avgLevel,
    avgSkillLevel: avgLevel,
    scalesMastered: scalesData.filter(s => s.status === 'mastered').length,
    lessonsCompleted: theoryLessons.filter(l => l.status === 'completed').length,
    totalRecordings: recordings.length,
  };
}

// ─── Color Maps ──────────────────────────────────────────────────────────────

export const SONG_STATUS_COLORS: Record<SongStatus, string> = {
  wish_list: 'text-muted-foreground bg-muted/40',
  learning: 'text-amber-400 bg-amber-500/10',
  repertoire: 'text-sky-400 bg-sky-500/10',
  polished: 'text-emerald-400 bg-emerald-500/10',
  on_hold: 'text-orange-400 bg-orange-500/10',
};

export const PRACTICE_FOCUS_COLORS: Record<PracticeFocus, string> = {
  chords: 'text-violet-400 bg-violet-500/10',
  scales: 'text-sky-400 bg-sky-500/10',
  songs: 'text-emerald-400 bg-emerald-500/10',
  theory: 'text-indigo-400 bg-indigo-500/10',
  fingerpicking: 'text-pink-400 bg-pink-500/10',
  improvisation: 'text-orange-400 bg-orange-500/10',
  strumming: 'text-cyan-400 bg-cyan-500/10',
  technique: 'text-amber-400 bg-amber-500/10',
};

export const SCALE_STATUS_COLORS: Record<ScaleStatus, string> = {
  not_started: 'text-muted-foreground bg-muted/40',
  learning: 'text-amber-400 bg-amber-500/10',
  comfortable: 'text-sky-400 bg-sky-500/10',
  mastered: 'text-emerald-400 bg-emerald-500/10',
};

export const PRACTICE_INTENSITY_COLORS: Record<PracticeIntensity, string> = {
  casual: 'text-emerald-400 bg-emerald-500/10',
  focused: 'text-amber-400 bg-amber-500/10',
  intensive: 'text-red-400 bg-red-500/10',
};
