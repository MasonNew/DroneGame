'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance, useGLTF, useTexture } from '@react-three/drei';

// Create instanced meshes for better performance
function Trees({ count = 50 }) {
  const positions = useMemo(() => 
    Array.from({ length: count }, () => ({
      position: [
        Math.random() * 200 - 100,
        0,
        Math.random() * 200 - 100
      ] as [number, number, number],
      scale: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI
    })), [count]
  );

  return (
    <Instances limit={count}>
      <cylinderGeometry args={[0.3, 0.5, 2]} />
      <meshStandardMaterial color="#4b3f2f" />
      {positions.map((data, i) => (
        <group key={i} position={data.position}>
          <Instance scale={[1, data.scale * 2, 1]} />
          <mesh position={[0, data.scale * 2, 0]}>
            <coneGeometry args={[1.5, 3 * data.scale, 8]} />
            <meshStandardMaterial color="#1a472a" />
          </mesh>
        </group>
      ))}
    </Instances>
  );
}

// Instanced bushes with optimized rendering
function Bushes({ count = 100 }) {
  const positions = useMemo(() => 
    Array.from({ length: count }, () => ({
      position: [
        Math.random() * 180 - 90,
        0.5,
        Math.random() * 180 - 90
      ] as [number, number, number],
      scale: 0.6 + Math.random() * 0.4
    })), [count]
  );

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

// Ground with optimized textures
function Ground() {
  const groundTexture = useTexture('/textures/grass.jpg');
  const roadTexture = useTexture('/textures/road.jpg');

  useMemo(() => {
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);
    groundTexture.minFilter = THREE.LinearMipMapLinearFilter;
    groundTexture.magFilter = THREE.LinearFilter;
    groundTexture.generateMipmaps = true;

    roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(20, 1);
    roadTexture.minFilter = THREE.LinearMipMapLinearFilter;
    roadTexture.magFilter = THREE.LinearFilter;
    roadTexture.generateMipmaps = true;
  }, [groundTexture, roadTexture]);

  const groundMaterial = useMemo(() => (
    <meshStandardMaterial 
      map={groundTexture}
      roughness={0.8}
      metalness={0.1}
    />
  ), [groundTexture]);

  const roadMaterial = useMemo(() => (
    <meshStandardMaterial 
      map={roadTexture}
      roughness={0.7}
      metalness={0.2}
    />
  ), [roadTexture]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[400, 400]} />
        {groundMaterial}
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 200]} />
        {roadMaterial}
      </mesh>
      <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 200]} />
        {roadMaterial}
      </mesh>
    </group>
  );
}

// Buildings with optimized geometry and materials
function Buildings({ count = 30 }) {
  const positions = useMemo(() => 
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
        windowRows: Math.floor(Math.random() * 3) + 4,
        windowCols: Math.floor(Math.random() * 2) + 3
      };
    }), [count]
  );

  // Shared materials
  const buildingMaterial = useMemo(() => (
    <meshStandardMaterial
      color="#666666"
      metalness={0.5}
      roughness={0.5}
    />
  ), []);

  const windowFrameMaterial = useMemo(() => (
    <meshStandardMaterial
      color="#333333"
      metalness={0.8}
      roughness={0.2}
    />
  ), []);

  const windowGlassMaterial = useMemo(() => (
    <meshPhysicalMaterial
      color="#88ccff"
      metalness={0.9}
      roughness={0.1}
      transparent={true}
      opacity={0.7}
      envMapIntensity={1.5}
    />
  ), []);

  // Shared geometries
  const windowFrameGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 0.2), []);
  const windowGlassGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 0.1), []);

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
            {buildingMaterial}
          </mesh>

          {Array.from({ length: data.windowRows }).map((_, row) =>
            Array.from({ length: data.windowCols }).map((_, col) => {
              const windowScale = [
                data.scale[0] * 0.15,
                data.scale[1] * 0.12,
                1
              ];
              const windowPos = [
                (col - (data.windowCols - 1) / 2) * (data.scale[0] * 0.2),
                (row - data.windowRows / 2) * (data.scale[1] * 0.15) + data.scale[1] * 0.3,
                data.scale[2] / 2 + 0.1
              ];

              return (
                <group key={`window-${row}-${col}`} position={windowPos}>
                  <mesh
                    geometry={windowFrameGeometry}
                    scale={windowScale}
                    castShadow
                  >
                    {windowFrameMaterial}
                  </mesh>
                  <mesh
                    geometry={windowGlassGeometry}
                    scale={[windowScale[0] * 0.9, windowScale[1] * 0.9, 1]}
                  >
                    {windowGlassMaterial}
                  </mesh>
                  <pointLight
                    color="#ffaa44"
                    intensity={0.5}
                    distance={5}
                    decay={2}
                  />
                </group>
              );
            })
          )}
        </group>
      ))}
    </group>
  );
}

// Optimized sidewalks
const SidewalksComponent = () => {
  const geometry = useMemo(() => new THREE.BoxGeometry(12, 0.2, 100), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: "#999999" }), []);

  return (
    <group>
      {[0, 90, 180, 270].map((angle, i) => (
        <group key={i} rotation-y={angle * Math.PI / 180}>
          <mesh position={[0, 0.1, 40]} receiveShadow geometry={geometry} material={material} />
        </group>
      ))}
    </group>
  );
};

const Sidewalks = React.memo(SidewalksComponent);

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