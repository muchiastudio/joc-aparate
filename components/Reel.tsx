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
    <div className="relative w-full h-full border-r border-[#C8AA6E]/20 last:border-r-0 bg-[#010A13]/90 overflow-hidden">
      {/* Vertical line decoration - subtle */}
      <div className="absolute inset-x-0 top-0 bottom-0 w-px mx-auto bg-black/20"></div>

      <div
        className={`flex flex-col h-full justify-around ${spinning ? 'reel-spin' : 'reel-land'}`}
        style={{
          animationDuration: spinning ? '0.15s' : '0.4s',
        }}
      >
        {spinning ? (
          // Blur effect during spin - simplified
          <div className="flex flex-col h-full w-full">
             <div className="flex-1 w-full bg-gradient-to-t from-[#C8AA6E]/10 to-transparent"></div>
             <div className="flex-1 w-full bg-gradient-to-t from-[#0AC8B9]/10 to-transparent"></div>
             <div className="flex-1 w-full bg-gradient-to-t from-[#C8AA6E]/10 to-transparent"></div>
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
                  h-[33.33%] w-full
                  transition-all duration-300 group
                  ${isWinner ? 'winning-rune z-20' : 'z-10'}
                `}
              >
                {/* 
                   Symbol Content - 100% Width/Height 
                   Removes padding to look like a full 512x512 tile
                */}
                <div className={`
                    relative flex items-center justify-center
                    w-full h-full
                    ${isWinner 
                        ? 'border-2 border-[#C8AA6E] shadow-[inset_0_0_20px_#C8AA6E]' 
                        : 'border border-white/5'}
                `}>
                    
                    {/* Render Image if available, else fallback to Icon */}
                    {sym.image ? (
                         <img 
                            src={sym.image} 
                            alt={sym.name}
                            className={`
                                w-full h-full object-cover
                                ${isWinner ? 'brightness-125' : 'brightness-90'}
                            `}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                         />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1E2328]">
                            <IconComponent 
                                size={isWinner ? 56 : 48} 
                                className={`
                                    drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] 
                                    ${sym.color} 
                                `}
                                strokeWidth={1.5}
                            />
                        </div>
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