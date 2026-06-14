import Stockfish from 'stockfish.js';

interface EvalResult {
  score: number; // centipawns or mate
  isMate: boolean;
  bestMove: string;
}

let engine: InstanceType<typeof Stockfish> | null = null;
let engineReady = false;
const queue: { fen: string; resolve: (r: EvalResult) => void }[] = [];

function getEngine(): InstanceType<typeof Stockfish> {
  if (!engine) {
    engine = new Stockfish();
    engine.onmessage = (msg: string) => {
      if (msg.includes('uciok')) {
        engine!.postMessage('setoption name Skill Level value 20');
        engine!.postMessage('setoption name MultiPV value 1');
        engine!.postMessage('isready');
      }
      if (msg.includes('readyok')) {
        engineReady = true;
        processQueue();
      }
      if (msg.startsWith('info') && msg.includes('score')) {
        const bestMatch = msg.match(/bestmove (\S+)/);
        const scoreMatch = msg.match(/score (cp|mate) (-?\d+)/);
        const current = queue[0];
        if (current && scoreMatch && bestMatch) {
          current.resolve({
            score: parseInt(scoreMatch[2]),
            isMate: scoreMatch[1] === 'mate',
            bestMove: bestMatch[1],
          });
          queue.shift();
        }
      }
    };
    engine.postMessage('uci');
  }
  return engine;
}

function processQueue() {
  if (!engineReady || queue.length === 0) return;
  const task = queue[0];
  engine!.postMessage('position fen ' + task.fen);
  engine!.postMessage('go depth 12');
}

export function evaluatePosition(fen: string): Promise<EvalResult> {
  return new Promise((resolve) => {
    queue.push({ fen, resolve });
    processQueue();
  });
}

export function getEngineAccuracy(fen: string, playerMove: string): Promise<number> {
  return new Promise(async (resolve) => {
    const evalBefore = await evaluatePosition(fen);
    // After player move, evaluate again
    const fenAfter = `${fen} ${playerMove}`; // simplified - would need proper FEN update
    const evalAfter = await evaluatePosition(fenAfter);
    const diff = Math.abs(evalBefore.score - evalAfter.score);
    // Accuracy: 100% if move is best, lower if diff is high
    const isBest = evalBefore.bestMove === playerMove;
    if (isBest) { resolve(100); return; }
    // Linear scale: 0 diff = 100%, 300+ diff = 0%
    const accuracy = Math.max(0, 100 - Math.min(diff / 3, 100));
    resolve(Math.round(accuracy));
  });
}

export function terminateEngine() {
  if (engine) {
    engine.postMessage('quit');
    engine = null;
    engineReady = false;
  }
}
