import { create } from 'zustand';
import { GameState, WeaponConfig, DroneType } from './types';
import { CollisionManager } from './components/collision/CollisionManager';
import * as THREE from 'three';

const defaultWeapon: WeaponConfig = {
  type: 'standard',
  damage: 100,
  accuracy: 0.95,
  recoil: 0.2,
  zoomLevels: [2, 4, 8, 16],
  ammoCapacity: 10,
  bulletDrop: 0.1,
  windAffect: 0.05,
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  threshold: number;
  unlocked: boolean;
}

const achievements: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Blood',
    description: 'Shoot down your first drone',
    threshold: 1,
    unlocked: false
  },
  {
    id: 'sharp_shooter',
    title: 'Sharp Shooter',
    description: 'Destroy 10 drones',
    threshold: 10,
    unlocked: false
  },
  {
    id: 'drone_hunter',
    title: 'Drone Hunter',
    description: 'Destroy 25 drones',
    threshold: 25,
    unlocked: false
  },
  {
    id: 'master_hunter',
    title: 'Master Hunter',
    description: 'Destroy 50 drones',
    threshold: 50,
    unlocked: false
  },
  {
    id: 'legendary',
    title: 'Legendary',
    description: 'Destroy 100 drones',
    threshold: 100,
    unlocked: false
  }
];

interface MissionObjective {
  id: string;
  type: 'eliminate' | 'protect';
  count?: number;
  timeLimit?: number;
  completed: boolean;
}

interface Mission {
  id: string;
  name: string;
  objectives: MissionObjective[];
  timeLimit?: number;
}

interface GameStore extends GameState {
  collisionManager: CollisionManager | null;
  isReloading: boolean;
  reloadProgress: number;
  totalDronesDestroyed: number;
  achievements: Achievement[];
  showAchievement: boolean;
  latestAchievement: Achievement | null;
  currentMission: Mission | null;
  
  initGame: () => void;
  updateScore: (points: number) => void;
  shootDrone: (droneId: string) => void;
  spawnDrone: (drone: DroneType) => void;
  updateWeather: () => void;
  startReload: () => void;
  finishReload: () => void;
  setCollisionManager: (scene: THREE.Scene) => void;
  checkAchievements: () => void;
  hideAchievement: () => void;
  useAmmo: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  score: 0,
  ammo: defaultWeapon.ammoCapacity,
  activeWeapon: defaultWeapon,
  activeDrones: [],
  weather: {
    windSpeed: 0,
    windDirection: 0,
    visibility: 1000,
    precipitation: 'none'
  },
  gameTime: 0,
  difficulty: 1,
  isReloading: false,
  reloadProgress: 0,
  collisionManager: null,
  totalDronesDestroyed: 0,
  achievements: [...achievements],
  showAchievement: false,
  latestAchievement: null,
  currentMission: null,

  initGame: () => set({
    score: 0,
    ammo: defaultWeapon.ammoCapacity,
    activeWeapon: defaultWeapon,
    activeDrones: [],
    weather: {
      windSpeed: Math.random() * 10,
      windDirection: Math.random() * 360,
      visibility: 0.8 + Math.random() * 0.2,
      precipitation: 'none'
    },
    gameTime: 0,
    difficulty: 1,
    isReloading: false,
    reloadProgress: 0,
    totalDronesDestroyed: 0,
    achievements: achievements.map(a => ({ ...a, unlocked: false })),
    showAchievement: false,
    latestAchievement: null,
    currentMission: {
      id: 'mission-1',
      name: 'First Strike',
      objectives: [
        {
          id: 'obj-1',
          type: 'eliminate',
          count: 5,
          completed: false
        }
      ],
      timeLimit: 300
    },
  }),

  updateScore: (points) => set((state) => ({
    score: state.score + 1, // Always add 1 point per drone
  })),

  shootDrone: (droneId: string) => {
    const state = get();
    const drone = state.activeDrones.find(d => d.id === droneId);
    if (!drone) return;

    // Remove the drone and update score/stats
    set((state) => {
      const newTotalDrones = state.totalDronesDestroyed + 1;
      
      // Check for achievements before updating state
      const newAchievements = state.achievements.map(achievement => {
        if (!achievement.unlocked && newTotalDrones >= achievement.threshold) {
          // Show achievement notification
          setTimeout(() => {
            set(state => ({
              showAchievement: true,
              latestAchievement: achievement
            }));
            
            // Hide achievement after 3 seconds
            setTimeout(() => {
              set({ showAchievement: false });
            }, 3000);
          }, 0);
          
          return { ...achievement, unlocked: true };
        }
        return achievement;
      });

      return {
        activeDrones: state.activeDrones.filter(d => d.id !== droneId),
        score: state.score + 1,
        totalDronesDestroyed: newTotalDrones,
        achievements: newAchievements
      };
    });
  },

  useAmmo: () => set(state => {
    if (state.ammo <= 0) return state;
    return { ammo: state.ammo - 1 };
  }),

  startReload: () => {
    if (get().isReloading) return;
    
    set({ isReloading: true, reloadProgress: 0 });
    
    // Animate reload progress
    const startTime = Date.now();
    const reloadDuration = 2000; // 2 seconds
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / reloadDuration);
      
      set({ reloadProgress: progress });
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        get().finishReload();
      }
    };
    
    requestAnimationFrame(updateProgress);
  },

  finishReload: () => set((state) => ({
    isReloading: false,
    reloadProgress: 0,
    ammo: state.activeWeapon.ammoCapacity,
  })),

  setCollisionManager: (scene: THREE.Scene) => set({
    collisionManager: new CollisionManager(scene)
  }),

  spawnDrone: (drone) => set((state) => ({
    activeDrones: [...state.activeDrones, drone],
  })),

  updateWeather: () => set((state) => ({
    weather: {
      windSpeed: Math.random() * 10,
      windDirection: (state.weather.windDirection + Math.random() * 20 - 10) % 360,
      visibility: Math.max(0.5, Math.min(1, state.weather.visibility + (Math.random() * 0.2 - 0.1))),
      precipitation: 'none'
    },
  })),

  checkAchievements: () => {
    const state = get();
    const newAchievements = state.achievements.map(achievement => {
      if (!achievement.unlocked && state.totalDronesDestroyed >= achievement.threshold) {
        set({
          showAchievement: true,
          latestAchievement: achievement
        });
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });

    set({ achievements: newAchievements });
  },

  hideAchievement: () => set({ showAchievement: false }),
}));