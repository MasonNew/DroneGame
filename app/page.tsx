'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center mb-8">
          <Crosshair className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-6xl font-bold tracking-tighter">
          Welcome To Drone Buster!
        </h1>
        
        <p className="text-xl text-gray-400 max-w-md mx-auto">
          Let&apos;s Start Playing! – Take Aim and Shoot Down Those Pesky TikTok Drones That Keep Buzzing Around, Prove You&apos;re the Ultimate Drone Buster!
        </p>

        <div className="space-y-4">
          <Link href="/game">
            <Button size="lg" className="w-48">
              Start Mission
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Realistic Ballistics</h3>
            <p className="text-gray-400">
              Master wind effects, bullet drop, and distance calculations.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Strategic Gameplay</h3>
            <p className="text-gray-400">
              Choose your vantage points and manage limited ammunition.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Dynamic Environment</h3>
            <p className="text-gray-400">
              Adapt to changing weather conditions and time pressure.
            </p>
          </div>
        </div>

        {/* Animated $BUST text */}
        <div className="mt-16">
          <div className="cyber-text">$BUST</div>
        </div>
      </div>
    </div>
  );
}