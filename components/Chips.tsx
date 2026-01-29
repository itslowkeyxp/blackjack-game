import React from 'react';

interface ChipsProps {
  onBet: (amount: number) => void;
  disabled: boolean;
  balance: number;
}

const chipValues = [10, 25, 50, 100, 500];
const chipColors: Record<number, string> = {
  10: 'bg-red-600 border-white',
  25: 'bg-green-600 border-white',
  50: 'bg-blue-600 border-white',
  100: 'bg-black border-yellow-500 text-yellow-500',
  500: 'bg-purple-800 border-yellow-200 text-yellow-200'
};

const Chips: React.FC<ChipsProps> = ({ onBet, disabled, balance }) => {
  return (
    <div className="flex gap-2 md:gap-4 justify-center items-center py-2">
      {chipValues.map((val) => (
        <button
          key={val}
          onClick={() => onBet(val)}
          disabled={disabled || balance < val}
          className={`
            relative w-11 h-11 md:w-14 md:h-14 rounded-full border-4 border-dashed flex items-center justify-center font-bold text-xs md:text-sm transition-all transform
            ${chipColors[val]}
            ${disabled || balance < val ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:scale-110 active:scale-90 shadow-lg cursor-pointer'}
          `}
        >
          <div className="absolute inset-1 rounded-full border-2 border-white/10 pointer-events-none"></div>
          ${val}
        </button>
      ))}
    </div>
  );
};

export default Chips;