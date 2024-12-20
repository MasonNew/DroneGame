'use client';

import dynamic from 'next/dynamic';
import { ClientWrapper } from './components/ClientWrapper';
import { BrandOverlay } from './components/ui/BrandOverlay';
import { useGameStore } from './store';

const DynamicLoginModal = dynamic(() => import('./components/ui/LoginModal').then(mod => mod.LoginModal), {
  ssr: false
});

const DynamicLeaderboard = dynamic(() => import('./components/ui/Leaderboard').then(mod => mod.Leaderboard), {
  ssr: false
});

export default function GamePage() {
  const { isLoggedIn } = useGameStore();

  return (
    <ClientWrapper>
      {!isLoggedIn && <DynamicLoginModal />}
      {isLoggedIn && <DynamicLeaderboard />}
      <BrandOverlay />
    </ClientWrapper>
  );
}