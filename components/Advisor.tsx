import React from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { AdviceResponse } from '../types.js';

interface AdvisorProps {
  loading: boolean;
  advice: AdviceResponse | null;
  onAsk: () => void;
  disabled: boolean;
}

const Advisor: React.FC<AdvisorProps> = ({ loading, advice, onAsk, disabled }) => {
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm p-3 rounded-xl border border-white/5 shadow-lg w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Bot size={16} className="text-indigo-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">AI Strat</span>
        </div>
        {!advice && !loading && (
           <button
           onClick={onAsk}
           disabled={disabled}
           className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:opacity-50 text-white text-[10px] font-bold rounded transition-colors"
         >
           <Sparkles size={12} />
           <span>Advice</span>
         </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-indigo-300 animate-pulse py-1">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-[10px]">Analyzing...</span>
        </div>
      )}

      {advice && !loading && (
        <div className="bg-indigo-900/40 border border-indigo-500/20 rounded-lg p-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-black text-white">{advice.suggestion}</span>
            <button 
               onClick={onAsk} 
               className="text-[9px] text-indigo-400 hover:underline"
               disabled={disabled}
            >
              Refresh
            </button>
          </div>
          <p className="text-[9px] text-indigo-200 italic line-clamp-1">{advice.reasoning}</p>
        </div>
      )}
      
      {!advice && !loading && (
        <p className="text-[9px] text-gray-500 leading-none">
          Click Advice for Gemini 3 Flash insights.
        </p>
      )}
    </div>
  );
};

export default Advisor;
