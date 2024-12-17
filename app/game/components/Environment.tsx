'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
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
  const height = 20 + Math.random() * 40;
  const width = 8 + Math.random() * 4;
  const depth = 8 + Math.random() * 4;
  const style = Math.floor(Math.random() * 3);

  const geometry = useMemo(() => new THREE.BoxGeometry(width * scale, height * scale, depth * scale), [width, height, depth, scale]);
  const windowGeometry = useMemo(() => new THREE.BoxGeometry(width * 0.15 * scale, 1.5 * scale, 0.1 * scale), [width, scale]);
  
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: style === 0 ? '#2196f3' : style === 1 ? '#424242' : '#757575',
    metalness: style === 0 ? 0.9 : 0.3,
    roughness: style === 0 ? 0.1 : 0.7
  }), [style]);

  const windowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: style === 0 ? '#e3f2fd' : '#fafafa',
    emissive: style === 0 ? '#bbdefb' : '#f5f5f5',
    emissiveIntensity: 0.2,
    metalness: 0.9,
    roughness: 0.1
  }), [style]);

  return (
    <group position={position}>
      <mesh 
        geometry={geometry}
        material={material}
        castShadow 
        receiveShadow
      />

      {/* Reduce window count and only render windows on visible sides */}
      {Array.from({ length: Math.min(Math.floor(height / 4), 10) }).map((_, i) =>
        Array.from({ length: 4 }).map((_, j) => (
          <group key={`${i}-${j}`}>
            <mesh
              position={[
                (j - 1.5) * (width * 0.2) * scale,
                (i * 4 - height / 2 + 1) * scale,
                depth * 0.51 * scale
              ]}
              geometry={windowGeometry}
              material={windowMaterial}
            />
          </group>
        ))
      )}

      {/* Simplified roof details */}
      <mesh
        position={[0, height * 0.5 * scale + 0.5 * scale, 0]}
        castShadow
      >
        <boxGeometry args={[width * 0.3 * scale, height * 0.1 * scale, depth * 0.3 * scale]} />
        <meshStandardMaterial color="#424242" />
      </mesh>
    </group>
  );
}

export function Environment() {
  const cloudsRef = useRef<THREE.Group>(null);

  // Generate building positions only once using useMemo
  const buildingPositions = useMemo(() => {
    const positions: Array<{ pos: THREE.Vector3; scale: number }> = [];
    const count = 25; // Reduced from 40
    const minSpacing = 25;

    while (positions.length < count) {
      const pos = new THREE.Vector3(
        Math.random() * 200 - 100,
        0,
        Math.random() * 200 - 100
      );

      let tooClose = false;
      for (const existing of positions) {
        if (pos.distanceTo(existing.pos) < minSpacing) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        positions.push({
          pos,
          scale: 0.8 + Math.random() * 0.8
        });
      }
    }
    return positions;
  }, []);

  // Optimize cloud animation
  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.01; // Reduced speed
    }
  });

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>

      {/* City area with optimized skyscrapers */}
      <group>
        {buildingPositions.map((building, i) => (
          <Skyscraper
            key={`skyscraper-${i}`}
            position={building.pos}
            scale={building.scale}
          />
        ))}
      </group>

      {/* Reduced number of trees and mountains */}
      {Array.from({ length: 50 }).map((_, i) => (
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

      {/* Reduced number of mountains */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Mountain
          key={i}
          position={new THREE.Vector3(
            Math.sin(i * Math.PI / 3) * 150,
            0,
            Math.cos(i * Math.PI / 3) * 150
          )}
          scale={1 + Math.random() * 0.5}
        />
      ))}

      {/* Optimized clouds */}
      <group ref={cloudsRef} position={[0, 50, 0]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.random() * 200 - 100,
              Math.random() * 20,
              Math.random() * 200 - 100
            ]}
          >
            <sphereGeometry args={[10 + Math.random() * 10, 8, 8]} />
            <meshStandardMaterial
              color="white"
              transparent
              opacity={0.3}
              roughness={1}
            />
          </mesh>
        ))}
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 0]}
        intensity={0.7}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight
        args={["#87CEEB", "#2d5a27", 0.5]}
        position={[0, 50, 0]}
      />
    </group>
  );
}