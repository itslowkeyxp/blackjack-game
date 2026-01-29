
import React from 'react';

interface BetStackProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md';
}

const CHIP_VALUES = [500, 100, 50, 25, 10];
const CHIP_COLORS: Record<number, string> = {
  10: 'bg-red-600 border-white',
  25: 'bg-green-600 border-white',
  50: 'bg-blue-600 border-white',
  100: 'bg-black border-yellow-500 text-yellow-500',
  500: 'bg-purple-800 border-yellow-200 text-yellow-200'
};

const BetStack: React.FC<BetStackProps> = ({ amount, className = '', size = 'md' }) => {
  if (amount <= 0) return null;

  const getChips = (val: number) => {
    let remaining = val;
    const chips: number[] = [];
    for (const chipVal of CHIP_VALUES) {
      const count = Math.floor(remaining / chipVal);
      for (let i = 0; i < count; i++) {
        chips.push(chipVal);
      }
      remaining %= chipVal;
    }
    return chips;
  };

  const chips = getChips(amount);
  const chipSize = size === 'sm' ? 'w-6 h-6 text-[8px]' : 'w-8 h-8 text-[10px]';

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative h-10 flex items-end justify-center">
        {chips.slice(0, 12).map((chipVal, idx) => (
          <div
            key={idx}
            className={`
              absolute rounded-full border-2 border-dashed flex items-center justify-center font-bold shadow-md transition-all
              ${CHIP_COLORS[chipVal]} ${chipSize}
            `}
            style={{
              bottom: `${idx * 3}px`,
              zIndex: idx,
              transform: `rotate(${idx * 5}deg)`
            }}
          >
            <div className="absolute inset-0.5 rounded-full border border-white/10"></div>
            {chipVal}
          </div>
        ))}
        {chips.length > 12 && (
          <div className="absolute -top-2 -right-4 bg-white text-black text-[8px] px-1 rounded-full font-black border border-black z-50">
            +{chips.length - 12}
          </div>
        )}
      </div>
      <div className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 text-[10px] font-black text-yellow-500 shadow-xl">
        ${amount}
      </div>
    </div>
  );
};

export default BetStack;
