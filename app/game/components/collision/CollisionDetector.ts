import * as THREE from 'three';
import { HitResult } from './types';

export class CollisionDetector {
  private static raycaster = new THREE.Raycaster();
  private static tempMatrix = new THREE.Matrix4();
  private static tempVector = new THREE.Vector3();

  static checkSphereCollision(
    sphere1Pos: THREE.Vector3,
    sphere1Radius: number,
    sphere2Pos: THREE.Vector3,
    sphere2Radius: number
  ): HitResult {
    const distance = sphere1Pos.distanceTo(sphere2Pos);
    const combinedRadius = sphere1Radius + sphere2Radius;

    if (distance <= combinedRadius) {
      const normal = sphere2Pos.clone().sub(sphere1Pos).normalize();
      const hitPoint = sphere1Pos.clone().add(normal.multiplyScalar(sphere1Radius));
      
      return {
        hit: true,
        point: hitPoint,
        normal,
        distance
      };
    }

    return { hit: false };
  }

  static checkRayCollision(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    target: THREE.Object3D,
    maxDistance: number = Infinity
  ): HitResult {
    this.raycaster.set(origin, direction.normalize());
    this.raycaster.far = maxDistance;

    const intersects = this.raycaster.intersectObject(target, true);
    
    if (intersects.length > 0) {
      const hit = intersects[0];
      return {
        hit: true,
        point: hit.point,
        normal: hit.face?.normal,
        distance: hit.distance
      };
    }

    return { hit: false };
  }
}