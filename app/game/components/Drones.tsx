'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../store';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { updateDronePosition } from '../utils/dronePatterns';
import { DroneType } from '../types';

export function Drones() {
  const { scene } = useThree();
  const { activeDrones, spawnDrone, shootDrone } = useGameStore();
  const droneRefs = useRef<{ [key: string]: THREE.Group }>({});
  const basePositions = useRef<{ [key: string]: THREE.Vector3 }>({});
  const elapsedTime = useRef(0);
  const spawnTimer = useRef(0);

  // Initialize and spawn first drone
  useEffect(() => {
    spawnNewDrone();
  }, [spawnDrone]);

  const destroyDrone = (droneId: string) => {
    console.log('Destroying drone:', droneId);
    const droneRef = droneRefs.current[droneId];
    if (droneRef && droneRef.parent) {
      // Create explosion at drone's position
      createExplosion(droneRef.position);
      
      // Remove drone
      droneRef.parent.remove(droneRef);
      delete droneRefs.current[droneId];
      delete basePositions.current[droneId];
      
      // Update game state
      shootDrone(droneId);
    }
  };

  const createExplosion = (position: THREE.Vector3) => {
    // Create particles
    const particleCount = 30;
    const particles = new THREE.Group();
    particles.position.copy(position);

    // Create particle material
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 1
    });

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.3),
        particleMaterial.clone()
      );

      // Random position within sphere
      const radius = 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      particle.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      // Random velocity
      particle.userData.velocity = particle.position.clone().normalize().multiplyScalar(0.2);
      particles.add(particle);
    }

    // Add explosion light
    const light = new THREE.PointLight(0xff4400, 5, 10);
    particles.add(light);

    // Add to scene
    scene.add(particles);

    // Animate explosion
    let frame = 0;
    const animate = () => {
      frame++;
      if (frame > 30) {
        scene.remove(particles);
        particles.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
        return;
      }

      particles.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          // Move particle outward
          child.position.add(child.userData.velocity);
          // Fade out
          child.material.opacity = 1 - (frame / 30);
        } else if (child instanceof THREE.PointLight) {
          // Fade light
          child.intensity = 5 * (1 - (frame / 30));
        }
      });

      requestAnimationFrame(animate);
    };
    animate();
  };

  const spawnNewDrone = () => {
    const droneTypes = ['scout', 'combat', 'stealth'] as const;
    const patterns = ['circular', 'linear', 'erratic'] as const;
    
    const type = droneTypes[Math.floor(Math.random() * 3)];
    const pattern = patterns[Math.floor(Math.random() * 3)];
    
    const drone: DroneType = {
      id: `drone-${Date.now()}`,
      type: type,
      speed: type === 'stealth' ? 3 : type === 'scout' ? 2 : 1.5,
      health: type === 'combat' ? 150 : type === 'scout' ? 100 : 80,
      value: type === 'stealth' ? 200 : type === 'combat' ? 150 : 100,
      pattern: pattern,
      size: type === 'combat' ? 1.2 : type === 'scout' ? 1 : 0.8,
      model: type
    };

    const baseHeight = 40;
    const heightVariation = type === 'stealth' ? 40 : type === 'scout' ? 30 : 20;
    
    basePositions.current[drone.id] = new THREE.Vector3(
      Math.random() * 100 - 50,
      baseHeight + Math.random() * heightVariation,
      Math.random() * 100 - 50
    );

    spawnDrone(drone);
  };

  // Update drone positions and spawn new ones
  useFrame((state, delta) => {
    elapsedTime.current += delta;
    spawnTimer.current += delta;

    // Spawn new drone if we have less than max drones
    const maxDrones = 12; // Increased from 6 to 12
    const spawnInterval = 1.5; // Reduced from 2 to 1.5 seconds

    if (activeDrones.length < maxDrones && spawnTimer.current > spawnInterval) {
      spawnTimer.current = 0;
      spawnNewDrone();
    }

    // Update existing drones
    activeDrones.forEach(drone => {
      if (!droneRefs.current[drone.id]) return;

      const basePosition = basePositions.current[drone.id];
      if (!basePosition) return;

      const newPosition = updateDronePosition(
        drone.pattern,
        elapsedTime.current,
        basePosition,
        drone.speed
      );

      // Increase flight area
      newPosition.y = Math.max(newPosition.y, 30);
      droneRefs.current[drone.id].position.copy(newPosition);
    });
  });

  return (
    <group>
      {activeDrones.map(drone => (
        <group
          key={drone.id}
          ref={ref => {
            if (ref) {
              droneRefs.current[drone.id] = ref;
              const basePosition = basePositions.current[drone.id];
              if (basePosition) {
                ref.position.copy(basePosition);
              }
            }
          }}
          userData={{ 
            isDrone: true,
            droneId: drone.id,
            onHit: () => destroyDrone(drone.id)
          }}
        >
          {/* Drone body */}
          <mesh castShadow>
            <boxGeometry args={[drone.size * 2, drone.size * 0.6, drone.size * 2]} />
            <meshStandardMaterial 
              color={getDroneColor(drone.type)}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>

          {/* Rotors */}
          {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, z], i) => (
            <group
              key={i}
              position={[
                x * (drone.size * 1.2),
                drone.size * 0.4,
                z * (drone.size * 1.2)
              ]}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.4, 0.4, 0.1, 6]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
              <mesh
                castShadow
                rotation={[0, elapsedTime.current * 20, 0]}
              >
                <boxGeometry args={[1.6, 0.1, 0.2]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
            </group>
          ))}

          {/* Drone light */}
          <pointLight
            color={getDroneLightColor(drone.type)}
            intensity={0.5}
            distance={8}
          />
        </group>
      ))}
    </group>
  );
}

function getDroneColor(type: string): string {
  switch (type) {
    case 'scout': return '#4a90e2';
    case 'combat': return '#e24a4a';
    case 'stealth': return '#2c3e50';
    default: return '#666666';
  }
}

function getDroneLightColor(type: string): string {
  switch (type) {
    case 'scout': return '#00ff00';
    case 'combat': return '#ff0000';
    case 'stealth': return '#0000ff';
    default: return '#ffffff';
  }
}