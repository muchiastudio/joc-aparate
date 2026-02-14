import React, { useState, useEffect } from 'react';
import { Sword, Skull } from 'lucide-react'; // Changed Shield to Skull for Black/Void theme
import { SoundManager } from '../utils/audio';

interface GambleGameProps {
  amount: number;
  onDouble: () => void;
  onLose: () => void;
  onCollect: () => void;
}

const GambleGame: React.FC<GambleGameProps> = ({ amount, onDouble, onLose, onCollect }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [resultColor, setResultColor] = useState<'red' | 'black'>('red'); 
  const [isFlipping, setIsFlipping] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'win' | 'lose'>('none');

  useEffect(() => {
    // Generate fake history (Red vs Black)
    const fakeHistory = Array(6).fill(null).map(() => Math.random() > 0.5 ? 'red' : 'black');
    setHistory(fakeHistory);
  }, []);

  const handleGuess = (choice: 'red' | 'black') => {
    if (isFlipping) return;
    SoundManager.playClick();
    setIsFlipping(true);
    setFeedback('none');

    let shuffleCount = 0;
    const interval = setInterval(() => {
      setResultColor(Math.random() > 0.5 ? 'red' : 'black');
      SoundManager.playClick(); 
      shuffleCount++;
      if (shuffleCount > 10) {
        clearInterval(interval);
        finalizeGuess(choice);
      }
    }, 50);
  };

  const finalizeGuess = (userChoice: 'red' | 'black') => {
    const finalResult = Math.random() > 0.5 ? 'red' : 'black';
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
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#010A13] text-[#F0E6D2]">
      
      {/* Header Info */}
      <div className="flex justify-center items-center gap-8 w-full mb-4 relative z-10 px-4">
        <div className="flex flex-col items-center">
            <div className="text-[#A09B8C] text-xs font-bold uppercase mb-1">Câștig</div>
            <div className="text-[#C8AA6E] font-bold text-3xl font-lol">
                {amount.toFixed(0)}
            </div>
        </div>

        <div className="text-2xl text-[#5B5A56]">&rarr;</div>

        <div className="flex flex-col items-center">
            <div className="text-[#0AC8B9] text-xs font-bold uppercase mb-1">Dublaj (x2)</div>
            <div className="text-[#F0E6D2] font-bold text-3xl font-lol animate-pulse">
                {(amount * 2).toFixed(0)}
            </div>
        </div>
      </div>

      {/* The Card Area */}
      <div className="mb-6 relative perspective-1000 flex-1 flex items-center justify-center w-full max-h-[40vh]">
        <div className={`
            aspect-[3/4] h-full max-h-[300px] bg-[#1E2328] border-[6px] border-[#C8AA6E] 
            flex items-center justify-center transition-transform duration-200 relative overflow-hidden shadow-2xl
            ${isFlipping ? 'rotate-y-180 scale-95' : 'scale-100'}
        `}>
          {/* Inner Content */}
          <div className={`flex flex-col items-center justify-center w-full h-full relative z-10 ${resultColor === 'red' ? 'bg-[#D13639]/10' : 'bg-black/40'}`}>
             {resultColor === 'red' ? (
                 <div className="flex flex-col items-center text-[#D13639]">
                    <Sword size={80} strokeWidth={2} />
                    <span className="font-lol font-bold text-2xl mt-4 uppercase">ROȘU</span>
                 </div>
             ) : (
                 <div className="flex flex-col items-center text-[#F0E6D2]">
                    <Skull size={80} strokeWidth={2} />
                    <span className="font-lol font-bold text-2xl mt-4 uppercase">NEGRU</span>
                 </div>
             )}
          </div>
          
          {feedback === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#C8AA6E]/90 z-20">
                <span className="text-black font-black text-3xl uppercase tracking-widest">VICTORIE!</span>
            </div>
          )}
           {feedback === 'lose' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                <span className="text-[#D13639] font-black text-3xl uppercase tracking-widest">AI PIERDUT</span>
            </div>
          )}
        </div>
      </div>

      {/* History Bar */}
      <div className="flex gap-2 mb-6 bg-[#000]/50 p-2 rounded-full border border-[#3C3C41]">
        <span className="mr-2 text-xs text-[#5B5A56] self-center uppercase font-bold tracking-wider">Istoric:</span>
        {history.map((h, i) => (
          <div key={i} className={`w-6 h-6 rounded-full border-2 ${h === 'red' ? 'bg-[#D13639] border-red-900' : 'bg-black border-gray-600'}`}></div>
        ))}
      </div>

      {/* Big Action Buttons */}
      <div className="flex gap-4 w-full px-4 max-w-lg mb-4">
        <button 
            onClick={() => handleGuess('red')}
            disabled={isFlipping || feedback !== 'none'}
            className="flex-1 py-6 border-2 border-[#D13639] bg-[#D13639] text-[#010A13] font-lol font-black text-2xl uppercase tracking-widest hover:bg-[#ff4d4d] active:scale-95 transition-all shadow-[0_0_20px_rgba(209,54,57,0.4)]"
        >
            ROȘU
        </button>
        <button 
            onClick={() => handleGuess('black')}
            disabled={isFlipping || feedback !== 'none'}
            className="flex-1 py-6 border-2 border-gray-500 bg-black text-white font-lol font-black text-2xl uppercase tracking-widest hover:bg-gray-900 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
            NEGRU
        </button>
      </div>
      
      <div className="text-[#5B5A56] text-xs uppercase animate-pulse mb-2">
          Apasă COLECT pentru a încasa
      </div>

    </div>
  );
};

export default GambleGame;