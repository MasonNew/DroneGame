'use client';

import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, Stats } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { Drones } from './Drones';
import { Environment } from './Environment';
import { Weapon } from './Weapon';
import { Player } from './Player';
import { HUD } from './HUD';
import { WeatherEffects } from './effects/WeatherEffects';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Loader } from '@/components/ui/loader';

export function Scene() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Ensure Three.js is loaded and WebGL is available
    if (typeof window !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          throw new Error('WebGL is not supported');
        }
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize WebGL:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize'));
      }
    }
  }, []);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#17171b]">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-400">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white text-black rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#17171b]">
        <Loader className="w-8 h-8 text-white" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        dpr={[1, 1.5]} // Reduced max DPR for better performance
        camera={{ 
          fov: 75, 
          near: 0.1, 
          far: 1000, 
          position: [-90, 2, -90],
          rotation: [0, Math.PI / 4, 0]
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true // Prevent running with poor performance
        }}
        onCreated={({ gl }) => {
          // Enable memory info in development
          if (process.env.NODE_ENV === 'development') {
            (gl as any).debug.checkShaderErrors = true;
          }
        }}
      >
        <color attach="background" args={["#17171b"]} />
        <fog attach="fog" args={['#17171b', 30, 150]} />
        
        <Suspense fallback={null}>
          <Sky 
            distance={450000} 
            sunPosition={[100, 10, 100]} 
            inclination={0.5}
            azimuth={0.25}
            turbidity={0.5} 
          />
          
          <Environment />
          <Drones />
          <Player />
          <Weapon />
          <WeatherEffects />
          
          <EffectComposer>
            <Bloom 
              intensity={0.5} 
              luminanceThreshold={0.9}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
          
          <PointerLockControls />
        </Suspense>
        
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      <HUD />
    </div>
  );
}