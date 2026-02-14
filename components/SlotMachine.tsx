import React, { useState, useCallback, useRef, useEffect } from 'react';
import Reel from './Reel';
import Controls from './Controls';
import GambleGame from './GambleGame';
import Paytable from './Paytable';
import AutoplaySettings, { AutoplayConfig } from './AutoplaySettings';
import JackpotDisplay from './JackpotDisplay';
import MegaWinAnimation from './MegaWinAnimation';
import { SYMBOLS, PAYLINES, BET_LEVELS, STARTING_BALANCE, COLS, ROWS, JACKPOT_SEED, JACKPOT_CONTRIBUTION, JACKPOT_CHANCE, SCATTER_CHANCE_PERCENT, FREE_SPINS_COUNT, MAX_WIN_MULTIPLIER } from '../constants';
import { WinData } from '../types';
import { SoundManager } from '../utils/audio';

// Helper to get random symbol based on weights, optionally excluding an ID
const getRandomSymbolId = (excludeId?: number, isHighVolatility: boolean = false) => {
  const availableSymbols = excludeId !== undefined 
    ? SYMBOLS.filter(s => s.id !== excludeId) 
    : SYMBOLS;
    
  // Calculate total weight (adjust for volatility)
  const totalWeight = availableSymbols.reduce((acc, sym) => {
      let weight = sym.weight;
      // In high volatility (Free Spins), Triple chances for Wilds and High Tier symbols
      if (isHighVolatility) {
          if (sym.isWild) weight *= 3;
          if (sym.value[4] >= 400) weight *= 2; // High value symbols
      }
      return acc + weight;
  }, 0);

  let random = Math.random() * totalWeight;
  
  for (const sym of availableSymbols) {
    let weight = sym.weight;
    if (isHighVolatility) {
        if (sym.isWild) weight *= 3;
        if (sym.value[4] >= 400) weight *= 2;
    }

    if (random < weight) {
      return sym.id;
    }
    random -= weight;
  }
  return availableSymbols[0].id;
};

// Generate Grid
// 2% chance to force at least 3 scatters (Special Trigger)
const generateGrid = (isHighVolatility: boolean = false) => {
  const scatterSymbol = SYMBOLS.find(s => s.isScatter);
  const scatterId = scatterSymbol?.id;
  
  // Check for Forced Trigger (Only in base game, not retriggering freely in this logic for simplicity)
  // But allow retrigger if random luck hits
  const forceScatter = !isHighVolatility && Math.random() < SCATTER_CHANCE_PERCENT; 

  const grid = Array(COLS).fill(null).map(() => Array(ROWS).fill(null));
  
  // If forced, place 3 scatters randomly first
  if (forceScatter && scatterId !== undefined) {
      const colsIndices = [0,1,2,3,4].sort(() => 0.5 - Math.random()).slice(0, 3);
      colsIndices.forEach(colIdx => {
          const rowIdx = Math.floor(Math.random() * ROWS);
          grid[colIdx][rowIdx] = scatterId;
      });
  }

  // Fill the rest
  for (let c = 0; c < COLS; c++) {
      let hasScatterInColumn = grid[c].includes(scatterId);

      for (let r = 0; r < ROWS; r++) {
          if (grid[c][r] !== null) continue; // Skip pre-placed symbols

          const id = getRandomSymbolId(hasScatterInColumn ? scatterId : undefined, isHighVolatility);
          if (id === scatterId) hasScatterInColumn = true;
          grid[c][r] = id;
      }
  }

  return grid;
};

const checkWins = (currentGrid: number[][], currentBet: number) => {
  let totalWin = 0;
  const newWins: WinData[] = [];

  // 1. Check Paylines with Wild Substitution
  PAYLINES.forEach((line) => {
    // Get symbols on this line
    const lineSymbols = line.positions.map((row, col) => {
        const symId = currentGrid[col][row];
        return SYMBOLS.find(s => s.id === symId)!;
    });

    // Determine the "Match Symbol" (the first non-wild symbol)
    // If all are wilds, match symbol is Wild (highest pay)
    const firstNonWild = lineSymbols.find(s => !s.isWild && !s.isScatter);
    const matchSymbol = firstNonWild || SYMBOLS.find(s => s.isWild)!;
    
    // We cannot form lines with Scatters usually, so if matchSymbol is Scatter, skip (handled separately)
    // But here we filtered out scatter in firstNonWild, so if it's undefined, it means line is all Wilds or Wilds+Scatters?
    // Scatters don't usually act as blockers for Wilds in line logic unless specific. 
    // Simplified: Wilds substitute for standard symbols.

    if (matchSymbol.isScatter) return; // Should not happen based on logic above unless all scatters

    let matchCount = 0;
    // Count matches from left to right
    for (let i = 0; i < COLS; i++) {
        const sym = lineSymbols[i];
        if (sym.id === matchSymbol.id || sym.isWild) {
            matchCount++;
        } else {
            break;
        }
    }

    if (matchCount >= 2) { // Some symbols pay on 2
        const multiplier = matchSymbol.value[matchCount - 1] || 0;
        if (multiplier > 0) {
            const winAmount = currentBet * multiplier;
            totalWin += winAmount;
            newWins.push({
                amount: winAmount,
                lineIndex: line.id,
                symbolId: matchSymbol.id,
                matchCount
            });
        }
    }
  });

  // 2. Check Scatters (Anywhere in grid)
  let scatterCount = 0;
  const scatterSymbol = SYMBOLS.find(s => s.isScatter);
  
  if (scatterSymbol) {
      currentGrid.flat().forEach(id => {
          if (id === scatterSymbol.id) scatterCount++;
      });
      
      if (scatterCount >= 3) {
          const scatterMult = scatterSymbol.value[Math.min(scatterCount, 5) - 1] || 0;
          const winAmount = currentBet * scatterMult;
          if (winAmount > 0) {
              totalWin += winAmount;
              newWins.push({
                  amount: winAmount,
                  lineIndex: -1, 
                  symbolId: scatterSymbol.id,
                  matchCount: scatterCount
              });
          }
      }
  }

  return { totalWin, newWins, scatterCount };
};

const SlotMachine: React.FC = () => {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [bet, setBet] = useState(BET_LEVELS[0]); 
  const [grid, setGrid] = useState<number[][]>(generateGrid());
  
  // Jackpot State
  const [jackpot, setJackpot] = useState(() => {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('slot_jackpot');
        if (saved) return parseFloat(saved);
    }
    return JACKPOT_SEED;
  });

  // Game State
  const [isGameActive, setIsGameActive] = useState(false);
  const [reelSpinning, setReelSpinning] = useState<boolean[]>(Array(COLS).fill(false));
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<WinData[]>([]);
  const [jackpotWinAmount, setJackpotWinAmount] = useState(0); 
  const [winCooldown, setWinCooldown] = useState(false);
  const [showMegaWin, setShowMegaWin] = useState(false); // State for "NEBUNULE" animation

  // Gamble State (Restored)
  const [isGambling, setIsGambling] = useState(false);
  const [gambleAmount, setGambleAmount] = useState(0);

  // Free Spins State
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [isBonusTriggered, setIsBonusTriggered] = useState(false);

  // Modals & Auto
  const [isPaytableOpen, setIsPaytableOpen] = useState(false);
  const [isAutoplaySettingsOpen, setIsAutoplaySettingsOpen] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);
  const [autoplayCount, setAutoplayCount] = useState(0);
  const [autoplayConfig, setAutoplayConfig] = useState<AutoplayConfig | null>(null);
  const [startingAutoBalance, setStartingAutoBalance] = useState(0);

  // Refs
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextGridRef = useRef<number[][]>([]);
  const autoSpinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
      localStorage.setItem('slot_jackpot', jackpot.toString());
  }, [jackpot]);

  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;
      if (winCooldown) {
          // Calculate delay based on what animation is showing
          let delay = 1500;
          if (isBonusTriggered) delay = 4000;
          if (showMegaWin) delay = 5000; // Give time for the TSSSS animation
          
          // Speed up cooldown in turbo mode unless it's a special animation
          const isTurbo = isAutoplayActive && autoplayConfig?.turbo;
          if (isTurbo && !isBonusTriggered && !showMegaWin && jackpotWinAmount === 0) {
              delay = 500; 
          }

          timeout = setTimeout(() => {
              setWinCooldown(false);
              setJackpotWinAmount(0);
              setIsBonusTriggered(false);
              setShowMegaWin(false);
              
              // If we have free spins left, auto spin after cooldown
              if (freeSpinsLeft > 0 && !isGameActive) {
                   handleSpin();
              }
          }, delay); 
      }
      return () => clearTimeout(timeout);
  }, [winCooldown, freeSpinsLeft, isGameActive, isBonusTriggered, showMegaWin, isAutoplayActive, autoplayConfig, jackpotWinAmount]);

  // AUTOPLAY LOGIC
  useEffect(() => {
    if (isAutoplayActive && !isGameActive && !winCooldown && autoplayCount > 0 && freeSpinsLeft === 0 && !isGambling) {
        // TURBO LOGIC: Reduce delay between spins
        const delay = autoplayConfig?.turbo ? 200 : 800;
        
        autoSpinTimerRef.current = setTimeout(() => {
            handleSpin();
        }, delay);
    } else if (isAutoplayActive && autoplayCount <= 0 && !isGameActive && !winCooldown && freeSpinsLeft === 0) {
        setIsAutoplayActive(false);
    }
    return () => { if (autoSpinTimerRef.current) clearTimeout(autoSpinTimerRef.current); }
  }, [isAutoplayActive, isGameActive, winCooldown, autoplayCount, freeSpinsLeft, isGambling, autoplayConfig]);


  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => {});
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const stopAutoplay = () => {
      setIsAutoplayActive(false);
      setAutoplayCount(0);
  };

  // Process Wins
  const processWins = (currentGrid: number[][]) => {
      const { totalWin, newWins, scatterCount } = checkWins(currentGrid, bet);
      let finalWin = totalWin;
      let hitJackpot = false;

      // Jackpot Check
      if (Math.random() < JACKPOT_CHANCE) {
          hitJackpot = true;
          const currentPot = jackpot;
          finalWin += currentPot;
          setJackpotWinAmount(currentPot);
          SoundManager.playJackpotWin();
          setJackpot(JACKPOT_SEED);
      }

      // Bonus Trigger Check
      let bonusTriggeredNow = false;
      if (scatterCount >= 3) {
          bonusTriggeredNow = true;
          setIsBonusTriggered(true);
          SoundManager.playWin('big'); // Reuse big win sound for bonus
          
          // Add Free Spins
          setFreeSpinsLeft(prev => prev + FREE_SPINS_COUNT);
      }
        
      if (finalWin > 0) {
          setLastWin(finalWin);
          setWinningLines(newWins);
          setWinCooldown(true);

          if (!hitJackpot && !bonusTriggeredNow) {
              // Logic for 100x Win Animation (BASE GAME ONLY)
              const isBaseGameWin = freeSpinsLeft === 0 && !bonusTriggeredNow; 
              
              if (isBaseGameWin && finalWin >= bet * 100) {
                  setShowMegaWin(true);
                  SoundManager.playWin('big');
              } else {
                  if (finalWin > bet * 10) SoundManager.playWin('big');
                  else SoundManager.playWin('small');
              }
          }

          // Add to balance immediately (We deduct if they gamble)
          setBalance(prev => prev + finalWin);

          // MAX WIN CAP (256x) - Auto Stop
          if (finalWin >= bet * MAX_WIN_MULTIPLIER) {
              stopAutoplay();
              // Force clear any remaining free spins if max win hit
              setFreeSpinsLeft(0); 
              alert(`MAX WIN REACHED! (${finalWin})`);
              return;
          }

          // Autoplay Stops
          if (isAutoplayActive && autoplayConfig) {
             if (hitJackpot || (bonusTriggeredNow && autoplayConfig.stopOnBonus)) {
                 stopAutoplay();
                 return;
             }
             if (autoplayConfig.stopOnWin) { stopAutoplay(); return; }
             if (autoplayConfig.singleWinLimit && finalWin >= autoplayConfig.singleWinLimit) { stopAutoplay(); return; }
          }

      } else {
          // No win logic
          if (bonusTriggeredNow) {
              setWinCooldown(true);
          }
          
          if (isAutoplayActive && autoplayConfig && !bonusTriggeredNow && freeSpinsLeft === 0) {
             if (autoplayConfig.lossLimit && (startingAutoBalance - balance) >= autoplayConfig.lossLimit) {
                 stopAutoplay();
             }
          }
      }

      // Decrement Autoplay count (only if not a free spin)
      if (isAutoplayActive && freeSpinsLeft === 0) {
          setAutoplayCount(prev => prev - 1);
      }
  };

  const handleGambleCollect = () => {
    SoundManager.playWin('small');
    setBalance(prev => prev + gambleAmount);
    
    setIsGambling(false);
    // Reset win state so user can't gamble again until next spin
    setLastWin(0);
    setWinningLines([]);
  };

  const handleSpin = useCallback(() => {
    if (isGambling) {
        handleGambleCollect();
        return;
    }

    if (winCooldown) return;

    if (isGameActive) {
        // Quick Stop
        timerRefs.current.forEach(clearTimeout);
        timerRefs.current = [];
        setReelSpinning(Array(COLS).fill(false));
        SoundManager.playReelStop();
        processWins(nextGridRef.current);
        setIsGameActive(false);
        return;
    }

    // Logic for deducting balance
    // If Free Spin, don't deduct.
    const isFreeSpinRound = freeSpinsLeft > 0;
    
    if (isFreeSpinRound) {
        setFreeSpinsLeft(prev => prev - 1);
    } else {
        if (balance < bet) {
            if (isAutoplayActive) stopAutoplay();
            return;
        }
        setBalance(prev => prev - bet);
        setJackpot(prev => prev + (bet * JACKPOT_CONTRIBUTION));
    }

    SoundManager.playClick();
    SoundManager.playSpinStart();

    setIsGambling(false);
    setGambleAmount(0);
    setIsPaytableOpen(false);
    setIsAutoplaySettingsOpen(false);
    setJackpotWinAmount(0);
    setLastWin(0);
    setWinningLines([]);
    setIsBonusTriggered(false);
    setShowMegaWin(false);
    
    setIsGameActive(true);
    setReelSpinning(Array(COLS).fill(true));

    // High Volatility during Free Spins
    const nextGrid = generateGrid(isFreeSpinRound);
    nextGridRef.current = nextGrid;
    setGrid(nextGrid);

    // TURBO LOGIC
    const isTurbo = isAutoplayActive && autoplayConfig?.turbo;
    const INITIAL_DELAY = isTurbo ? 200 : 600; 
    const DELAY_PER_REEL = isTurbo ? 100 : 300; 
    
    timerRefs.current = [];

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

    const totalDuration = INITIAL_DELAY + ((COLS - 1) * DELAY_PER_REEL) + 200;
    const finalTimeoutId = setTimeout(() => {
        processWins(nextGrid);
        setIsGameActive(false);
        timerRefs.current = [];
    }, totalDuration);
    timerRefs.current.push(finalTimeoutId);

  }, [balance, bet, isGameActive, winCooldown, isGambling, gambleAmount, isAutoplayActive, autoplayConfig, startingAutoBalance, freeSpinsLeft]); 

  // --- Gamble Logic Handlers ---
  const handleStartGamble = () => {
    // Block if cooling down
    if (winCooldown) return;
    // Block gamble if we hit jackpot or Max Win Cap
    if (jackpotWinAmount > 0 || lastWin >= bet * MAX_WIN_MULTIPLIER) return;

    SoundManager.playClick();
    if (lastWin > 0) {
        // If we are gambling, we must stop autoplay
        if (isAutoplayActive) stopAutoplay();

        // Deduct from balance to table (since we auto-collected in processWins, we take it back)
        setBalance(prev => prev - lastWin);
        setGambleAmount(lastWin);
        setIsGambling(true);
    }
  };

  const handleGambleWin = () => {
    SoundManager.playGambleWin();
    setGambleAmount(prev => {
        const newAmt = prev * 2;
        setLastWin(newAmt);
        return newAmt;
    });
  };

  const handleGambleLose = () => {
    SoundManager.playGambleLose();
    setGambleAmount(0);
    setLastWin(0);
    setIsGambling(false);
    setWinningLines([]);
  };

  const handleStartAutoplay = (config: AutoplayConfig) => {
      setAutoplayConfig(config);
      setAutoplayCount(config.spins);
      setStartingAutoBalance(balance);
      setIsAutoplayActive(true);
      setTimeout(() => { handleSpin(); }, 100);
  };

  const getWinningCells = (colIndex: number) => {
    if (isGameActive) return [];
    const highlightedRows: number[] = [];
    winningLines.forEach(win => {
        if (win.lineIndex === -1) {
            const scatterId = SYMBOLS.find(s => s.isScatter)?.id;
            grid[colIndex].forEach((sym, rIdx) => { if (sym === scatterId) highlightedRows.push(rIdx); });
        } else {
            const line = PAYLINES.find(p => p.id === win.lineIndex);
            if (line && colIndex < win.matchCount) highlightedRows.push(line.positions[colIndex]);
        }
    });
    return highlightedRows;
  };

  return (
    <div className={`flex flex-col h-screen w-full relative overflow-hidden ${freeSpinsLeft > 0 ? 'bg-[#1a0505]' : 'bg-[#010A13]'} transition-colors duration-1000`}>
      
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-cover bg-center z-0 opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')" }}></div>
      <div className={`absolute inset-0 bg-gradient-to-t ${freeSpinsLeft > 0 ? 'from-[#330000] via-[#1a0505]/80' : 'from-[#010A13] via-[#010A13]/80'} to-transparent z-0 transition-colors duration-1000`}></div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto flex flex-col">
        
        {/* Header */}
        <div className="flex-shrink-0 pt-2 pb-0 md:py-2 text-center z-20">
             <JackpotDisplay amount={jackpot} />
             {/* Title */}
            <h1 className="hidden md:inline-block font-lol text-2xl lg:text-5xl font-bold text-[#C8AA6E] tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] border-b-2 border-[#C8AA6E] px-8 pb-1">
                {freeSpinsLeft > 0 ? <span className="text-[#D13639] animate-pulse">VOID RIFT ACTIVE</span> : <span>LEAGUE <span className="text-[#F0E6D2] inline mx-2">OF</span> SLOTS</span>}
            </h1>
        </div>

        {/* Game Area Wrapper */}
        <div className="flex-1 flex items-center justify-center w-full px-2 py-1 md:p-4 overflow-hidden relative min-h-0">
            <div className={`relative 
                w-full h-auto max-w-full max-h-full aspect-[5/3]
                border-[3px] ${freeSpinsLeft > 0 ? 'border-[#D13639] shadow-[0_0_50px_#D13639]' : 'border-[#C8AA6E] shadow-[0_0_40px_rgba(10,200,185,0.15)]'} 
                bg-[#010A13]/90 shrink-0 transition-all duration-500
            `}>
                
                {/* Reel Container */}
                <div className="flex h-full w-full relative">
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
                                    const getCoord = (col: number, row: number) => `${(col * 20) + 10}% ${(row * 33.33) + 16.66}%`;
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

                    {/* MEGA WIN ANIMATION (100x Base Game) */}
                    {showMegaWin && <MegaWinAnimation />}

                    {/* BONUS WIN OVERLAY */}
                    {isBonusTriggered && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 animate-in zoom-in duration-500">
                             <h2 className="text-4xl md:text-6xl font-lol font-black text-[#D13639] animate-bounce text-center mb-4 uppercase drop-shadow-[0_0_20px_#D13639]">
                                SPECIALA ACTIVATĂ!
                             </h2>
                             <div className="text-2xl md:text-4xl font-bold text-[#F0E6D2] drop-shadow-lg">
                                 10 ROTIRI GRATUITE
                             </div>
                        </div>
                    )}

                    {/* JACKPOT WIN OVERLAY */}
                    {jackpotWinAmount > 0 && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 animate-in zoom-in duration-500">
                             <h2 className="text-4xl md:text-6xl font-lol font-black text-[#0AC8B9] animate-bounce text-center mb-4 uppercase drop-shadow-[0_0_20px_#0AC8B9]">
                                JACKPOT WIN!
                             </h2>
                             <div className="text-5xl md:text-8xl font-black text-[#F0E6D2] drop-shadow-lg">
                                 {jackpotWinAmount.toLocaleString('ro-RO')}
                             </div>
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

                    {/* Modals */}
                    {isPaytableOpen && <Paytable onClose={() => setIsPaytableOpen(false)} currentBet={bet} />}
                    {isAutoplaySettingsOpen && <AutoplaySettings onClose={() => setIsAutoplaySettingsOpen(false)} onStart={handleStartAutoplay} currentBalance={balance} />}
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 w-full z-50">
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
                onOpenAutoplay={() => setIsAutoplaySettingsOpen(true)}
                onStopAutoplay={stopAutoplay}
                cooldown={winCooldown}
                isGambling={isGambling}
                isAutoplayActive={isAutoplayActive}
                autoplayCount={autoplayCount}
                freeSpinsLeft={freeSpinsLeft}
            />
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;