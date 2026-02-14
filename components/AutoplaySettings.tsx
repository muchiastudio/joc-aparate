import React, { useState } from 'react';
import { X, Play, AlertTriangle, ShieldCheck, Coins, Zap } from 'lucide-react';
import { SoundManager } from '../utils/audio';

interface AutoplaySettingsProps {
  onClose: () => void;
  onStart: (settings: AutoplayConfig) => void;
  currentBalance: number;
}

export interface AutoplayConfig {
  spins: number;
  stopOnWin: boolean;
  stopOnBonus: boolean;
  singleWinLimit: number | null;
  lossLimit: number | null;
  turbo: boolean;
}

const SPIN_OPTIONS = [10, 20, 50, 100];

const AutoplaySettings: React.FC<AutoplaySettingsProps> = ({ onClose, onStart, currentBalance }) => {
  const [spins, setSpins] = useState(10);
  const [stopOnWin, setStopOnWin] = useState(false);
  const [singleWinLimit, setSingleWinLimit] = useState<string>('');
  const [lossLimit, setLossLimit] = useState<string>('');
  const [turbo, setTurbo] = useState(false);

  const handleStart = () => {
    SoundManager.playClick();
    onStart({
      spins,
      stopOnWin,
      stopOnBonus: true, // Always stop on 'Bonus' (Scatter wins >= 3 usually)
      singleWinLimit: singleWinLimit ? parseInt(singleWinLimit) : null,
      lossLimit: lossLimit ? parseInt(lossLimit) : null,
      turbo
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#010A13] border-2 border-[#0AC8B9] shadow-[0_0_40px_rgba(10,200,185,0.2)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#0AC8B9]/30 bg-[#1E2328]">
          <h2 className="text-xl font-lol text-[#0AC8B9] tracking-widest uppercase flex items-center gap-2">
            <Play size={20} fill="currentColor" />
            Autoplay
          </h2>
          <button 
            onClick={() => { SoundManager.playClick(); onClose(); }}
            className="text-[#A09B8C] hover:text-[#F0E6D2] hover:bg-[#0AC8B9]/20 p-2 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Spin Count Selection */}
            <div>
                <label className="text-[#A09B8C] text-xs font-bold uppercase mb-2 block">Număr de Rotiri</label>
                <div className="grid grid-cols-4 gap-2">
                    {SPIN_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            onClick={() => { SoundManager.playClick(); setSpins(opt); }}
                            className={`
                                py-2 border font-bold text-sm transition-all
                                ${spins === opt 
                                    ? 'bg-[#0AC8B9] text-[#010A13] border-[#0AC8B9] shadow-[0_0_10px_#0AC8B9]' 
                                    : 'bg-[#1E2328] text-[#F0E6D2] border-[#3C3C41] hover:border-[#0AC8B9]/50'}
                            `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stop Conditions */}
            <div className="space-y-3">
                <label className="text-[#A09B8C] text-xs font-bold uppercase mb-2 block">Setări Avansate</label>
                
                {/* Turbo Mode */}
                <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-all ${turbo ? 'bg-[#D13639]/10 border-[#D13639]' : 'bg-[#1E2328] border-[#3C3C41]'}`}>
                    <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${turbo ? 'bg-[#D13639] border-[#D13639]' : 'border-[#5B5A56]'}`}>
                        {turbo && <Zap size={14} className="text-white fill-current" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={turbo} onChange={(e) => setTurbo(e.target.checked)} />
                    <div className="flex flex-col">
                        <span className={`text-sm font-bold ${turbo ? 'text-[#D13639]' : 'text-[#F0E6D2]'}`}>MOD TURBO ⚡</span>
                        <span className="text-[10px] text-[#A09B8C]">Viteză maximă de joc</span>
                    </div>
                </label>

                {/* Stop on Any Win */}
                <label className="flex items-center gap-3 p-3 bg-[#1E2328] border border-[#3C3C41] rounded cursor-pointer hover:bg-[#2A3036]">
                    <div className={`w-5 h-5 border flex items-center justify-center ${stopOnWin ? 'bg-[#0AC8B9] border-[#0AC8B9]' : 'border-[#5B5A56]'}`}>
                        {stopOnWin && <X size={14} className="text-black" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={stopOnWin} onChange={(e) => setStopOnWin(e.target.checked)} />
                    <span className="text-[#F0E6D2] text-sm">Oprește la orice câștig</span>
                </label>

                {/* Single Win Limit */}
                <div className="flex items-center gap-2 bg-[#1E2328] border border-[#3C3C41] p-2 rounded">
                    <Coins size={18} className="text-[#C8AA6E]" />
                    <span className="text-[#A09B8C] text-xs uppercase w-24">Câștig Unic &gt;</span>
                    <input 
                        type="number" 
                        value={singleWinLimit}
                        onChange={(e) => setSingleWinLimit(e.target.value)}
                        placeholder="Nelimitat"
                        className="bg-transparent border-none outline-none text-[#F0E6D2] font-bold w-full text-right placeholder-gray-600"
                    />
                </div>

                {/* Loss Limit */}
                <div className="flex items-center gap-2 bg-[#1E2328] border border-[#3C3C41] p-2 rounded">
                    <ShieldCheck size={18} className="text-[#D13639]" />
                    <span className="text-[#A09B8C] text-xs uppercase w-24">Soldul scade cu &gt;</span>
                    <input 
                        type="number" 
                        value={lossLimit}
                        onChange={(e) => setLossLimit(e.target.value)}
                        placeholder="Nelimitat"
                        className="bg-transparent border-none outline-none text-[#F0E6D2] font-bold w-full text-right placeholder-gray-600"
                    />
                </div>
            </div>

            {/* Start Button */}
            <button 
                onClick={handleStart}
                className="w-full py-4 mt-4 bg-gradient-to-r from-[#0AC8B9] to-[#005A82] text-white font-lol font-bold text-xl uppercase tracking-widest border border-[#0AC8B9] hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
                Start Auto
            </button>

        </div>
      </div>
    </div>
  );
};

export default AutoplaySettings;