// ─── Types ───────────────────────────────────────────────────────────────────

export type ChessPlatform = 'lichess' | 'chess.com' | 'otb';
export type ChessResult = 'win' | 'loss' | 'draw';
export type OpeningStatus = 'learning' | 'mastered' | 'dropped';
export type TournamentFormat = 'classical' | 'rapid' | 'blitz' | 'bullet' | 'correspondence';
export type TrainingFocus = 'openings' | 'tactics' | 'endgames' | 'analysis' | 'blitz' | 'strategy';
export type TrainingIntensity = 'light' | 'medium' | 'intense';
export type EndgameCategory = 'king_pawn' | 'rook' | 'queen' | 'knight_bishop' | 'minor_piece';
export type EndgameStatus = 'not_started' | 'in_progress' | 'mastered';

export type RatingEntry = {
  id: string;
  date: string;
  rating: number;
  platform: ChessPlatform;
  change: number;
};

export type PuzzleSession = {
  id: string;
  date: string;
  puzzlesSolved: number;
  accuracy: number;
  themes: string[];
  durationMins: number;
  platform: ChessPlatform;
  rating: number;
};

export type ChessOpening = {
  id: string;
  name: string;
  eco: string;
  color: 'white' | 'black';
  moves: string;
  winRate: number;
  gamesPlayed: number;
  status: OpeningStatus;
  notes: string;
  tags: string[];
};

export type EndgameStudy = {
  id: string;
  title: string;
  category: EndgameCategory;
  status: EndgameStatus;
  difficulty: 1 | 2 | 3 | 4 | 5;
  notes: string;
  completedAt?: string;
};

export type Tournament = {
  id: string;
  name: string;
  date: string;
  format: TournamentFormat;
  result: string;
  score: string;
  rounds: number;
  ratingBefore: number;
  ratingAfter: number;
  location: string;
  notes: string;
};

export type TrainingSession = {
  id: string;
  date: string;
  durationMins: number;
  focus: TrainingFocus;
  notes: string;
  intensity: TrainingIntensity;
  puzzlesSolved?: number;
  gamesPlayed?: number;
};

export type GameNote = {
  id: string;
  date: string;
  platform: ChessPlatform;
  opponent: string;
  result: ChessResult;
  color: 'white' | 'black';
  opening: string;
  analysis: string;
  lessons: string[];
  ratingAtTime: number;
};

// ─── Sample Data ──────────────────────────────────────────────────────────────

export const ratingHistory: RatingEntry[] = [
  { id: 'r1', date: '2026-01-05', rating: 1347, platform: 'lichess', change: 0 },
  { id: 'r2', date: '2026-01-20', rating: 1389, platform: 'lichess', change: 42 },
  { id: 'r3', date: '2026-02-03', rating: 1372, platform: 'lichess', change: -17 },
  { id: 'r4', date: '2026-02-18', rating: 1401, platform: 'lichess', change: 29 },
  { id: 'r5', date: '2026-03-01', rating: 1428, platform: 'lichess', change: 27 },
  { id: 'r6', date: '2026-03-15', rating: 1415, platform: 'lichess', change: -13 },
  { id: 'r7', date: '2026-04-02', rating: 1452, platform: 'lichess', change: 37 },
  { id: 'r8', date: '2026-04-20', rating: 1468, platform: 'lichess', change: 16 },
  { id: 'r9', date: '2026-05-05', rating: 1491, platform: 'lichess', change: 23 },
  { id: 'r10', date: '2026-05-22', rating: 1507, platform: 'lichess', change: 16 },
  { id: 'r11', date: '2026-06-08', rating: 1489, platform: 'lichess', change: -18 },
  { id: 'r12', date: '2026-06-12', rating: 1450, platform: 'lichess', change: -39 },
];

export const puzzleSessions: PuzzleSession[] = [
  { id: 'ps1', date: '2026-06-12', puzzlesSolved: 25, accuracy: 72, themes: ['pins', 'forks'], durationMins: 30, platform: 'lichess', rating: 1620 },
  { id: 'ps2', date: '2026-06-10', puzzlesSolved: 30, accuracy: 80, themes: ['discovered attacks', 'back rank'], durationMins: 35, platform: 'lichess', rating: 1645 },
  { id: 'ps3', date: '2026-06-08', puzzlesSolved: 20, accuracy: 65, themes: ['endgame', 'king and pawn'], durationMins: 25, platform: 'chess.com', rating: 1590 },
  { id: 'ps4', date: '2026-06-05', puzzlesSolved: 40, accuracy: 85, themes: ['tactics', 'mating nets'], durationMins: 45, platform: 'lichess', rating: 1680 },
  { id: 'ps5', date: '2026-06-03', puzzlesSolved: 15, accuracy: 60, themes: ['skewers', 'zwischenzug'], durationMins: 20, platform: 'lichess', rating: 1560 },
  { id: 'ps6', date: '2026-05-30', puzzlesSolved: 35, accuracy: 88, themes: ['pawn promotion', 'rook endings'], durationMins: 40, platform: 'chess.com', rating: 1710 },
  { id: 'ps7', date: '2026-05-27', puzzlesSolved: 22, accuracy: 77, themes: ['deflection', 'overloading'], durationMins: 28, platform: 'lichess', rating: 1640 },
  { id: 'ps8', date: '2026-05-24', puzzlesSolved: 18, accuracy: 67, themes: ['x-ray attack', 'interference'], durationMins: 22, platform: 'lichess', rating: 1580 },
];

export const openingsData: ChessOpening[] = [
  { id: 'op1', name: "King's Indian Defense", eco: 'E60', color: 'black', moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6', winRate: 54, gamesPlayed: 42, status: 'mastered', notes: 'Main weapon with black vs. d4. Know the Classical and Sämisch variations.', tags: ['d4', 'fianchetto', 'dynamic'] },
  { id: 'op2', name: 'Sicilian Defense (Najdorf)', eco: 'B90', color: 'black', moves: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a5', winRate: 58, gamesPlayed: 38, status: 'mastered', notes: 'Sharp and aggressive. Fischer and Kasparov used this. Still learning the English Attack.', tags: ['e4', 'sharp', 'counterplay'] },
  { id: 'op3', name: "Queen's Gambit (Accepted)", eco: 'D20', color: 'white', moves: '1.d4 d5 2.c4 dxc4', winRate: 62, gamesPlayed: 28, status: 'mastered', notes: 'Solid play with queens gambit accepted. Good in rapid games.', tags: ['d4', 'solid', 'positional'] },
  { id: 'op4', name: 'London System', eco: 'D02', color: 'white', moves: '1.d4 d5 2.Nf3 Nf6 3.Bf4', winRate: 55, gamesPlayed: 55, status: 'mastered', notes: 'Main weapon with white. Easy to learn, flexible. Works against most setups.', tags: ['d4', 'solid', 'system'] },
  { id: 'op5', name: 'Ruy Lopez (Berlin)', eco: 'C65', color: 'white', moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6', winRate: 48, gamesPlayed: 18, status: 'learning', notes: 'Studying the Berlin endgame. Complex but very solid.', tags: ['e4', 'classical', 'endgame'] },
  { id: 'op6', name: 'French Defense', eco: 'C00', color: 'black', moves: '1.e4 e6 2.d4 d5', winRate: 42, gamesPlayed: 12, status: 'dropped', notes: 'Too passive for my style. Switched to Sicilian.', tags: ['e4', 'solid', 'passive'] },
];

export const endgameStudies: EndgameStudy[] = [
  { id: 'eg1', title: 'K+P vs K fundamentals', category: 'king_pawn', status: 'mastered', difficulty: 1, notes: 'Opposition, key squares, outflanking all covered.', completedAt: '2026-03-15' },
  { id: 'eg2', title: 'Rook vs Pawn endings', category: 'rook', status: 'mastered', difficulty: 2, notes: 'Lucena and Philidor positions memorized.', completedAt: '2026-04-10' },
  { id: 'eg3', title: 'Rook vs Minor Piece', category: 'rook', status: 'in_progress', difficulty: 3, notes: 'Know when to trade down. Still shaky on R vs B.', },
  { id: 'eg4', title: 'Queen vs Pawn on 7th', category: 'queen', status: 'in_progress', difficulty: 3, notes: 'Only bishop and rook pawns escape. Practicing conversion.', },
  { id: 'eg5', title: 'Knight & Bishop mate', category: 'knight_bishop', status: 'not_started', difficulty: 5, notes: 'Very rare but want to know it for OTB tournaments.', },
  { id: 'eg6', title: 'Opposite-colored Bishops', category: 'minor_piece', status: 'in_progress', difficulty: 4, notes: 'Drawing technique and winning technique both needed.', },
];

export const tournamentsData: Tournament[] = [
  { id: 't1', name: 'School Chess Championship', date: '2026-02-15', format: 'classical', result: '3rd Place', score: '4.5/7', rounds: 7, ratingBefore: 1389, ratingAfter: 1428, location: 'School', notes: 'Lost to eventual winner in round 6. Good overall performance.' },
  { id: 't2', name: 'District Open', date: '2026-04-05', format: 'rapid', result: 'Top 10', score: '3.5/5', rounds: 5, ratingBefore: 1452, ratingAfter: 1491, location: 'Chennai', notes: 'Best tournament result. Won against an 1600-rated player.' },
  { id: 't3', name: 'Online Lichess Arena (Weekly)', date: '2026-05-18', format: 'blitz', result: 'Mid-table', score: '12pts', rounds: 20, ratingBefore: 1491, ratingAfter: 1507, location: 'Online', notes: 'Lichess Arena format. Performed well in the second half.' },
  { id: 't4', name: 'State U-18 Qualifier', date: '2026-06-01', format: 'classical', result: 'Did not qualify', score: '3/7', rounds: 7, ratingBefore: 1507, ratingAfter: 1450, location: 'Chennai', notes: 'Tough competition. Blundered badly in rounds 4 and 6. Need better time management.' },
];

export const trainingSessions: TrainingSession[] = [
  { id: 'ts1', date: '2026-06-11', durationMins: 90, focus: 'tactics', notes: 'Focused on knight forks and pinning patterns', intensity: 'intense', puzzlesSolved: 40 },
  { id: 'ts2', date: '2026-06-10', durationMins: 45, focus: 'openings', notes: 'Reviewed KID Classical variation games by Kasparov', intensity: 'medium' },
  { id: 'ts3', date: '2026-06-08', durationMins: 60, focus: 'analysis', notes: 'Analyzed State qualifier losses with Stockfish', intensity: 'intense', gamesPlayed: 4 },
  { id: 'ts4', date: '2026-06-05', durationMins: 30, focus: 'endgames', notes: 'Rook endgame practice - Lucena position drills', intensity: 'medium' },
  { id: 'ts5', date: '2026-06-03', durationMins: 60, focus: 'blitz', notes: 'Blitz ladder on Lichess to practice time management', intensity: 'light', gamesPlayed: 12 },
  { id: 'ts6', date: '2026-06-01', durationMins: 120, focus: 'strategy', notes: 'Studied Silman\'s "How to Reassess Your Chess" chapter 4', intensity: 'intense' },
  { id: 'ts7', date: '2026-05-29', durationMins: 45, focus: 'openings', notes: 'Drilled London System move orders vs KID transpositions', intensity: 'medium' },
  { id: 'ts8', date: '2026-05-27', durationMins: 90, focus: 'tactics', notes: 'Blind tactics trainer — no board hints', intensity: 'intense', puzzlesSolved: 25 },
];

export const gameNotes: GameNote[] = [
  { id: 'gn1', date: '2026-06-10', platform: 'lichess', opponent: 'TacticsKing99', result: 'win', color: 'white', opening: "London System", analysis: 'Perfect execution of London System. Opponent walked into a pawn fork on move 18.', lessons: ['Patience in positional games pays off', 'The f4-e5 advance is very powerful'], ratingAtTime: 1491 },
  { id: 'gn2', date: '2026-06-08', platform: 'lichess', opponent: 'DeepCalc2000', result: 'loss', color: 'black', opening: "KID Classical", analysis: 'Miscalculated the piece sacrifice on move 23. Should have taken with the rook.', lessons: ['Always double check tactical shots', 'When in doubt, recapture towards the center'], ratingAtTime: 1489 },
  { id: 'gn3', date: '2026-06-06', platform: 'chess.com', opponent: 'MidnightGM', result: 'draw', color: 'white', opening: "Ruy Lopez Berlin", analysis: 'Reached the Berlin endgame but couldn\'t convert the extra pawn. Fortress was well constructed.', lessons: ['King activity is crucial in R+P endgames', 'Need more Lucena practice'], ratingAtTime: 1492 },
  { id: 'gn4', date: '2026-06-03', platform: 'otb', opponent: 'Ravi K. (1620)', result: 'loss', color: 'black', opening: "Sicilian Najdorf", analysis: 'Blundered a bishop on move 31 due to time pressure. Position was equal before that.', lessons: ['Manage clock better in OTB — use at least 30 mins', 'Don\'t rush in equal positions'], ratingAtTime: 1507 },
  { id: 'gn5', date: '2026-05-30', platform: 'lichess', opponent: 'PawnStorm42', result: 'win', color: 'black', opening: "King\'s Indian Defense", analysis: 'Beautiful kingside attack. The h-pawn push decided the game by move 28.', lessons: ['The g5-h4-h5 pawn storm is devastating', 'Learn when NOT to castle kingside against KID'], ratingAtTime: 1491 },
  { id: 'gn6', date: '2026-05-27', platform: 'chess.com', opponent: 'KaspaMaster', result: 'win', color: 'white', opening: "QGA", analysis: 'Model game — exploited the isolated queen\'s pawn perfectly.', lessons: ['Blockade IQP on d5 with knight', 'Piece activity beats pawn structure when attacking'], ratingAtTime: 1468 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export type ChessStats = {
  currentRating: number;
  ratingChange: number;
  ratingGoal: number;
  totalPuzzles: number;
  avgAccuracy: number;
  trainingHours: number;
  trainingDays: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalGames: number;
  tournamentsPlayed: number;
  openingsMastered: number;
  endgamesMastered: number;
};

export function getChessStats(): ChessStats {
  const latest = ratingHistory[ratingHistory.length - 1];
  const prev = ratingHistory[ratingHistory.length - 2];
  const totalPuzzles = puzzleSessions.reduce((s, p) => s + p.puzzlesSolved, 0);
  const avgAccuracy = Math.round(puzzleSessions.reduce((s, p) => s + p.accuracy, 0) / puzzleSessions.length);
  const trainingMinutes = trainingSessions.reduce((s, t) => s + t.durationMins, 0);
  const wins = gameNotes.filter(g => g.result === 'win').length;
  const losses = gameNotes.filter(g => g.result === 'loss').length;
  const draws = gameNotes.filter(g => g.result === 'draw').length;
  const totalGames = wins + losses + draws;
  return {
    currentRating: latest.rating,
    ratingChange: latest.rating - prev.rating,
    ratingGoal: 1800,
    totalPuzzles,
    avgAccuracy,
    trainingHours: Math.round(trainingMinutes / 60),
    trainingDays: trainingSessions.length,
    wins,
    losses,
    draws,
    winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
    totalGames,
    tournamentsPlayed: tournamentsData.length,
    openingsMastered: openingsData.filter(o => o.status === 'mastered').length,
    endgamesMastered: endgameStudies.filter(e => e.status === 'mastered').length,
  };
}

// ─── Color Maps ──────────────────────────────────────────────────────────────

export const RESULT_COLORS: Record<ChessResult, string> = {
  win: 'text-emerald-400 bg-emerald-500/10',
  loss: 'text-red-400 bg-red-500/10',
  draw: 'text-amber-400 bg-amber-500/10',
};

export const OPENING_STATUS_COLORS: Record<OpeningStatus, string> = {
  learning: 'text-amber-400 bg-amber-500/10',
  mastered: 'text-emerald-400 bg-emerald-500/10',
  dropped: 'text-muted-foreground bg-muted/40',
};

export const TRAINING_FOCUS_COLORS: Record<TrainingFocus, string> = {
  openings: 'text-violet-400 bg-violet-500/10',
  tactics: 'text-orange-400 bg-orange-500/10',
  endgames: 'text-sky-400 bg-sky-500/10',
  analysis: 'text-cyan-400 bg-cyan-500/10',
  blitz: 'text-pink-400 bg-pink-500/10',
  strategy: 'text-indigo-400 bg-indigo-500/10',
};

export const INTENSITY_COLORS: Record<TrainingIntensity, string> = {
  light: 'text-emerald-400 bg-emerald-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  intense: 'text-red-400 bg-red-500/10',
};

export const ENDGAME_STATUS_COLORS: Record<EndgameStatus, string> = {
  not_started: 'text-muted-foreground bg-muted/40',
  in_progress: 'text-amber-400 bg-amber-500/10',
  mastered: 'text-emerald-400 bg-emerald-500/10',
};
