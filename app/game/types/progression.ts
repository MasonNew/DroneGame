export interface PlayerProgress {
  level: number;
  experience: number;
  currency: number;
  unlockedWeapons: string[];
  unlockedModifications: string[];
  skills: PlayerSkills;
  achievements: Achievement[];
}

export interface PlayerSkills {
  stability: number;
  reloadSpeed: number;
  spotting: number;
  windReading: number;
  stealthAwareness: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  completed: boolean;
  reward?: {
    type: 'experience' | 'currency' | 'unlock';
    amount: number;
    itemId?: string;
  };
}