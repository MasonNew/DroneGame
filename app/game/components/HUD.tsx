'use client';

import { useGameStore } from '../store';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crosshair, Wind } from 'lucide-react';

export function HUD() {
  const { score, ammo, weather, activeWeapon } = useGameStore();

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 space-y-2">
        <Badge variant="secondary">Score: {score}</Badge>
        <Badge variant="destructive">Ammo: {ammo}</Badge>
      </div>

      <div className="absolute top-4 right-4 space-y-2">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4" />
          <Progress value={weather.windSpeed * 10} className="w-24" />
        </div>
        <Badge variant="outline">
          Wind Direction: {Math.round(weather.windDirection)}°
        </Badge>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Crosshair className="w-8 h-8 text-red-500" />
      </div>

      <div className="absolute bottom-4 left-4">
        <Badge variant="secondary">
          Zoom: {activeWeapon.zoomLevels[0]}x
        </Badge>
      </div>
    </div>
  );
}