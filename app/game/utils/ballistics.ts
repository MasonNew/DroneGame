import { Vector3 } from 'three';

export const calculateBulletTrajectory = (
  origin: Vector3,
  direction: Vector3,
  windSpeed: number,
  windDirection: number,
  distance: number,
  bulletDrop: number
): Vector3 => {
  // Convert wind direction to radians
  const windRad = (windDirection * Math.PI) / 180;
  
  // Calculate wind effect
  const windEffect = new Vector3(
    Math.cos(windRad) * windSpeed * 0.01,
    0,
    Math.sin(windRad) * windSpeed * 0.01
  );
  
  // Calculate gravity drop
  const drop = new Vector3(0, -bulletDrop * distance * 0.001, 0);
  
  // Combine all effects
  return direction.clone()
    .add(windEffect)
    .add(drop)
    .normalize();
};

export const calculateHitProbability = (
  distance: number,
  accuracy: number,
  windSpeed: number
): number => {
  const distanceFactor = Math.max(0, 1 - distance / 1000);
  const windFactor = Math.max(0, 1 - windSpeed / 20);
  return accuracy * distanceFactor * windFactor;
};