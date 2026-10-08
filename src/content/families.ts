import type { Family, QlForm } from '../types';

export interface FamilyInfo {
  label: string;
  /** Label as it reads mid-sentence. */
  inSentence: string;
  short: string;
  formula: (form?: QlForm) => string;
  curveShape: string;
  signature: string;
  color: string;
}

export const FAMILY_INFO: Record<Family, FamilyInfo> = {
  substitutes: {
    label: 'Perfect substitutes',
    inSentence: 'perfect substitutes',
    short: 'Substitutes',
    formula: () => 'u = a·x + b·y',
    curveShape: 'straight lines: you trade at one fixed rate everywhere',
    signature: 'one fixed trade-off rate and an all-or-nothing switch when prices move',
    color: 'var(--c-sub)',
  },
  complements: {
    label: 'Perfect complements',
    inSentence: 'perfect complements',
    short: 'Complements',
    formula: () => 'u = min(a·x, b·y)',
    curveShape: 'L-shapes: extra of one good alone adds nothing',
    signature: 'goods consumed in a fixed ratio, so both fall together when either gets pricier',
    color: 'var(--c-comp)',
  },
  cobbDouglas: {
    label: 'Cobb-Douglas',
    inSentence: 'Cobb-Douglas preferences',
    short: 'Cobb-Douglas',
    formula: () => 'u = x^a · y^b',
    curveShape: 'smooth curves bowed toward the origin: you like a mix',
    signature: 'diminishing appetite for each good and a constant share of budget on each',
    color: 'var(--c-cd)',
  },
  quasilinear: {
    label: 'Quasilinear',
    inSentence: 'quasilinear preferences',
    short: 'Quasilinear',
    formula: (form = 'ln') => (form === 'sqrt' ? 'u = a·√x + y' : 'u = a·ln(x) + y'),
    curveShape: 'vertically shifted copies of one curve: richer you, same amount of the first good',
    signature: 'a fixed amount of the first good no matter your income, with everything extra going to the second',
    color: 'var(--c-ql)',
  },
};
