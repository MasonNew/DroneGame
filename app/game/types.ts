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

export interface Weather {
  windSpeed: number;
  windDirection: number;
  visibility: number;
  precipitation: 'none' | 'rain' | 'snow';
}

export interface GameState {
  score: number;
  ammo: number;
  activeWeapon: WeaponConfig;
  activeDrones: DroneType[];
  weather: Weather;
  gameTime: number;
  difficulty: number;
}

export interface MissionObjective {
  id: string;
  type: 'eliminate' | 'protect' | 'survive';
  description: string;
  target?: string;
  count?: number;
  area?: Area;
  timeLimit?: number;
  completed: boolean;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  objectives: MissionObjective[];
  timeLimit?: number;
  civilianZones: CivilianZone[];
  difficulty: number;
  rewards: MissionRewards;
}

export interface CivilianZone {
  position: [number, number, number];
  radius: number;
}

export interface Area {
  center: [number, number, number];
  radius: number;
}

export interface MissionRewards {
  experience: number;
  currency: number;
  unlocks?: string[];
}