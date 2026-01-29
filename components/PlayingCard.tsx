import React from 'react';
import { Card, Suit } from '../types.js';

interface PlayingCardProps {
  card: Card;
  className?: string;
  style?: React.CSSProperties;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card, className, style }) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  
  return (
    <div 
      className={`relative w-20 h-28 md:w-28 md:h-40 perspective-1000 card-enter ${className || ''}`}
      style={style}
    >
      <div className={`card-inner h-full w-full ${card.isHidden ? 'card-is-hidden' : ''}`}>
        
        {/* Front Face (Card Value) */}
        <div 
          className="card-face bg-white shadow-xl flex flex-col justify-between p-1.5 md:p-2.5 select-none border border-gray-200"
        >
          <div className={`text-sm md:text-xl font-black ${isRed ? 'text-red-600' : 'text-gray-900'} leading-none text-left`}>
            {card.rank}
            <div className="text-[10px] md:text-sm">{card.suit}</div>
          </div>
          
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl ${isRed ? 'text-red-600/80' : 'text-gray-900/80'}`}>
            {card.suit}
          </div>

          <div className={`text-sm md:text-xl font-black ${isRed ? 'text-red-600' : 'text-gray-900'} leading-none self-end transform rotate-180 text-left`}>
            {card.rank}
            <div className="text-[10px] md:text-sm">{card.suit}</div>
          </div>
        </div>

        {/* Back Face (Hidden Design) */}
        <div 
          className="card-face card-face-back bg-indigo-950 rounded-xl border-2 border-gold-500/50 shadow-2xl flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
          <div className="absolute inset-1.5 border border-gold-500/20 rounded-lg"></div>
          
          <div className="relative z-10 w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-gold-500/40 flex items-center justify-center bg-indigo-900 shadow-inner">
            <div className="text-gold-500 text-sm md:text-xl font-serif">B</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayingCard;