'use client';

import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls } from '@react-three/drei';
import { Suspense } from 'react';
import { Drones } from './Drones';
import { Environment } from './Environment';
import { Weapon } from './Weapon';
import { Player } from './Player';
import { HUD } from './HUD';
import { WeatherEffects } from './effects/WeatherEffects';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GameTooltip } from './GameTooltip';

export function Scene() {
  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 10, 100]} turbidity={0.5} />
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <fog attach="fog" args={['#17171b', 30, 150]} />
          
          <Environment />
          <Drones />
          <Player />
          <Weapon />
          <WeatherEffects />
          
          <EffectComposer>
            <Bloom intensity={0.5} luminanceThreshold={0.9} />
          </EffectComposer>
          
          <PointerLockControls />
        </Suspense>
      </Canvas>
      <HUD />
      <GameTooltip />
    </div>
  );
}