export interface CollisionEvent {
  droneId: string;
  hitPoint: THREE.Vector3;
  bulletVelocity: THREE.Vector3;
  damage: number;
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