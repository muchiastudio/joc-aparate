import { SlotSymbol, Payline } from './types';

// LoL Themed Symbols
// Adaugă calea către fișierele tale la proprietatea 'image'.
// Dacă fișierul nu există, va afișa iconița implicită din cod.

export const SYMBOLS: SlotSymbol[] = [
  { 
    id: 0, 
    name: 'GHERGHE', 
    icon: 'crown',
    image: '/assets/symbols/7.png', // Pune imaginea ta aici
    color: 'text-purple-400', 
    value: [0, 0, 50, 500, 2000], 
    weight: 40 
  },
  { 
    id: 1, 
    name: 'POPI', 
    icon: 'sword', 
    image: '/assets/symbols/1.png',
    color: 'text-yellow-400', 
    value: [0, 0, 20, 100, 400], 
    weight: 80 
  },
  { 
    id: 2, 
    name: 'ROBI', 
    icon: 'hat', 
    image: '/assets/symbols/4.png',
    color: 'text-red-500', 
    value: [0, 0, 20, 100, 400], 
    weight: 80 
  },
  { 
    id: 3, 
    name: 'ILIE', 
    icon: 'droplet', 
    image: '/assets/symbols/3.png',
    color: 'text-blue-500', 
    value: [0, 0, 10, 30, 100], 
    weight: 120 
  },
  { 
    id: 4, 
    name: 'CRISTI', 
    icon: 'flame', 
    image: '/assets/symbols/6.png',
    color: 'text-orange-500', 
    value: [0, 0, 10, 30, 100], 
    weight: 120 
  },
  { 
    id: 5, 
    name: 'STELI', 
    icon: 'eye', 
    image: '/assets/symbols/8.png',
    color: 'text-green-400', 
    value: [0, 0, 5, 20, 50], 
    weight: 150 
  },
  { 
    id: 6, 
    name: 'LUCI', 
    icon: 'coins', 
    image: '/assets/symbols/5.png',
    color: 'text-yellow-200', 
    value: [0, 0, 5, 20, 50], 
    weight: 150 
  },
  { 
    id: 7, 
    name: 'CIPI', 
    icon: 'box', 
    image: '/assets/symbols/2.png',
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
