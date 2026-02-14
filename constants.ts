import { SlotSymbol, Payline } from './types';

// LoL Themed Symbols
// Adaugă calea către fișierele tale la proprietatea 'image'.
// Dacă fișierul nu există, va afișa iconița implicită din cod.

export const SYMBOLS: SlotSymbol[] = [
  { 
    id: 0, 
    name: 'BARON NASHOR', 
    icon: 'crown',
    image: '/assets/symbols/baron.png', // Pune imaginea ta aici
    color: 'text-purple-400', 
    value: [0, 0, 50, 500, 2000], 
    weight: 40 
  },
  { 
    id: 1, 
    name: 'INFINITY EDGE', 
    icon: 'sword', 
    image: '/assets/symbols/sword.png',
    color: 'text-yellow-400', 
    value: [0, 0, 20, 100, 400], 
    weight: 80 
  },
  { 
    id: 2, 
    name: 'RABADON', 
    icon: 'hat', 
    image: '/assets/symbols/rabadon.png',
    color: 'text-red-500', 
    value: [0, 0, 20, 100, 400], 
    weight: 80 
  },
  { 
    id: 3, 
    name: 'BLUE BUFF', 
    icon: 'droplet', 
    image: '/assets/symbols/blue.png',
    color: 'text-blue-500', 
    value: [0, 0, 10, 30, 100], 
    weight: 120 
  },
  { 
    id: 4, 
    name: 'RED BUFF', 
    icon: 'flame', 
    image: '/assets/symbols/red.png',
    color: 'text-orange-500', 
    value: [0, 0, 10, 30, 100], 
    weight: 120 
  },
  { 
    id: 5, 
    name: 'WARD', 
    icon: 'eye', 
    image: '/assets/symbols/ward.png',
    color: 'text-green-400', 
    value: [0, 0, 5, 20, 50], 
    weight: 150 
  },
  { 
    id: 6, 
    name: 'GOLD', 
    icon: 'coins', 
    image: '/assets/symbols/gold.png',
    color: 'text-yellow-200', 
    value: [0, 0, 5, 20, 50], 
    weight: 150 
  },
  { 
    id: 7, 
    name: 'HEXTECH CHEST', 
    icon: 'box', 
    image: '/assets/symbols/scatter.png',
    color: 'text-cyan-400', 
    value: [0, 0, 5, 20, 100], 
    isScatter: true,
    weight: 80 
  },
];

export const BET_LEVELS = [1, 2, 5, 10, 20, 50, 100];
export const STARTING_BALANCE = 1000;

export const PAYLINES: Payline[] = [
  { id: 0, positions: [1, 1, 1, 1, 1], color: '#D13639' }, // Middle (Noxus Red)
  { id: 1, positions: [0, 0, 0, 0, 0], color: '#0AC8B9' }, // Top (Hextech Blue)
  { id: 2, positions: [2, 2, 2, 2, 2], color: '#C8AA6E' }, // Bottom (Shurima Gold)
  { id: 3, positions: [0, 1, 2, 1, 0], color: '#A09B8C' }, // V
  { id: 4, positions: [2, 1, 0, 1, 2], color: '#005A82' }, // Inverted V
];

export const COLS = 5;
export const ROWS = 3;