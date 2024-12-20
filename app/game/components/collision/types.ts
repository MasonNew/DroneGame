import * as THREE from 'three';

export interface CollisionEvent {
  type: 'bullet-drone';
  droneId: string;
  position: THREE.Vector3;
}

export interface ColliderConfig {
  radius: number;
  offset: [number, number, number];
  type: 'sphere' | 'box';
}

export interface HitResult {
  hit: boolean;
  point?: THREE.Vector3;
  normal?: THREE.Vector3;
  distance?: number;
}