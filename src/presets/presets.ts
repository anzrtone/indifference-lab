import type { Answers, Scenario } from '../types';

const SUB_KEY: Omit<Answers, 'bIsMoney'> = { q1: 'a', q2: 'c', q3: 'c', q4: 'b' };
const COMP_KEY: Omit<Answers, 'bIsMoney'> = { q1: 'c', q2: 'a', q3: 'a', q4: 'c' };
const CD_KEY: Omit<Answers, 'bIsMoney'> = { q1: 'b', q2: 'b', q3: 'a', q4: 'a' };
const QL_KEY: Omit<Answers, 'bIsMoney'> = { q1: 'b', q2: 'd', q3: 'b', q4: 'a' };

/** PRD §6. Numbers chosen so the Marshallian answer is clean. */
export const PRESETS: Scenario[] = [
  {
    id: 'coke-pepsi',
    goodA: 'Coke',
    goodB: 'Pepsi',
    pA: 1.5,
    pB: 1.2,
    income: 24,
    family: 'substitutes',
    params: { a: 1, b: 1 },
    answers: { ...SUB_KEY, bIsMoney: false },
    blurb: 'Two colas you genuinely cannot tell apart.',
    punchline: "Drag Coke's price below 1.2 and demand jumps to all-Coke: a corner switch.",
  },
  {
    id: 'coffee-sizes',
    goodA: 'Small coffee',
    goodB: 'Large coffee',
    pA: 3,
    pB: 5,
    income: 30,
    family: 'substitutes',
    params: { a: 1, b: 2 },
    answers: { ...SUB_KEY, bIsMoney: false },
    blurb: 'A large is simply two smalls in one cup.',
    punchline: 'Large is worth two smalls, so the cheaper-per-utility good wins entirely.',
  },
  {
    id: 'pancakes',
    goodA: 'Pancake mix (cups)',
    goodB: 'Eggs',
    pA: 2,
    pB: 0.5,
    income: 20,
    family: 'complements',
    params: { a: 2, b: 1 },
    answers: { ...COMP_KEY, bIsMoney: false },
    blurb: 'The recipe says 2 eggs for every cup of mix.',
    punchline: 'Price of eggs rises: the substitution effect is zero.',
  },
  {
    id: 'shoes',
    goodA: 'Left shoes',
    goodB: 'Right shoes',
    pA: 30,
    pB: 30,
    income: 240,
    family: 'complements',
    params: { a: 1, b: 1 },
    answers: { ...COMP_KEY, bIsMoney: false },
    blurb: 'A left shoe without a right one is no use to anyone.',
    punchline: 'Exactly 4 pairs, always equal quantities.',
  },
  {
    id: 'housing',
    goodA: 'Housing (m²)',
    goodB: 'Everything else',
    pA: 10,
    pB: 1,
    income: 3000,
    family: 'cobbDouglas',
    params: { a: 0.3, b: 0.7 },
    answers: { ...CD_KEY, bIsMoney: true },
    blurb: 'Space to live versus all your other spending.',
    punchline: 'Housing share stays 30 percent whatever the rent.',
  },
  {
    id: 'pizza-movies',
    goodA: 'Pizza',
    goodB: 'Movies',
    pA: 12,
    pB: 15,
    income: 180,
    family: 'cobbDouglas',
    params: { a: 0.5, b: 0.5 },
    answers: { ...CD_KEY, bIsMoney: false },
    blurb: 'A night in or a night out: you like some of both.',
    punchline: 'Equal shares; the textbook smooth case.',
  },
  {
    id: 'streaming',
    goodA: 'Streaming hours',
    goodB: 'Other money',
    pA: 2,
    pB: 1,
    income: 100,
    family: 'quasilinear',
    qlForm: 'ln',
    params: { a: 20, b: 1 },
    answers: { ...QL_KEY, bIsMoney: true },
    blurb: 'There are only so many hours of TV you want.',
    punchline: 'Double income: hours stay at 10 and all extra goes to other spending.',
  },
  {
    id: 'tea',
    goodA: 'Cups of tea',
    goodB: 'Other money',
    pA: 1,
    pB: 1,
    income: 50,
    family: 'quasilinear',
    qlForm: 'sqrt',
    params: { a: 4, b: 1 },
    answers: { ...QL_KEY, bIsMoney: true },
    blurb: 'A daily habit that does not grow with your pay.',
    punchline: 'Same income-invariance, different curvature.',
  },
];

/** One preset per family, in grand-tour order. */
export const TOUR_IDS = ['coke-pepsi', 'pancakes', 'pizza-movies', 'streaming'];

export function presetById(id: string): Scenario | undefined {
  return PRESETS.find((p) => p.id === id);
}
