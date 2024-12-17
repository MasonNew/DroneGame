import { Achievement, PlayerProgress } from '../types/progression';

export const checkAchievements = (
  progress: PlayerProgress,
  stats: {
    totalShots: number;
    hits: number;
    longShots: number;
    droneTypes: { [key: string]: number };
  }
): Achievement[] => {
  const achievements: Achievement[] = [];
  
  // Accuracy achievements
  if (stats.hits / stats.totalShots > 0.8 && stats.totalShots > 100) {
    achievements.push({
      id: 'sharpshooter',
      name: 'Sharpshooter',
      description: 'Maintain 80% accuracy over 100 shots',
      progress: 1,
      completed: true,
      reward: { type: 'experience', amount: 1000 }
    });
  }
  
  // Long-range achievements
  if (stats.longShots >= 10) {
    achievements.push({
      id: 'longshot_expert',
      name: 'Long Shot Expert',
      description: 'Score 10 hits over 500 meters',
      progress: 1,
      completed: true,
      reward: { type: 'currency', amount: 500 }
    });
  }
  
  return achievements;
};