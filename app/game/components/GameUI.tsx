'use client';

import { useGameStore } from '../store';
import { useEffect } from 'react';

export function GameUI() {
  const { 
    score, 
    ammo, 
    isReloading, 
    reloadProgress, 
    showAchievement, 
    latestAchievement,
    startReload,
    totalDronesDestroyed,
    activeWeapon
  } = useGameStore();

  // Handle reload key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && !isReloading && ammo < 10) {
        startReload();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isReloading, ammo, startReload]);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Help Tips */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-4 text-white">
        <h3 className="text-xl font-bold mb-2">Controls:</h3>
        <ul className="space-y-1 text-sm">
          <li>WASD - Move</li>
          <li>SHIFT - Sprint</li>
          <li>MOUSE - Aim</li>
          <li>LEFT CLICK - Shoot</li>
          <li>R - Reload</li>
          <li>SPACE - Jump</li>
        </ul>
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Objectives:</h3>
          <ul className="space-y-1 text-sm">
            <li>• Shoot down drones</li>
            <li>• Unlock achievements</li>
            <li>• Increase your score</li>
          </ul>
        </div>
      </div>

      {/* Score and Ammo */}
      <div className="absolute top-4 right-4 text-white text-xl font-bold">
        <div>Score: {score}</div>
        <div>Drones Destroyed: {totalDronesDestroyed}</div>
        <div className={`${ammo === 0 ? 'text-red-500' : ''}`}>
          Ammo: {ammo}/10
        </div>
      </div>

      {/* Weapon HUD */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-lg p-4 text-white flex items-center space-x-4">
        <div className="text-lg font-bold">{activeWeapon.type.toUpperCase()}</div>
        <div className="h-8 w-32 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(ammo / activeWeapon.ammoCapacity) * 100}%` }}
          />
        </div>
      </div>

      {/* Reload Progress */}
      {isReloading && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-black bg-opacity-50 rounded-lg p-4 text-white text-center">
            <div>Reloading...</div>
            <div className="w-48 h-2 bg-gray-700 rounded-full mt-2">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-100"
                style={{ width: `${reloadProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty Ammo Indicator */}
      {ammo === 0 && !isReloading && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-red-500 bg-opacity-75 rounded-lg p-4 text-white text-center">
            Press R to Reload!
          </div>
        </div>
      )}

      {/* Achievement Popup */}
      {showAchievement && latestAchievement && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 animate-achievement">
          <div className="bg-yellow-500 bg-opacity-90 rounded-lg p-6 text-center shadow-lg">
            <div className="text-2xl font-bold mb-2">Achievement Unlocked!</div>
            <div className="text-xl">{latestAchievement.title}</div>
            <div className="text-sm mt-2">{latestAchievement.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this to your globals.css
/*
@keyframes achievement {
  0% { transform: translate(-50%, -20px); opacity: 0; }
  10% { transform: translate(-50%, 0); opacity: 1; }
  90% { transform: translate(-50%, 0); opacity: 1; }
  100% { transform: translate(-50%, -20px); opacity: 0; }
}

.animate-achievement {
  animation: achievement 3s ease-in-out;
}
*/ 