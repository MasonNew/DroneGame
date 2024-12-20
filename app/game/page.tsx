'use client';

import { Canvas } from '@react-three/fiber';
import { GameEnvironment } from './components/Environment/GameEnvironment';
import { WeatherEffects } from './components/effects/WeatherEffects';
import { FloatingItems } from './components/FloatingItems';
import { LoginModal } from './components/ui/LoginModal';
import { Leaderboard } from './components/ui/Leaderboard';
import { BrandOverlay } from './components/ui/BrandOverlay';
import { useGameStore } from './store';

export default function GamePage() {
  const { isLoggedIn } = useGameStore();

  return (
    <main className="w-screen h-screen relative">
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 75 }}
        style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a1e 100%)' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={2048}
        />
        <GameEnvironment />
        <WeatherEffects />
        <FloatingItems />
      </Canvas>

      {!isLoggedIn && <LoginModal />}
      {isLoggedIn && <Leaderboard />}
      <BrandOverlay />
    </main>
  );
}