'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Dynamically import Scene with no SSR
const DynamicScene = dynamic(
  () => import('./components/Scene').then(mod => ({ default: mod.Scene })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-[#17171b]">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Game...</h2>
          <p className="text-gray-400">Preparing your mission...</p>
        </div>
      </div>
    )
  }
);

export default function GamePage() {
  const initGame = useGameStore((state) => state.initGame);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized) {
      // Initialize game state
      initGame();
      setHasInitialized(true);
    }
    
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Lock pointer on click
    const handleClick = () => {
      document.body.requestPointerLock();
    };

    // Handle pointer lock errors
    const handlePointerLockError = () => {
      console.error('Pointer lock failed');
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('pointerlockerror', handlePointerLockError);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    };
  }, [initGame, hasInitialized]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#17171b]">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Game...</h2>
          <p className="text-gray-400">Preparing your mission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#17171b]">
      <DynamicScene />
      
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
        <Button 
          variant="outline" 
          onClick={() => {
            initGame();
            document.body.requestPointerLock();
          }}
          className="text-white border-white hover:bg-white/10"
        >
          New Game
        </Button>
      </div>

      <div className="fixed bottom-4 left-4 text-white text-sm opacity-50">
        <p>Click anywhere to start</p>
        <p>WASD to move, Mouse to aim, Click to shoot</p>
        <p>ESC to pause</p>
      </div>
    </div>
  );
}