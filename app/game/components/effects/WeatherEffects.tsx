'use client';

import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

export function WeatherEffects() {
  const weather = useGameStore((state) => state.weather);
  const rainRef = useRef<THREE.Points>(null);
  
  const rainGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = Math.random() * 100 - 50;
      positions[i + 1] = Math.random() * 50;
      positions[i + 2] = Math.random() * 100 - 50;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);
  
  useFrame((state) => {
    if (rainRef.current && weather.precipitation === 'rain') {
      const positions = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.2;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 50;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  if (weather.precipitation === 'none') return null;
  
  return (
    <points ref={rainRef} geometry={rainGeometry}>
      <pointsMaterial
        color="#aaaaaa"
        size={0.1}
        transparent
        opacity={0.5}
      />
    </points>
  );
}