'use client';

import * as THREE from 'three';

export class BulletSystem {
  private scene: THREE.Scene;
  private bullets: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    tracer: THREE.Line;
    startTime: number;
  }[] = [];
  private bulletGeometry: THREE.SphereGeometry;
  private bulletMaterial: THREE.MeshBasicMaterial;
  private tracerMaterial: THREE.LineBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    // Create reusable geometries and materials
    this.bulletGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    this.bulletMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00
    });
    this.tracerMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
  }

  createBullet(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    weather: any,
    weapon: any,
    onHit: (hitPoint: THREE.Vector3, droneId: string) => void
  ) {
    // Create bullet mesh
    const bullet = new THREE.Mesh(this.bulletGeometry, this.bulletMaterial);
    bullet.position.copy(position);
    this.scene.add(bullet);

    // Create tracer
    const tracerGeometry = new THREE.BufferGeometry();
    const tracerPoints = [
      position.clone(),
      position.clone().add(direction.clone().multiplyScalar(1000))
    ];
    tracerGeometry.setFromPoints(tracerPoints);
    const tracer = new THREE.Line(tracerGeometry, this.tracerMaterial.clone());
    this.scene.add(tracer);

    // Add to active bullets
    this.bullets.push({
      mesh: bullet,
      velocity: direction.multiplyScalar(speed),
      tracer,
      startTime: Date.now()
    });

    // Remove tracer after 1 second
    setTimeout(() => {
      this.scene.remove(tracer);
      tracer.geometry.dispose();
      if (tracer.material instanceof THREE.Material) {
        tracer.material.dispose();
      }
    }, 1000);

    // Check for immediate hits
    this.checkCollision(bullet.position, direction, onHit);

    // Remove bullet after 2 seconds
    setTimeout(() => {
      const index = this.bullets.findIndex(b => b.mesh === bullet);
      if (index !== -1) {
        this.removeBullet(index);
      }
    }, 2000);
  }

  private checkCollision(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    onHit: (hitPoint: THREE.Vector3, droneId: string) => void
  ) {
    const raycaster = new THREE.Raycaster(position, direction.normalize());
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    for (const intersect of intersects) {
      let currentObj = intersect.object;

      // Traverse up to find drone group
      while (currentObj && currentObj.parent) {
        if (currentObj.userData?.isDrone) {
          console.log('Hit drone:', currentObj.userData.droneId);
          currentObj.userData.onHit?.();
          onHit(intersect.point, currentObj.userData.droneId);
          return true;
        }
        currentObj = currentObj.parent;
      }

      // Stop at buildings or ground
      if (intersect.object.name === 'building-collider' || intersect.object.name === 'ground') {
        return true;
      }
    }

    return false;
  }

  update(deltaTime: number) {
    // Update all bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      // Update bullet position
      const oldPosition = bullet.mesh.position.clone();
      bullet.mesh.position.add(bullet.velocity.clone().multiplyScalar(deltaTime));

      // Check for collisions
      if (this.checkCollision(
        oldPosition,
        bullet.velocity.clone().normalize(),
        (hitPoint, droneId) => {
          console.log('Bullet hit drone:', droneId, 'at position:', hitPoint);
          this.removeBullet(i);
        }
      )) {
        break;
      }
    }
  }

  private removeBullet(index: number) {
    const bullet = this.bullets[index];
    this.scene.remove(bullet.mesh);
    bullet.mesh.geometry.dispose();
    if (bullet.mesh.material instanceof THREE.Material) {
      bullet.mesh.material.dispose();
    }
    this.bullets.splice(index, 1);
  }

  cleanup() {
    // Clean up all bullets
    this.bullets.forEach(bullet => {
      this.scene.remove(bullet.mesh);
      this.scene.remove(bullet.tracer);
      bullet.mesh.geometry.dispose();
      bullet.tracer.geometry.dispose();
      if (bullet.tracer.material instanceof THREE.Material) {
        bullet.tracer.material.dispose();
      }
    });
    this.bullets = [];
    
    // Dispose of shared resources
    this.bulletGeometry.dispose();
    this.bulletMaterial.dispose();
    this.tracerMaterial.dispose();
  }
}