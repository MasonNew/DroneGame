'use client';

import { useGameStore } from '../../store';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crosshair, Timer } from 'lucide-react';

export function WeaponHUD() {
  const { activeWeapon, ammo, isReloading } = useGameStore();
  
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{activeWeapon.type}</Badge>
        <Progress value={(ammo / activeWeapon.ammoCapacity) * 100} className="w-24" />
        {isReloading && (
          <div className="flex items-center gap-1 text-yellow-500">
            <Timer className="w-4 h-4 animate-spin" />
            <span>Reloading...</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Crosshair className="w-4 h-4" />
        <Badge variant="secondary">
          Accuracy: {Math.round(activeWeapon.accuracy * 100)}%
        </Badge>
      </div>
    </div>
  );
}