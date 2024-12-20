'use client';

import * as THREE from 'three';

interface Explosion {
  particles: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  light: THREE.PointLight;
  startTime: number;
  velocities: Float32Array;
  sizes: Float32Array;
}

export class ExplosionSystem {
  private scene: THREE.Scene;
  private explosions: Set<Explosion> = new Set();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createExplosion(position: THREE.Vector3) {
    // Create explosion light
    const light = new THREE.PointLight('#ff4444', 10, 20);
    light.position.copy(position);
    this.scene.add(light);

    // Create particle system
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color1 = new THREE.Color('#ff4444');
    const color2 = new THREE.Color('#ff8800');
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;
      
      const velocity = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize().multiplyScalar(2 + Math.random() * 3);
      
      velocities[i3] = velocity.x;
      velocities[i3 + 1] = velocity.y;
      velocities[i3 + 2] = velocity.z;
      
      const color = color1.clone().lerp(color2, Math.random());
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = 0.2 + Math.random() * 0.3;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particles = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      })
    );
    
    this.scene.add(particles);

    const explosion: Explosion = {
      particles,
      light,
      startTime: Date.now(),
      velocities,
      sizes
    };
    
    this.explosions.add(explosion);

    // Remove after animation completes
    setTimeout(() => {
      this.scene.remove(particles);
      this.scene.remove(light);
      this.explosions.delete(explosion);
      geometry.dispose();
      particles.material.dispose();
    }, 1000);
  }

  update() {
    const currentTime = Date.now();
    
    this.explosions.forEach(explosion => {
      const elapsed = (currentTime - explosion.startTime) / 1000;
      if (elapsed > 1) return;
      
      const positions = explosion.particles.geometry.attributes.position.array;
      const velocities = explosion.velocities;
      const sizes = explosion.particles.geometry.attributes.size.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * (1 - elapsed) * 0.16;
        positions[i + 1] += velocities[i + 1] * (1 - elapsed) * 0.16;
        positions[i + 2] += velocities[i + 2] * (1 - elapsed) * 0.16;
        
        const sizeIndex = i / 3;
        sizes[sizeIndex] *= 0.98;
      }
      
      explosion.particles.geometry.attributes.position.needsUpdate = true;
      explosion.particles.geometry.attributes.size.needsUpdate = true;
      explosion.particles.material.opacity = Math.max(0, 1 - elapsed);
      explosion.light.intensity = Math.max(0, 10 * (1 - elapsed));
    });
  }
}