'use client';

import { useGameStore } from '../../store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Target } from 'lucide-react';

export function MissionHUD() {
  const { currentMission, gameTime } = useGameStore();
  
  if (!currentMission) return null;
  
  return (
    <div className="fixed top-4 left-4 space-y-4">
      <Card className="p-4 bg-black/50 text-white">
        <h3 className="font-bold mb-2">{currentMission.name}</h3>
        
        {currentMission.objectives.map((objective) => (
          <div key={objective.id} className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" />
            <span className={objective.completed ? 'line-through' : ''}>
              {objective.type === 'eliminate' && `Eliminate ${objective.count} drones`}
              {objective.type === 'protect' && `Protect area for ${objective.timeLimit}s`}
            </span>
          </div>
        ))}
        
        {currentMission.timeLimit && (
          <div className="flex items-center gap-2 mt-4">
            <Timer className="w-4 h-4" />
            <Badge variant="outline">
              {Math.max(0, currentMission.timeLimit - gameTime)}s
            </Badge>
          </div>
        )}
      </Card>
    </div>
  );
}