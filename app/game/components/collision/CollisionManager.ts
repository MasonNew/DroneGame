import * as THREE from 'three';
import { DroneHitbox } from './DroneHitbox';
import { CollisionDetector } from './CollisionDetector';
import { ColliderConfig, CollisionEvent } from './types';

export class CollisionManager {
  private hitboxes: Map<string, DroneHitbox> = new Map();
  private collisionEvents: CollisionEvent[] = [];
  private debugMode = false;

  constructor(private scene: THREE.Scene) {}

  registerDrone(
    droneId: string,
    config: ColliderConfig,
    onHit: (event: CollisionEvent) => void
  ) {
    // Remove existing hitbox if present
    this.unregisterDrone(droneId);

    const hitbox = new DroneHitbox(this.scene, {
      ...config,
      debug: this.debugMode,
      onHit: () => {
        const event = this.collisionEvents.find(e => e.droneId === droneId);
        if (event) {
          onHit(event);
          this.collisionEvents = this.collisionEvents.filter(e => e.droneId !== droneId);
          this.unregisterDrone(droneId);
        }
      }
    });
    
    this.hitboxes.set(droneId, hitbox);
    return hitbox;
  }

  checkBulletCollision(
    bulletPosition: THREE.Vector3,
    bulletRadius: number,
    bulletVelocity: THREE.Vector3,
    damage: number
  ): string | null {
    // Create raycaster for the bullet path
    const raycaster = new THREE.Raycaster(
      bulletPosition.clone(),
      bulletVelocity.clone().normalize(),
      0,
      200 // Increased range for better detection
    );

    // Check all drone hitboxes
    Array.from(this.hitboxes.entries()).forEach(([droneId, hitbox]) => {
      if (hitbox.checkCollision(bulletPosition, bulletRadius)) {
        // Create collision event
        this.collisionEvents.push({
          droneId,
          hitPoint: bulletPosition.clone(),
          bulletVelocity: bulletVelocity.clone(),
          damage
        });
        return droneId;
      }
    });
    return null;
  }

  unregisterDrone(droneId: string) {
    const hitbox = this.hitboxes.get(droneId);
    if (hitbox) {
      hitbox.destroy();
      this.hitboxes.delete(droneId);
    }
  }

  cleanup() {
    this.hitboxes.forEach(hitbox => hitbox.destroy());
    this.hitboxes.clear();
    this.collisionEvents = [];
  }
}