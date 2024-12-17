'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';

export function CityBranding() {
  const bannerRef = useRef<THREE.Group>(null);
  const logoTexture = useTexture('/pump.fun.png');

  // Animate banner
  useFrame((state, delta) => {
    if (bannerRef.current) {
      // Move banner in a circular path
      const time = state.clock.getElapsedTime();
      const radius = 80; // Reduced radius to match buildings
      bannerRef.current.position.x = Math.cos(time * 0.1) * radius; // Slower rotation
      bannerRef.current.position.z = Math.sin(time * 0.1) * radius;
      // Make banner always face center
      bannerRef.current.rotation.y = time * 0.1 + Math.PI;
      // Add gentle floating motion
      bannerRef.current.position.y = 35 + Math.sin(time) * 2; // Lower height
    }
  });

  return (
    <group>
      {/* Building Signs */}
      {[0, 90, 180, 270].map((angle, index) => {
        const radius = 80;
        const x = Math.cos(angle * (Math.PI / 180)) * radius;
        const z = Math.sin(angle * (Math.PI / 180)) * radius;
        
        return (
          <group key={index} position={[x, 30, z]} rotation={[0, -angle * (Math.PI / 180), 0]}>
            {/* Building */}
            <mesh position={[0, -15, 0]} castShadow receiveShadow>
              <boxGeometry args={[20, 30, 20]} />
              <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.5} />
            </mesh>

            {/* Sign with frame */}
            <group position={[0, 5, 10.1]}>
              {/* Frame */}
              <mesh position={[0, 0, -0.2]}>
                <boxGeometry args={[16, 16, 1]} />
                <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
              </mesh>

              {/* Background panel */}
              <mesh position={[0, 0, 0.3]}>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial 
                  color="#111111" 
                  emissive="#222222"
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>

              {/* Logo */}
              <mesh position={[0, 0, 0.4]}>
                <planeGeometry args={[12, 12]} />
                <meshBasicMaterial 
                  map={logoTexture}
                  transparent
                  opacity={1}
                />
              </mesh>

              {/* Sign lighting */}
              <pointLight
                position={[0, 0, 2]}
                distance={10}
                intensity={1}
                color="#ffffff"
              />
              <pointLight
                position={[0, 0, 4]}
                distance={15}
                intensity={0.5}
                color="#00ffff"
              />
            </group>
          </group>
        );
      })}

      {/* Flying Banner */}
      <group ref={bannerRef}>
        {/* Banner frame */}
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[41, 9, 0.5]} />
          <meshStandardMaterial 
            color="#333333"
            metalness={0.7}
            roughness={0.3}
            emissive="#222222"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Banner background */}
        <mesh position={[0, 0, 0.2]}>
          <planeGeometry args={[40, 8]} />
          <meshStandardMaterial 
            color="#ff4400"
            emissive="#ff2200"
            emissiveIntensity={1}
            metalness={0.5}
            roughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Banner text */}
        <Text
          position={[0, 0, 0.3]}
          fontSize={5}
          font="bold"
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.2}
          outlineColor="#000000"
          outlineBlur={0.1}
          material-emissive="#ffffff"
          material-emissiveIntensity={1}
        >
          DRONE BUSTER
        </Text>

        {/* Banner lighting */}
        <pointLight
          position={[0, 0, 2]}
          distance={15}
          intensity={2}
          color="#ff6600"
        />

        {/* Glowing edges */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[42, 10]} />
          <meshBasicMaterial 
            color="#ff6600"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
} 