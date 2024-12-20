'use client';

import { useGameStore } from '../../store';
import { Target } from 'lucide-react';
import { MissionObjective } from '../../types';

export function MissionHUD() {
  const { currentMission, gameTime } = useGameStore();
  
  if (!currentMission) return null;
  
  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg shadow-lg">
      <div className="space-y-4">
        {/* Mission Title */}
        <h3 className="font-bold mb-2">{currentMission.name}</h3>
        
        {/* Mission Objectives */}
        {currentMission.objectives.map((objective: MissionObjective) => (
          <div key={objective.id} className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" />
            <span className={objective.completed ? 'line-through' : ''}>
              {objective.description}
            </span>
          </div>
        ))}
        
        {/* Time Limit */}
        {currentMission.timeLimit && (
          <div className="text-sm">
            Time Remaining: {Math.max(0, currentMission.timeLimit - gameTime)}s
          </div>
        )}
      </div>
    </div>
  );
}