'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';
import { BulletSystem } from './weapon/BulletSystem';

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
  const isShooting = useRef(false);
  const lastShootTime = useRef(0);
  const muzzleFlash = useRef<THREE.PointLight>();

  // Initialize systems
  useEffect(() => {
    bulletSystem.current = new BulletSystem(scene);

    // Create reusable muzzle flash
    const flash = new THREE.PointLight('#ffaa00', 3, 8);
    flash.visible = false;
    scene.add(flash);
    muzzleFlash.current = flash;

    return () => {
      bulletSystem.current?.cleanup();
      scene.remove(flash);
    };
  }, [scene]);

  // Update bullet system every frame
  useFrame((state, delta) => {
    if (bulletSystem.current) {
      bulletSystem.current.update(delta);
    }
  });

  const shoot = () => {
    if (isShooting.current || ammo <= 0 || isReloading || !bulletSystem.current) {
      if (ammo <= 0) reload();
      return;
    }

    const now = Date.now();
    if (now - lastShootTime.current < 500) return;

    lastShootTime.current = now;
    isShooting.current = true;

    // Decrease ammo
    useAmmo();

    // Show muzzle flash
    if (muzzleFlash.current) {
      muzzleFlash.current.position.copy(camera.position).add(new THREE.Vector3(0, -0.1, -0.5));
      muzzleFlash.current.visible = true;
      setTimeout(() => {
        if (muzzleFlash.current) muzzleFlash.current.visible = false;
      }, 50);
    }

    // Apply screen shake
    const originalPosition = camera.position.clone();
    camera.position.y += Math.random() * 0.03 - 0.015;
    camera.position.x += Math.random() * 0.03 - 0.015;

    // Get direction from camera
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // Create bullet
    bulletSystem.current.createBullet(
      camera.position.clone().add(direction.multiplyScalar(2)),
      direction.normalize(),
      300,
      weather,
      activeWeapon,
      (hitPoint: THREE.Vector3, droneId: string) => {
        console.log('Bullet hit drone:', droneId);
        shootDrone(droneId);
        updateScore(Math.floor(hitPoint.distanceTo(camera.position)));
      }
    );

    // Reset camera position
    setTimeout(() => {
      camera.position.copy(originalPosition);
      isShooting.current = false;
    }, 50);
  };

  const reload = () => {
    if (isReloading || ammo === activeWeapon.ammoCapacity) return;
    startReload();
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) shoot();
    };
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' && !isReloading && ammo < activeWeapon.ammoCapacity) {
        reload();
      }
    };
    
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [camera, scene, weather, activeWeapon, ammo, isReloading]);

  return null;
}