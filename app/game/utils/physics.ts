import { Vector3 } from 'three';
import { WeatherState } from './weather';

export const calculateBulletPhysics = (
  origin: Vector3,
  direction: Vector3,
  weather: WeatherState,
  bulletProperties: {
    mass: number;
    velocity: number;
    dragCoefficient: number;
  },
  deltaTime: number
): { position: Vector3; velocity: Vector3 } => {
  const gravity = new Vector3(0, -9.81, 0);
  const windForce = new Vector3(
    Math.cos(weather.windDirection * Math.PI / 180) * weather.windSpeed * 0.05,
    0,
    Math.sin(weather.windDirection * Math.PI / 180) * weather.windSpeed * 0.05
  );
  
  // Calculate air resistance
  const velocity = direction.multiplyScalar(bulletProperties.velocity);
  const dragForce = velocity.clone()
    .normalize()
    .multiplyScalar(-0.5 * bulletProperties.dragCoefficient * velocity.lengthSq() * 0.01);
  
  // Apply forces with reduced effect for better gameplay
  const acceleration = new Vector3()
    .add(gravity.multiplyScalar(0.1)) // Reduced gravity effect
    .add(windForce)
    .add(dragForce.divideScalar(bulletProperties.mass));
  
  // Update velocity and position
  const newVelocity = velocity.add(acceleration.multiplyScalar(deltaTime));
  const newPosition = origin.clone().add(newVelocity.multiplyScalar(deltaTime));
  
  return { position: newPosition, velocity: newVelocity };
};