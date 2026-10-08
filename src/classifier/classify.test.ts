import { describe, expect, it } from 'vitest';
import { PRESETS } from '../presets/presets';
import type { Answers, Family } from '../types';
import { FAMILIES } from '../types';
import { applyTieBreak, classify, normalisedScores, rawScores } from './classify';
import { tieBreakFor } from './tiebreak';

function allAnswerCombos(): Answers[] {
  const out: Answers[] = [];
  for (const q1 of ['a', 'b', 'c'] as const)
    for (const q2 of ['a', 'b', 'c', 'd'] as const)
      for (const q3 of ['a', 'b', 'c'] as const)
        for (const q4 of ['a', 'b', 'c'] as const)
          for (const bIsMoney of [false, true]) out.push({ q1, q2, q3, q4, bIsMoney });
  return out;
}

describe('classify', () => {
  it.each(PRESETS.map((p) => [p.id, p] as const))('preset %s classifies to its own family with gap >= 0.25', (_, p) => {
    const c = classify(p.answers!);
    expect(c.winner).toBe(p.family);
    expect(c.confidence).toBeGreaterThanOrEqual(0.25);
    expect(c.needsTieBreak).toBe(false);
  });

  it('reaches the documented maximum scores with each answer key', () => {
    expect(rawScores({ q1: 'a', q2: 'c', q3: 'c', q4: 'b', bIsMoney: false }).substitutes).toBe(11);
    expect(rawScores({ q1: 'c', q2: 'a', q3: 'a', q4: 'c', bIsMoney: false }).complements).toBe(11);
    expect(rawScores({ q1: 'b', q2: 'b', q3: 'a', q4: 'a', bIsMoney: false }).cobbDouglas).toBe(8);
    expect(rawScores({ q1: 'b', q2: 'd', q3: 'b', q4: 'a', bIsMoney: true }).quasilinear).toBe(11);
  });

  it('every one of the 216 answer combinations returns a result or a tie-break, never an error', () => {
    const combos = allAnswerCombos();
    expect(combos).toHaveLength(216);
    for (const a of combos) {
      const c = classify(a, 'Apple', 'Pear');
      for (const f of FAMILIES) {
        expect(c.scores[f]).toBeGreaterThanOrEqual(0);
        expect(c.scores[f]).toBeLessThanOrEqual(1);
      }
      expect(c.winner).not.toBe(c.runnerUp);
      expect(c.reasons.length).toBeGreaterThan(0);
      if (c.needsTieBreak) {
        const q = tieBreakFor(c.winner, c.runnerUp);
        for (const opt of q.options) {
          const resolved = applyTieBreak(c, opt.family, a);
          expect(resolved.winner).toBe(opt.family);
          expect(resolved.needsTieBreak).toBe(false);
        }
      }
    }
  });

  it('every pair of families has a tie-break question covering both', () => {
    for (const f1 of FAMILIES)
      for (const f2 of FAMILIES) {
        if (f1 === f2) continue;
        const fams = tieBreakFor(f1, f2).options.map((o) => o.family).sort();
        expect(fams).toEqual([f1, f2].sort());
      }
  });

  it('breaks exact ties deterministically', () => {
    const ties = allAnswerCombos().filter((a) => {
      const s = normalisedScores(a);
      const sorted = FAMILIES.map((f) => s[f]).sort((x, y) => y - x);
      return sorted[0] === sorted[1];
    });
    expect(ties.length).toBeGreaterThan(0);
    for (const a of ties) expect(classify(a).winner).toBe(classify(a).winner);
  });

  it('builds plain-language reasons using the good names', () => {
    const c = classify({ q1: 'c', q2: 'a', q3: 'a', q4: 'c', bIsMoney: false }, 'Mix', 'Eggs');
    expect(c.reasons[0]).toContain('Mix');
    expect(c.reasons[0]).toContain('Eggs');
    expect(c.reasons.at(-1)).toContain('perfect complements');
  });

  it('the money toggle only ever helps quasilinear', () => {
    for (const a of allAnswerCombos().filter((x) => !x.bIsMoney)) {
      const off = rawScores(a);
      const on = rawScores({ ...a, bIsMoney: true });
      for (const f of FAMILIES as Family[]) expect(on[f] - off[f]).toBe(f === 'quasilinear' ? 2 : 0);
    }
  });
});
