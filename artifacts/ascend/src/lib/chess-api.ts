export type ChessGameDataPlatform = 'chess.com' | 'lichess';

export interface ChessGameData {
  id: string;
  platform: ChessGameDataPlatform;
  externalId: string;
  pgn?: string;
  fen?: string;
  result: 'win' | 'loss' | 'draw';
  playerColor: 'white' | 'black';
  playerRating?: number;
  opponentUsername?: string;
  opponentRating?: number;
  openingName?: string;
  openingEco?: string;
  timeControl?: string;
  gameDurationSecs?: number;
  gameDate: string;
  movesCount?: number;
  isAnalyzed: boolean;
  accuracy?: number;
  bestMove?: string;
  worstMove?: string;
  analysisNotes?: string;
}

export interface ChessAccountData {
  chesscomUsername: string;
  lichessUsername: string;
}

export interface ChessStatsData {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winRate: number;
  topOpenings: { name: string; count: number }[];
  hourPerformance: { hour: number; wins: number; losses: number; draws: number; total: number }[];
  ratingTimeline: { date: string; rating: number; platform: string }[];
}

export async function fetchChessAccounts(userId: string): Promise<ChessAccountData> {
  const res = await fetch(`/api/chess/accounts/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveChessAccounts(userId: string, data: Partial<ChessAccountData>): Promise<void> {
  const res = await fetch(`/api/chess/accounts/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchChessGames(userId: string, platform?: string): Promise<ChessGameData[]> {
  const qs = platform ? `?platform=${platform}` : '';
  const res = await fetch(`/api/chess/games/${userId}${qs}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveChessGames(userId: string, games: Partial<ChessGameData>[]): Promise<void> {
  const res = await fetch(`/api/chess/games/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ games }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function saveGameAnalysis(userId: string, gameId: string, analysis: {
  accuracy: number;
  bestMove: string;
  worstMove: string;
  analysisNotes: string;
}): Promise<void> {
  const res = await fetch(`/api/chess/games/${userId}/${gameId}/analysis`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analysis),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchChessStats(userId: string): Promise<ChessStatsData> {
  const res = await fetch(`/api/chess/stats/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Chess.com API ───────────────────────────────────────────────────────
export interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  fen: string;
  time_class: string;
  rules: string;
  white: { username: string; rating: number; result: string };
  black: { username: string; rating: number; result: string };
  accuracies?: { white: number; black: number };
}

export async function fetchChessComGames(username: string, year: number, month: number): Promise<ChessComGame[]> {
  const monthStr = String(month).padStart(2, '0');
  const res = await fetch(`https://api.chess.com/pub/player/${username.toLowerCase()}/games/${year}/${monthStr}`, {
    headers: { 'User-Agent': 'ASCEND/1.0 (replit.app)' },
  });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Chess.com API error: ${res.status}`);
  }
  const data = await res.json();
  return data.games || [];
}

export async function fetchChessComAllGames(username: string): Promise<ChessComGame[]> {
  const allGames: ChessComGame[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // Try current month and previous 2 months
  for (let i = 0; i < 3; i++) {
    let y = year;
    let m = month - i;
    if (m <= 0) { m += 12; y -= 1; }
    try {
      const games = await fetchChessComGames(username, y, m);
      allGames.push(...games);
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn(`Chess.com fetch failed for ${y}-${m}`, e);
    }
  }
  return allGames;
}

// ─── Lichess API ───────────────────────────────────────────────────────
export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: { user?: { name: string }; rating: number };
    black: { user?: { name: string }; rating: number };
  };
  winner?: 'white' | 'black';
  pgn?: string;
  opening?: { eco: string; name: string };
  moves?: string;
  clock?: { initial: number; increment: number };
}

export async function fetchLichessGames(username: string, max = 30): Promise<LichessGame[]> {
  const res = await fetch(`https://lichess.org/api/games/user/${username}?perfType=rapid&max=${max}&pgnInJson=false&moves=true&tags=true&clocks=true&evals=false&opening=true&fen=false`, {
    headers: {
      'Accept': 'application/x-ndjson',
      'User-Agent': 'ASCEND/1.0 (replit.app)',
    },
  });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Lichess API error: ${res.status}`);
  }
  const text = await res.text();
  const lines = text.trim().split('\n').filter(Boolean);
  const games: LichessGame[] = [];
  for (const line of lines) {
    try {
      games.push(JSON.parse(line));
    } catch {
      // skip malformed lines
    }
  }
  return games;
}
