'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const NORMAL_SPEED = 8;
const SPRINT_SPEED = 16;
const JUMP_FORCE = 5;
const GRAVITY = 20;
const HEAD_BOB_SPEED = 12;
const HEAD_BOB_AMOUNT = 0.15;
const PLAYER_RADIUS = 0.5; // Reduced from 1 to 0.5 for tighter collision
const COLLISION_MARGIN = 0.2; // Added margin for smoother movement

export function Player() {
  const { camera, scene } = useThree();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jumping: false
  });

  const playerState = useRef({
    velocity: new THREE.Vector3(),
    headBobPhase: 0,
    isGrounded: true,
    height: 2,
    eyeLevel: 2,
    crouchHeight: 1,
    stepOffset: 0.5
  });

  // Set initial spawn position in the city area
  useEffect(() => {
    camera.position.set(-90, playerState.current.eyeLevel, -90);
  }, [camera]);

  const checkBuildingCollision = useCallback((newPosition: THREE.Vector3) => {
    // Create a ray for collision detection
    const raycaster = new THREE.Raycaster();
    const directions = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(1, 0, 1).normalize(),
      new THREE.Vector3(-1, 0, 1).normalize(),
      new THREE.Vector3(1, 0, -1).normalize(),
      new THREE.Vector3(-1, 0, -1).normalize(),
    ];

    // Check collisions in all directions
    for (const direction of directions) {
      raycaster.set(newPosition, direction);
      const intersects = raycaster.intersectObjects(
        scene.children,
        true
      ).filter(intersect => 
        intersect.object.name === 'building-collider' && 
        intersect.distance < PLAYER_RADIUS + COLLISION_MARGIN
      );

      if (intersects.length > 0) {
        // Calculate slide direction along the wall
        const normal = intersects[0].face?.normal || new THREE.Vector3();
        const dot = direction.dot(normal);
        if (Math.abs(dot) > 0.5) { // If not a glancing collision
          return true;
        }
      }
    }

    return false; // No collision
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyD': moveState.current.right = true; break;
        case 'ShiftLeft': moveState.current.sprint = true; break;
        case 'Space': 
          if (playerState.current.isGrounded) {
            playerState.current.velocity.y = JUMP_FORCE;
            playerState.current.isGrounded = false;
            moveState.current.jumping = true;
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyD': moveState.current.right = false; break;
        case 'ShiftLeft': moveState.current.sprint = false; break;
      }
    };

    const updatePosition = (timestamp: number) => {
      const deltaTime = 1 / 60; // Fixed time step
      const speed = moveState.current.sprint ? SPRINT_SPEED : NORMAL_SPEED;
      const moveVector = new THREE.Vector3();
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0; // Keep movement horizontal
      cameraDirection.normalize();

      // Calculate movement direction
      if (moveState.current.forward) moveVector.add(cameraDirection);
      if (moveState.current.backward) moveVector.sub(cameraDirection);
      if (moveState.current.left || moveState.current.right) {
        const rightVector = new THREE.Vector3();
        rightVector.crossVectors(cameraDirection, camera.up).normalize();
        if (moveState.current.left) moveVector.sub(rightVector);
        if (moveState.current.right) moveVector.add(rightVector);
      }

      // Normalize and apply movement with collision detection
      if (moveVector.length() > 0) {
        moveVector.normalize();
        moveVector.multiplyScalar(speed * deltaTime);
        
        // Try main movement direction
        let newPosition = camera.position.clone().add(moveVector);
        let canMove = !checkBuildingCollision(newPosition);

        // If can't move, try sliding along walls
        if (!canMove) {
          // Try X movement only
          newPosition = camera.position.clone();
          newPosition.x += moveVector.x;
          if (!checkBuildingCollision(newPosition)) {
            camera.position.copy(newPosition);
          }

          // Try Z movement only
          newPosition = camera.position.clone();
          newPosition.z += moveVector.z;
          if (!checkBuildingCollision(newPosition)) {
            camera.position.copy(newPosition);
          }
        } else {
          camera.position.copy(newPosition);
        }

        // Apply head bobbing when moving
        if (playerState.current.isGrounded) {
          const bobAmount = moveState.current.sprint ? HEAD_BOB_AMOUNT * 1.5 : HEAD_BOB_AMOUNT;
          playerState.current.headBobPhase += HEAD_BOB_SPEED * deltaTime;
          const bobOffset = Math.sin(playerState.current.headBobPhase) * bobAmount;
          camera.position.y = playerState.current.eyeLevel + bobOffset;
        }
      } else {
        // Smoothly return to eye level when not moving
        const currentHeight = camera.position.y;
        const targetHeight = playerState.current.eyeLevel;
        camera.position.y += (targetHeight - currentHeight) * 5 * deltaTime;
      }

      // Apply gravity and ground check
      if (!playerState.current.isGrounded) {
        playerState.current.velocity.y -= GRAVITY * deltaTime;
        const newPosition = camera.position.clone();
        newPosition.y += playerState.current.velocity.y * deltaTime;
        
        // Check for collisions before applying gravity
        if (!checkBuildingCollision(newPosition)) {
          camera.position.copy(newPosition);
        } else {
          playerState.current.velocity.y = 0;
        }

        // Ground check
        if (camera.position.y <= playerState.current.eyeLevel) {
          camera.position.y = playerState.current.eyeLevel;
          playerState.current.velocity.y = 0;
          playerState.current.isGrounded = true;
          moveState.current.jumping = false;
        }
      }

      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const animationId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [checkBuildingCollision]);

  return null;
}