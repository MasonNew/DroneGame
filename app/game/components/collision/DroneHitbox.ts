'use client';

import * as THREE from 'three';

export class DroneHitbox {
  private hitbox: THREE.Mesh;
  private collisionSphere: THREE.Sphere;
  private debugHelper?: THREE.Mesh;
  private active = true;

  constructor(
    private scene: THREE.Scene,
    private config: {
      radius: number;
      onHit: () => void;
      debug?: boolean;
    }
  ) {
    // Create larger hitbox for better hit detection
    const hitboxRadius = this.config.radius * 2; // Double size for easier hitting
    const geometry = new THREE.SphereGeometry(hitboxRadius);
    const material = new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0
    });

    this.hitbox = new THREE.Mesh(geometry, material);
    this.scene.add(this.hitbox);

    // Initialize collision sphere
    this.collisionSphere = new THREE.Sphere(new THREE.Vector3(), hitboxRadius);

    // Add debug visualization if enabled
    if (this.config.debug) {
      const debugGeometry = new THREE.SphereGeometry(hitboxRadius);
      const debugMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      this.debugHelper = new THREE.Mesh(debugGeometry, debugMaterial);
      this.scene.add(this.debugHelper);
    }
  }

  updatePosition(position: THREE.Vector3) {
    if (!this.active) return;

    this.hitbox.position.copy(position);
    this.collisionSphere.center.copy(position);

    if (this.debugHelper) {
      this.debugHelper.position.copy(position);
    }
  }

  checkCollision(bulletPosition: THREE.Vector3, bulletRadius: number): boolean {
    if (!this.active) return false;

    // Check if bullet intersects with drone's collision sphere
    const bulletSphere = new THREE.Sphere(bulletPosition, bulletRadius);
    const hit = bulletSphere.intersectsSphere(this.collisionSphere);

    if (hit) {
      this.handleHit();
    }

    return hit;
  }

  private handleHit() {
    if (!this.active) return;
    
    this.active = false;
    this.config.onHit();
    this.createExplosionEffect();
    
    // Clean up after explosion animation
    setTimeout(() => this.destroy(), 1000);
  }

  private createExplosionEffect() {
    const explosionGeometry = new THREE.SphereGeometry(this.config.radius);
    const explosionMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.8
    });

    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.copy(this.hitbox.position);
    this.scene.add(explosion);

    // Add explosion light
    const light = new THREE.PointLight(0xff4400, 5, 10);
    light.position.copy(this.hitbox.position);
    this.scene.add(light);

    // Animate explosion
    let scale = 1;
    const animate = () => {
      if (scale > 2) {
        this.scene.remove(explosion);
        this.scene.remove(light);
        explosionGeometry.dispose();
        explosionMaterial.dispose();
        return;
      }

      scale += 0.1;
      explosion.scale.set(scale, scale, scale);
      explosion.material.opacity = 1 - (scale - 1) / 1;
      light.intensity = 5 * (1 - (scale - 1) / 1);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  destroy() {
    this.active = false;
    this.hitbox.removeFromParent();
    this.hitbox.geometry.dispose();
    (this.hitbox.material as THREE.Material).dispose();

    if (this.debugHelper) {
      this.debugHelper.removeFromParent();
      this.debugHelper.geometry.dispose();
      (this.debugHelper.material as THREE.Material).dispose();
    }
  }
}