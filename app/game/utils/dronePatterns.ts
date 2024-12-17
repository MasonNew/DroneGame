import { Vector3 } from 'three';

type PatternFunction = (time: number, basePosition: Vector3, speed: number) => Vector3;

const patterns: Record<string, PatternFunction> = {
  linear: (time, basePos, speed) => {
    const amplitude = 20;
    const frequency = speed * 0.2;
    return new Vector3(
      basePos.x + Math.sin(time * frequency) * amplitude,
      basePos.y + Math.sin(time * frequency * 0.5) * 2,
      basePos.z
    );
  },
  
  circular: (time, basePos, speed) => {
    const radius = 15;
    const verticalSpeed = speed * 0.3;
    return new Vector3(
      basePos.x + Math.cos(time * speed) * radius,
      basePos.y + Math.sin(time * verticalSpeed) * 3,
      basePos.z + Math.sin(time * speed) * radius
    );
  },
  
  erratic: (time, basePos, speed) => {
    const baseFreq = speed * 0.5;
    return new Vector3(
      basePos.x + Math.sin(time * baseFreq) * 8 + Math.cos(time * baseFreq * 1.3) * 5,
      basePos.y + Math.sin(time * baseFreq * 0.7) * 4,
      basePos.z + Math.cos(time * baseFreq * 0.9) * 8
    );
  }
};

export const updateDronePosition = (
  pattern: string,
  time: number,
  basePosition: Vector3,
  speed: number
): Vector3 => {
  const patternFunc = patterns[pattern] || patterns.linear;
  return patternFunc(time, basePosition, speed);
};