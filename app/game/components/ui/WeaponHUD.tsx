'use client';

import { useGameStore } from '../../store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crosshair, Timer } from 'lucide-react';

export function WeaponHUD() {
  const { activeWeapon, ammo, isReloading } = useGameStore();
  
  return (
    <div className="fixed bottom-4 right-4">
      <Card className="p-4 bg-black/50 text-white">
        <div className="flex items-center gap-4">
          <Crosshair className="w-6 h-6" />
          <div>
            <h4 className="font-bold">{activeWeapon.type}</h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {ammo} / {activeWeapon.ammoCapacity}
              </Badge>
              {isReloading && (
                <Progress value={ammo / activeWeapon.ammoCapacity * 100} className="w-20" />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}