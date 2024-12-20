'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance, useGLTF, useTexture } from '@react-three/drei';

// Create instanced meshes for better performance
function Trees({ count = 50 }) {
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
          {/* Tree trunk */}
          <Instance scale={[1, data.scale * 2, 1]} />
          {/* Tree top */}
          <mesh position={[0, data.scale * 2, 0]}>
            <coneGeometry args={[1.5, 3 * data.scale, 8]} />
            <meshStandardMaterial color="#1a472a" />
          </mesh>
        </group>
      ))}
    </Instances>
  );
}

// Instanced bushes
function Bushes({ count = 100 }) {
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
      <sphereGeometry args={[1, 8, 8]} />
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

// Ground with grass texture
function Ground() {
  const groundTexture = useTexture('/textures/grass.jpg');
  const roadTexture = useTexture('/textures/road.jpg');

  // Repeat textures
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(50, 50);
  roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(20, 1);

  return (
    <group>
      {/* Main ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial 
          map={groundTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Roads */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 200]} />
        <meshStandardMaterial 
          map={roadTexture}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 200]} />
        <meshStandardMaterial 
          map={roadTexture}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

// Buildings using instancing for better performance
function Buildings({ count = 30 }) {
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
        windowRows: Math.floor(Math.random() * 3) + 4, // 4-6 rows of windows
        windowCols: Math.floor(Math.random() * 2) + 3  // 3-4 columns of windows
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
          {/* Main building structure */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={data.scale} />
            <meshStandardMaterial
              color="#666666"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>

          {/* Collision box - slightly larger than the building */}
          <mesh visible={false} name="building-collider">
            <boxGeometry args={[
              data.scale[0] * 1.1,
              data.scale[1],
              data.scale[2] * 1.1
            ]} />
          </mesh>

          {/* Windows - Front face */}
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
                {/* Window frame */}
                <mesh castShadow>
                  <boxGeometry args={[data.scale[0] * 0.15, data.scale[1] * 0.12, 0.2]} />
                  <meshStandardMaterial
                    color="#333333"
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
                {/* Window glass */}
                <mesh>
                  <boxGeometry args={[data.scale[0] * 0.13, data.scale[1] * 0.1, 0.1]} />
                  <meshPhysicalMaterial
                    color="#88ccff"
                    metalness={0.9}
                    roughness={0.1}
                    transparent={true}
                    opacity={0.7}
                    envMapIntensity={1.5}
                  />
                </mesh>
                {/* Window light */}
                <pointLight
                  color="#ffaa44"
                  intensity={0.5}
                  distance={5}
                  decay={2}
                />
              </group>
            ))
          )}

          {/* Windows - Back face */}
          {Array.from({ length: data.windowRows }).map((_, row) =>
            Array.from({ length: data.windowCols }).map((_, col) => (
              <group
                key={`back-${row}-${col}`}
                position={[
                  (col - (data.windowCols - 1) / 2) * (data.scale[0] * 0.2),
                  (row - data.windowRows / 2) * (data.scale[1] * 0.15) + data.scale[1] * 0.3,
                  -data.scale[2] / 2 - 0.1
                ]}
              >
                <mesh castShadow>
                  <boxGeometry args={[data.scale[0] * 0.15, data.scale[1] * 0.12, 0.2]} />
                  <meshStandardMaterial
                    color="#333333"
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
                <mesh>
                  <boxGeometry args={[data.scale[0] * 0.13, data.scale[1] * 0.1, 0.1]} />
                  <meshPhysicalMaterial
                    color="#88ccff"
                    metalness={0.9}
                    roughness={0.1}
                    transparent={true}
                    opacity={0.7}
                    envMapIntensity={1.5}
                  />
                </mesh>
                <pointLight
                  color="#ffaa44"
                  intensity={0.5}
                  distance={5}
                  decay={2}
                />
              </group>
            ))
          )}

          {/* Building details */}
          {/* Roof edge */}
          <mesh
            position={[0, data.scale[1] / 2 + 0.2, 0]}
            castShadow
          >
            <boxGeometry args={[data.scale[0] * 1.1, 0.4, data.scale[2] * 1.1]} />
            <meshStandardMaterial
              color="#444444"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Base/Foundation */}
          <mesh
            position={[0, -data.scale[1] / 2 + 0.2, 0]}
            receiveShadow
          >
            <boxGeometry args={[data.scale[0] * 1.1, 0.4, data.scale[2] * 1.1]} />
            <meshStandardMaterial
              color="#555555"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>

          {/* Corner pillars */}
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], index) => (
            <mesh
              key={`pillar-${index}`}
              position={[
                x * (data.scale[0] / 2),
                0,
                z * (data.scale[2] / 2)
              ]}
              castShadow
            >
              <boxGeometry args={[1, data.scale[1], 1]} />
              <meshStandardMaterial
                color="#555555"
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Sidewalks
function Sidewalks() {
  return (
    <group>
      {[0, 90, 180, 270].map((angle, i) => (
        <group key={i} rotation-y={angle * Math.PI / 180}>
          <mesh position={[0, 0.1, 40]} receiveShadow>
            <boxGeometry args={[12, 0.2, 100]} />
            <meshStandardMaterial color="#999999" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function GameEnvironment() {
  return (
    <group>
      <Ground />
      <Buildings count={40} />
      <Trees count={100} />
      <Bushes count={200} />
      <Sidewalks />
    </group>
  );
} 