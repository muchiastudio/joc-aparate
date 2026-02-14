import React, { useState, useCallback, useRef } from 'react';
import Reel from './Reel';
import Controls from './Controls';
import GambleGame from './GambleGame';
import Paytable from './Paytable';
import { SYMBOLS, PAYLINES, BET_LEVELS, STARTING_BALANCE, COLS, ROWS } from '../constants';
import { WinData } from '../types';
import { SoundManager } from '../utils/audio';

// Helper to get random symbol based on weights, optionally excluding an ID
const getRandomSymbolId = (excludeId?: number) => {
  const availableSymbols = excludeId !== undefined 
    ? SYMBOLS.filter(s => s.id !== excludeId) 
    : SYMBOLS;
    
  const totalWeight = availableSymbols.reduce((acc, sym) => acc + sym.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const sym of availableSymbols) {
    if (random < sym.weight) {
      return sym.id;
    }
    random -= sym.weight;
  }
  return availableSymbols[0].id;
};

// Generate Grid with Logic: Max 1 Scatter per column
const generateGrid = () => {
  const scatterId = SYMBOLS.find(s => s.isScatter)?.id;
  
  return Array(COLS).fill(null).map(() => {
    let hasScatterInColumn = false;
    
    return Array(ROWS).fill(null).map(() => {
      // If we already have a scatter in this column, exclude it from future generations in this column
      const id = getRandomSymbolId(hasScatterInColumn ? scatterId : undefined);
      
      if (id === scatterId) {
        hasScatterInColumn = true;
      }
      return id;
    });
  });
};

const checkWins = (currentGrid: number[][], currentBet: number) => {
  let totalWin = 0;
  const newWins: WinData[] = [];

  // 1. Check Paylines
  PAYLINES.forEach((line) => {
    const symbolId = currentGrid[0][line.positions[0]];
    let matchCount = 1;
    
    for (let col = 1; col < COLS; col++) {
      const row = line.positions[col];
      if (currentGrid[col][row] === symbolId) {
        matchCount++;
      } else {
        break;
      }
    }

    const symbolDef = SYMBOLS.find(s => s.id === symbolId);
    if (symbolDef && !symbolDef.isScatter) {
      const multiplier = symbolDef.value[matchCount - 1] || 0;
      if (multiplier > 0) {
          const winAmount = currentBet * multiplier;
          totalWin += winAmount;
          newWins.push({
              amount: winAmount,
              lineIndex: line.id,
              symbolId: symbolId,
              matchCount
          });
      }
    }
  });

  // 2. Check Scatters (Anywhere in grid)
  let scatterCount = 0;
  const scatterSymbolId = SYMBOLS.find(s => s.isScatter)?.id;
  
  if (scatterSymbolId !== undefined) {
      currentGrid.flat().forEach(id => {
          if (id === scatterSymbolId) scatterCount++;
      });
      
      const scatterDef = SYMBOLS.find(s => s.isScatter);
      if (scatterDef && scatterCount >= 3) {
          const scatterMult = scatterDef.value[Math.min(scatterCount, 5) - 1] || 0;
          if (scatterMult > 0) {
              const winAmount = currentBet * scatterMult;
              totalWin += winAmount;
              newWins.push({
                  amount: winAmount,
                  lineIndex: -1, 
                  symbolId: scatterDef.id,
                  matchCount: scatterCount
              });
          }
      }
  }

  return { totalWin, newWins };
};

const SlotMachine: React.FC = () => {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [bet, setBet] = useState(BET_LEVELS[0]); 
  const [grid, setGrid] = useState<number[][]>(generateGrid());
  
  // Controls global game state
  const [isGameActive, setIsGameActive] = useState(false);
  // Controls individual reel animation
  const [reelSpinning, setReelSpinning] = useState<boolean[]>(Array(COLS).fill(false));

  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<WinData[]>([]);
  
  // Gamble State
  const [isGambling, setIsGambling] = useState(false);
  const [gambleAmount, setGambleAmount] = useState(0);

  // Paytable State
  const [isPaytableOpen, setIsPaytableOpen] = useState(false);

  // Refs for Quick Stop Logic
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextGridRef = useRef<number[][]>([]);

  // Full Screen Logic
  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => {
            console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  // Function to process wins
  const processWins = (currentGrid: number[][]) => {
      const { totalWin, newWins } = checkWins(currentGrid, bet);
        
      if (totalWin > 0) {
          setBalance(prev => prev + totalWin);
          setLastWin(totalWin);
          setWinningLines(newWins);
          
          if (totalWin > bet * 10) {
            SoundManager.playWin('big');
          } else {
            SoundManager.playWin('small');
          }
      }
  };

  const handleSpin = useCallback(() => {
    // === QUICK STOP LOGIC ===
    if (isGameActive) {
        // Clear all pending reel stops
        timerRefs.current.forEach(clearTimeout);
        timerRefs.current = [];

        // Force stop all reels immediately
        setReelSpinning(Array(COLS).fill(false));
        SoundManager.playReelStop(); // Play sound once for impact

        // Calculate result immediately using the grid we already generated
        processWins(nextGridRef.current);

        setIsGameActive(false);
        return;
    }

    // === START SPIN LOGIC ===
    if (balance < bet) return;

    SoundManager.playClick();
    SoundManager.playSpinStart();

    setIsGambling(false);
    setGambleAmount(0);
    setIsPaytableOpen(false); // Close paytable if open

    setBalance(prev => prev - bet);
    setLastWin(0);
    setWinningLines([]);
    
    // Start game state
    setIsGameActive(true);
    // Start all reels spinning
    setReelSpinning(Array(COLS).fill(true));

    // Pre-calculate next grid immediately
    const nextGrid = generateGrid();
    nextGridRef.current = nextGrid; // Store for quick stop access
    
    // Update the grid state in background.
    setGrid(nextGrid);

    // Staggered stop logic
    const INITIAL_DELAY = 600; 
    const DELAY_PER_REEL = 300; 

    timerRefs.current = [];

    // Schedule each reel stop
    nextGrid.forEach((_, colIndex) => {
        const timeoutId = setTimeout(() => {
            setReelSpinning(prev => {
                const newState = [...prev];
                newState[colIndex] = false;
                return newState;
            });
            SoundManager.playReelStop();
        }, INITIAL_DELAY + (colIndex * DELAY_PER_REEL));
        
        timerRefs.current.push(timeoutId);
    });

    // Schedule final result calculation
    const totalDuration = INITIAL_DELAY + ((COLS - 1) * DELAY_PER_REEL) + 200;
    const finalTimeoutId = setTimeout(() => {
        processWins(nextGrid);
        setIsGameActive(false);
        timerRefs.current = []; // Clear refs when done normally
    }, totalDuration);

    timerRefs.current.push(finalTimeoutId);

  }, [balance, bet, isGameActive]);

  const handleStartGamble = () => {
    SoundManager.playClick();
    if (lastWin > 0) {
        // NOTE: The money is already in the balance from the win. 
        // We deduct it to put it "on the table".
        setBalance(prev => prev - lastWin);
        setGambleAmount(lastWin);
        setIsGambling(true);
    }
  };

  const handleGambleWin = () => {
    SoundManager.playGambleWin();
    const newAmount = gambleAmount * 2;
    setGambleAmount(newAmount);
    setLastWin(newAmount); // Update last win to show the new potential
  };

  const handleGambleLose = () => {
    SoundManager.playGambleLose();
    setGambleAmount(0);
    setLastWin(0);
    setIsGambling(false);
    setWinningLines([]);
  };

  const handleGambleCollect = () => {
    SoundManager.playWin('small');
    // Add the current table amount back to balance
    setBalance(prev => prev + gambleAmount);
    setIsGambling(false);
    // Reset win state so user can't gamble again until next spin
    setLastWin(0);
    setWinningLines([]);
  };

  const getWinningCells = (colIndex: number) => {
    if (isGameActive) return [];
    
    const highlightedRows: number[] = [];

    winningLines.forEach(win => {
        if (win.lineIndex === -1) {
            const scatterId = SYMBOLS.find(s => s.isScatter)?.id;
            grid[colIndex].forEach((sym, rIdx) => {
                if (sym === scatterId) highlightedRows.push(rIdx);
            });
        } else {
            const line = PAYLINES.find(p => p.id === win.lineIndex);
            if (line && colIndex < win.matchCount) {
                highlightedRows.push(line.positions[colIndex]);
            }
        }
    });

    return highlightedRows;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden bg-[#010A13]">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-cover bg-center z-0 opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')" }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#010A13] via-[#010A13]/80 to-transparent z-0"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1300px] px-2 md:px-8 flex flex-col gap-4 md:gap-8 h-full justify-center">
        
        {/* Header - LoL Logo Style */}
        <div className="flex flex-col items-center justify-center mb-1 md:mb-4 shrink-0">
            <h1 className="font-lol text-3xl md:text-7xl font-bold text-[#C8AA6E] tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] border-b-2 border-[#C8AA6E] pb-2 text-center">
                LEAGUE <span className="text-[#F0E6D2] text-xl md:text-5xl inline mx-2">OF</span> SLOTS
            </h1>
        </div>

        {/* Game Area - Responsive Aspect Ratio 
            Mobile: aspect-[3/4] to prevent squashing
            Desktop: aspect-[2/1] for cinematic feel
        */}
        <div className="relative w-full mx-auto aspect-[3/4] md:aspect-[16/9] lg:aspect-[2/1] max-w-[1100px] max-h-[70vh] border-[3px] border-[#C8AA6E] bg-[#010A13]/90 shadow-[0_0_40px_rgba(10,200,185,0.15)] overflow-hidden shrink-0">
            
            {/* Decorative Corner Ornaments */}
            <div className="absolute top-0 left-0 w-8 h-8 md:w-16 md:h-16 border-t-4 border-l-4 border-[#C8AA6E] z-20"></div>
            <div className="absolute top-0 right-0 w-8 h-8 md:w-16 md:h-16 border-t-4 border-r-4 border-[#C8AA6E] z-20"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 md:w-16 md:h-16 border-b-4 border-l-4 border-[#C8AA6E] z-20"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 md:w-16 md:h-16 border-b-4 border-r-4 border-[#C8AA6E] z-20"></div>

            {/* Reel Container */}
            <div className="flex h-full w-full relative">
                 {/* Reels */}
                 {grid.map((colSymbols, colIndex) => (
                    <div key={colIndex} className="flex-1 h-full z-0 relative">
                        <Reel 
                            symbols={colSymbols} 
                            spinning={reelSpinning[colIndex]} 
                            delay={colIndex}
                            winHighlightRows={getWinningCells(colIndex)}
                        />
                    </div>
                ))}

                 {/* Paylines Overlay */}
                {winningLines.length > 0 && !isGameActive && !isGambling && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <svg className="w-full h-full" preserveAspectRatio="none">
                            {winningLines.map((win, i) => {
                                if (win.lineIndex === -1) return null;
                                const line = PAYLINES.find(p => p.id === win.lineIndex);
                                if(!line) return null;

                                const getCoord = (col: number, row: number) => {
                                    // Adjusted for tighter centers
                                    const x = (col * 20) + 10; 
                                    const y = (row * 33.33) + 16.66;
                                    return `${x}% ${y}%`;
                                }

                                const points = line.positions.slice(0, win.matchCount).map((row, col) => getCoord(col, row)).join(',');

                                return (
                                    <polyline 
                                        key={i}
                                        points={points}
                                        fill="none"
                                        stroke={line.color}
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="drop-shadow-[0_0_8px_rgba(0,0,0,1)] animate-pulse"
                                        style={{ vectorEffect: 'non-scaling-stroke' }} 
                                    />
                                )
                            })}
                        </svg>
                    </div>
                )}

                 {/* Gamble Game Overlay */}
                 {isGambling && (
                    <GambleGame 
                        amount={gambleAmount}
                        onDouble={handleGambleWin}
                        onLose={handleGambleLose}
                        onCollect={handleGambleCollect}
                    />
                )}
                
                {/* Paytable Modal */}
                {isPaytableOpen && (
                    <Paytable 
                        onClose={() => setIsPaytableOpen(false)}
                        currentBet={bet}
                    />
                )}
            </div>
        </div>

        {/* Controls - LoL Client Footer */}
        <Controls 
            balance={balance}
            bet={bet}
            setBet={setBet}
            spin={handleSpin}
            onGamble={handleStartGamble}
            spinning={isGameActive}
            lastWin={lastWin}
            onFullScreen={handleFullScreen}
            onOpenPaytable={() => setIsPaytableOpen(true)}
        />
      </div>

    </div>
  );
};

export default SlotMachine;