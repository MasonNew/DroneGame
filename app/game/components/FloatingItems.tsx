'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, useMemo } from 'react';
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
  const textureRef = useRef<THREE.Texture | null>(null);
  const glowMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const itemsRef = useRef<FloatingItem[]>([]);

  // Initialize items and load texture
  useEffect(() => {
    // Load texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/pump.fun.png', (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      textureRef.current = texture;
      
      // Create items once texture is loaded
      const newItems: FloatingItem[] = [];
      const itemCount = 8; // Reduced count for better performance
      
      for (let i = 0; i < itemCount; i++) {
        newItems.push({
          id: `item-${i}`,
          position: new THREE.Vector3(
            Math.random() * 80 - 40,  // Reduced range
            15 + Math.random() * 15,  // Reduced height
            Math.random() * 80 - 40   // Reduced range
          ),
          rotationSpeed: 0.3 + Math.random() * 0.3,  // Reduced speed
          floatSpeed: 0.8 + Math.random() * 0.3,     // Reduced speed
          floatHeight: 0.8 + Math.random() * 0.3,    // Reduced range
          phase: Math.random() * Math.PI * 2
        });
      }
      
      setItems(newItems);
      itemsRef.current = newItems;
    });

    // Create optimized glow shader material
    const glowMaterial = new THREE.ShaderMaterial({
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

    glowMaterialRef.current = glowMaterial;

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
      if (glowMaterialRef.current) {
        glowMaterialRef.current.dispose();
      }
    };
  }, []);

  // Animate items with optimized performance
  useFrame((state, delta) => {
    const camera = state.camera;
    
    // Update glow effect view vector
    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.viewVector.value.copy(camera.position);
    }

    // Update items directly without state changes for better performance
    itemsRef.current = itemsRef.current.map(item => ({
      ...item,
      phase: (item.phase + delta * item.floatSpeed) % (Math.PI * 2)
    }));

    // Only update state every few frames
    if (Math.random() < 0.1) { // 10% chance to update per frame
      setItems([...itemsRef.current]);
    }
  });

  if (!textureRef.current || !glowMaterialRef.current) return null;

  const glowMaterial = glowMaterialRef.current as THREE.Material;

  // Use instancing for better performance
  const instancePositions = useMemo(() => {
    const array = new Float32Array(items.length * 3);
    items.forEach((item, i) => {
      const i3 = i * 3;
      array[i3] = item.position.x;
      array[i3 + 1] = item.position.y;
      array[i3 + 2] = item.position.z;
    });
    return array;
  }, [items.length]);

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
          <sprite scale={[4, 4, 4]}>
            <spriteMaterial
              map={textureRef.current}
              transparent={true}
              opacity={0.8}
              depthWrite={false}
              sizeAttenuation={true}
            />
          </sprite>

          <mesh>
            <sphereGeometry args={[2.5, 16, 16]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
} 