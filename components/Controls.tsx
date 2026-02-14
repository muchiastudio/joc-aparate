import React, { useState } from 'react';
import { BET_LEVELS } from '../constants';
import { ChevronUp, ChevronDown, Sparkles, Coins, Maximize, Volume2, VolumeX, Info } from 'lucide-react';
import { SoundManager } from '../utils/audio';

interface ControlsProps {
  balance: number;
  bet: number;
  setBet: (amount: number) => void;
  spin: () => void;
  onGamble: () => void;
  spinning: boolean;
  lastWin: number;
  onFullScreen: () => void;
  onOpenPaytable: () => void;
}

const Controls: React.FC<ControlsProps> = ({ balance, bet, setBet, spin, onGamble, spinning, lastWin, onFullScreen, onOpenPaytable }) => {
  const [isMuted, setIsMuted] = useState(SoundManager.getMuted());
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

  const toggleSound = () => {
    const newState = SoundManager.toggleMute();
    setIsMuted(newState);
    if (!newState) {
        SoundManager.playClick();
    }
  };

  return (
    <div className="w-full border-t border-[#C8AA6E] bg-[#010A13]/90 backdrop-blur-xl p-2 md:p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] relative shrink-0">
      {/* Decorative Gold Border Top */}
      <div className="absolute top-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C8AA6E] to-transparent"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 max-w-6xl mx-auto">
        
        <div className="flex w-full md:w-auto justify-between items-center gap-4">
            {/* Profile / Balance Section */}
            <div className="flex items-center gap-2 md:gap-4 min-w-[140px]">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#C8AA6E] bg-[#1E2328] flex items-center justify-center">
                    <Coins className="text-[#C8AA6E]" size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[#A09B8C] text-[10px] md:text-xs font-bold tracking-wider uppercase">Sold</span>
                    <div className="text-xl md:text-2xl font-lol font-bold text-[#F0E6D2] drop-shadow-md leading-none">
                        {balance.toFixed(0)} <span className="text-[#0AC8B9] text-xs">RP</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                 {/* Mobile Utility Buttons */}
                 <button 
                    onClick={onOpenPaytable}
                    className="md:hidden w-10 h-10 flex items-center justify-center text-[#C8AA6E] border border-[#C8AA6E]/30 bg-[#1E2328] rounded hover:bg-[#C8AA6E]/10"
                 >
                    <Info size={20} />
                 </button>
                 <button 
                    onClick={toggleSound}
                    className="md:hidden w-10 h-10 flex items-center justify-center text-[#C8AA6E] border border-[#C8AA6E]/30 bg-[#1E2328] rounded hover:bg-[#C8AA6E]/10"
                 >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                 </button>
                 <button 
                    onClick={onFullScreen}
                    className="md:hidden w-10 h-10 flex items-center justify-center text-[#C8AA6E] border border-[#C8AA6E]/30 bg-[#1E2328] rounded hover:bg-[#C8AA6E]/10"
                 >
                    <Maximize size={20} />
                 </button>
            </div>
        </div>

        {/* Win Notification */}
        <div className="flex-1 flex justify-center h-12 md:h-16 items-center order-first md:order-none w-full border-b border-[#C8AA6E]/20 md:border-none pb-2 md:pb-0">
             {lastWin > 0 ? (
                <div className="flex flex-col items-center animate-bounce">
                    <span className="text-[#C8AA6E] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-1">VICTORIE</span>
                    <span className="text-4xl md:text-5xl font-lol font-black text-transparent bg-clip-text bg-gradient-to-b from-[#F0E6D2] to-[#C8AA6E] drop-shadow-[0_0_15px_rgba(200,170,110,0.6)]">
                        +{lastWin.toFixed(0)}
                    </span>
                </div>
             ) : (
                 <div className="text-[#5B5A56] font-lol text-xs md:text-sm tracking-widest uppercase block text-center">
                    {spinning ? "CLICK PENTRU STOP" : "FORJEAZĂ-ȚI DESTINUL"}
                 </div>
             )}
        </div>

        {/* Interactions */}
        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
            
            {/* Bet Input */}
            <div className="flex items-center bg-[#1E2328] border border-[#3C3C41] px-1 py-1 rounded">
                <button 
                    onClick={decreaseBet} 
                    disabled={spinning || currentBetIndex === 0}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[#C8AA6E] hover:bg-[#3C3C41] transition-colors disabled:opacity-30"
                >
                    <ChevronDown size={16} />
                </button>

                <div className="flex flex-col items-center w-16 md:w-24 border-l border-r border-[#3C3C41] px-1">
                    <span className="text-[8px] md:text-[9px] text-[#A09B8C] uppercase font-bold tracking-wider">Miză</span>
                    <span className="text-base md:text-lg font-bold font-lol text-[#F0E6D2]">{bet}</span>
                </div>

                <button 
                    onClick={increaseBet} 
                    disabled={spinning || currentBetIndex === BET_LEVELS.length - 1}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[#C8AA6E] hover:bg-[#3C3C41] transition-colors disabled:opacity-30"
                >
                    <ChevronUp size={16} />
                </button>
            </div>

            {/* Main Buttons */}
            <div className="flex gap-2 md:gap-4 flex-1 justify-end">
                {/* Desktop Utility Buttons */}
                <div className="hidden md:flex gap-2">
                     <button 
                        onClick={onOpenPaytable}
                        className="w-12 h-12 flex items-center justify-center text-[#C8AA6E] border border-[#C8AA6E]/30 bg-[#1E2328] hover:bg-[#C8AA6E]/10 transition-colors"
                        title="Tabel de Plăți"
                    >
                        <Info size={20} />
                    </button>

                     <button 
                        onClick={toggleSound}
                        className="w-12 h-12 flex items-center justify-center text-[#C8AA6E] border border-[#C8AA6E]/30 bg-[#1E2328] hover:bg-[#C8AA6E]/10 transition-colors"
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    <button 
                        onClick={onFullScreen}
                        className="w-12 h-12 flex items-center justify-center text-[#C8AA6E] border border-[#C8AA6E]/30 bg-[#1E2328] hover:bg-[#C8AA6E]/10 transition-colors"
                        title="Full Screen"
                    >
                        <Maximize size={20} />
                    </button>
                </div>

                {/* Gamble Button */}
                <button 
                    onClick={onGamble}
                    disabled={spinning || lastWin <= 0}
                    className={`
                        px-3 md:px-6 h-12 border border-[#C8AA6E] font-lol font-bold text-xs md:text-sm uppercase tracking-wider transition-all
                        flex items-center justify-center gap-2
                        ${lastWin > 0 
                            ? 'bg-[#C8AA6E]/10 text-[#C8AA6E] hover:bg-[#C8AA6E] hover:text-[#010A13] hover:shadow-[0_0_15px_#C8AA6E]' 
                            : 'bg-transparent text-[#5B5A56] border-[#3C3C41] cursor-not-allowed'}
                    `}
                >
                    <Sparkles size={16} className="hidden md:block"/>
                    Riscă
                </button>

                {/* Spin Button */}
                <button
                    onClick={spin}
                    disabled={!spinning && balance < bet}
                    className={`
                        btn-hex relative h-12 w-28 md:w-36 font-lol font-bold text-base md:text-lg uppercase tracking-wider transition-all
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