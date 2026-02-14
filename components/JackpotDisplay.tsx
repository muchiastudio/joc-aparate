import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface JackpotDisplayProps {
  amount: number;
}

const JackpotDisplay: React.FC<JackpotDisplayProps> = ({ amount }) => {
  const [displayAmount, setDisplayAmount] = useState(amount);

  // Smooth number transition effect
  useEffect(() => {
    let start = displayAmount;
    const end = amount;
    const diff = end - start;
    
    if (diff === 0) return;

    const duration = 500; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const ease = 1 - (1 - progress) * (1 - progress);
      
      const current = start + (diff * ease);
      setDisplayAmount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [amount]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-lg mx-auto mb-2 z-30">
        {/* Glow Effect Background */}
        <div className="absolute inset-0 bg-[#0AC8B9]/20 blur-xl rounded-full animate-pulse"></div>
        
        <div className="relative bg-[#010A13] border-x-4 border-[#0AC8B9] px-8 py-1 flex flex-col items-center shadow-[0_0_20px_#0AC8B9] clip-path-hex">
            <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-[#0AC8B9] animate-bounce" />
                <span className="text-[#0AC8B9] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">HEXTECH JACKPOT</span>
                <Zap size={16} className="text-[#0AC8B9] animate-bounce" />
            </div>
            
            <div className="text-2xl md:text-4xl font-lol font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff] to-[#0AC8B9] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {displayAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        </div>

        {/* Bottom decorative line */}
        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#0AC8B9] to-transparent mt-1"></div>
    </div>
  );
};

export default JackpotDisplay;