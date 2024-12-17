import { Vector3 } from 'three';

export interface WeatherState {
  time: number; // 0-24 hours
  windSpeed: number;
  windDirection: number;
  visibility: number;
  precipitation: 'none' | 'rain' | 'snow';
  precipitationIntensity: number;
  fogDensity: number;
}

export const calculateVisibilityFactor = (weather: WeatherState): number => {
  let factor = 1;
  
  // Time of day affects visibility
  const dayFactor = Math.sin((weather.time / 24) * Math.PI);
  factor *= 0.3 + (dayFactor * 0.7);
  
  // Weather effects
  factor *= 1 - (weather.fogDensity * 0.8);
  factor *= 1 - (weather.precipitationIntensity * 0.5);
  
  return Math.max(0.1, Math.min(1, factor));
};

export const updateWeatherState = (current: WeatherState, deltaTime: number): WeatherState => {
  return {
    ...current,
    time: (current.time + deltaTime / 3600) % 24,
    windSpeed: Math.max(0, Math.min(20, current.windSpeed + (Math.random() - 0.5) * deltaTime)),
    windDirection: (current.windDirection + Math.random() * 5 - 2.5) % 360,
    fogDensity: Math.max(0, Math.min(1, current.fogDensity + (Math.random() - 0.5) * 0.1 * deltaTime)),
  };
};