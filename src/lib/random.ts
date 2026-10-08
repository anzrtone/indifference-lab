import type { Family, QlForm, Scenario } from '../types';
import { FAMILIES } from '../types';

const PAIRS: Record<Family, [string, string][]> = {
  substitutes: [
    ['Butter', 'Margarine'],
    ['Bus rides', 'Tram rides'],
    ['Brand-name pens', 'Store-brand pens'],
    ['Paperbacks', 'E-books'],
  ],
  complements: [
    ['Hot dogs', 'Buns'],
    ['Printers', 'Ink cartridges'],
    ['Bike frames', 'Wheels'],
    ['Phones', 'Chargers'],
  ],
  cobbDouglas: [
    ['Groceries', 'Eating out'],
    ['Books', 'Concerts'],
    ['Clothes', 'Travel'],
    ['Coffee', 'Cake'],
  ],
  quasilinear: [
    ['Toothpaste', 'Other money'],
    ['Gym visits', 'Other money'],
    ['Haircuts', 'Other money'],
    ['Phone data (GB)', 'Other money'],
  ],
};

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const int = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

export function randomFamily(): Family {
  return pick(FAMILIES);
}

/** Fresh goods, prices and parameters within a family, with tidy numbers. */
export function randomScenario(family: Family): Scenario {
  const [goodA, goodB] = pick(PAIRS[family]);
  const base = {
    id: `random-${Date.now().toString(36)}`,
    goodA,
    goodB,
    family,
    blurb: 'A randomly generated scenario for practice.',
  };
  switch (family) {
    case 'substitutes': {
      const b = pick([1, 1.5, 2, 3]);
      const pA = int(1, 6);
      let pB = int(1, 10);
      if (pB / b === pA) pB += 1; // avoid an exact tie
      return {
        ...base,
        pA,
        pB,
        income: pA * pB * int(2, 6),
        params: { a: 1, b },
        punchline: 'All spending goes to the good with more satisfaction per unit of money.',
      };
    }
    case 'complements': {
      const a = pick([1, 2, 3]);
      const pA = int(1, 10);
      const pB = int(1, 5);
      return {
        ...base,
        pA,
        pB,
        income: (pA + pB * a) * int(3, 10),
        params: { a, b: 1 },
        punchline: `Always ${a} ${goodB} per ${goodA}, whatever the prices.`,
      };
    }
    case 'cobbDouglas': {
      const a = pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]);
      return {
        ...base,
        pA: int(2, 20),
        pB: int(2, 20),
        income: 20 * int(5, 30),
        params: { a, b: 1 - a },
        punchline: `${Math.round(a * 100)}% of the budget goes on ${goodA}, whatever the prices.`,
      };
    }
    case 'quasilinear': {
      const pA = int(1, 5);
      const x = int(2, 12);
      const qlForm: QlForm = Math.random() < 0.5 ? 'ln' : 'sqrt';
      return {
        ...base,
        pA,
        pB: 1,
        income: Math.max(pA * x * 3, 10 * int(3, 15)),
        qlForm,
        params: { a: qlForm === 'sqrt' ? 2 * pA * Math.sqrt(x) : x * pA, b: 1 },
        punchline: `${x} units of ${goodA} at any income; extra money goes elsewhere.`,
      };
    }
  }
}
