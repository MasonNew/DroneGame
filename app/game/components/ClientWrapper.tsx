'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with no SSR
const DynamicCanvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), {
  ssr: false
});

const DynamicGameEnvironment = dynamic(() => import('./Environment/GameEnvironment').then(mod => mod.GameEnvironment), {
  ssr: false
});

const DynamicWeatherEffects = dynamic(() => import('./effects/WeatherEffects').then(mod => mod.WeatherEffects), {
  ssr: false
});

const DynamicFloatingItems = dynamic(() => import('./FloatingItems').then(mod => mod.FloatingItems), {
  ssr: false
});

interface Props {
  children?: React.ReactNode;
}

export function ClientWrapper({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="w-screen h-screen relative">
      <DynamicCanvas
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
        <DynamicGameEnvironment />
        <DynamicWeatherEffects />
        <DynamicFloatingItems />
      </DynamicCanvas>
      {children}
    </main>
  );
} 