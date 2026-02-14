import React, { useState } from 'react';
import { BET_LEVELS } from '../constants';
import { ChevronUp, ChevronDown, Coins, Maximize, Volume2, VolumeX, Info, Repeat, StopCircle, Sparkles } from 'lucide-react';
import { SoundManager } from '../utils/audio';

interface ControlsProps {
  balance: number;
  bet: number;
  setBet: (amount: number) => void;
  spin: () => void;
  onGamble: () => void; // Restored
  spinning: boolean;
  lastWin: number;
  onFullScreen: () => void;
  onOpenPaytable: () => void;
  onOpenAutoplay: () => void;
  onStopAutoplay: () => void;
  cooldown?: boolean;
  isGambling?: boolean; // Restored
  isAutoplayActive?: boolean;
  autoplayCount?: number;
  freeSpinsLeft: number;
}

const Controls: React.FC<ControlsProps> = ({ 
    balance, bet, setBet, spin, onGamble, spinning, lastWin, 
    onFullScreen, onOpenPaytable, onOpenAutoplay, onStopAutoplay,
    cooldown = false, isGambling = false, isAutoplayActive = false, autoplayCount = 0,
    freeSpinsLeft = 0
}) => {
  const [isMuted, setIsMuted] = useState(SoundManager.getMuted());
  const currentBetIndex = BET_LEVELS.indexOf(bet);
  
  // Lock controls if spinning, in cooldown, OR autoplay is running
  const isLocked = spinning || cooldown || isAutoplayActive || freeSpinsLeft > 0;

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
    <div className={`w-full border-t ${freeSpinsLeft > 0 ? 'border-[#D13639] bg-[#1a0505]' : 'border-[#C8AA6E] bg-[#010A13]'} p-2 md:p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] relative shrink-0 z-50 transition-all duration-300`}>
      {/* Decorative Border Top */}
      <div className={`absolute top-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${freeSpinsLeft > 0 ? 'via-[#D13639]' : 'via-[#C8AA6E]'} to-transparent`}></div>

      {/* Main Flex Container */}
      <div className="flex flex-col md:flex-row landscape:flex-row items-center justify-between gap-3 md:gap-2 landscape:gap-2 max-w-7xl mx-auto h-auto md:h-20 landscape:h-auto">
        
        {/* ROW 1 Mobile / LEFT Desktop: Balance & Mobile Utils */}
        <div className="flex items-center justify-between md:justify-start landscape:justify-start w-full md:w-auto landscape:w-auto gap-2 md:gap-6 landscape:gap-2">
            
            {/* Balance Display */}
            <div className="flex items-center gap-2 md:gap-3 bg-[#1E2328] px-3 py-1.5 md:py-2 rounded border border-[#3C3C41] min-w-[120px] md:min-w-[180px] landscape:min-w-[140px]">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-[#C8AA6E] bg-black flex items-center justify-center shrink-0">
                    <Coins className="text-[#C8AA6E]" size={16} />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[#A09B8C] text-[9px] md:text-[10px] font-bold tracking-wider uppercase truncate">Sold</span>
                    <div className="text-lg md:text-2xl font-lol font-bold text-[#F0E6D2] leading-none truncate">
                        {balance.toFixed(0)}
                    </div>
                </div>
            </div>

            {/* Mobile Utils */}
            <div className="flex gap-2 md:hidden">
                 <button onClick={toggleSound} className="w-9 h-9 flex items-center justify-center text-[#C8AA6E] border border-[#3C3C41] bg-[#1E2328] rounded active:bg-[#C8AA6E]/20">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                 </button>
                 <button onClick={onOpenPaytable} disabled={isLocked || isGambling} className="w-9 h-9 flex items-center justify-center text-[#C8AA6E] border border-[#3C3C41] bg-[#1E2328] rounded disabled:opacity-50 active:bg-[#C8AA6E]/20">
                    <Info size={18} />
                 </button>
                 <button onClick={onFullScreen} className="w-9 h-9 flex items-center justify-center text-[#C8AA6E] border border-[#3C3C41] bg-[#1E2328] rounded active:bg-[#C8AA6E]/20">
                    <Maximize size={18} />
                 </button>
            </div>
        </div>

        {/* CENTER: Win/Free Spin Notification */}
        <div className="hidden md:flex flex-col items-center justify-center w-[200px] shrink-0 h-full mx-2 border-x border-white/5 bg-black/20">
             {freeSpinsLeft > 0 ? (
                 <div className="flex flex-col items-center animate-pulse">
                    <span className="text-[#D13639] text-xs font-bold tracking-[0.2em] uppercase">ROTIRI GRATUITE</span>
                    <span className="text-4xl font-lol font-black text-[#D13639] drop-shadow-[0_0_15px_#D13639]">
                        {freeSpinsLeft}
                    </span>
                </div>
             ) : isAutoplayActive ? (
                <div className="flex flex-col items-center">
                    <span className="text-[#0AC8B9] text-xs font-bold tracking-[0.2em] uppercase animate-pulse">AUTOPLAY</span>
                    <span className="text-3xl font-lol font-black text-[#F0E6D2]">
                        {autoplayCount}
                    </span>
                </div>
             ) : (lastWin > 0 || isGambling) ? (
                <div className="flex flex-col items-center animate-bounce">
                    <span className="text-[#C8AA6E] text-xs font-bold tracking-[0.2em] uppercase">CÂȘTIG</span>
                    <span className="text-3xl font-lol font-black text-[#F0E6D2] drop-shadow-[0_0_10px_#C8AA6E]">
                        {lastWin.toFixed(0)}
                    </span>
                </div>
             ) : (
                 <div className="text-[#5B5A56] font-lol text-sm tracking-widest uppercase text-center opacity-50">
                    {spinning ? "NOROC BUN" : "JOACĂ ACUM"}
                 </div>
             )}
        </div>

        {/* ROW 2 Mobile / RIGHT Desktop: Controls & Play */}
        <div className="flex items-center justify-between md:justify-end landscape:justify-end w-full md:w-auto landscape:w-auto gap-2 md:gap-4 landscape:gap-2">
            
            {/* Bet Selector */}
            <div className={`flex items-center bg-[#1E2328] border ${freeSpinsLeft > 0 ? 'border-[#D13639] opacity-70' : 'border-[#3C3C41]'} rounded h-10 md:h-12 shrink-0`}>
                <button 
                    onClick={decreaseBet} 
                    disabled={isLocked || currentBetIndex === 0 || isGambling}
                    className="w-8 md:w-10 h-full flex items-center justify-center text-[#C8AA6E] hover:bg-white/5 disabled:opacity-30 active:scale-95 transition-transform"
                >
                    <ChevronDown size={16} />
                </button>

                <div className="flex flex-col items-center justify-center w-12 md:w-20 border-x border-[#3C3C41] h-full px-1">
                    <span className="text-[8px] text-[#A09B8C] uppercase font-bold">Miză</span>
                    <span className="text-sm md:text-lg font-bold text-[#F0E6D2] leading-none">{bet}</span>
                </div>

                <button 
                    onClick={increaseBet} 
                    disabled={isLocked || currentBetIndex === BET_LEVELS.length - 1 || isGambling}
                    className="w-8 md:w-10 h-full flex items-center justify-center text-[#C8AA6E] hover:bg-white/5 disabled:opacity-30 active:scale-95 transition-transform"
                >
                    <ChevronUp size={16} />
                </button>
            </div>

            {/* Buttons Group */}
            <div className="flex items-center gap-2 flex-1 justify-end md:flex-none landscape:flex-none">
                
                {/* Desktop Utils */}
                <div className="hidden md:flex gap-2">
                    <button onClick={onOpenPaytable} disabled={isLocked || isGambling} className="w-12 h-12 border border-[#C8AA6E]/30 bg-[#1E2328] flex items-center justify-center text-[#C8AA6E] hover:bg-[#C8AA6E]/10 transition-colors">
                        <Info size={20} />
                    </button>
                    <button onClick={toggleSound} className="w-12 h-12 border border-[#C8AA6E]/30 bg-[#1E2328] flex items-center justify-center text-[#C8AA6E] hover:bg-[#C8AA6E]/10 transition-colors">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button onClick={onFullScreen} className="w-12 h-12 border border-[#C8AA6E]/30 bg-[#1E2328] flex items-center justify-center text-[#C8AA6E] hover:bg-[#C8AA6E]/10 transition-colors">
                        <Maximize size={20} />
                    </button>
                </div>

                {/* Autoplay Button */}
                {isAutoplayActive ? (
                    <button 
                        onClick={onStopAutoplay}
                        className="h-10 md:h-12 w-10 md:w-12 border border-[#D13639] bg-[#D13639]/20 flex items-center justify-center text-[#D13639] hover:bg-[#D13639]/40 active:scale-95 transition-all animate-pulse shrink-0"
                    >
                        <StopCircle size={20} fill="currentColor" />
                    </button>
                ) : (
                    <button 
                        onClick={onOpenAutoplay}
                        disabled={isLocked || isGambling}
                        className="h-10 md:h-12 w-10 md:w-12 border border-[#0AC8B9] bg-[#1E2328] flex items-center justify-center text-[#0AC8B9] hover:bg-[#0AC8B9]/20 active:scale-95 transition-all disabled:opacity-30 disabled:border-[#3C3C41] shrink-0"
                    >
                        <Repeat size={20} />
                    </button>
                )}

                {/* Gamble Button - RESTORED */}
                <button 
                    onClick={onGamble}
                    disabled={isLocked || lastWin <= 0 || isGambling}
                    className={`
                        h-10 md:h-12 px-2 md:px-4 border font-bold text-xs md:text-sm uppercase tracking-wider transition-all
                        flex items-center justify-center gap-1 shrink-0
                        ${lastWin > 0 && !isLocked && !isGambling
                            ? 'border-[#C8AA6E] bg-[#C8AA6E]/10 text-[#C8AA6E] animate-pulse shadow-[0_0_10px_#C8AA6E]' 
                            : 'border-[#3C3C41] text-[#5B5A56] opacity-50'}
                        ${freeSpinsLeft > 0 ? 'hidden' : ''} 
                    `}
                >
                    <Sparkles size={14} />
                    <span className="hidden sm:inline landscape:hidden lg:landscape:inline ml-1">RISCĂ</span>
                </button>

                {/* SPIN / COLLECT Button */}
                <button
                    onClick={spin}
                    disabled={(!spinning && balance < bet && !freeSpinsLeft && !isGambling) || cooldown || isAutoplayActive}
                    className={`
                        h-10 md:h-12 min-w-[80px] md:min-w-[120px] w-28 md:w-40 font-lol font-black text-sm md:text-xl uppercase tracking-wider transition-all
                        flex items-center justify-center shadow-lg active:scale-95 shrink-0
                        ${cooldown 
                            ? 'bg-[#1E2328] border-2 border-[#5B5A56] text-[#5B5A56] cursor-not-allowed'
                            : isGambling 
                                ? 'bg-[#0AC8B9] border-2 border-[#0AC8B9] text-black hover:bg-[#A0E6E1] animate-pulse' // Collect Mode
                                : freeSpinsLeft > 0
                                    ? 'bg-[#D13639] border-2 border-[#ff4d4d] text-[#010A13] hover:brightness-110 animate-pulse shadow-[0_0_20px_#D13639]'
                                    : !spinning && balance < bet 
                                        ? 'bg-[#D13639]/20 border-2 border-[#D13639] text-[#D13639]' 
                                        : spinning || isAutoplayActive
                                            ? 'bg-[#C8AA6E]/10 border-2 border-[#C8AA6E] text-[#C8AA6E]'
                                            : 'bg-gradient-to-b from-[#C8AA6E] to-[#A08855] border-2 border-[#F0E6D2] text-[#010A13] hover:brightness-110 shadow-[0_0_15px_rgba(200,170,110,0.4)]'}
                    `}
                >
                    {spinning || isAutoplayActive ? 'STOP' : (
                        isGambling ? 'COLECT' : (
                            freeSpinsLeft > 0 ? (
                                <div className="flex flex-col items-center leading-none">
                                    <span className="text-[10px] md:text-xs">FREE SPIN</span>
                                    <span>{freeSpinsLeft} LEFT</span>
                                </div>
                            ) : (lastWin > 0 ? 'COLECT' : 'START')
                        )
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;