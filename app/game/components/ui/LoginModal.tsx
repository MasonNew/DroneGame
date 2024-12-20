'use client';

import { useState } from 'react';
import { useGameStore } from '../../store';

export function LoginModal() {
  const [username, setUsername] = useState('');
  const { setPlayerName, isLoggedIn, setIsLoggedIn } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setPlayerName(username);
      setIsLoggedIn(true);
    }
  };

  if (isLoggedIn) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Enter Your Name</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-500 focus:outline-none"
            maxLength={20}
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded transition-colors"
          >
            Start Playing
          </button>
        </form>
      </div>
    </div>
  );
} 