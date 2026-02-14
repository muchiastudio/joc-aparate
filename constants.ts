import { SlotSymbol, Payline } from './types';

// LoL Themed Symbols

export const SYMBOLS: SlotSymbol[] = [
 { 
    id: 99, 
    name: 'ZOZO (WILD)', 
    icon: 'ghost', // Using ghost icon for void
    image: '/assets/symbols/10.png',
    color: 'text-purple-600', 
    value: [0, 0, 100, 1000, 5000], // Pays high if you match 5 wilds
    isWild: true,
    weight: 15 // Rare in base game
  },
  { 
    id: 0, 
    name: 'GHERGHE', 
    icon: 'crown',
    image: '/assets/symbols/1.png', 
    color: 'text-purple-400', 
    value: [0, 0, 50, 500, 2000], 
    weight: 30 
  },
  { 
    id: 1, 
    name: 'POPI', 
    icon: 'sword', 
    image: '/assets/symbols/1.png',
    color: 'text-yellow-400', 
    value: [0, 0, 20, 100, 400], 
    weight: 60 
  },
  { 
    id: 2, 
    name: 'ROBI', 
    icon: 'hat', 
    image: '/assets/symbols/4.png',
    color: 'text-red-500', 
    value: [0, 0, 20, 100, 400], 
    weight: 60 
  },
  { 
    id: 3, 
    name: 'ILIE', 
    icon: 'droplet', 
    image: '/assets/symbols/3.png',
    color: 'text-blue-500', 
    value: [0, 0, 10, 30, 100], 
    weight: 100 
  },
  { 
    id: 4, 
    name: 'CRISTI', 
    icon: 'flame', 
    image: '/assets/symbols/6.png',
    color: 'text-orange-500', 
    value: [0, 0, 10, 30, 100], 
    weight: 100 
  },
  { 
    id: 5, 
    name: 'STELI', 
    icon: 'eye', 
    image: '/assets/symbols/8.png',
    color: 'text-green-400', 
    value: [0, 0, 5, 20, 50], 
    weight: 140 
  },
  { 
    id: 6, 
    name: 'LUCI', 
    icon: 'coins', 
    image: '/assets/symbols/5.png',
    color: 'text-yellow-200', 
    value: [0, 0, 5, 20, 50], 
    weight: 140 
  },
  { 
    id: 100, 
    name: 'CIPI (SCATTER)', 
    icon: 'hexagon', 
    image: '/assets/symbols/21.png',
    color: 'text-cyan-400', 
    value: [0, 0, 5, 20, 100], // Payout for scatters themselves
    isScatter: true,
    weight: 25 // Mathematical weight, but overridden by 2% logic
  },
];

export const BET_LEVELS = [1, 2, 5, 10, 20, 50, 100];
export const STARTING_BALANCE = 1000;

// Game Config
export const FREE_SPINS_COUNT = 10;
export const SCATTER_CHANCE_PERCENT = 0.02; // 2% chance to force trigger bonus
export const MAX_WIN_MULTIPLIER = 256; // Auto collect at 256x

// Jackpot Config
export const JACKPOT_SEED = 10000;
export const JACKPOT_CONTRIBUTION = 0.05; 
export const JACKPOT_CHANCE = 0.001; 

export const PAYLINES: Payline[] = [
  { id: 0, positions: [1, 1, 1, 1, 1], color: '#D13639' }, // Middle 
  { id: 1, positions: [0, 0, 0, 0, 0], color: '#0AC8B9' }, // Top 
  { id: 2, positions: [2, 2, 2, 2, 2], color: '#C8AA6E' }, // Bottom 
  { id: 3, positions: [0, 1, 2, 1, 0], color: '#A09B8C' }, // V
  { id: 4, positions: [2, 1, 0, 1, 2], color: '#005A82' }, // Inverted V
];

export const COLS = 5;
export const ROWS = 3;