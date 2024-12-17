'use client';

import * as THREE from 'three';
import { CollisionManager } from '../collision/CollisionManager';

export class BulletSystem {
  private scene: THREE.Scene;
  private collisionManager: CollisionManager;
  private bullets: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    tracer: THREE.Line;
    startTime: number;
  }[] = [];
  private bulletGeometry: THREE.SphereGeometry;
  private bulletMaterial: THREE.MeshBasicMaterial;
  private tracerMaterial: THREE.LineBasicMaterial;

  constructor(scene: THREE.Scene, collisionManager: CollisionManager) {
    this.scene = scene;
    this.collisionManager = collisionManager;
    
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
    // Create bullet mesh (reusing geometry and material)
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

    // Add to active bullets with onHit callback
    this.bullets.push({
      mesh: bullet,
      velocity: direction.multiplyScalar(speed),
      tracer,
      startTime: Date.now()
    });

    // Remove tracer after 2 seconds
    setTimeout(() => {
      this.scene.remove(tracer);
      tracer.geometry.dispose();
      if (tracer.material instanceof THREE.Material) {
        tracer.material.dispose();
      }
    }, 2000);

    // Check for immediate hits
    const raycaster = new THREE.Raycaster(position, direction.normalize());
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    for (const intersect of intersects) {
      // Find drone in parent hierarchy
      let currentObj = intersect.object;
      let isDrone = false;
      let droneId = '';

      while (currentObj && currentObj.parent) {
        if (currentObj.name && currentObj.name.startsWith('drone-')) {
          isDrone = true;
          droneId = currentObj.name;
          break;
        }
        currentObj = currentObj.parent;
      }

      if (isDrone) {
        this.createExplosionEffect(intersect.point);
        onHit(intersect.point, droneId);
        this.removeBullet(this.bullets.length - 1);
        return;
      }

      // Stop at buildings
      if (intersect.object.name === 'building-collider') {
        break;
      }
    }

    // Remove bullet after 2 seconds
    setTimeout(() => {
      const index = this.bullets.findIndex(b => b.mesh === bullet);
      if (index !== -1) {
        this.removeBullet(index);
      }
    }, 2000);
  }

  private createExplosionEffect(position: THREE.Vector3) {
    // Create multiple explosion lights
    const lights = [];
    const lightColors = [0xff4400, 0xff8800, 0xffaa00];
    for (let i = 0; i < 3; i++) {
      const light = new THREE.PointLight(lightColors[i], 8, 15);
      light.position.copy(position);
      this.scene.add(light);
      lights.push(light);
    }

    // Create explosion particles
    const particleCount = 50; // Increased particle count
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Create multiple particle colors for more dynamic effect
    const particleColors = [
      new THREE.Color(0xff4400),
      new THREE.Color(0xff8800),
      new THREE.Color(0xffaa00)
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3; // Increased radius
      positions[i3] = position.x + Math.cos(angle) * radius;
      positions[i3 + 1] = position.y + Math.random() * 3; // Increased height spread
      positions[i3 + 2] = position.z + Math.sin(angle) * radius;

      // Randomly select color from palette
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      sizes[i] = 0.5 + Math.random() * 1.0; // Increased particle size variation
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1.0, // Increased base size
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    // Create shockwave effect
    const shockwaveGeometry = new THREE.RingGeometry(0, 0.1, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(position);
    shockwave.lookAt(this.scene.position);
    this.scene.add(shockwave);

    // Animate explosion with enhanced effects
    let scale = 1;
    const animate = () => {
      scale += 0.2;
      particles.scale.set(scale, scale, scale);
      material.opacity = 1 - (scale - 1) / 3;

      // Animate shockwave
      shockwave.scale.set(scale * 2, scale * 2, scale * 2);
      shockwaveMaterial.opacity = 0.7 * (1 - (scale - 1) / 3);

      // Animate lights
      lights.forEach((light, index) => {
        light.intensity = 8 * (1 - (scale - 1) / 3);
        light.position.y += 0.1; // Make lights rise
      });

      if (scale <= 4) { // Increased animation duration
        requestAnimationFrame(animate);
      } else {
        // Cleanup
        this.scene.remove(particles);
        this.scene.remove(shockwave);
        lights.forEach(light => this.scene.remove(light));
        geometry.dispose();
        material.dispose();
        shockwaveGeometry.dispose();
        shockwaveMaterial.dispose();
      }
    };
    requestAnimationFrame(animate);
  }

  update(deltaTime: number) {
    // Update all bullets in a single loop
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      // Update bullet position
      bullet.mesh.position.add(bullet.velocity.clone().multiplyScalar(deltaTime));

      // Check for collisions
      const raycaster = new THREE.Raycaster(
        bullet.mesh.position.clone().sub(bullet.velocity.clone().normalize().multiplyScalar(deltaTime)),
        bullet.velocity.clone().normalize(),
        0,
        bullet.velocity.length() * deltaTime
      );

      const intersects = raycaster.intersectObjects(this.scene.children, true);
      for (const intersect of intersects) {
        let currentObj = intersect.object;
        let isDrone = false;
        let droneId = '';

        while (currentObj && currentObj.parent) {
          if (currentObj.name && currentObj.name.startsWith('drone-')) {
            isDrone = true;
            droneId = currentObj.name;
            break;
          }
          currentObj = currentObj.parent;
        }

        if (isDrone) {
          this.createExplosionEffect(intersect.point);
          onHit(intersect.point, droneId);
          this.removeBullet(i);
          break;
        }
      }
    }
  }

  private removeBullet(index: number) {
    const bullet = this.bullets[index];
    this.scene.remove(bullet.mesh);
    bullet.mesh.geometry.dispose();
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