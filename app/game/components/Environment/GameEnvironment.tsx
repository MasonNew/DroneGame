'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import { useGameStore } from '../../store';

// Simplified environment for login screen
function SimpleEnvironment() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial 
          color="#2d5a27"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Simple decorative elements */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const radius = 30;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              10,
              Math.sin(angle) * radius
            ]}
            castShadow
          >
            <boxGeometry args={[8, 20, 8]} />
            <meshStandardMaterial
              color="#666666"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Optimized trees with instancing
function Trees({ count = 20 }) {
  const positions = useRef(
    Array.from({ length: count }, () => ({
      position: [
        Math.random() * 160 - 80,
        0,
        Math.random() * 160 - 80
      ] as [number, number, number],
      scale: 0.8 + Math.random() * 0.4
    }))
  ).current;

  return (
    <Instances limit={count}>
      <cylinderGeometry args={[0.3, 0.5, 2]} />
      <meshStandardMaterial color="#4b3f2f" />
      {positions.map((data, i) => (
        <group key={i} position={data.position}>
          <Instance scale={[1, data.scale * 2, 1]} />
          <mesh position={[0, data.scale * 2, 0]}>
            <coneGeometry args={[1.5, 3 * data.scale, 6]} />
            <meshStandardMaterial color="#1a472a" />
          </mesh>
        </group>
      ))}
    </Instances>
  );
}

// Buildings with window lights
function Buildings({ count = 15 }) {
  const positions = useRef(
    Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 40;
      return {
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ] as [number, number, number],
        scale: [
          8 + Math.random() * 8,
          15 + Math.random() * 20,
          8 + Math.random() * 8
        ] as [number, number, number],
        rotation: Math.random() * Math.PI * 2
      };
    })
  ).current;

  return (
    <group>
      {positions.map((data, i) => (
        <group
          key={i}
          position={data.position}
          rotation-y={data.rotation}
        >
          {/* Building collider */}
          <mesh castShadow receiveShadow name="building-collider">
            <boxGeometry args={data.scale} />
            <meshStandardMaterial
              color="#666666"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          {/* Window lights */}
          <mesh position={[0, data.scale[1] * 0.3, data.scale[2] / 2 + 0.1]}>
            <boxGeometry args={[data.scale[0] * 0.3, data.scale[1] * 0.2, 0.1]} />
            <meshStandardMaterial
              color="#88ccff"
              emissive="#88ccff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Ground with road
function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial 
          color="#2d5a27"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 200]} />
        <meshStandardMaterial 
          color="#333333"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

// Progressive loading game environment
function GameplayEnvironment() {
  const [loadedStage, setLoadedStage] = useState(0);

  useEffect(() => {
    // Progressive loading stages
    const loadStages = () => {
      setLoadedStage(prev => {
        const next = prev + 1;
        if (next < 4) {
          setTimeout(loadStages, 300); // Load next stage after 300ms
        }
        return next;
      });
    };

    setTimeout(loadStages, 100); // Start loading after initial render

    return () => {
      setLoadedStage(0);
    };
  }, []);

  return (
    <group>
      {/* Ground - Always loaded */}
      <Ground />

      {/* Buildings - Stage 1 */}
      {loadedStage >= 1 && (
        <Buildings count={15} />
      )}

      {/* Trees - Stage 2 */}
      {loadedStage >= 2 && (
        <Trees count={20} />
      )}
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