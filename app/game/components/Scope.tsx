'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';

export function Scope() {
  const { camera } = useThree();
  const scopeRef = useRef<THREE.Group>(null);
  const { activeWeapon, weather } = useGameStore();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (scopeRef.current) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        scopeRef.current.rotation.y = x * 0.1;
        scopeRef.current.rotation.x = y * 0.1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (scopeRef.current) {
      // Apply weapon sway and environmental effects
      scopeRef.current.position.x += Math.sin(Date.now() * 0.001) * 0.001 * weather.windSpeed;
      scopeRef.current.position.y += Math.cos(Date.now() * 0.001) * 0.001 * weather.windSpeed;
    }
  });

  return (
    <group ref={scopeRef}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}