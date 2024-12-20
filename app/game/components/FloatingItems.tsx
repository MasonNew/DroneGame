'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';

interface FloatingItem {
  id: string;
  position: THREE.Vector3;
  rotationSpeed: number;
  floatSpeed: number;
  floatHeight: number;
  phase: number;
}

export function FloatingItems() {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const textureRef = useRef<THREE.Texture | null>(null);
  const glowMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const itemsRef = useRef<FloatingItem[]>([]);

  // Check if we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Create items function
  const createItems = useCallback((count: number) => {
    const newItems: FloatingItem[] = [];
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: `item-${i}`,
        position: new THREE.Vector3(
          Math.random() * 80 - 40,
          15 + Math.random() * 15,
          Math.random() * 80 - 40
        ),
        rotationSpeed: 0.3 + Math.random() * 0.3,
        floatSpeed: 0.8 + Math.random() * 0.3,
        floatHeight: 0.8 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
    return newItems;
  }, []);

  // Create glow material
  const createGlowMaterial = useCallback(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x00ffff) },
        viewVector: { value: new THREE.Vector3() }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.6 - dot(vNormal, vNormel), 1.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, min(intensity, 0.6));
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
  }, []);

  // Initialize items and create texture
  useEffect(() => {
    if (!isClient) return;

    const newItems = createItems(8);
    setItems(newItems);
    itemsRef.current = newItems;

    const glowMaterial = createGlowMaterial();
    glowMaterialRef.current = glowMaterial;

    // Create a simple colored texture
    const texture = new THREE.DataTexture(
      new Uint8Array([0, 255, 255, 255]), // RGBA for cyan
      1, 1, // width, height
      THREE.RGBAFormat
    );
    texture.needsUpdate = true;
    textureRef.current = texture;

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
      if (glowMaterialRef.current) {
        glowMaterialRef.current.dispose();
      }
    };
  }, [isClient, createItems, createGlowMaterial]);

  // Update function for animation
  const updateItems = useCallback((delta: number) => {
    return itemsRef.current.map(item => ({
      ...item,
      phase: (item.phase + delta * item.floatSpeed) % (Math.PI * 2)
    }));
  }, []);

  // Animate items with optimized performance
  useFrame((state, delta) => {
    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.viewVector.value.copy(state.camera.position);
    }

    itemsRef.current = updateItems(delta);

    if (Math.random() < 0.1) {
      setItems([...itemsRef.current]);
    }
  });

  if (!isClient || !textureRef.current || !glowMaterialRef.current) return null;

  return (
    <group>
      {items.map(item => (
        <group 
          key={item.id}
          position={[
            item.position.x,
            item.position.y + Math.sin(item.phase) * item.floatHeight,
            item.position.z
          ]}
          rotation={[0, item.phase * item.rotationSpeed, 0]}
        >
          <mesh>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
} 