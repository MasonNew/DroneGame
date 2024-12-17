'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../store';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { updateDronePosition } from '../utils/dronePatterns';
import { CollisionManager } from './collision/CollisionManager';
import { DroneType } from '../types';

export function Drones() {
  const { scene } = useThree();
  const { activeDrones, spawnDrone, shootDrone, collisionManager, setCollisionManager } = useGameStore();
  const droneRefs = useRef<{ [key: string]: THREE.Group }>({});
  const basePositions = useRef<{ [key: string]: THREE.Vector3 }>({});
  const elapsedTime = useRef(0);
  const spawnTimer = useRef(0);
  const isDisposed = useRef(false);

  // Initialize collision manager
  useEffect(() => {
    if (!collisionManager) {
      setCollisionManager(scene);
    }

    // Initial drone spawn with delay to ensure scene is ready
    setTimeout(() => {
      if (!isDisposed.current) {
        spawnInitialDrones();
      }
    }, 1000);

    return () => {
      isDisposed.current = true;
      // Cleanup drones
      Object.values(droneRefs.current).forEach(drone => {
        if (drone && drone.parent) {
          drone.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (child.material instanceof THREE.Material) {
                child.material.dispose();
              } else if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              }
            }
          });
          drone.parent.remove(drone);
        }
      });
      droneRefs.current = {};
      basePositions.current = {};
      
      // Cleanup collision manager
      if (collisionManager) {
        collisionManager.cleanup();
      }
    };
  }, [scene, setCollisionManager, collisionManager]);

  const spawnInitialDrones = () => {
    try {
      const droneTypes = ['scout', 'combat', 'stealth'] as const;
      const patterns = ['circular', 'linear', 'erratic'] as const;

      // Spawn drones gradually to prevent frame drops
      const spawnDroneWithDelay = (index: number) => {
        if (index >= 6 || isDisposed.current) return;

        const type = droneTypes[index % 3];
        const pattern = patterns[index % 3];
        const drone: DroneType = {
          id: `drone-${Date.now()}-${index}`,
          type: type,
          speed: type === 'stealth' ? 3 : type === 'scout' ? 2 : 1.5,
          health: type === 'combat' ? 150 : type === 'scout' ? 100 : 80,
          value: type === 'stealth' ? 200 : type === 'combat' ? 150 : 100,
          pattern: pattern,
          size: type === 'combat' ? 1.2 : type === 'scout' ? 1 : 0.8,
          model: type
        };

        spawnDrone(drone);
        basePositions.current[drone.id] = new THREE.Vector3(
          Math.random() * 80 - 40,
          10 + Math.random() * 10,
          Math.random() * 80 - 40
        );

        // Spawn next drone after delay
        setTimeout(() => spawnDroneWithDelay(index + 1), 500);
      };

      spawnDroneWithDelay(0);
    } catch (error) {
      console.error('Error spawning drones:', error);
    }
  };

  // Update drone positions with performance optimization
  useFrame((state, delta) => {
    if (isDisposed.current) return;

    try {
      elapsedTime.current += delta;
      
      // Update drones in batches to prevent frame drops
      activeDrones.forEach((drone, index) => {
        if (index % 2 === state.clock.elapsedTime % 2) { // Update half the drones each frame
          const droneRef = droneRefs.current[drone.id];
          const basePosition = basePositions.current[drone.id];
          
          if (droneRef && basePosition) {
            updateDronePosition(droneRef, basePosition, drone, elapsedTime.current);
          }
        }
      });
    } catch (error) {
      console.error('Error updating drones:', error);
    }
  });

  return null;
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