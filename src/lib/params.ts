import type { Family, QlForm } from '../types';

export interface FriendlyParam {
  question: string;
  min: number;
  max: number;
  step: number;
  unit: (goodA: string, goodB: string) => string;
}

interface Ctx {
  pA: number;
  pB: number;
  income: number;
  qlForm?: QlForm;
}

/** PRD §5.4, with the substitutes ratio and complements wording corrected. */
export function friendlyParam(family: Family, ctx: Ctx): FriendlyParam {
  switch (family) {
    case 'substitutes':
      return {
        question: 'How many {A} is one {B} worth to you?',
        min: 0.25,
        max: 5,
        step: 0.25,
        unit: (a) => a,
      };
    case 'complements':
      return {
        question: 'How many {B} go with one {A}?',
        min: 0.25,
        max: 5,
        step: 0.25,
        unit: (_, b) => b,
      };
    case 'cobbDouglas':
      return {
        question: 'Out of every 10 you spend on these two, how many would go on {A}?',
        min: 0.5,
        max: 9.5,
        step: 0.5,
        unit: () => 'out of 10',
      };
    case 'quasilinear': {
      const affordable = ctx.income / ctx.pA;
      return {
        question: `At today's prices (${fmtPrice(ctx.pA)} for {A}, ${fmtPrice(ctx.pB)} for {B}), how many {A} would you buy?`,
        min: Math.min(1, affordable),
        max: Math.max(1, Math.floor(affordable * 0.9)),
        step: affordable > 40 ? 1 : 0.5,
        unit: (a) => a,
      };
    }
  }
}

function fmtPrice(p: number) {
  return Number.isInteger(p) ? String(p) : p.toFixed(2);
}

export function paramsFromFriendly(family: Family, value: number, ctx: Ctx): { a: number; b: number } {
  switch (family) {
    case 'substitutes':
      return { a: 1, b: value };
    case 'complements':
      return { a: value, b: 1 };
    case 'cobbDouglas':
      return { a: value / 10, b: 1 - value / 10 };
    case 'quasilinear': {
      // Interior demand: ln -> x = a·pB/pA, sqrt -> x = (a·pB / 2pA)^2
      const a = ctx.qlForm === 'sqrt' ? (2 * ctx.pA * Math.sqrt(value)) / ctx.pB : (value * ctx.pA) / ctx.pB;
      return { a, b: 1 };
    }
  }
}

export function friendlyFromParams(family: Family, params: { a: number; b: number }, ctx: Ctx): number {
  switch (family) {
    case 'substitutes':
      return params.b / params.a;
    case 'complements':
      return params.a / params.b;
    case 'cobbDouglas':
      return (10 * params.a) / (params.a + params.b);
    case 'quasilinear': {
      const r = (params.a * ctx.pB) / ctx.pA;
      return ctx.qlForm === 'sqrt' ? (r / 2) ** 2 : r;
    }
  }
}

export function defaultFriendly(family: Family, ctx: Ctx): number {
  switch (family) {
    case 'substitutes':
      return 1;
    case 'complements':
      return 1;
    case 'cobbDouglas':
      return 5;
    case 'quasilinear': {
      // Roughly a fifth of the budget on A.
      const n = (0.2 * ctx.income) / ctx.pA;
      return n >= 2 ? Math.round(n) : Math.max(0.5, Math.round(n * 2) / 2);
    }
  }
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
