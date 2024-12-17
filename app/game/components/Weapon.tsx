'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';
import { BulletSystem } from './weapon/BulletSystem';
import { CollisionManager } from './collision/CollisionManager';

export function Weapon() {
  const { camera, scene } = useThree();
  const { 
    activeWeapon, 
    weather, 
    shootDrone, 
    updateScore, 
    ammo, 
    isReloading, 
    startReload, 
    finishReload,
    useAmmo 
  } = useGameStore();
  
  const bulletSystem = useRef<BulletSystem>();
  const collisionManager = useRef<CollisionManager>();
  const isShooting = useRef(false);
  const lastShootTime = useRef(0);
  const muzzleFlash = useRef<THREE.PointLight>();
  const isDisposed = useRef(false);

  // Initialize systems with error handling
  useEffect(() => {
    try {
      collisionManager.current = new CollisionManager(scene);
      bulletSystem.current = new BulletSystem(scene, collisionManager.current);

      // Create reusable muzzle flash
      const flash = new THREE.PointLight('#ffaa00', 3, 8);
      flash.visible = false;
      scene.add(flash);
      muzzleFlash.current = flash;

      return () => {
        isDisposed.current = true;
        if (bulletSystem.current) {
          bulletSystem.current.cleanup();
        }
        if (collisionManager.current) {
          collisionManager.current.cleanup();
        }
        if (muzzleFlash.current && muzzleFlash.current.parent) {
          muzzleFlash.current.parent.remove(muzzleFlash.current);
          muzzleFlash.current.dispose();
        }
      };
    } catch (error) {
      console.error('Error initializing weapon systems:', error);
    }
  }, [scene]);

  // Handle shooting with performance optimization
  useEffect(() => {
    const handleMouseDown = () => {
      if (!isReloading && ammo > 0) {
        isShooting.current = true;
      } else if (ammo === 0) {
        startReload();
      }
    };

    const handleMouseUp = () => {
      isShooting.current = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isReloading, ammo, startReload]);

  // Update weapon state and handle shooting
  useFrame((state, delta) => {
    if (isDisposed.current) return;

    try {
      // Update bullet system
      if (bulletSystem.current) {
        bulletSystem.current.update(delta);
      }

      // Handle shooting
      if (isShooting.current && !isReloading && ammo > 0) {
        const currentTime = state.clock.getElapsedTime();
        const timeSinceLastShot = currentTime - lastShootTime.current;
        const fireRate = 0.2; // 5 shots per second

        if (timeSinceLastShot >= fireRate) {
          lastShootTime.current = currentTime;

          // Calculate spread based on weapon accuracy and weather
          const spread = (1 - activeWeapon.accuracy) * (1 + weather.windSpeed * 0.1);
          const spreadVector = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
          );

          // Get camera direction and apply spread
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          direction.add(spreadVector).normalize();

          // Create bullet
          if (bulletSystem.current) {
            bulletSystem.current.createBullet(
              camera.position.clone(),
              direction,
              activeWeapon.damage,
              weather
            );
          }

          // Show muzzle flash
          if (muzzleFlash.current) {
            muzzleFlash.current.position.copy(camera.position).add(direction.multiplyScalar(2));
            muzzleFlash.current.visible = true;
            setTimeout(() => {
              if (muzzleFlash.current) {
                muzzleFlash.current.visible = false;
              }
            }, 50);
          }

          useAmmo();
        }
      }
    } catch (error) {
      console.error('Error in weapon update:', error);
    }
  });

  return null;
}