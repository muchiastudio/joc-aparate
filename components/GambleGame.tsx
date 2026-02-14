import React, { useState, useEffect } from 'react';
import { Sword, Shield } from 'lucide-react';
import { SoundManager } from '../utils/audio';

interface GambleGameProps {
  amount: number;
  onDouble: () => void;
  onLose: () => void;
  onCollect: () => void;
}

const GambleGame: React.FC<GambleGameProps> = ({ amount, onDouble, onLose, onCollect }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [resultColor, setResultColor] = useState<'red' | 'blue'>('red'); 
  const [isFlipping, setIsFlipping] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'win' | 'lose'>('none');

  useEffect(() => {
    // Generate fake history
    const fakeHistory = Array(5).fill(null).map(() => Math.random() > 0.5 ? 'red' : 'blue');
    setHistory(fakeHistory);
  }, []);

  const handleGuess = (choice: 'red' | 'blue') => {
    if (isFlipping) return;
    SoundManager.playClick();
    setIsFlipping(true);
    setFeedback('none');

    let shuffleCount = 0;
    const interval = setInterval(() => {
      setResultColor(Math.random() > 0.5 ? 'red' : 'blue');
      SoundManager.playClick(); 
      shuffleCount++;
      if (shuffleCount > 10) {
        clearInterval(interval);
        finalizeGuess(choice);
      }
    }, 50);
  };

  const finalizeGuess = (userChoice: 'red' | 'blue') => {
    const finalResult = Math.random() > 0.5 ? 'red' : 'blue';
    setResultColor(finalResult);
    setIsFlipping(false);

    setHistory(prev => [...prev.slice(1), finalResult]);

    if (finalResult === userChoice) {
      setFeedback('win');
      setTimeout(() => {
        onDouble();
        setFeedback('none');
      }, 800);
    } else {
      setFeedback('lose');
      setTimeout(onLose, 1000);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#010A13]/98 backdrop-blur-xl">
      
      {/* Header Info - Clearly distinct between what you have and what you might get */}
      <div className="flex justify-center gap-4 md:gap-8 w-full max-w-lg mb-4 md:mb-8 relative z-10 px-4">
        <div className="flex flex-col items-center">
            <div className="text-[#A09B8C] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1">Câștig Curent</div>
            <div className="text-[#C8AA6E] font-bold text-2xl md:text-3xl drop-shadow-[0_0_10px_#C8AA6E] font-lol">
                {amount.toFixed(0)}
            </div>
        </div>

        <div className="w-px bg-[#C8AA6E]/30 h-10 md:h-12"></div>

        <div className="flex flex-col items-center">
            <div className="text-[#0AC8B9] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1">Potențial (x2)</div>
            <div className="text-[#0AC8B9] font-bold text-2xl md:text-3xl drop-shadow-[0_0_10px_#0AC8B9] font-lol">
                {(amount * 2).toFixed(0)}
            </div>
        </div>
      </div>

      {/* The Coin/Card */}
      <div className="mb-4 md:mb-8 relative perspective-1000">
        <div className={`
            w-32 h-48 md:w-56 md:h-80 bg-[#1E2328] border-[4px] md:border-[6px] border-[#C8AA6E] rounded-none shadow-[0_0_50px_rgba(0,0,0,0.5)] 
            flex items-center justify-center transition-transform duration-200 relative overflow-hidden
            ${isFlipping ? 'rotate-y-180 scale-95' : 'scale-100'}
        `}>
          {/* Inner Content */}
          <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
             {resultColor === 'red' ? (
                 <div className="flex flex-col items-center text-[#D13639] animate-pulse">
                    <Sword size={60} className="md:w-20 md:h-20" strokeWidth={1.5} />
                    <span className="font-lol font-bold text-lg md:text-2xl mt-4 tracking-widest">NOXUS</span>
                 </div>
             ) : (
                 <div className="flex flex-col items-center text-[#005A82] animate-pulse">
                    <Shield size={60} className="md:w-20 md:h-20" strokeWidth={1.5} />
                    <span className="font-lol font-bold text-lg md:text-2xl mt-4 tracking-widest">DEMACIA</span>
                 </div>
             )}
          </div>
          
          {feedback === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#C8AA6E]/20 border-4 border-[#C8AA6E] z-20 backdrop-blur-sm">
                <span className="text-[#C8AA6E] font-black text-xl md:text-3xl uppercase tracking-widest drop-shadow-[0_2px_4px_black]">VICTORIE</span>
            </div>
          )}
           {feedback === 'lose' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#D13639]/20 border-4 border-[#D13639] z-20 backdrop-blur-sm">
                <span className="text-[#D13639] font-black text-xl md:text-3xl uppercase tracking-widest drop-shadow-[0_2px_4px_black]">ÎNFRÂNGERE</span>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="flex gap-2 md:gap-3 mb-6 md:mb-8 bg-[#000]/50 p-2 border border-[#3C3C41]">
        {history.map((h, i) => (
          <div key={i} className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border ${h === 'red' ? 'bg-[#D13639]/20 border-[#D13639] text-[#D13639]' : 'bg-[#005A82]/20 border-[#005A82] text-[#005A82]'}`}>
             {h === 'red' ? <Sword size={12} /> : <Shield size={12} />}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 md:gap-8 w-full max-w-xl px-4 justify-center">
        <button 
            onClick={() => handleGuess('red')}
            disabled={isFlipping || feedback !== 'none'}
            className="flex-1 py-3 md:py-4 border border-[#D13639] bg-gradient-to-b from-[#D13639]/20 to-[#D13639]/5 hover:bg-[#D13639] hover:text-black text-[#D13639] font-lol font-bold text-lg md:text-xl tracking-widest transition-all group active:scale-95"
        >
            <span className="group-hover:scale-110 inline-block transition-transform">NOXUS</span>
        </button>
        <button 
            onClick={() => handleGuess('blue')}
            disabled={isFlipping || feedback !== 'none'}
            className="flex-1 py-3 md:py-4 border border-[#005A82] bg-gradient-to-b from-[#005A82]/20 to-[#005A82]/5 hover:bg-[#005A82] hover:text-white text-[#005A82] font-lol font-bold text-lg md:text-xl tracking-widest transition-all group active:scale-95"
        >
             <span className="group-hover:scale-110 inline-block transition-transform">DEMACIA</span>
        </button>
      </div>

      <div className="mt-4 text-[#A09B8C] text-xs uppercase tracking-wider md:hidden">
          Apasă COLECT (jos) pentru a ieși
      </div>

    </div>
  );
};

export default GambleGame;