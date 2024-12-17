'use client';

import * as THREE from 'three';

export class DroneCollider {
  private hitbox: THREE.Mesh;
  private visualHitbox: THREE.Mesh | null = null;
  private droneId: string;
  private onHit: (droneId: string) => void;
  private isDestroyed = false;

  constructor(
    scene: THREE.Scene,
    droneId: string,
    size: number,
    onHit: (droneId: string) => void,
    debug = false
  ) {
    // Create a larger spherical hitbox for better hit detection
    const hitboxSize = size * 2; // Double the size for easier hitting
    const geometry = new THREE.SphereGeometry(hitboxSize);
    const material = new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0
    });

    this.hitbox = new THREE.Mesh(geometry, material);
    this.hitbox.userData.isHitbox = true;
    this.hitbox.userData.droneId = droneId;
    scene.add(this.hitbox);

    // Add visible hitbox for debugging if enabled
    if (debug) {
      const visualGeometry = new THREE.SphereGeometry(hitboxSize);
      const visualMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.2
      });
      this.visualHitbox = new THREE.Mesh(visualGeometry, visualMaterial);
      scene.add(this.visualHitbox);
    }

    this.droneId = droneId;
    this.onHit = onHit;
  }

  updatePosition(position: THREE.Vector3) {
    if (this.isDestroyed) return;
    
    this.hitbox.position.copy(position);
    if (this.visualHitbox) {
      this.visualHitbox.position.copy(position);
    }
  }

  checkCollision(bulletPosition: THREE.Vector3, bulletRadius: number = 0.1): boolean {
    if (this.isDestroyed) return false;

    // Create a sphere representing the bullet
    const bulletSphere = new THREE.Sphere(bulletPosition, bulletRadius);
    
    // Create a sphere representing the hitbox
    const hitboxSphere = new THREE.Sphere(
      this.hitbox.position,
      (this.hitbox.geometry as THREE.SphereGeometry).parameters.radius
    );

    // Check for intersection between the spheres
    if (bulletSphere.intersectsSphere(hitboxSphere)) {
      this.handleHit();
      return true;
    }

    return false;
  }

  private handleHit() {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.onHit(this.droneId);
    
    // Create explosion effect
    const explosionGeometry = new THREE.SphereGeometry(0.5);
    const explosionMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.8
    });
    
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.copy(this.hitbox.position);
    this.hitbox.parent?.add(explosion);

    // Animate explosion
    let scale = 1;
    const animate = () => {
      if (scale > 2) {
        explosion.removeFromParent();
        explosionGeometry.dispose();
        explosionMaterial.dispose();
        return;
      }
      
      scale += 0.1;
      explosion.scale.set(scale, scale, scale);
      explosion.material.opacity = 1 - (scale - 1) / 1;
      requestAnimationFrame(animate);
    };
    
    animate();
    this.destroy();
  }

  destroy() {
    this.isDestroyed = true;
    this.hitbox.removeFromParent();
    this.hitbox.geometry.dispose();
    (this.hitbox.material as THREE.Material).dispose();
    
    if (this.visualHitbox) {
      this.visualHitbox.removeFromParent();
      this.visualHitbox.geometry.dispose();
      (this.visualHitbox.material as THREE.Material).dispose();
    }
  }
}