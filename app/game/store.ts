import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as THREE from 'three';

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface GameStore {
  playerName: string;
  isLoggedIn: boolean;
  score: number;
  leaderboard: LeaderboardEntry[];
  setPlayerName: (name: string) => void;
  setIsLoggedIn: (value: boolean) => void;
  incrementScore: (amount: number) => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  addScoreToLeaderboard: () => void;
  resetScore: () => void;
  cameraPosition: THREE.Vector3;
  cameraRotation: THREE.Euler;
  setCameraPosition: (position: THREE.Vector3) => void;
  setCameraRotation: (rotation: THREE.Euler) => void;
  isInitialized: boolean;
  initGame: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      playerName: '',
      isLoggedIn: false,
      score: 0,
      leaderboard: [],
      isInitialized: false,
      cameraPosition: new THREE.Vector3(0, 5, 10),
      cameraRotation: new THREE.Euler(0, 0, 0),

      setPlayerName: (name) => set({ playerName: name }),
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
      incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
      updateLeaderboard: (entries) => {
        set({ leaderboard: entries.sort((a, b) => b.score - a.score) });
      },
      addScoreToLeaderboard: () => {
        const { playerName, score, leaderboard } = get();
        if (!playerName || score === 0) return;

        const newLeaderboard = [...leaderboard];
        const existingEntry = newLeaderboard.find(entry => entry.name === playerName);

        if (existingEntry) {
          if (score > existingEntry.score) {
            existingEntry.score = score;
          }
        } else {
          newLeaderboard.push({ name: playerName, score });
        }

        newLeaderboard.sort((a, b) => b.score - a.score);
        set({ leaderboard: newLeaderboard });
      },
      resetScore: () => set({ score: 0 }),
      setCameraPosition: (position) => set({ cameraPosition: position }),
      setCameraRotation: (rotation) => set({ cameraRotation: rotation }),

      initGame: () => {
        if (get().isInitialized) return;
        set({
          score: 0,
          isInitialized: true,
          cameraPosition: new THREE.Vector3(0, 5, 10),
          cameraRotation: new THREE.Euler(0, 0, 0),
        });
      },
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        leaderboard: state.leaderboard,
        playerName: state.playerName,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);