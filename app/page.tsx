'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Crosshair, Target, Shield, Wind, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-12 px-4 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
            <Crosshair className="w-24 h-24 text-red-500 animate-pulse relative" />
          </div>
          
          <h1 className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            SOL Drone Killer
          </h1>
          
          <p className="text-2xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
            Take control of the skies. Eliminate rogue drones with precision and skill in the Solana blockchain's most thrilling combat game.
          </p>

          <div className="flex items-center justify-center gap-6 pt-4">
            <Link href="/game">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl transition-all hover:scale-105">
                <Zap className="mr-2 h-5 w-5" />
                Launch Game
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="bg-purple-600/20 p-3 rounded-lg w-fit mb-4">
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-purple-200">Advanced Targeting</h3>
            <p className="text-gray-400">
              Experience realistic ballistics with wind effects, bullet drop, and precision targeting systems.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="bg-purple-600/20 p-3 rounded-lg w-fit mb-4">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-purple-200">Strategic Combat</h3>
            <p className="text-gray-400">
              Plan your attacks, manage resources, and choose optimal vantage points for maximum efficiency.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="bg-purple-600/20 p-3 rounded-lg w-fit mb-4">
              <Wind className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-purple-200">Dynamic World</h3>
            <p className="text-gray-400">
              Face ever-changing weather conditions and environmental challenges in your mission.
            </p>
          </div>
        </div>

        {/* Animated Token Display */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-full"></div>
          <div className="relative">
            <div className="cyber-text text-4xl">KILLA</div>
            <p className="text-purple-300 mt-4">Powered by Solana</p>
          </div>
        </div>
      </div>
    </div>
  );
}