'use client';

import { useEffect } from 'react';
import { Scene } from './components/Scene';
import { useGameStore } from './store';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const initGame = useGameStore((state) => state.initGame);

  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div className="relative w-full h-screen">
      <Scene />
      
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
        <Button variant="outline" onClick={initGame}>
          New Game
        </Button>
      </div>
    </div>
  );
}