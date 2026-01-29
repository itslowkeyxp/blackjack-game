
import React, { useState, useEffect, useCallback } from 'react';
import { Card, GameStatus, Winner, PlayerStats } from './types.js';
import { createDeck, shuffleDeck, calculateScore, isBlackjack } from './utils/gameLogic.js';
import PlayingCard from './components/PlayingCard.js';
import Chips from './components/Chips.js';
import StatsPanel from './components/StatsPanel.js';
import BetStack from './components/BetStack.js';
import { soundService } from './services/soundService.js';
import { Coins, RotateCcw, User, Briefcase, Trophy, AlertCircle, Scissors, Volume2, VolumeX } from 'lucide-react';

const INITIAL_STATS: PlayerStats = {
  wins: 0,
  losses: 0,
  pushes: 0,
  totalGames: 0,
  netProfit: 0,
  highestBalance: 1000,
};

const App: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<Card[][]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);
  const [handBets, setHandBets] = useState<number[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [balance, setBalance] = useState<number>(1000);
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.BETTING);
  const [handWinners, setHandWinners] = useState<Winner[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('blackjack_muted') === 'true');
  const [roundResultMessage, setRoundResultMessage] = useState<string | null>(null);

  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('blackjack_career_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  useEffect(() => {
    localStorage.setItem('blackjack_career_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    soundService.setMute(isMuted);
    localStorage.setItem('blackjack_muted', String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    if (balance > stats.highestBalance) {
      setStats(prev => ({ ...prev, highestBalance: balance }));
    }
  }, [balance, stats.highestBalance]);

  useEffect(() => {
    setDeck(shuffleDeck(createDeck()));
  }, []);

  const toggleMute = () => setIsMuted(!isMuted);

  const handleBet = (amount: number) => {
    if (isProcessing) return;
    if (balance >= amount && status === GameStatus.BETTING) {
      setCurrentBet(prev => prev + amount);
      setBalance(prev => prev - balance === amount ? 0 : balance - amount);
      soundService.play('chip');
    }
  };

  const finalizeRound = useCallback((dHand: Card[], pHands: Card[][]) => {
    const dScore = calculateScore(dHand);
    const dBlackjack = isBlackjack(dHand);
    
    const results: Winner[] = [];
    let totalPayout = 0;
    let netChange = 0;
    
    let roundWins = 0;
    let roundLosses = 0;
    let roundPushes = 0;

    pHands.forEach((pHand, idx) => {
      const pScore = calculateScore(pHand);
      const pBlackjack = isBlackjack(pHand);
      const bet = handBets[idx];
      let result = Winner.NONE;
      let payout = 0;

      if (pScore > 21) {
        result = Winner.DEALER;
        payout = 0;
      } else if (dScore > 21) {
        result = Winner.PLAYER;
        payout = pBlackjack ? Math.floor(bet * 2.5) : bet * 2;
      } else if (pScore > dScore) {
        result = Winner.PLAYER;
        payout = pBlackjack ? Math.floor(bet * 2.5) : bet * 2;
      } else if (dScore > pScore) {
        result = Winner.DEALER;
        payout = 0;
      } else {
        // Equal scores
        if (pBlackjack && !dBlackjack) {
          result = Winner.PLAYER;
          payout = Math.floor(bet * 2.5);
        } else if (!pBlackjack && dBlackjack) {
          result = Winner.DEALER;
          payout = 0;
        } else {
          result = Winner.PUSH;
          payout = bet;
        }
      }

      results.push(result);
      totalPayout += payout;
      netChange += (payout - bet);

      if (result === Winner.PLAYER) roundWins++;
      else if (result === Winner.DEALER) roundLosses++;
      else if (result === Winner.PUSH) roundPushes++;
    });

    setStats(prev => ({
      ...prev,
      wins: prev.wins + roundWins,
      losses: prev.losses + roundLosses,
      pushes: prev.pushes + roundPushes,
      netProfit: prev.netProfit + netChange
    }));

    if (netChange > 0) {
      soundService.play('win');
      setRoundResultMessage("YOU WON!");
    } else if (netChange < 0) {
      soundService.play('loss');
      setRoundResultMessage("DEALER WINS");
    } else {
      soundService.play('push');
      setRoundResultMessage("PUSH");
    }

    setHandWinners(results);
    setBalance(prev => prev + totalPayout);
    setStatus(GameStatus.GAME_OVER);
    setIsProcessing(false);
  }, [handBets]);

  // Fix: changed finalPlayerHands type from Card[] to Card[][] to match its usage as an array of hands and fix the calculateScore parameter error
  const startDealerTurn = useCallback(async (finalPlayerHands: Card[][]) => {
    setStatus(GameStatus.DEALER_TURN);
    setIsProcessing(true);
    
    const revealedDHand: Card[] = dealerHand.map(c => ({ ...c, isHidden: false }));
    setDealerHand(revealedDHand);
    soundService.play('deal');

    await new Promise(resolve => setTimeout(resolve, 800));

    const allBust = finalPlayerHands.every(hand => calculateScore(hand) > 21);
    
    let currentDHand = [...revealedDHand];
    let workingDeck = [...deck];

    if (!allBust) {
      while (calculateScore(currentDHand) < 17) {
        const newCard = workingDeck.pop()!;
        currentDHand = [...currentDHand, newCard];
        setDealerHand([...currentDHand]);
        soundService.play('deal');
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    setDeck(workingDeck);
    finalizeRound(currentDHand, finalPlayerHands);
  }, [dealerHand, deck, finalizeRound]);

  const handleStand = useCallback((currentHands = playerHands) => {
    if (status !== GameStatus.PLAYER_TURN || isProcessing) return;

    if (activeHandIndex < currentHands.length - 1) {
      setActiveHandIndex(prev => prev + 1);
      soundService.play('push');
    } else {
      startDealerTurn(currentHands);
    }
  }, [status, isProcessing, activeHandIndex, playerHands, startDealerTurn]);

  const deal = () => {
    if (currentBet === 0 || status !== GameStatus.BETTING || isProcessing) return;
    
    setIsProcessing(true);
    let currentDeck = [...deck];
    if (currentDeck.length < 15) {
      currentDeck = shuffleDeck(createDeck());
    }

    const p1 = currentDeck.pop()!;
    const d1 = currentDeck.pop()!;
    const p2 = currentDeck.pop()!;
    const d2: Card = { ...currentDeck.pop()!, isHidden: true };

    const initialPlayerHand = [p1, p2];
    const initialDealerHand = [d1, d2];

    setPlayerHands([initialPlayerHand]);
    setHandBets([currentBet]);
    setActiveHandIndex(0);
    setDealerHand(initialDealerHand);
    setDeck(currentDeck);
    setStatus(GameStatus.PLAYER_TURN);
    setHandWinners([]);
    setRoundResultMessage(null);
    
    soundService.play('deal');
    setStats(prev => ({ ...prev, totalGames: prev.totalGames + 1 }));

    if (calculateScore(initialPlayerHand) === 21) {
      // Delay to let cards animate in
      setTimeout(() => {
        const revealedDHand = initialDealerHand.map(c => ({ ...c, isHidden: false }));
        setDealerHand(revealedDHand);
        finalizeRound(revealedDHand, [initialPlayerHand]);
      }, 1000);
    } else {
      setIsProcessing(false);
    }
  };

  const handleHit = () => {
    if (status !== GameStatus.PLAYER_TURN || isProcessing) return;
    
    setIsProcessing(true);
    const currentDeck = [...deck];
    const newCard = currentDeck.pop()!;
    const newHands = [...playerHands];
    newHands[activeHandIndex] = [...newHands[activeHandIndex], newCard];
    
    setPlayerHands(newHands);
    setDeck(currentDeck);
    soundService.play('deal');

    const newScore = calculateScore(newHands[activeHandIndex]);
    if (newScore >= 21) {
      setTimeout(() => {
        setIsProcessing(false);
        handleStand(newHands);
      }, 600);
    } else {
      setIsProcessing(false);
    }
  };

  const handleSplit = () => {
    if (status !== GameStatus.PLAYER_TURN || isProcessing) return;
    const currentHand = playerHands[0];
    const bet = handBets[0];
    if (playerHands.length > 1 || currentHand.length !== 2 || balance < bet) return;

    setIsProcessing(true);
    const currentDeck = [...deck];
    const card1_2 = currentDeck.pop()!;
    const card2_2 = currentDeck.pop()!;

    setBalance(prev => prev - bet);
    setHandBets([bet, bet]);
    const splitHands = [
      [currentHand[0], card1_2],
      [currentHand[1], card2_2]
    ];
    setPlayerHands(splitHands);
    setActiveHandIndex(0);
    setDeck(currentDeck);
    soundService.play('deal');
    
    setTimeout(() => {
      setIsProcessing(false);
      if (calculateScore(splitHands[0]) === 21) {
        setActiveHandIndex(1);
      }
    }, 600);
  };

  const handleDoubleDown = () => {
    if (status !== GameStatus.PLAYER_TURN || isProcessing) return;
    const bet = handBets[activeHandIndex];
    if (balance < bet || playerHands[activeHandIndex].length !== 2) return;
    
    setIsProcessing(true);
    setBalance(prev => prev - bet);
    const newBets = [...handBets];
    newBets[activeHandIndex] = bet * 2;
    setHandBets(newBets);
    
    const currentDeck = [...deck];
    const newCard = currentDeck.pop()!;
    const newHands = [...playerHands];
    newHands[activeHandIndex] = [...newHands[activeHandIndex], newCard];
    
    setPlayerHands(newHands);
    setDeck(currentDeck);
    soundService.play('chip');
    soundService.play('deal');
    
    setTimeout(() => {
      setIsProcessing(false);
      handleStand(newHands);
    }, 1000);
  };

  const resetGame = () => {
    if (isProcessing) return;
    setPlayerHands([]);
    setHandBets([]);
    setActiveHandIndex(0);
    setDealerHand([]);
    setCurrentBet(0);
    setHandWinners([]);
    setRoundResultMessage(null);
    setStatus(GameStatus.BETTING);
    soundService.play('push');
  };

  const resetCareer = () => {
    if (confirm("Reset your career statistics?")) {
      setStats(INITIAL_STATS);
      setBalance(1000);
      soundService.play('loss');
    }
  };

  const refillBalance = () => {
    setBalance(1000);
    soundService.play('win');
  };

  const canSplit = status === GameStatus.PLAYER_TURN && 
    !isProcessing &&
    playerHands.length === 1 && 
    playerHands[0].length === 2 && 
    playerHands[0][0].rank === playerHands[0][1].rank &&
    balance >= handBets[0];

  return (
    <div className="h-screen bg-gray-950 flex flex-col items-center p-2 md:p-4 overflow-hidden">
      {/* Header Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-1">
        <h1 className="font-serif text-lg md:text-2xl text-amber-500 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          Blackjack Pro
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute} 
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div className="bg-gray-800 px-3 py-1 rounded-lg border border-white/5 flex items-center gap-2">
            <Coins size={14} className="text-yellow-500" />
            <span className="font-bold text-white text-sm md:text-base">${balance}</span>
          </div>
          {balance < 10 && status === GameStatus.BETTING && currentBet === 0 && (
            <button onClick={refillBalance} className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded font-bold transition-colors">
              REFILL
            </button>
          )}
        </div>
      </div>

      <StatsPanel stats={stats} onReset={resetCareer} />

      {/* Main Table Area */}
      <div className="flex-1 w-full max-w-5xl relative flex flex-col justify-between items-center py-2 px-4 rounded-[32px] md:rounded-[40px] bg-emerald-900 border-[6px] md:border-[8px] border-emerald-950 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Dealer Area */}
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-1.5 mb-1 text-white/30 uppercase text-[8px] tracking-widest font-black">
            <Briefcase size={10} /> Dealer 
            {dealerHand.length > 0 && (
              <span className="bg-black/40 text-white px-2 rounded text-[9px]">
                {calculateScore(dealerHand)}
              </span>
            )}
          </div>
          <div className="flex justify-center h-24 md:h-36 w-full relative">
            {dealerHand.length > 0 ? (
              dealerHand.map((card, idx) => (
                <PlayingCard 
                  key={`${idx}-${card.rank}-${card.suit}`} 
                  card={card} 
                  className="scale-90 md:scale-100"
                  style={{ marginLeft: idx > 0 ? '-35px' : '0', zIndex: idx }}
                />
              ))
            ) : (
              <div className="w-16 h-24 md:w-28 md:h-36 border-2 border-white/5 rounded-lg border-dashed"></div>
            )}
          </div>
        </div>

        {/* Mid-Section Overlay */}
        <div className="flex flex-col items-center justify-center w-full z-20 min-h-[80px] relative">
          {status === GameStatus.DEALER_TURN || (isProcessing && status === GameStatus.PLAYER_TURN) ? (
            <div className="flex items-center gap-2 text-white/60 font-black text-xs uppercase tracking-widest animate-pulse">
              <RotateCcw className="animate-spin" size={14} /> Dealer's Turn
            </div>
          ) : status === GameStatus.BETTING && currentBet > 0 ? (
            <div className="flex flex-col items-center gap-2">
               <BetStack amount={currentBet} size="sm" className="animate-in fade-in zoom-in" />
               <button 
                onClick={deal} 
                disabled={isProcessing}
                className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-2 rounded-full font-black text-base transition-all shadow-xl active:scale-95 border-b-4 border-amber-700 uppercase disabled:opacity-50"
              >
                DEAL
              </button>
            </div>
          ) : status === GameStatus.PLAYER_TURN ? (
             <div className="text-white/20 font-black text-[10px] tracking-[0.2em] uppercase">
               Decision Phase
             </div>
          ) : status === GameStatus.GAME_OVER && roundResultMessage ? (
            <div className="flex flex-col items-center animate-splash">
               <div className={`text-4xl md:text-6xl font-black italic tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${
                 roundResultMessage.includes("WON") ? 'text-white' : 
                 roundResultMessage.includes("DEALER") ? 'text-red-500' : 'text-amber-400'
               }`}>
                 {roundResultMessage}
               </div>
            </div>
          ) : null}
        </div>

        {/* Player Area */}
        <div className={`flex w-full justify-center gap-2 md:gap-12 ${playerHands.length > 1 ? 'scale-75 md:scale-100' : ''}`}>
          {playerHands.length > 0 ? (
            playerHands.map((hand, hIdx) => {
              const isActive = status === GameStatus.PLAYER_TURN && hIdx === activeHandIndex;
              const result = handWinners[hIdx];
              const handScore = calculateScore(hand);

              return (
                <div key={hIdx} className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : playerHands.length > 1 ? 'opacity-60 scale-90' : ''}`}>
                  <div className={`relative flex justify-center h-24 md:h-36 mb-1 min-w-[120px] p-1.5 rounded-2xl transition-all ${isActive ? 'ring-2 ring-amber-400 bg-emerald-800/20' : ''}`}>
                    {hand.map((card, cIdx) => (
                      <PlayingCard 
                        key={`${hIdx}-${cIdx}-${card.rank}-${card.suit}`} 
                        card={card} 
                        className="scale-90 md:scale-100"
                        style={{ marginLeft: cIdx > 0 ? '-35px' : '0', zIndex: cIdx }}
                      />
                    ))}
                    
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20">
                      <BetStack amount={handBets[hIdx]} size="sm" />
                    </div>

                    {result && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-in fade-in zoom-in duration-300">
                        <div className={`px-3 py-1 rounded-full font-black text-[10px] uppercase shadow-2xl border ${
                          result === Winner.PLAYER ? 'bg-white text-emerald-700 border-emerald-500' : 
                          result === Winner.DEALER ? 'bg-red-600 text-white border-white/50' : 
                          'bg-gray-400 text-black border-black/20'
                        }`}>
                          {result === Winner.PLAYER ? 'WIN' : result === Winner.DEALER ? 'LOSE' : 'PUSH'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex items-center gap-1.5 text-white/30 uppercase text-[8px] tracking-widest font-black">
                    <User size={10} className={isActive ? 'text-amber-400' : ''} /> 
                    {playerHands.length > 1 ? `Hand ${hIdx + 1}` : 'Player'}
                    <span className={`px-1.5 rounded text-[10px] py-0.5 ${isActive ? 'bg-amber-400 text-emerald-950 font-black' : 'bg-white/5 text-white/60'}`}>
                      {handScore}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-24 md:w-28 md:h-36 border-2 border-white/5 rounded-lg border-dashed mb-1"></div>
              <div className="text-white/10 text-[8px] uppercase font-black tracking-widest">Awaiting Stake</div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="w-full max-w-5xl mt-2 flex flex-col items-center gap-2">
        {status === GameStatus.BETTING ? (
          <div className="w-full bg-gray-900/40 backdrop-blur border border-white/5 p-2 rounded-2xl flex flex-col items-center">
             <div className="flex items-center gap-2 text-[10px] font-black text-amber-200 uppercase tracking-tighter mb-1">
               <AlertCircle size={10} /> Current Bet: ${currentBet}
               {currentBet > 0 && (
                 <button onClick={() => { setBalance(b => b + currentBet); setCurrentBet(0); soundService.play('push'); }} disabled={isProcessing} className="ml-2 text-red-500 underline">Clear</button>
               )}
             </div>
             <Chips onBet={handleBet} disabled={isProcessing} balance={balance} />
          </div>
        ) : status === GameStatus.PLAYER_TURN ? (
          <div className="w-full grid grid-cols-4 gap-2 px-1">
            <button onClick={handleHit} disabled={isProcessing} className="py-2.5 bg-white text-black rounded-xl font-black text-sm md:text-lg hover:bg-gray-100 active:scale-95 shadow-lg uppercase disabled:opacity-50">
              Hit
            </button>
            <button onClick={() => handleStand()} disabled={isProcessing} className="py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm md:text-lg hover:bg-indigo-500 active:scale-95 shadow-lg uppercase disabled:opacity-50">
              Stand
            </button>
            <button 
              onClick={handleDoubleDown} 
              disabled={isProcessing || playerHands[activeHandIndex].length !== 2 || balance < handBets[activeHandIndex]} 
              className="py-2.5 bg-orange-600 disabled:opacity-40 text-white rounded-xl font-black text-sm md:text-lg hover:bg-orange-500 active:scale-95 shadow-lg uppercase"
            >
              Double
            </button>
            <button 
              onClick={handleSplit} 
              disabled={!canSplit} 
              className={`py-2.5 bg-amber-500 text-black rounded-xl font-black text-sm md:text-lg flex flex-col items-center justify-center shadow-lg transition-all
                ${!canSplit ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-amber-400 active:scale-95 ring-2 ring-amber-300 animate-pulse'}`}
            >
              <div className="flex items-center gap-1 uppercase"><Scissors size={12} /> Split</div>
            </button>
          </div>
        ) : (
          <button 
            onClick={resetGame} 
            disabled={isProcessing} 
            className="w-full max-w-sm py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-black text-base md:text-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-xl border-b-4 border-amber-700 uppercase animate-in fade-in duration-700"
          >
            <RotateCcw size={18} /> Next Round
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
