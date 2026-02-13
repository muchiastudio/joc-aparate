import React from 'react';
import SlotMachine from './components/SlotMachine';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#010A13] text-[#F0E6D2] font-sans selection:bg-[#0AC8B9] selection:text-black relative overflow-hidden">
      
      {/* Background Layer 1: Dark Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#091428] via-[#010A13] to-[#010A13] z-0"></div>

      {/* Background Layer 2: Moving Mist/Smoke */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1C2333] via-transparent to-transparent"></div>
      </div>

      {/* Background Layer 3: Floating Runes/Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {[...Array(30)].map((_, i) => (
             <div 
                key={i}
                className="absolute rounded-full bg-[#0AC8B9] blur-[2px] animate-pulse"
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    opacity: Math.random() * 0.5 + 0.1,
                    animationDuration: `${Math.random() * 5 + 3}s`,
                    transform: `translateY(${Math.random() * 100}px)`
                }}
             ></div>
         ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
         <SlotMachine />
      </div>
    </div>
  );
};

export default App;