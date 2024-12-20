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

  // Shared geometries
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(3, 32, 32), []);

  // Initialize items and load texture
  useEffect(() => {
    // Load texture with optimized settings
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/pump.fun.png', (texture) => {
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      textureRef.current = texture;
      
      // Create items once texture is loaded
      const newItems: FloatingItem[] = [];
      const itemCount = 15;
      
      for (let i = 0; i < itemCount; i++) {
        newItems.push({
          id: `item-${i}`,
          position: new THREE.Vector3(
            Math.random() * 100 - 50,
            20 + Math.random() * 20,
            Math.random() * 100 - 50
          ),
          rotationSpeed: 0.5 + Math.random() * 0.5,
          floatSpeed: 1.0 + Math.random() * 0.5,
          floatHeight: 1.0 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2
        });
      }
      
      setItems(newItems);
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
          intensity = pow(0.8 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, min(intensity, 0.8));
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
      sphereGeometry.dispose();
    };
  }, [sphereGeometry]);

  // Optimize animation updates
  useFrame((state, delta) => {
    const camera = state.camera;
    
    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.viewVector.value.subVectors(
        camera.position,
        new THREE.Vector3(0, 0, 0)
      );
    }

    setItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        phase: (item.phase + delta * item.floatSpeed) % (Math.PI * 2)
      }))
    );
  });

  if (!textureRef.current || !glowMaterialRef.current) return null;

  const spriteMaterial = useMemo(() => (
    <spriteMaterial
      map={textureRef.current}
      transparent={true}
      opacity={0.9}
      depthWrite={false}
      sizeAttenuation={true}
    />
  ), [textureRef.current]);

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
          <sprite scale={[5, 5, 5]}>
            {spriteMaterial}
          </sprite>

          <mesh geometry={sphereGeometry}>
            <primitive object={glowMaterial} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
} 