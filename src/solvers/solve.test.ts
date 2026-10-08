import { describe, expect, it } from 'vitest';
import { PRESETS, presetById } from '../presets/presets';
import type { Scenario } from '../types';
import { expenditure, hicksian, indifferenceCurve, marshallian, priceChange, utility } from './solve';

const model = (s: Scenario) => ({ family: s.family, a: s.params.a, b: s.params.b, qlForm: s.qlForm });
const prices = (s: Scenario) => ({ pA: s.pA, pB: s.pB });

/** Marshallian results from the PRD §6 table. */
const EXPECTED: Record<string, [number, number]> = {
  'coke-pepsi': [0, 20],
  'coffee-sizes': [0, 6],
  pancakes: [6.67, 13.33],
  shoes: [4, 4],
  housing: [90, 2100],
  'pizza-movies': [7.5, 6],
  streaming: [10, 80],
  tea: [4, 46],
};

describe('marshallian', () => {
  it.each(PRESETS.map((p) => [p.id, p] as const))('%s matches the PRD table and exhausts the budget', (id, p) => {
    const d = marshallian(model(p), prices(p), p.income);
    expect(d.x).toBeCloseTo(EXPECTED[id][0], 2);
    expect(d.y).toBeCloseTo(EXPECTED[id][1], 2);
    expect(expenditure(prices(p), d)).toBeCloseTo(p.income, 8);
  });

  it('Coke vs Pepsi switches to all-Coke when Coke drops below 1.2', () => {
    const p = presetById('coke-pepsi')!;
    const d = marshallian(model(p), { pA: 1.1, pB: 1.2 }, p.income);
    expect(d.y).toBe(0);
    expect(d.x).toBeCloseTo(24 / 1.1);
  });

  it('streaming hours stay at 10 when income doubles', () => {
    const p = presetById('streaming')!;
    const d = marshallian(model(p), prices(p), 200);
    expect(d.x).toBeCloseTo(10);
    expect(d.y).toBeCloseTo(180);
  });

  it('housing share stays 30% whatever the rent', () => {
    const p = presetById('housing')!;
    for (const rent of [5, 10, 25]) {
      const d = marshallian(model(p), { pA: rent, pB: 1 }, p.income);
      expect((rent * d.x) / p.income).toBeCloseTo(0.3);
    }
  });

  it('quasilinear hits a corner when income is too low', () => {
    const d = marshallian({ family: 'quasilinear', a: 20, b: 1 }, { pA: 2, pB: 1 }, 10);
    expect(d.x).toBeCloseTo(5);
    expect(d.y).toBeCloseTo(0);
  });
});

describe('hicksian', () => {
  it.each(PRESETS.map((p) => [p.id, p] as const))('%s: duality, h(p, v(p, I)) = x(p, I)', (_, p) => {
    const m = model(p);
    const d = marshallian(m, prices(p), p.income);
    const u = utility(m, d.x, d.y);
    const h = hicksian(m, prices(p), u);
    expect(utility(m, h.x, h.y)).toBeCloseTo(u, 6);
    expect(expenditure(prices(p), h)).toBeCloseTo(p.income, 6);
  });

  it('pancakes: zero substitution effect when eggs get pricier', () => {
    const p = presetById('pancakes')!;
    const r = priceChange(model(p), prices(p), p.income, { pA: p.pA, pB: 1 });
    expect(r.substitutionEffect.x).toBeCloseTo(0);
    expect(r.substitutionEffect.y).toBeCloseTo(0);
    expect(r.after.y).toBeLessThan(r.before.y);
  });

  it('Coke vs Pepsi: a small Coke price cut flips the corner', () => {
    const p = presetById('coke-pepsi')!;
    const r = priceChange(model(p), prices(p), p.income, { pA: 1.1, pB: p.pB });
    expect(r.before.x).toBe(0);
    expect(r.compensated.x).toBeGreaterThan(0);
    expect(r.after.y).toBe(0);
  });

  it('quasilinear price change has no income effect on x', () => {
    const p = presetById('streaming')!;
    const r = priceChange(model(p), prices(p), p.income, { pA: 4, pB: p.pB });
    expect(r.incomeEffect.x).toBeCloseTo(0);
    expect(r.after.x).toBeCloseTo(5);
  });

  it('Cobb-Douglas decomposition sums to the total change', () => {
    const p = presetById('pizza-movies')!;
    const r = priceChange(model(p), prices(p), p.income, { pA: 24, pB: p.pB });
    expect(r.substitutionEffect.x + r.incomeEffect.x).toBeCloseTo(r.after.x - r.before.x);
    expect(r.substitutionEffect.x).toBeLessThan(0);
    expect(r.incomeEffect.x).toBeLessThan(0);
  });
});

describe('indifferenceCurve', () => {
  it.each(PRESETS.map((p) => [p.id, p] as const))('%s passes through the optimum', (_, p) => {
    const m = model(p);
    const d = marshallian(m, prices(p), p.income);
    const u = utility(m, d.x, d.y);
    const pts = indifferenceCurve(m, u, (p.income / p.pA) * 1.3, (p.income / p.pB) * 1.3);
    expect(pts.length).toBeGreaterThan(1);
    for (const pt of pts) {
      if (p.family !== 'complements') expect(utility(m, pt.x, pt.y)).toBeCloseTo(u, 4);
      else expect(utility(m, pt.x, pt.y)).toBeCloseTo(u, 6);
    }
  });
});
