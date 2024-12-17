'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Tree({ position, scale = 1 }: { position: THREE.Vector3; scale?: number }) {
  const trunkHeight = 2 * scale;
  const trunkRadius = 0.2 * scale;
  const leavesRadius = 1.5 * scale;
  const leavesHeight = 3 * scale;

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, trunkHeight, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={0.8} />
      </mesh>

      {/* Leaves */}
      <group position={[0, trunkHeight / 2 + leavesHeight / 3, 0]}>
        <mesh castShadow>
          <coneGeometry args={[leavesRadius, leavesHeight, 8]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.8} />
        </mesh>
        <mesh position={[0, -leavesHeight / 4, 0]} castShadow>
          <coneGeometry args={[leavesRadius * 1.2, leavesHeight, 8]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Mountain({ position, scale = 1 }: { position: THREE.Vector3; scale?: number }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <coneGeometry args={[20 * scale, 30 * scale, 4]} />
      <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
    </mesh>
  );
}

function Skyscraper({ position, scale = 1 }: { position: THREE.Vector3; scale?: number }) {
  const height = 20 + Math.random() * 30;
  const width = 8 + Math.random() * 4;
  const depth = 8 + Math.random() * 4;

  return (
    <group position={position}>
      {/* Main building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width * scale, height * scale, depth * scale]} />
        <meshStandardMaterial color="#37474f" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 0, depth * scale * 0.501]}>
        <planeGeometry args={[width * scale, height * scale]} />
        <meshStandardMaterial
          color="#90caf9"
          emissive="#90caf9"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Collision box - slightly smaller than visual model */}
      <mesh visible={false} name="building-collider">
        <boxGeometry args={[
          (width - 0.4) * scale, 
          height * scale, 
          (depth - 0.4) * scale
        ]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

export function Environment() {
  const cloudsRef = useRef<THREE.Group>(null);

  // Animate clouds
  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }
  });

  // Generate building positions with minimum spacing
  const generateBuildingPositions = (count: number, minSpacing: number) => {
    const positions: THREE.Vector3[] = [];
    const maxAttempts = 100;

    while (positions.length < count && maxAttempts > 0) {
      const pos = new THREE.Vector3(
        Math.random() * 100 - 50,
        0,
        Math.random() * 100 - 50
      );

      // Check distance from other buildings
      let tooClose = false;
      for (const existingPos of positions) {
        if (pos.distanceTo(existingPos) < minSpacing) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        positions.push(pos);
      }
    }

    return positions;
  };

  // Generate building positions with minimum spacing
  const buildingPositions = generateBuildingPositions(20, 25); // Reduced building count, increased spacing to 25 units

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>

      {/* Basic lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[50, 50, 0]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* City area with skyscrapers */}
      <group position={[-90, 0, -90]}>
        {buildingPositions.map((pos, i) => (
          <Skyscraper
            key={`skyscraper-${i}`}
            position={pos}
            scale={0.6 + Math.random() * 0.3}
          />
        ))}
      </group>

      {/* Trees */}
      {Array.from({ length: 100 }).map((_, i) => (
        <Tree
          key={i}
          position={new THREE.Vector3(
            Math.random() * 200 - 100,
            0,
            Math.random() * 200 - 100
          )}
          scale={0.8 + Math.random() * 0.4}
        />
      ))}

      {/* Mountains in the distance */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Mountain
          key={i}
          position={new THREE.Vector3(
            Math.sin(i * Math.PI / 4) * 150,
            0,
            Math.cos(i * Math.PI / 4) * 150
          )}
          scale={1 + Math.random() * 0.5}
        />
      ))}

      {/* Clouds */}
      <group ref={cloudsRef} position={[0, 50, 0]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.random() * 200 - 100,
              Math.random() * 20,
              Math.random() * 200 - 100
            ]}
          >
            <sphereGeometry args={[10 + Math.random() * 10, 16, 16]} />
            <meshStandardMaterial
              color="white"
              transparent
              opacity={0.3}
              roughness={1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}