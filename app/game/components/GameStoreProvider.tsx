'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../store';

interface Props {
  children: React.ReactNode;
}

export function GameStoreProvider({ children }: Props) {
  const [isStoreReady, setIsStoreReady] = useState(false);
  const initGame = useGameStore((state) => state.initGame);

  useEffect(() => {
    // Initialize the game store
    initGame();
    setIsStoreReady(true);
  }, [initGame]);

  if (!isStoreReady) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
} 