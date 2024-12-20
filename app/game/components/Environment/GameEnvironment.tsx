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
    </group>
  );
}

// Building with window lights
function Building({ position, scale, rotation }: { 
  position: [number, number, number], 
  scale: [number, number, number],
  rotation: number 
}) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={scale} />
        <meshStandardMaterial
          color="#666666"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      {/* Window light */}
      <mesh position={[0, scale[1] * 0.3, scale[2] / 2 + 0.1]}>
        <boxGeometry args={[scale[0] * 0.3, scale[1] * 0.2, 0.1]} />
        <meshStandardMaterial
          color="#88ccff"
          emissive="#88ccff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// Optimized trees using instancing
function Trees({ positions }: { positions: Array<{ position: [number, number, number], scale: number }> }) {
  return (
    <Instances limit={positions.length}>
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

// Progressive loading game environment
function GameplayEnvironment() {
  const [loadedStage, setLoadedStage] = useState(0);
  const buildingPositions = useRef<Array<{
    position: [number, number, number],
    scale: [number, number, number],
    rotation: number
  }>>([]);
  const treePositions = useRef<Array<{
    position: [number, number, number],
    scale: number
  }>>([]);

  useEffect(() => {
    // Generate building positions
    buildingPositions.current = Array.from({ length: 15 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 40;
      return {
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        scale: [
          8 + Math.random() * 8,
          15 + Math.random() * 20,
          8 + Math.random() * 8
        ],
        rotation: Math.random() * Math.PI * 2
      };
    });

    // Generate tree positions
    treePositions.current = Array.from({ length: 20 }, () => ({
      position: [
        Math.random() * 160 - 80,
        0,
        Math.random() * 160 - 80
      ],
      scale: 0.8 + Math.random() * 0.4
    }));

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
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial 
          color="#2d5a27"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Road - Stage 1 */}
      {loadedStage >= 1 && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
          <planeGeometry args={[10, 200]} />
          <meshStandardMaterial 
            color="#333333"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Buildings - Stage 2 */}
      {loadedStage >= 2 && buildingPositions.current.map((data, i) => (
        <Building key={`building-${i}`} {...data} />
      ))}

      {/* Trees - Stage 3 */}
      {loadedStage >= 3 && (
        <Trees positions={treePositions.current} />
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