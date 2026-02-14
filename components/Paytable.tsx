import React from 'react';
import { X, Sword, Crown, Droplet, Flame, Eye, Coins, Box, GraduationCap } from 'lucide-react';
import { SYMBOLS, PAYLINES, COLS, ROWS } from '../constants';

interface PaytableProps {
  onClose: () => void;
  currentBet: number;
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

const Paytable: React.FC<PaytableProps> = ({ onClose, currentBet }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#010A13] border-2 border-[#C8AA6E] shadow-[0_0_50px_rgba(200,170,110,0.2)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#C8AA6E]/30 bg-[#1E2328]">
          <h2 className="text-2xl font-lol text-[#C8AA6E] tracking-widest uppercase">Tabel de Plăți</h2>
          <button 
            onClick={onClose}
            className="text-[#A09B8C] hover:text-[#F0E6D2] hover:bg-[#C8AA6E]/20 p-2 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Symbols Section */}
            <div>
                <h3 className="text-[#0AC8B9] font-lol text-xl mb-4 uppercase tracking-wider border-b border-[#0AC8B9]/20 pb-2 inline-block">
                    Simboluri & Câștiguri (Miză: {currentBet})
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SYMBOLS.sort((a, b) => {
                        // Sort by max payout desc
                        const maxA = a.value[a.value.length-1];
                        const maxB = b.value[b.value.length-1];
                        return maxB - maxA;
                    }).map((symbol) => {
                        const IconComponent = IconMap[symbol.icon] || Box;
                        
                        return (
                            <div key={symbol.id} className="bg-[#1E2328]/50 border border-[#3C3C41] p-4 flex flex-col items-center gap-3 rounded hover:border-[#C8AA6E]/50 transition-colors">
                                {/* Icon/Image Display - Clean, no circle background */}
                                <div className="w-20 h-20 flex items-center justify-center mb-2">
                                     {symbol.image ? (
                                         <img src={symbol.image} alt={symbol.name} className="w-full h-full object-contain drop-shadow-md" />
                                     ) : (
                                         <IconComponent size={48} className={symbol.color} />
                                     )}
                                </div>
                                
                                <span className="text-[#F0E6D2] font-bold text-sm tracking-wide text-center h-10 flex items-center justify-center">
                                    {symbol.name} {symbol.isScatter && <span className="text-[#0AC8B9] ml-1">(SCATTER)</span>}
                                </span>

                                {/* Payout List */}
                                <div className="w-full space-y-1">
                                    {[5, 4, 3, 2].map((count) => {
                                        const multiplier = symbol.value[count - 1];
                                        if (!multiplier || multiplier === 0) return null;
                                        
                                        return (
                                            <div key={count} className="flex justify-between text-xs md:text-sm border-b border-white/5 pb-1 last:border-0">
                                                <span className="text-[#A09B8C]">{count}x</span>
                                                <span className="text-[#C8AA6E] font-bold">{(multiplier * currentBet).toFixed(0)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Paylines Section */}
            <div>
                <h3 className="text-[#0AC8B9] font-lol text-xl mb-4 uppercase tracking-wider border-b border-[#0AC8B9]/20 pb-2 inline-block">
                    Linii de Plată ({PAYLINES.length})
                </h3>
                
                <div className="flex flex-wrap gap-4 justify-center">
                    {PAYLINES.map((line) => (
                        <div key={line.id} className="bg-[#1E2328] p-3 border border-[#3C3C41] rounded flex flex-col items-center gap-2">
                            <span className="text-[#A09B8C] text-xs font-bold uppercase">Linia {line.id + 1}</span>
                            
                            {/* Mini Grid Visualization */}
                            <div className="grid grid-cols-5 gap-1 bg-black p-1 rounded">
                                {Array(COLS).fill(0).map((_, col) => (
                                    <div key={col} className="flex flex-col gap-1">
                                        {Array(ROWS).fill(0).map((_, row) => {
                                            const isActive = line.positions[col] === row;
                                            return (
                                                <div 
                                                    key={`${col}-${row}`} 
                                                    className={`w-4 h-3 rounded-sm ${isActive ? '' : 'bg-[#3C3C41]/30'}`}
                                                    style={{ backgroundColor: isActive ? line.color : undefined }}
                                                ></div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 text-center text-[#A09B8C] text-sm italic">
                    Scatter-ul plătește în orice poziție. Toate celelalte simboluri plătesc de la stânga la dreapta pe liniile active.
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Paytable;