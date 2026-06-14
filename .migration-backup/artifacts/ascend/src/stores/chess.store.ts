import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChessState {
  chesscomUsername: string;
  lichessUsername: string;
  setChesscomUsername: (v: string) => void;
  setLichessUsername: (v: string) => void;
}

export const useChessStore = create<ChessState>()(
  persist(
    (set) => ({
      chesscomUsername: 'princeplaysch',
      lichessUsername: 'princeplaysch',
      setChesscomUsername: (v) => set({ chesscomUsername: v }),
      setLichessUsername: (v) => set({ lichessUsername: v }),
    }),
    { name: 'ascend-chess-accounts' }
  )
);
