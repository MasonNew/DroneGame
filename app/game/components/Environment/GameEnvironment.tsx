'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';

// Create instanced meshes for better performance
function Trees({ count = 30 }) {
  const positions = useRef(
    Array.from({ length: count }, () => ({
      position: [
        Math.random() * 200 - 100,
        0,
        Math.random() * 200 - 100
      ] as [number, number, number],
      scale: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI
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

// Instanced bushes
function Bushes({ count = 50 }) {
  const positions = useRef(
    Array.from({ length: count }, () => ({
      position: [
        Math.random() * 180 - 90,
        0.5,
        Math.random() * 180 - 90
      ] as [number, number, number],
      scale: 0.6 + Math.random() * 0.4
    }))
  ).current;

  return (
    <Instances limit={count}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#2d5a27" />
      {positions.map((data, i) => (
        <Instance
          key={i}
          position={data.position}
          scale={data.scale}
        />
      ))}
    </Instances>
  );
}

// Ground with solid color
function Ground() {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[400, 400, 32, 32]} />
        <meshStandardMaterial 
          color="#2d5a27"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Road */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 200, 1, 16]} />
        <meshStandardMaterial 
          color="#333333"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

// Buildings using instancing for better performance
function Buildings({ count = 20 }) {
  const positions = useRef(
    Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 60;
      return {
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ] as [number, number, number],
        scale: [
          10 + Math.random() * 10,
          20 + Math.random() * 30,
          10 + Math.random() * 10
        ] as [number, number, number],
        rotation: Math.random() * Math.PI * 2,
        windowRows: Math.floor(Math.random() * 2) + 3,
        windowCols: Math.floor(Math.random() * 2) + 2
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
          <mesh castShadow receiveShadow>
            <boxGeometry args={data.scale} />
            <meshStandardMaterial
              color="#666666"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>

          {/* Windows - Front face only for better performance */}
          {Array.from({ length: data.windowRows }).map((_, row) =>
            Array.from({ length: data.windowCols }).map((_, col) => (
              <group
                key={`front-${row}-${col}`}
                position={[
                  (col - (data.windowCols - 1) / 2) * (data.scale[0] * 0.2),
                  (row - data.windowRows / 2) * (data.scale[1] * 0.15) + data.scale[1] * 0.3,
                  data.scale[2] / 2 + 0.1
                ]}
              >
                <mesh>
                  <boxGeometry args={[data.scale[0] * 0.13, data.scale[1] * 0.1, 0.1]} />
                  <meshPhysicalMaterial
                    color="#88ccff"
                    metalness={0.9}
                    roughness={0.1}
                    transparent={true}
                    opacity={0.7}
                    envMapIntensity={1}
                  />
                </mesh>
                <pointLight
                  color="#ffaa44"
                  intensity={0.3}
                  distance={3}
                  decay={2}
                />
              </group>
            ))
          )}
        </group>
      ))}
    </group>
  );
}

export function GameEnvironment() {
  return (
    <group>
      <Ground />
      <Buildings count={20} />
      <Trees count={30} />
      <Bushes count={50} />
    </group>
  );
} 