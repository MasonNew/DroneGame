export interface DroneType {
  id: string;
  type: 'scout' | 'combat' | 'stealth';
  speed: number;
  health: number;
  value: number;
  pattern: 'linear' | 'circular' | 'erratic';
  size: number;
  model: string;
}

export interface WeaponConfig {
  type: string;
  damage: number;
  accuracy: number;
  recoil: number;
  zoomLevels: number[];
  ammoCapacity: number;
  bulletDrop: number;
  windAffect: number;
}

export interface Objective {
  id: string;
  type: 'eliminate' | 'protect';
  count?: number;
  timeLimit?: number;
  completed: boolean;
}

export interface Mission {
  id: string;
  name: string;
  objectives: Objective[];
  timeLimit?: number;
}

export interface GameState {
  score: number;
  ammo: number;
  activeWeapon: WeaponConfig;
  activeDrones: DroneType[];
  weather: {
    windSpeed: number;
    windDirection: number;
    visibility: number;
    precipitation: 'none' | 'rain';
    precipitationIntensity: number;
  };
  gameTime: number;
  difficulty: number;
  currentMission: Mission | null;
}