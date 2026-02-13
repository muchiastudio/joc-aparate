import React from 'react';
import { BET_LEVELS } from '../constants';
import { ChevronUp, ChevronDown, Sparkles, Coins, Play } from 'lucide-react';
import { SoundManager } from '../utils/audio';

interface ControlsProps {
  balance: number;
  bet: number;
  setBet: (amount: number) => void;
  spin: () => void;
  onGamble: () => void;
  spinning: boolean;
  lastWin: number;
}

const Controls: React.FC<ControlsProps> = ({ balance, bet, setBet, spin, onGamble, spinning, lastWin }) => {
  const currentBetIndex = BET_LEVELS.indexOf(bet);

  const increaseBet = () => {
    SoundManager.playClick();
    if (currentBetIndex < BET_LEVELS.length - 1) {
      setBet(BET_LEVELS[currentBetIndex + 1]);
    }
  };

  const decreaseBet = () => {
    SoundManager.playClick();
    if (currentBetIndex > 0) {
      setBet(BET_LEVELS[currentBetIndex - 1]);
    }
  };

  return (
    <div className="w-full border-t border-[#C8AA6E] bg-[#010A13]/90 backdrop-blur-xl p-4 md:p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] relative">
      {/* Decorative Gold Border Top */}
      <div className="absolute top-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C8AA6E] to-transparent"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
        
        {/* Profile / Balance Section */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="w-12 h-12 rounded-full border-2 border-[#C8AA6E] bg-[#1E2328] flex items-center justify-center">
             <Coins className="text-[#C8AA6E]" size={24} />
          </div>
          <div className="flex flex-col">
             <span className="text-[#A09B8C] text-xs font-bold tracking-wider uppercase">Sold Curent</span>
             <div className="text-2xl font-lol font-bold text-[#F0E6D2] drop-shadow-md">
                {balance.toFixed(0)} <span className="text-[#0AC8B9] text-sm">RP</span>
             </div>
          </div>
        </div>

        {/* Win Notification - "Victory" style */}
        <div className="flex-1 flex justify-center h-16 items-center">
             {lastWin > 0 ? (
                <div className="flex flex-col items-center animate-bounce">
                    <span className="text-[#C8AA6E] text-xs font-bold tracking-[0.3em] uppercase mb-1">VICTORIE</span>
                    <span className="text-5xl font-lol font-black text-transparent bg-clip-text bg-gradient-to-b from-[#F0E6D2] to-[#C8AA6E] drop-shadow-[0_0_15px_rgba(200,170,110,0.6)]">
                        +{lastWin.toFixed(0)}
                    </span>
                </div>
             ) : (
                 <div className="text-[#5B5A56] font-lol text-sm tracking-widest uppercase hidden md:block border-b border-transparent pb-1">
                    {spinning ? "CLICK PENTRU STOP" : "FORJEAZĂ-ȚI DESTINUL"}
                 </div>
             )}
        </div>

        {/* Interactions */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            
            {/* Bet Input */}
            <div className="flex items-center bg-[#1E2328] border border-[#3C3C41] px-1 py-1">
                <button 
                    onClick={decreaseBet} 
                    disabled={spinning || currentBetIndex === 0}
                    className="w-8 h-8 flex items-center justify-center text-[#C8AA6E] hover:bg-[#3C3C41] transition-colors disabled:opacity-30"
                >
                    <ChevronDown size={16} />
                </button>

                <div className="flex flex-col items-center w-24 border-l border-r border-[#3C3C41] px-2">
                    <span className="text-[9px] text-[#A09B8C] uppercase font-bold tracking-wider">Miză</span>
                    <span className="text-lg font-bold font-lol text-[#F0E6D2]">{bet}</span>
                </div>

                <button 
                    onClick={increaseBet} 
                    disabled={spinning || currentBetIndex === BET_LEVELS.length - 1}
                    className="w-8 h-8 flex items-center justify-center text-[#C8AA6E] hover:bg-[#3C3C41] transition-colors disabled:opacity-30"
                >
                    <ChevronUp size={16} />
                </button>
            </div>

            {/* Main Buttons */}
            <div className="flex gap-4">
                {/* Gamble Button */}
                <button 
                    onClick={onGamble}
                    disabled={spinning || lastWin <= 0}
                    className={`
                        px-6 h-12 border border-[#C8AA6E] font-lol font-bold text-sm uppercase tracking-wider transition-all
                        flex items-center gap-2
                        ${lastWin > 0 
                            ? 'bg-[#C8AA6E]/10 text-[#C8AA6E] hover:bg-[#C8AA6E] hover:text-[#010A13] hover:shadow-[0_0_15px_#C8AA6E]' 
                            : 'bg-transparent text-[#5B5A56] border-[#3C3C41] cursor-not-allowed'}
                    `}
                >
                    <Sparkles size={16} />
                    Riscă
                </button>

                {/* Spin Button - "Find Match" style */}
                <button
                    onClick={spin}
                    // Button is disabled ONLY if balance is low AND we are not currently spinning.
                    // If we ARE spinning, button is enabled to allow Stop.
                    disabled={!spinning && balance < bet}
                    className={`
                        btn-hex relative h-12 w-36 font-lol font-bold text-lg uppercase tracking-wider transition-all
                        flex items-center justify-center gap-2
                        ${!spinning && balance < bet 
                                ? 'bg-[#D13639]/20 border-2 border-[#D13639] text-[#D13639]' 
                                : spinning
                                    ? 'bg-[#1E2328] border-2 border-[#C8AA6E] text-[#C8AA6E] shadow-[0_0_15px_#C8AA6E/30] hover:bg-[#C8AA6E]/20'
                                    : 'bg-[#1E2328] border-2 border-[#0AC8B9] text-[#0AC8B9] hover:bg-[#0AC8B9] hover:text-[#010A13] hover:shadow-[0_0_20px_#0AC8B9]'}
                    `}
                >
                    {spinning ? 'STOP' : (lastWin > 0 ? 'COLECT' : 'JOACĂ')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;