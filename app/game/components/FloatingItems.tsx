'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
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
      const itemCount = 15; // Increased number of items
      
      for (let i = 0; i < itemCount; i++) {
        newItems.push({
          id: `item-${i}`,
          position: new THREE.Vector3(
            Math.random() * 100 - 50,  // X: -50 to 50
            20 + Math.random() * 20,   // Y: 20 to 40 (lower for better visibility)
            Math.random() * 100 - 50   // Z: -50 to 50
          ),
          rotationSpeed: 0.5 + Math.random() * 0.5,  // Faster rotation
          floatSpeed: 1.0 + Math.random() * 0.5,     // Faster floating
          floatHeight: 1.0 + Math.random() * 0.5,    // Higher float range
          phase: Math.random() * Math.PI * 2
        });
      }
      
      setItems(newItems);
    });

    // Create glow shader material with stronger glow
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
          intensity = pow(0.8 - dot(vNormal, vNormel), 2.0);  // Increased base intensity
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, min(intensity, 0.8));  // Adjusted opacity
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false  // Added to prevent glow from being occluded
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

  // Animate items
  useFrame((state, delta) => {
    const camera = state.camera;
    
    // Update glow effect view vector
    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.viewVector.value = new THREE.Vector3().subVectors(
        camera.position,
        new THREE.Vector3(0, 0, 0)
      );
    }

    // Update items
    setItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        phase: (item.phase + delta * item.floatSpeed) % (Math.PI * 2)
      }))
    );
  });

  if (!textureRef.current || !glowMaterialRef.current) return null;

  const glowMaterial = glowMaterialRef.current as THREE.Material;

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
          {/* Item sprite - made larger and always facing camera */}
          <sprite scale={[5, 5, 5]}>
            <spriteMaterial
              map={textureRef.current}
              transparent={true}
              opacity={0.9}
              depthWrite={false}
              sizeAttenuation={true}
            />
          </sprite>

          {/* Glow effect - made larger */}
          <mesh>
            <sphereGeometry args={[3, 32, 32]} />
            <primitive object={glowMaterial} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
} 