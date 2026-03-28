export interface Rank {
  name: string;
  minXP: number;
  color: string;
  borderColor: string;
  bg: string;
}

export const RANKS: Rank[] = [
  { name: 'IRON', minXP: 0, color: 'text-slate-500', borderColor: 'border-slate-700', bg: 'bg-slate-900/50' },
  { name: 'BRONZE', minXP: 200, color: 'text-orange-700', borderColor: 'border-orange-900', bg: 'bg-orange-950/50' },
  { name: 'SILVER', minXP: 500, color: 'text-slate-300', borderColor: 'border-slate-500', bg: 'bg-slate-800/50' },
  { name: 'GOLD', minXP: 900, color: 'text-yellow-400', borderColor: 'border-yellow-600', bg: 'bg-yellow-900/50' },
  { name: 'PLATINUM', minXP: 1400, color: 'text-cyan-400', borderColor: 'border-cyan-600', bg: 'bg-cyan-900/50' },
]

export const getRank = (xp: number): Rank => {
  return [...RANKS].reverse().find(rank => xp >= rank.minXP) || RANKS[0]
}