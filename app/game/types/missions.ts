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

export interface MissionObjective {
  id: string;
  type: 'eliminate' | 'protect' | 'survive';
  target?: string;
  count?: number;
  area?: Area;
  timeLimit?: number;
  completed: boolean;
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