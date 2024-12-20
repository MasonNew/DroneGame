'use client';

import { Canvas } from '@react-three/fiber';
import { GameEnvironment } from './components/Environment/GameEnvironment';
import { GameUI } from './components/GameUI';
import { LoginModal } from './components/ui/LoginModal';
import { Leaderboard } from './components/ui/Leaderboard';
import { useGameStore } from './store';
import { PlayerController } from './components/PlayerController';
import { Weapon } from './components/Weapon';
import { Scope } from './components/Scope';
import { GameTooltip } from './components/GameTooltip';
import { WeatherEffects } from './components/effects/WeatherEffects';
import { FloatingItems } from './components/FloatingItems';
import { WeaponHUD } from './components/ui/WeaponHUD';
import { MissionHUD } from './components/ui/MissionHUD';

export default function GamePage() {
  const isLoggedIn = useGameStore((state) => state.isLoggedIn);

  return (
    <main className="w-screen h-screen relative">
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <GameEnvironment />
        {isLoggedIn && (
          <>
            <PlayerController />
            <Weapon />
            <Scope />
            <WeatherEffects />
            <FloatingItems />
          </>
        )}
      </Canvas>
      
      <GameUI />
      <GameTooltip />
      <WeaponHUD />
      <MissionHUD />
      <Leaderboard />
      <LoginModal />
    </main>
  );
}