declare module 'stockfish.js' {
  interface StockfishInstance {
    onmessage: ((msg: string) => void) | null;
    postMessage(msg: string): void;
  }
  const Stockfish: new () => StockfishInstance;
  export default Stockfish;
}
