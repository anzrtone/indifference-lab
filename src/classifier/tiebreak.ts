import type { Family } from '../types';

export interface TieBreakQuestion {
  prompt: string;
  options: { text: string; family: Family }[];
}

type PairKey = `${Family}|${Family}`;

/** One distinguishing question per pair of families. Copy uses {A}/{B}. */
const QUESTIONS: Partial<Record<PairKey, TieBreakQuestion>> = {
  'cobbDouglas|quasilinear': {
    prompt: 'If you became very rich, would you still only want a fixed amount of {A}?',
    options: [
      { text: "Yes. Past a certain amount, more money wouldn't change how much {A} I buy.", family: 'quasilinear' },
      { text: 'No. Richer me would buy more {A} as well as more {B}.', family: 'cobbDouglas' },
    ],
  },
  'cobbDouglas|substitutes': {
    prompt: 'Would you ever happily spend your whole budget on just one of them?',
    options: [
      { text: 'Yes, if it were the better deal I would go all-in.', family: 'substitutes' },
      { text: 'No, I always want at least some of each.', family: 'cobbDouglas' },
    ],
  },
  'complements|substitutes': {
    prompt: '{A} gets a little cheaper. Do you change the mix?',
    options: [
      { text: 'Yes, I would switch over to whichever is the better deal.', family: 'substitutes' },
      { text: 'No, I keep them in the same proportion and just buy a bit more of both.', family: 'complements' },
    ],
  },
  'quasilinear|substitutes': {
    prompt: 'Is one more {A} always worth the same amount of {B}, however many {A} you already have?',
    options: [
      { text: 'Yes, the trade rate never changes.', family: 'substitutes' },
      { text: 'No, extra {A} is worth less once I have plenty.', family: 'quasilinear' },
    ],
  },
  'cobbDouglas|complements': {
    prompt: 'Does extra {A} help you at all if you get no more {B}?',
    options: [
      { text: 'No, it just sits there unused.', family: 'complements' },
      { text: 'Yes, a little.', family: 'cobbDouglas' },
    ],
  },
  'complements|quasilinear': {
    prompt: 'Does extra {A} help you at all if you get no more {B}?',
    options: [
      { text: 'No, it just sits there unused.', family: 'complements' },
      { text: 'Yes, up to the amount of {A} I normally want.', family: 'quasilinear' },
    ],
  },
};

export function tieBreakFor(f1: Family, f2: Family): TieBreakQuestion {
  const [x, y] = [f1, f2].sort();
  const q = QUESTIONS[`${x}|${y}` as PairKey];
  if (!q) throw new Error(`No tie-break question for ${f1} vs ${f2}`);
  return q;
}
