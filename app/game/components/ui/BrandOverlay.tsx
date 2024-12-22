'use client';

import { Zap } from 'lucide-react';

export function BrandOverlay() {
  return (
    <div className="fixed bottom-4 right-4 z-50 text-white font-bold text-lg bg-gray-800/80 backdrop-blur-lg px-6 py-3 rounded-xl border border-purple-500/20">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-purple-400" />
        <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">KILLA</span>
        <span className="text-purple-200">on SOL</span>
      </div>
    </div>
  );
} 