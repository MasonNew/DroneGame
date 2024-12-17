'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '../store';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  total?: number;
  sound?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  // Drone Kill Milestones
  {
    id: 'rookie',
    title: 'Rookie Hunter',
    description: 'Shoot down 10 drones',
    icon: '🎯',
    type: 'bronze',
    total: 10
  },
  {
    id: 'skilled',
    title: 'Skilled Hunter',
    description: 'Shoot down 20 drones',
    icon: '🏹',
    type: 'silver',
    total: 20
  },
  {
    id: 'expert',
    title: 'Expert Hunter',
    description: 'Shoot down 50 drones',
    icon: '🎖️',
    type: 'gold',
    total: 50
  },
  {
    id: 'legendary',
    title: 'Legendary Hunter',
    description: 'Shoot down 100 drones',
    icon: '👑',
    type: 'diamond',
    total: 100
  },
  // Special Achievements
  {
    id: 'quickdraw',
    title: 'Quick Draw',
    description: 'Shoot 3 drones within 5 seconds',
    icon: '⚡',
    type: 'silver'
  },
  {
    id: 'perfectreload',
    title: 'Perfect Reload',
    description: 'Perform 5 perfect reloads in a row',
    icon: '🔄',
    type: 'bronze',
    total: 5
  },
  {
    id: 'sniper',
    title: 'Eagle Eye',
    description: 'Hit a drone from over 100m away',
    icon: '🦅',
    type: 'gold'
  },
  {
    id: 'combo',
    title: 'Combo Master',
    description: 'Take down 5 drones without missing',
    icon: '🎯',
    type: 'silver'
  },
  {
    id: 'stealth',
    title: 'Ghost Hunter',
    description: 'Take down 3 stealth drones in a row',
    icon: '👻',
    type: 'platinum'
  },
  {
    id: 'speedrun',
    title: 'Speed Demon',
    description: 'Take down 10 drones in under 30 seconds',
    icon: '⚡',
    type: 'platinum'
  }
];

// Add rank system
const RANKS = [
  { level: 1, name: 'Pump Squadron Leader', required: 0 },
  { level: 2, name: 'Drone Operator Supreme', required: 15 },
  { level: 3, name: 'AeroPump Commander', required: 30 },
  { level: 4, name: 'Payload Pumper', required: 50 },
  { level: 5, name: 'Drone Fleet General', required: 75 },
  { level: 6, name: 'PumpPilot Ace', required: 100 },
  { level: 7, name: 'Flight Control Pumper', required: 150 },
  { level: 8, name: 'SkyPump Overseer', required: 200 },
  { level: 9, name: 'Drone Strike Specialist', required: 300 },
  { level: 10, name: 'PumpRecon Chief', required: 500 }
];

export function GameTooltip() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { ammo, isReloading, activeWeapon, totalDronesDestroyed } = useGameStore();
  const isLowAmmo = ammo <= 3;
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<string[]>([]);

  // Check for achievements
  useEffect(() => {
    const checkAchievements = () => {
      const milestones = [
        { id: 'rookie', count: 10 },
        { id: 'skilled', count: 20 },
        { id: 'expert', count: 50 },
        { id: 'legendary', count: 100 }
      ];

      for (const milestone of milestones) {
        if (totalDronesDestroyed >= milestone.count && !recentAchievements.includes(milestone.id)) {
          const achievement = ACHIEVEMENTS.find(a => a.id === milestone.id);
          if (achievement) {
            setShowAchievement(achievement);
            setRecentAchievements(prev => [...prev, milestone.id]);
            // Play achievement sound if we add it later
            break; // Show only one achievement at a time
          }
        }
      }
    };

    checkAchievements();
  }, [totalDronesDestroyed, recentAchievements]);

  // Hide achievement after delay
  useEffect(() => {
    if (showAchievement) {
      const timer = setTimeout(() => {
        setShowAchievement(null);
      }, 3000); // Reduced to 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showAchievement]);

  // Calculate current rank
  const getCurrentRank = () => {
    const rank = [...RANKS].reverse().find(rank => totalDronesDestroyed >= rank.required);
    return rank || RANKS[0];
  };

  // Calculate progress to next rank
  const getRankProgress = () => {
    const currentRank = getCurrentRank();
    const nextRank = RANKS.find(rank => rank.level > currentRank.level);
    
    if (!nextRank) return 100; // Max rank reached
    
    const progressToNext = totalDronesDestroyed - currentRank.required;
    const requiredForNext = nextRank.required - currentRank.required;
    return Math.min(100, (progressToNext / requiredForNext) * 100);
  };

  return (
    <>
      {/* Main tooltip */}
      <div 
        className="fixed left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-4 rounded-lg shadow-lg z-50 transition-all duration-300"
        style={{ 
          maxWidth: '300px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Game Controls</h3>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-white/70 hover:text-white"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold text-yellow-400">Movement</h4>
              <ul className="ml-2 text-sm">
                <li>WASD - Move</li>
                <li>SHIFT - Sprint</li>
                <li>SPACE - Jump</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-400">Combat</h4>
              <ul className="ml-2 text-sm">
                <li>Left Click - Shoot</li>
                <li className={`${isLowAmmo ? 'text-red-400 font-bold animate-pulse' : ''}`}>
                  R - Reload {isLowAmmo && '(Low Ammo!)'}
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-400">Drones</h4>
              <ul className="ml-2 text-sm">
                <li>🔵 Scout - Fast & Agile</li>
                <li>🔴 Combat - Tough & Strong</li>
                <li>⚫ Stealth - Hard to Hit</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Notification */}
      {showAchievement && (
        <div 
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 animate-achievement"
          style={{
            perspective: '1000px'
          }}
        >
          <div 
            className={`
              bg-gradient-to-r p-[3px] rounded-xl shadow-2xl
              ${showAchievement.type === 'diamond' ? 'from-blue-400 via-purple-500 to-pink-600' : ''}
              ${showAchievement.type === 'platinum' ? 'from-indigo-400 via-purple-500 to-pink-500' : ''}
              ${showAchievement.type === 'gold' ? 'from-yellow-400 via-yellow-500 to-yellow-600' : ''}
              ${showAchievement.type === 'silver' ? 'from-gray-300 via-gray-400 to-gray-500' : ''}
              ${showAchievement.type === 'bronze' ? 'from-orange-400 via-orange-500 to-orange-600' : ''}
            `}
          >
            <div 
              className="bg-black/95 backdrop-blur-lg rounded-xl p-8 min-w-[450px]"
              style={{
                transform: 'rotateX(5deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '0 0 40px rgba(0,0,0,0.5)'
              }}
            >
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="text-7xl animate-bounce-slow mb-4 relative z-10">
                    {showAchievement.icon}
                    <div className="absolute inset-0 animate-ping opacity-50">
                      {showAchievement.icon}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full filter blur-xl">
                  </div>
                </div>
                
                <div 
                  className={`
                    text-4xl font-bold bg-gradient-to-r text-transparent bg-clip-text
                    ${showAchievement.type === 'diamond' ? 'from-blue-400 to-purple-600' : ''}
                    ${showAchievement.type === 'platinum' ? 'from-purple-400 to-pink-600' : ''}
                    ${showAchievement.type === 'gold' ? 'from-yellow-400 to-yellow-600' : ''}
                    ${showAchievement.type === 'silver' ? 'from-gray-300 to-gray-500' : ''}
                    ${showAchievement.type === 'bronze' ? 'from-orange-400 to-orange-600' : ''}
                  `}
                >
                  Achievement Unlocked!
                </div>
                
                <div className="text-3xl font-bold text-white">
                  {showAchievement.title}
                </div>
                
                <div className="text-lg text-gray-300">
                  {showAchievement.description}
                </div>
                
                {showAchievement.total && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-400 mb-2">
                      Progress: {Math.min(totalDronesDestroyed, showAchievement.total)}/{showAchievement.total}
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`
                          h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out
                          ${showAchievement.type === 'diamond' ? 'from-blue-500 to-purple-600' : ''}
                          ${showAchievement.type === 'platinum' ? 'from-purple-500 to-pink-600' : ''}
                          ${showAchievement.type === 'gold' ? 'from-yellow-500 to-yellow-600' : ''}
                          ${showAchievement.type === 'silver' ? 'from-gray-400 to-gray-600' : ''}
                          ${showAchievement.type === 'bronze' ? 'from-orange-500 to-orange-600' : ''}
                        `}
                        style={{
                          width: `${(Math.min(totalDronesDestroyed, showAchievement.total) / showAchievement.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating reload indicator */}
      {(isLowAmmo || isReloading) && (
        <div 
          className={`fixed right-4 bottom-32 bg-black/90 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
            isReloading ? 'bg-green-900/90' : 'bg-red-900/90'
          }`}
          style={{ 
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: isLowAmmo && !isReloading ? 'pulseRight 2s infinite' : 'none'
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {isReloading ? 'Reloading...' : 'Press R to Reload!'}
            </div>
            <div className="text-sm opacity-75">
              {isReloading ? 'Please wait' : `${ammo} bullets remaining`}
            </div>
          </div>
        </div>
      )}

      {/* Bottom HUD with player info and weapon */}
      <div 
        className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-4 bg-black/80 text-white p-4 rounded-lg shadow-lg z-50 transition-all duration-300"
        style={{ 
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          width: '450px'
        }}
      >
        <div className="flex items-center gap-4">
          {/* Player Avatar with Rank */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-2 border-black flex items-center justify-center">
              <span className="text-xs font-bold">{getCurrentRank().level}</span>
            </div>
          </div>

          {/* Player & Weapon Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">Elite Sniper</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
                    {getCurrentRank().name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{activeWeapon?.type || 'Sniper Rifle'}</div>
                <div className="text-xs text-gray-400">Ammo: {ammo}/10</div>
              </div>
            </div>

            {/* Rank Progress */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Rank {getCurrentRank().level}</span>
                {getCurrentRank().level < 10 && (
                  <span>Next: {RANKS[getCurrentRank().level]?.name}</span>
                )}
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
                  style={{ width: `${getRankProgress()}%` }}
                />
              </div>
            </div>

            {/* Ammo Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  isLowAmmo ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(ammo / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes achievement {
          0% { transform: translate(-50%, -40px) scale(0.8); opacity: 0; }
          15% { transform: translate(-50%, 0) scale(1.1); opacity: 1; }
          25% { transform: translate(-50%, 0) scale(1); }
          85% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -40px) scale(0.8); opacity: 0; }
        }

        .animate-achievement {
          animation: achievement 3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(-10%); }
          50% { transform: translateY(0); }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, 0) scale(1.05); }
          100% { transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
    </>
  );
} 