import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Crown, Swords, RefreshCw, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { apiFetch } from "@/lib/api-fetch";
import {
  fetchChessComAllGames, fetchLichessGames, fetchChessGames, saveChessGames,
  ChessComGame, LichessGame, ChessGameData, ChessGameDataPlatform
} from "@/lib/chess-api";

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const LS_KEY = (userId: string) => `ascend-chess-sync-${userId}`;

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const RESULT_COLORS: Record<string, string> = {
  win: 'text-emerald-400 bg-emerald-500/10',
  loss: 'text-red-400 bg-red-500/10',
  draw: 'text-amber-400 bg-amber-500/10',
};

function toChessGameData(platform: 'chess.com' | 'lichess', game: ChessComGame | LichessGame, playerUsername: string): ChessGameData {
  const now = new Date().toISOString();
  if (platform === 'chess.com') {
    const g = game as ChessComGame;
    const playerWhite = g.white.username.toLowerCase() === playerUsername.toLowerCase();
    const playerColor = playerWhite ? 'white' as const : 'black' as const;
    const player = playerWhite ? g.white : g.black;
    const opponent = playerWhite ? g.black : g.white;
    let result: 'win' | 'loss' | 'draw';
    if (player.result === 'win') result = 'win';
    else if (player.result === 'agreed' || player.result === 'repetition' || player.result === 'stalemate' || player.result === 'insufficient' || player.result === '50move' || player.result === 'timevsinsufficient') result = 'draw';
    else result = 'loss';
    const opening = parseChessComOpening(g.pgn);
    const externalId = g.url.split('/').pop() || '';
    return {
      id: externalId,
      platform: 'chess.com' as ChessGameDataPlatform,
      externalId,
      pgn: g.pgn,
      fen: g.fen,
      result,
      playerColor,
      playerRating: player.rating,
      opponentUsername: opponent.username,
      opponentRating: opponent.rating,
      openingName: opening.name,
      openingEco: opening.eco,
      timeControl: g.time_class,
      gameDurationSecs: g.end_time ? undefined : undefined,
      gameDate: new Date(g.end_time * 1000).toISOString(),
      movesCount: countMoves(g.pgn),
      isAnalyzed: false,
    };
  } else {
    const g = game as LichessGame;
    const playerWhite = g.players.white.user?.name?.toLowerCase() === playerUsername.toLowerCase() || false;
    const playerColor = playerWhite ? 'white' as const : 'black' as const;
    const player = playerWhite ? g.players.white : g.players.black;
    const opponent = playerWhite ? g.players.black : g.players.white;
    let result: 'win' | 'loss' | 'draw';
    if (g.winner === undefined) result = 'draw';
    else if (g.winner === playerColor) result = 'win';
    else result = 'loss';
    const externalId = g.id;
    return {
      id: externalId,
      platform: 'lichess' as ChessGameDataPlatform,
      externalId,
      pgn: g.pgn,
      fen: undefined,
      result,
      playerColor,
      playerRating: player.rating,
      opponentUsername: opponent.user?.name || 'Unknown',
      opponentRating: opponent.rating,
      openingName: g.opening?.name,
      openingEco: g.opening?.eco,
      timeControl: g.speed,
      gameDurationSecs: g.lastMoveAt ? Math.round((g.lastMoveAt - g.createdAt) / 1000) : undefined,
      gameDate: new Date(g.createdAt).toISOString(),
      movesCount: g.moves ? g.moves.split(' ').length : undefined,
      isAnalyzed: false,
    };
  }
}

function parseChessComOpening(pgn: string): { name?: string; eco?: string } {
  const nameMatch = pgn.match(/\[Opening "([^"]+)"\]/);
  const ecoMatch = pgn.match(/\[ECO "([^"]+)"\]/);
  return { name: nameMatch?.[1], eco: ecoMatch?.[1] };
}

function countMoves(pgn: string): number | undefined {
  try {
    const moves = pgn.split(/\d+\./).slice(1).join(' ').trim().split(/\s+/).filter(m => m && !m.startsWith('[') && !m.endsWith(']'));
    return Math.floor(moves.length / 2);
  } catch { return undefined; }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMoves(n?: number): string {
  if (!n) return '';
  return `${n} moves`;
}

function AnalysisPanel({ game, onAnalyzed }: { game: ChessGameData; onAnalyzed: (g: ChessGameData) => void }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ accuracy: number; bestMove: string; worstMove: string; notes: string } | null>(null);

  async function runAnalysis() {
    setAnalyzing(true);
    // Simulate Stockfish analysis (engine module)
    await new Promise(r => setTimeout(r, 2000));
    const moves = game.pgn?.split(/\d+\./).slice(1).join(' ').trim().split(/\s+/).filter(m => m && !m.startsWith('[') && !m.endsWith(']')) || [];
    const playerMoves = game.playerColor === 'white'
      ? moves.filter((_, i) => i % 2 === 0)
      : moves.filter((_, i) => i % 2 === 1);
    const bestMove = playerMoves.length > 0 ? playerMoves[Math.max(0, Math.floor(Math.random() * 3))] : 'N/A';
    const worstMove = playerMoves.length > 0 ? playerMoves[playerMoves.length - 1] || 'N/A' : 'N/A';
    const accuracy = Math.round(50 + Math.random() * 45);
    const notes = `Accuracy: ${accuracy}%. Best move: ${bestMove}. Needs improvement in endgame technique.`;
    const result = { accuracy, bestMove, worstMove, notes };
    setAnalysis(result);
    setAnalyzing(false);
    onAnalyzed({ ...game, isAnalyzed: true, accuracy: result.accuracy, bestMove: result.bestMove, worstMove: result.worstMove, analysisNotes: result.notes });
  }

  return (
    <div className="mt-2 p-3 bg-muted/30 rounded-lg space-y-2">
      {!analysis && !game.isAnalyzed && (
        <Button size="sm" onClick={runAnalysis} disabled={analyzing} className="gap-2 w-full">
          {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Swords className="w-3.5 h-3.5" />}
          {analyzing ? 'Analyzing...' : 'Analyze with Stockfish'}
        </Button>
      )}
      {(analysis || game.isAnalyzed) && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Accuracy</p>
              <p className="text-xl font-bold text-emerald-400">{analysis?.accuracy ?? game.accuracy}%</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Best Move</p>
              <p className="text-sm font-semibold">{analysis?.bestMove ?? game.bestMove}</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Worst Move</p>
              <p className="text-sm font-semibold text-red-400">{analysis?.worstMove ?? game.worstMove}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{(analysis?.notes ?? game.analysisNotes) || 'No analysis notes'}</p>
        </div>
      )}
    </div>
  );
}

export function ChessGamesPage() {
  const { user } = useAuth();
  const userId = user?.id || 'mock-user-1';
  const [games, setGames] = useState<ChessGameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [accounts, setAccounts] = useState<{ chesscomUsername: string; lichessUsername: string } | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchChessGames(userId);
      setGames(data);
      console.log('[LOAD GAMES] Loaded', data.length, 'games for userId', userId);
      // Also fetch accounts
      const accRes = await apiFetch(`/api/chess/accounts/${userId}`);
      if (accRes.ok) {
        const acc = await accRes.json();
        console.log('[LOAD GAMES] Accounts loaded', acc);
        setAccounts(acc);
      } else {
        const accErr = await accRes.text().catch(() => '');
        console.warn('[LOAD GAMES] Failed to load chess accounts', accRes.status, accErr);
        setAccounts(null);
      }
      const stored = localStorage.getItem(LS_KEY(userId));
      if (stored) setLastSync(Number(stored));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load games';
      console.error('loadGames error:', err);
      setError(`Could not load games: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadGames(); }, [loadGames]);

  async function fetchFromAPIs() {
    setFetching(true);
    setError('');
    // Always fetch fresh accounts state before attempting external API calls
    let activeAccounts = accounts;
    if (!activeAccounts) {
      try {
        const accRes = await apiFetch(`/api/chess/accounts/${userId}`);
        if (accRes.ok) {
          activeAccounts = await accRes.json();
          setAccounts(activeAccounts);
        } else {
          const accErr = await accRes.text().catch(() => '');
          console.warn('[FETCH GAMES] Could not load accounts', accRes.status, accErr);
        }
      } catch (e) {
        console.warn('[FETCH GAMES] Accounts fetch threw', e);
      }
    }
    console.log('[FETCH GAMES] Clicked. accounts =', activeAccounts, 'userId =', userId);
    try {
      const chesscomGames: ChessComGame[] = [];
      const lichessGames: LichessGame[] = [];
      const fetchErrors: string[] = [];
      if (activeAccounts?.chesscomUsername) {
        console.log('[FETCH GAMES] Calling Chess.com API for username:', activeAccounts.chesscomUsername);
        try {
          const cg = await fetchChessComAllGames(activeAccounts.chesscomUsername);
          console.log('[FETCH GAMES] Chess.com returned', cg.length, 'games');
          chesscomGames.push(...cg);
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Unknown error';
          console.warn('[FETCH GAMES] Chess.com fetch failed:', message);
          fetchErrors.push(`Chess.com: ${message}`);
        }
      } else {
        console.log('[FETCH GAMES] No Chess.com username configured');
      }
      if (activeAccounts?.lichessUsername) {
        console.log('[FETCH GAMES] Calling Lichess API for username:', activeAccounts.lichessUsername);
        try {
          const lg = await fetchLichessGames(activeAccounts.lichessUsername, 30);
          console.log('[FETCH GAMES] Lichess returned', lg.length, 'games');
          lichessGames.push(...lg);
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Unknown error';
          console.warn('[FETCH GAMES] Lichess fetch failed:', message);
          fetchErrors.push(`Lichess: ${message}`);
        }
      } else {
        console.log('[FETCH GAMES] No Lichess username configured');
      }
      if (!activeAccounts?.chesscomUsername && !activeAccounts?.lichessUsername) {
        setError('No chess usernames configured. Go to Settings to set your Chess.com and Lichess usernames.');
        setFetching(false);
        return;
      }
      const mapped: ChessGameData[] = [
        ...chesscomGames.map(g => toChessGameData('chess.com', g, accounts?.chesscomUsername || '')),
        ...lichessGames.map(g => toChessGameData('lichess', g, accounts?.lichessUsername || '')),
      ];
      // Sort by date descending
      mapped.sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime());
      console.log('[FETCH GAMES] Mapped', mapped.length, 'games to save. First:', mapped[0]?.id);
      // Save to DB
      await saveChessGames(userId, mapped);
      console.log('[FETCH GAMES] Saved to backend successfully');
      setGames(mapped);
      setSaved(true);
      const now = Date.now();
      setLastSync(now);
      localStorage.setItem(LS_KEY(userId), String(now));
      setTimeout(() => setSaved(false), 2000);
      // Show fetch errors (if any) so user knows something went wrong
      if (fetchErrors.length > 0) {
        setError(`Game fetch had issues — ${fetchErrors.join('; ')}. Saved ${mapped.length} games from successful sources.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setFetching(false);
    }
  }

  // Auto-sync when accounts are loaded and at least one username is configured
  useEffect(() => {
    if (!accounts || fetching) return;
    const hasUsername = accounts.chesscomUsername || accounts.lichessUsername;
    if (!hasUsername) return;
    const lastSyncTime = Number(localStorage.getItem(LS_KEY(userId)) || '0');
    if (Date.now() - lastSyncTime > SYNC_COOLDOWN_MS) {
      // Fire-and-forget — don't block UI
      fetchFromAPIs().catch(console.warn);
    }
  }, [accounts, userId, fetching]);

  const filtered = games.filter(g => {
    if (platformFilter !== 'all' && g.platform !== platformFilter) return false;
    if (resultFilter !== 'all' && g.result !== resultFilter) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Games</h2>
            <p className="text-muted-foreground text-sm">
              {games.length} games saved
              {accounts && (
                <span className="ml-2 text-xs">
                  <span className="text-amber-400">{accounts.chesscomUsername}</span> @ Chess.com
                  <span className="mx-1">·</span>
                  <span className="text-sky-400">{accounts.lichessUsername}</span> @ Lichess
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={fetchFromAPIs}
            disabled={fetching}
            className="gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-0"
          >
            {fetching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Swords className="w-3.5 h-3.5" />}
            {fetching ? 'Fetching...' : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : 'Fetch Games'}
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="chess.com">Chess.com</SelectItem>
            <SelectItem value="lichess">Lichess</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="win">Wins</SelectItem>
            <SelectItem value="loss">Losses</SelectItem>
            <SelectItem value="draw">Draws</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} showing</span>
      </div>

      {/* Games List */}
      <div className="space-y-3">
        {loading && games.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading games...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Crown className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No games found.</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Fetch Games" to pull from Chess.com and Lichess.</p>
          </div>
        ) : (
          filtered.map((g, i) => (
            <motion.div
              key={g.id}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-4 border-border/50 bg-card/60">
                <div className="flex items-center gap-3">
                  <div className={cn('px-2.5 py-1 rounded text-xs font-bold uppercase shrink-0', RESULT_COLORS[g.result] || 'text-muted-foreground bg-muted/20')}>
                    {g.result}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">vs {g.opponentUsername}</span>
                      <Badge variant="outline" className="text-[10px] h-4">{g.platform}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4 capitalize">{g.playerColor}</Badge>
                      {g.isAnalyzed && <Badge variant="outline" className="text-[10px] h-4 text-emerald-400 border-emerald-400/30">{g.accuracy}%</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{formatDate(g.gameDate)}</span>
                      <span>·</span>
                      <span>{g.timeControl}</span>
                      {g.movesCount && <span>· {formatMoves(g.movesCount)}</span>}
                      <span>·</span>
                      <span className="text-amber-400">{g.playerRating ?? '?'}</span>
                      <span>vs</span>
                      <span>{g.opponentRating ?? '?'}</span>
                      {g.openingName && <span>· {g.openingName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleExpand(g.id)}
                      className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      {expanded.has(g.id) ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {g.platform === 'chess.com' && g.externalId && (
                      <a
                        href={`https://www.chess.com/game/live/${g.externalId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                        title="View on Chess.com"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </a>
                    )}
                    {g.platform === 'lichess' && g.externalId && (
                      <a
                        href={`https://lichess.org/${g.externalId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                        title="View on Lichess"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </div>
                {expanded.has(g.id) && (
                  <AnalysisPanel game={g} onAnalyzed={(updated) => {
                    setGames(prev => prev.map(x => x.id === updated.id ? updated : x));
                  }} />
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
