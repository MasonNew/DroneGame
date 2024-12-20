'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';

// Extremely simplified environment for login screen
function SimpleEnvironment() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#2d5a27"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// Simple building without details
function Building({ position, scale, rotation }: { 
  position: [number, number, number], 
  scale: [number, number, number],
  rotation: number 
}) {
  return (
    <mesh position={position} rotation-y={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial
        color="#666666"
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

// Simple tree without details
function Tree({ position, scale }: { 
  position: [number, number, number], 
  scale: number 
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2 * scale, 0.3 * scale, 2 * scale]} />
        <meshStandardMaterial color="#4b3f2f" />
      </mesh>
      <mesh position={[0, 1.5 * scale, 0]} castShadow>
        <coneGeometry args={[1 * scale, 2 * scale, 6]} />
        <meshStandardMaterial color="#1a472a" />
      </mesh>
    </group>
  );
}

// Progressive loading game environment
function GameplayEnvironment() {
  const [loadedObjects, setLoadedObjects] = useState(0);
  const maxObjects = 10; // Reduced number of objects
  const objectsToLoad = useRef<Array<{ type: 'building' | 'tree', props: any }>>([]);

  useEffect(() => {
    // Generate a small number of objects with simpler positions
    objectsToLoad.current = Array.from({ length: maxObjects }, (_, i) => {
      const angle = (i / maxObjects) * Math.PI * 2;
      const radius = 20 + Math.random() * 20; // Reduced radius
      const position: [number, number, number] = [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ];

      return Math.random() > 0.5 
        ? {
            type: 'building' as const,
            props: {
              position,
              scale: [5, 10, 5] as [number, number, number], // Simplified scale
              rotation: Math.random() * Math.PI * 2
            }
          }
        : {
            type: 'tree' as const,
            props: {
              position,
              scale: 0.8 + Math.random() * 0.4
            }
          };
    });

    // Load objects progressively
    const interval = setInterval(() => {
      setLoadedObjects(prev => {
        const next = prev + 1;
        if (next >= maxObjects) {
          clearInterval(interval);
        }
        return next;
      });
    }, 100); // Load one object every 100ms

    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#2d5a27"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Road */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial 
          color="#333333"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Load objects progressively */}
      {objectsToLoad.current.slice(0, loadedObjects).map((object, i) => (
        object.type === 'building' 
          ? <Building key={`building-${i}`} {...object.props} />
          : <Tree key={`tree-${i}`} {...object.props} />
      ))}
    </group>
  );
}

export function GameEnvironment() {
  const isLoggedIn = useGameStore((state) => state.isLoggedIn);

  // Render simplified environment for login screen
  if (!isLoggedIn) {
    return <SimpleEnvironment />;
  }

  // Render progressively loading environment for gameplay
  return <GameplayEnvironment />;
} 