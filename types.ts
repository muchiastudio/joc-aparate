export interface SlotSymbol {
  id: number;
  name: string;
  icon: string; // Emoji key or fallback icon name
  image?: string; // Path to your custom image file (e.g., '/assets/symbols/7.png')
  color: string;
  value: number[]; // Multipliers for 1, 2, 3, 4, 5 matches
  isScatter?: boolean;
  weight: number; // Probability weight (higher = more frequent)
}

export interface Payline {
  id: number;
  positions: number[]; // Array of row indices for each column [0,0,0,0,0]
  color: string;
}

export interface WinData {
  amount: number;
  lineIndex: number; // -1 if scatter
  symbolId: number;
  matchCount: number;
}

export type GridState = number[][]; // 5 columns x 3 rows containing symbol IDs