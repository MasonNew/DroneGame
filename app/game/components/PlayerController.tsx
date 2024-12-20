'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

export function PlayerController() {
  const { camera } = useThree();
  const moveSpeed = 0.3;
  const velocity = useRef(new THREE.Vector3());
  const moveDirection = useRef(new THREE.Vector3());
  const isPointerLocked = useRef(false);

  useEffect(() => {
    // Initialize camera position
    camera.position.set(0, 2, 5);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;

      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;
      const sensitivity = 0.002;

      // Rotate camera based on mouse movement
      camera.rotation.y -= movementX * sensitivity;
      camera.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, camera.rotation.x - movementY * sensitivity)
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveDirection.current.z = -1;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveDirection.current.z = 1;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveDirection.current.x = -1;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveDirection.current.x = 1;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          if (moveDirection.current.z < 0) moveDirection.current.z = 0;
          break;
        case 'KeyS':
        case 'ArrowDown':
          if (moveDirection.current.z > 0) moveDirection.current.z = 0;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          if (moveDirection.current.x < 0) moveDirection.current.x = 0;
          break;
        case 'KeyD':
        case 'ArrowRight':
          if (moveDirection.current.x > 0) moveDirection.current.x = 0;
          break;
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === document.body;
    };

    const handleCanvasClick = () => {
      if (!isPointerLocked.current) {
        document.body.requestPointerLock();
      }
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('click', handleCanvasClick);
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    };
  }, [camera]);

  useFrame(() => {
    if (moveDirection.current.length() === 0) return;

    // Get camera's forward and right vectors (ignore Y component for ground movement)
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    // Calculate and apply movement
    velocity.current.set(0, 0, 0);
    velocity.current.addScaledVector(forward, -moveDirection.current.z * moveSpeed);
    velocity.current.addScaledVector(right, moveDirection.current.x * moveSpeed);
    camera.position.add(velocity.current);
  });

  return null;
} 