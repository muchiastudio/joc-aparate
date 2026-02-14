import React from 'react';

const MegaWinAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-300">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-purple-900/40 to-red-900/40 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent opacity-30 animate-[spin_4s_linear_infinite]"></div>

        {/* Text Container */}
        <div className="relative z-10 text-center transform scale-100 md:scale-125 animate-bounce">
            
            <h1 className="font-lol font-black text-5xl md:text-8xl italic uppercase leading-tight tracking-tighter drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]">
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 animate-pulse">
                    INTR-UNA MA
                </span>
                <span className="block text-white text-6xl md:text-9xl scale-110 my-2 drop-shadow-[0_5px_0_#000]">
                    NEBUNULE
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-purple-600 tracking-[0.2em] font-sans font-bold">
                    TSSSSSSS
                </span>
            </h1>

            {/* Decorative Sparks */}
            <div className="absolute -top-10 -left-10 text-yellow-400 text-6xl animate-ping opacity-75">✨</div>
            <div className="absolute -bottom-10 -right-10 text-yellow-400 text-6xl animate-ping opacity-75 delay-300">✨</div>
        </div>
    </div>
  );
};

export default MegaWinAnimation;