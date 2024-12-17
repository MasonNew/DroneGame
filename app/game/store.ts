import { create } from 'zustand';
import { DroneType } from './types';

interface GameStore {
  // Game state
  score: number;
  activeDrones: DroneType[];
  weather: any;
  
  // Weapon state
  activeWeapon: {
    ammoCapacity: number;
    reloadTime: number;
  };
  ammo: number;
  isReloading: boolean;
  
  // Actions
  updateScore: (points: number) => void;
  spawnDrone: (drone: DroneType) => void;
  shootDrone: (droneId: string) => void;
  startReload: () => void;
  handleShot: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  score: 0,
  activeDrones: [],
  weather: {},
  activeWeapon: {
    ammoCapacity: 30,
    reloadTime: 2000,
  },
  ammo: 30,
  isReloading: false,

  // Actions
  updateScore: (points) => set((state) => ({ score: state.score + points })),
  
  spawnDrone: (drone) => set((state) => ({
    activeDrones: [...state.activeDrones, drone]
  })),
  
  shootDrone: (droneId) => set((state) => ({
    activeDrones: state.activeDrones.filter(drone => drone.id !== droneId)
  })),

  startReload: () => {
    const state = get();
    if (!state.isReloading && state.ammo < state.activeWeapon.ammoCapacity) {
      set({ isReloading: true });
      setTimeout(() => {
        set({
          ammo: state.activeWeapon.ammoCapacity,
          isReloading: false
        });
      }, state.activeWeapon.reloadTime);
    }
  },

  handleShot: () => {
    const state = get();
    if (state.ammo > 0 && !state.isReloading) {
      set({ ammo: state.ammo - 1 });
    }
  }
}));