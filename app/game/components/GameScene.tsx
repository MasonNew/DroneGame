'use client';

import { Canvas } from '@react-three/fiber';
import { Sky, Environment, PerformanceMonitor } from '@react-three/drei';
import { Drones } from './Drones';
import { Weapon } from './Weapon';
import { CityBranding } from './CityBranding';
import { GameEnvironment } from './Environment/GameEnvironment';
import { PlayerController } from './PlayerController';
import { useState } from 'react';

export function GameScene() {
  const [dpr, setDpr] = useState(1);

  return (
    <div className="fixed inset-0">
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 5], fov: 75 }}
        dpr={dpr} // Dynamic pixel ratio for performance
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(0.75); // Lower resolution when performance drops
          }}
          onIncline={() => {
            setDpr(1); // Restore resolution when performance improves
          }}
        >
          <Sky />
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            position={[50, 50, 50]}
            intensity={1}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Game Environment */}
          <GameEnvironment />
          
          {/* Game Elements */}
          <CityBranding />
          <Drones />
          <Weapon />
          
          {/* Player Movement and Collision */}
          <PlayerController />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
} 