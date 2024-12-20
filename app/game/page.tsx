'use client';

import dynamic from 'next/dynamic';
import { GameStoreProvider } from './components/GameStoreProvider';
import { BrandOverlay } from './components/ui/BrandOverlay';
import { useGameStore } from './store';

const DynamicLoginModal = dynamic(() => import('./components/ui/LoginModal').then(mod => mod.LoginModal), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
});

const DynamicLeaderboard = dynamic(() => import('./components/ui/Leaderboard').then(mod => mod.Leaderboard), {
  ssr: false
});

const DynamicClientWrapper = dynamic(() => import('./components/ClientWrapper').then(mod => mod.ClientWrapper), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-xl">Loading game environment...</div>
    </div>
  )
});

export default function GamePage() {
  const { isLoggedIn } = useGameStore();

  return (
    <GameStoreProvider>
      <DynamicClientWrapper>
        {!isLoggedIn && <DynamicLoginModal />}
        {isLoggedIn && <DynamicLeaderboard />}
        <BrandOverlay />
      </DynamicClientWrapper>
    </GameStoreProvider>
  );
}