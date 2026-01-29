
import React from 'react';
import { PlayerStats } from '../types.js';
import { Target, TrendingUp, TrendingDown, Hash, Trophy } from 'lucide-react';

interface StatsPanelProps {
  stats: PlayerStats;
  onReset: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, onReset }) => {
  const winRate = stats.totalGames > 0 
    ? ((stats.wins / stats.totalGames) * 100).toFixed(0) 
    : '0';

  const isProfitable = stats.netProfit >= 0;

  return (
    <div className="w-full max-w-4xl grid grid-cols-4 gap-1.5 mb-1.5">
      <div className="bg-gray-800/40 border border-white/5 p-1 rounded-lg flex items-center justify-center gap-1.5">
        <Target size={10} className="text-blue-400" />
        <div className="flex flex-col items-center">
          <span className="text-[7px] text-white/30 uppercase font-black">Win %</span>
          <span className="text-xs font-black text-white">{winRate}%</span>
        </div>
      </div>

      <div className="bg-gray-800/40 border border-white/5 p-1 rounded-lg flex items-center justify-center gap-1.5">
        {isProfitable ? <TrendingUp size={10} className="text-green-500" /> : <TrendingDown size={10} className="text-red-500" />}
        <div className="flex flex-col items-center">
          <span className="text-[7px] text-white/30 uppercase font-black">Profit</span>
          <span className={`text-xs font-black ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(stats.netProfit)}
          </span>
        </div>
      </div>

      <div className="bg-gray-800/40 border border-white/5 p-1 rounded-lg flex items-center justify-center gap-1.5">
        <Hash size={10} className="text-purple-400" />
        <div className="flex flex-col items-center">
          <span className="text-[7px] text-white/30 uppercase font-black">Hands</span>
          <span className="text-xs font-black text-white">{stats.totalGames}</span>
        </div>
      </div>

      <div className="relative group bg-gray-800/40 border border-white/5 p-1 rounded-lg flex items-center justify-center gap-1.5 overflow-hidden">
        <Trophy size={10} className="text-gold-500" />
        <div className="flex flex-col items-center">
          <span className="text-[7px] text-white/30 uppercase font-black">Best</span>
          <span className="text-xs font-black text-gold-500">${stats.highestBalance}</span>
        </div>
        
        <button 
          onClick={onReset}
          className="absolute inset-0 bg-red-900 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] font-black text-white uppercase"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default StatsPanel;
