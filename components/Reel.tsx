import React from 'react';
import { SYMBOLS } from '../constants';
import { 
  Sword, Crown, Droplet, Flame, Eye, Coins, Box, GraduationCap
} from 'lucide-react';

interface ReelProps {
  symbols: number[]; 
  spinning: boolean;
  delay: number; 
  winHighlightRows: number[];
}

const IconMap: Record<string, React.FC<any>> = {
  'sword': Sword,
  'crown': Crown,
  'droplet': Droplet,
  'flame': Flame,
  'eye': Eye,
  'coins': Coins,
  'box': Box,
  'hat': GraduationCap
};

const Reel: React.FC<ReelProps> = ({ symbols, spinning, delay, winHighlightRows }) => {
  return (
    <div className="relative w-full h-full border-r border-[#C8AA6E]/10 last:border-r-0 bg-[#010A13]/80 backdrop-blur-md overflow-hidden">
      {/* Hextech vertical line decoration */}
      <div className="absolute inset-x-0 top-0 bottom-0 w-px mx-auto bg-gradient-to-b from-transparent via-[#0AC8B9]/10 to-transparent"></div>

      <div
        className={`flex flex-col h-full justify-around ${spinning ? 'reel-spin' : 'reel-land'}`}
        style={{
          animationDuration: spinning ? '0.15s' : '0.4s',
        }}
      >
        {spinning ? (
          // Blur effect during spin - simplified symbols
          <div className="flex flex-col h-full justify-around opacity-60">
             <div className="h-[33%] flex-shrink-0 bg-gradient-to-t from-[#C8AA6E]/20 to-transparent rounded-xl mx-2"></div>
             <div className="h-[33%] flex-shrink-0 bg-gradient-to-t from-[#0AC8B9]/20 to-transparent rounded-xl mx-2"></div>
             <div className="h-[33%] flex-shrink-0 bg-gradient-to-t from-[#C8AA6E]/20 to-transparent rounded-xl mx-2"></div>
          </div>
        ) : (
          symbols.map((symbolId, rowIndex) => {
            const sym = SYMBOLS.find((s) => s.id === symbolId) || SYMBOLS[0];
            const isWinner = winHighlightRows.includes(rowIndex);
            const IconComponent = IconMap[sym.icon] || Box;

            return (
              <div
                key={rowIndex}
                className={`
                  relative flex items-center justify-center 
                  h-[33.33%] flex-shrink-0 
                  transition-all duration-300 group
                  ${isWinner ? 'winning-rune z-20' : 'z-10'}
                `}
              >
                {/* Symbol Container - Balanced Size */}
                <div className={`
                    relative flex items-center justify-center
                    w-[85%] h-[85%] rounded-xl overflow-hidden
                    ${isWinner 
                        ? 'bg-[#C8AA6E]/30 shadow-[0_0_25px_#C8AA6E] border-2 border-[#C8AA6E]' 
                        : 'bg-[#1E2328]/50 border border-white/5 hover:bg-[#0AC8B9]/10 hover:border-[#0AC8B9]/30'}
                    transition-all duration-300
                `}>
                    
                    {/* Render Image if available, else fallback to Icon */}
                    {sym.image ? (
                         <img 
                            src={sym.image} 
                            alt={sym.name}
                            className={`
                                w-full h-full object-contain p-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]
                                transition-transform duration-300
                                ${!isWinner && 'group-hover:scale-105'}
                            `}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                         />
                    ) : (
                        <IconComponent 
                            size={isWinner ? 48 : 36} 
                            className={`
                                drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] 
                                ${sym.color} 
                                transition-transform duration-300
                                ${!isWinner && 'group-hover:scale-110'}
                            `}
                            strokeWidth={1.5}
                        />
                    )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Reel;