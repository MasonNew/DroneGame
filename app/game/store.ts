import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as THREE from 'three';
import { DroneType, Weather, WeaponConfig, Mission } from './types';

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  total?: number;
}

interface GameStore {
  playerName: string;
  isLoggedIn: boolean;
  score: number;
  leaderboard: LeaderboardEntry[];
  activeDrones: DroneType[];
  weather: Weather;
  // Weapon state
  ammo: number;
  isReloading: boolean;
  reloadProgress: number;
  activeWeapon: WeaponConfig;
  totalDronesDestroyed: number;
  // Achievement state
  showAchievement: boolean;
  latestAchievement: Achievement | null;
  unlockedAchievements: string[];
  // Mission state
  currentMission: Mission | null;
  gameTime: number;
  // Score management
  updateScore: (amount: number) => void;
  // Actions
  setPlayerName: (name: string) => void;
  setIsLoggedIn: (value: boolean) => void;
  incrementScore: (amount: number) => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  addScoreToLeaderboard: () => void;
  resetScore: () => void;
  cameraPosition: THREE.Vector3;
  cameraRotation: THREE.Euler;
  setCameraPosition: (position: THREE.Vector3) => void;
  setCameraRotation: (rotation: THREE.Euler) => void;
  isInitialized: boolean;
  initGame: () => void;
  // Drone management
  spawnDrone: (drone: DroneType) => void;
  shootDrone: (droneId: string) => void;
  removeDrone: (droneId: string) => void;
  // Weather management
  updateWeather: (weather: Partial<Weather>) => void;
  // Weapon management
  startReload: () => void;
  finishReload: () => void;
  useAmmo: () => void;
  setReloadProgress: (progress: number) => void;
  // Achievement management
  unlockAchievement: (achievement: Achievement) => void;
  hideAchievement: () => void;
  // Mission management
  startMission: (mission: Mission) => void;
  completeMission: () => void;
  updateGameTime: (time: number) => void;
}

const DEFAULT_WEAPON: WeaponConfig = {
  type: 'standard',
  damage: 100,
  accuracy: 0.9,
  recoil: 0.3,
  zoomLevels: [1, 2, 4],
  ammoCapacity: 10,
  bulletDrop: 0.1,
  windAffect: 0.2
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      playerName: '',
      isLoggedIn: false,
      score: 0,
      leaderboard: [],
      isInitialized: false,
      cameraPosition: new THREE.Vector3(0, 5, 10),
      cameraRotation: new THREE.Euler(0, 0, 0),
      activeDrones: [],
      weather: {
        windSpeed: 0,
        windDirection: 0,
        visibility: 1000,
        precipitation: 'none'
      },
      // Weapon state
      ammo: 10,
      isReloading: false,
      reloadProgress: 0,
      activeWeapon: DEFAULT_WEAPON,
      totalDronesDestroyed: 0,
      // Achievement state
      showAchievement: false,
      latestAchievement: null,
      unlockedAchievements: [],
      // Mission state
      currentMission: null,
      gameTime: 0,
      // Score management
      updateScore: (amount) => {
        set((state) => ({
          score: state.score + amount
        }));
      },

      setPlayerName: (name) => set({ playerName: name }),
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
      incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
      updateLeaderboard: (entries) => {
        set({ leaderboard: entries.sort((a, b) => b.score - a.score) });
      },
      addScoreToLeaderboard: () => {
        const { playerName, score, leaderboard } = get();
        if (!playerName || score === 0) return;

        const newLeaderboard = [...leaderboard];
        const existingEntry = newLeaderboard.find(entry => entry.name === playerName);

        if (existingEntry) {
          if (score > existingEntry.score) {
            existingEntry.score = score;
          }
        } else {
          newLeaderboard.push({ name: playerName, score });
        }

        newLeaderboard.sort((a, b) => b.score - a.score);
        set({ leaderboard: newLeaderboard });
      },
      resetScore: () => set({ score: 0 }),
      setCameraPosition: (position) => set({ cameraPosition: position }),
      setCameraRotation: (rotation) => set({ cameraRotation: rotation }),

      initGame: () => {
        if (get().isInitialized) return;
        set({
          score: 0,
          isInitialized: true,
          cameraPosition: new THREE.Vector3(0, 5, 10),
          cameraRotation: new THREE.Euler(0, 0, 0),
          activeDrones: [],
          weather: {
            windSpeed: 0,
            windDirection: 0,
            visibility: 1000,
            precipitation: 'none'
          },
          ammo: 10,
          isReloading: false,
          reloadProgress: 0,
          totalDronesDestroyed: 0,
          showAchievement: false,
          latestAchievement: null,
          currentMission: null,
          gameTime: 0
        });
      },

      // Drone management functions
      spawnDrone: (drone) => {
        set((state) => ({
          activeDrones: [...state.activeDrones, drone]
        }));
      },

      shootDrone: (droneId) => {
        set((state) => {
          const droneIndex = state.activeDrones.findIndex(d => d.id === droneId);
          if (droneIndex === -1) return state;

          const drone = state.activeDrones[droneIndex];
          const newScore = state.score + drone.value;
          const newTotalDronesDestroyed = state.totalDronesDestroyed + 1;

          const newDrones = [...state.activeDrones];
          newDrones.splice(droneIndex, 1);

          return {
            activeDrones: newDrones,
            score: newScore,
            totalDronesDestroyed: newTotalDronesDestroyed
          };
        });
      },

      removeDrone: (droneId) => {
        set((state) => ({
          activeDrones: state.activeDrones.filter(d => d.id !== droneId)
        }));
      },

      // Weather management
      updateWeather: (weatherUpdate) => {
        set((state) => ({
          weather: { ...state.weather, ...weatherUpdate }
        }));
      },

      // Weapon management
      startReload: () => {
        set({ isReloading: true, reloadProgress: 0 });
      },

      finishReload: () => {
        const { activeWeapon } = get();
        set({ 
          isReloading: false, 
          reloadProgress: 0,
          ammo: activeWeapon.ammoCapacity 
        });
      },

      useAmmo: () => {
        set((state) => ({
          ammo: Math.max(0, state.ammo - 1)
        }));
      },

      setReloadProgress: (progress) => {
        set({ reloadProgress: progress });
      },

      // Achievement management
      unlockAchievement: (achievement) => {
        const { unlockedAchievements } = get();
        if (!unlockedAchievements.includes(achievement.id)) {
          set((state) => ({
            showAchievement: true,
            latestAchievement: achievement,
            unlockedAchievements: [...state.unlockedAchievements, achievement.id]
          }));

          // Hide achievement after 3 seconds
          setTimeout(() => {
            get().hideAchievement();
          }, 3000);
        }
      },

      hideAchievement: () => {
        set({
          showAchievement: false,
          latestAchievement: null
        });
      },

      // Mission management
      startMission: (mission) => {
        set({
          currentMission: mission,
          gameTime: 0
        });
      },

      completeMission: () => {
        set({
          currentMission: null,
          gameTime: 0
        });
      },

      updateGameTime: (time) => {
        set({ gameTime: time });
      }
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        leaderboard: state.leaderboard,
        playerName: state.playerName,
        isLoggedIn: state.isLoggedIn,
        unlockedAchievements: state.unlockedAchievements
      }),
    }
  )
);