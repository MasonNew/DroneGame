'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../../store';

interface LeaderboardEntry {
  name: string;
  score: number;
}

export function Leaderboard() {
  const [mounted, setMounted] = useState(false);
  const { leaderboard, updateLeaderboard } = useGameStore();

  useEffect(() => {
    setMounted(true);
    // Load leaderboard from localStorage on mount
    const savedLeaderboard = localStorage.getItem('gameLeaderboard');
    if (savedLeaderboard) {
      updateLeaderboard(JSON.parse(savedLeaderboard));
    }
  }, [updateLeaderboard]);

  if (!mounted) return null;

  return (
    <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-white mb-3">Top Players</h2>
      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((entry, index) => (
          <div
            key={`${entry.name}-${index}`}
            className="flex justify-between items-center text-white"
          >
            <span className="flex items-center">
              <span className="w-6 text-cyan-400">{index + 1}.</span>
              <span className="ml-2">{entry.name}</span>
            </span>
            <span className="text-cyan-400 font-mono">{entry.score}</span>
          </div>
        ))}
        {leaderboard.length === 0 && (
          <div className="text-gray-400 text-center">No scores yet</div>
        )}
      </div>
    </div>
  );
} 