import type { Family } from '../types';

/** Evidence points per answer (PRD §5.3). Unlisted families score 0. */
export const SCORE_TABLE: Record<string, Partial<Record<Family, number>>> = {
  q1a: { substitutes: 3 },
  q1b: { cobbDouglas: 2, quasilinear: 1 },
  q1c: { complements: 3 },
  q2a: { complements: 3 },
  q2b: { cobbDouglas: 2, quasilinear: 1 },
  q2c: { substitutes: 3 },
  q2d: { quasilinear: 3 },
  q3a: { substitutes: 1, complements: 2, cobbDouglas: 2 },
  q3b: { quasilinear: 3 },
  q3c: { substitutes: 2 },
  q4a: { cobbDouglas: 2, quasilinear: 2 },
  q4b: { substitutes: 3 },
  q4c: { complements: 3 },
};

export const MONEY_BONUS = 2;

/** Maximum achievable score per family, without the money toggle. */
export const MAX_SCORES: Record<Family, number> = {
  substitutes: 11,
  complements: 11,
  cobbDouglas: 8,
  quasilinear: 9,
};

export const TIE_BREAK_GAP = 0.15;

/** Fixed order used only to break exact ties deterministically. */
export const TIE_ORDER: Family[] = ['cobbDouglas', 'quasilinear', 'substitutes', 'complements'];
