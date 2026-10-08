import { FAMILY_INFO } from '../content/families';
import { QUESTIONS, fillNames } from '../content/questions';
import type { Answers, Classification, Family } from '../types';
import { FAMILIES } from '../types';
import { MAX_SCORES, MONEY_BONUS, SCORE_TABLE, TIE_BREAK_GAP, TIE_ORDER } from './table';

export function rawScores(answers: Answers): Record<Family, number> {
  const s: Record<Family, number> = { substitutes: 0, complements: 0, cobbDouglas: 0, quasilinear: 0 };
  for (const q of ['q1', 'q2', 'q3', 'q4'] as const) {
    const row = SCORE_TABLE[q + answers[q]];
    if (!row) throw new Error(`Unknown answer ${q}=${answers[q]}`);
    for (const f of FAMILIES) s[f] += row[f] ?? 0;
  }
  if (answers.bIsMoney) s.quasilinear += MONEY_BONUS;
  return s;
}

export function normalisedScores(answers: Answers): Record<Family, number> {
  const raw = rawScores(answers);
  const out = {} as Record<Family, number>;
  for (const f of FAMILIES) {
    const max = MAX_SCORES[f] + (f === 'quasilinear' && answers.bIsMoney ? MONEY_BONUS : 0);
    out[f] = raw[f] / max;
  }
  return out;
}

function ranked(scores: Record<Family, number>): Family[] {
  return [...TIE_ORDER].sort((x, y) => scores[y] - scores[x]);
}

/** Answer-driven sentences: every answer that gave points to the winner. */
export function buildReasons(answers: Answers, winner: Family, goodA = 'A', goodB = 'B'): string[] {
  const drivers: string[] = [];
  for (const q of QUESTIONS) {
    const key = answers[q.id];
    if ((SCORE_TABLE[q.id + key]?.[winner] ?? 0) > 0) {
      const opt = q.options.find((o) => o.key === key)!;
      drivers.push(fillNames(opt.reason, goodA, goodB));
    }
  }
  if (answers.bIsMoney && winner === 'quasilinear') {
    drivers.push(`${goodB} stands for money spent on everything else`);
  }
  const info = FAMILY_INFO[winner];
  const out: string[] = [];
  if (drivers.length) out.push(`You said ${joinList(drivers)}.`);
  out.push(`That is the signature of ${info.inSentence}: ${info.signature}.`);
  return out;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function classify(answers: Answers, goodA = 'A', goodB = 'B'): Classification {
  const scores = normalisedScores(answers);
  const [winner, runnerUp] = ranked(scores);
  const confidence = scores[winner] - scores[runnerUp];
  return {
    scores,
    winner,
    runnerUp,
    confidence,
    needsTieBreak: confidence < TIE_BREAK_GAP,
    reasons: buildReasons(answers, winner, goodA, goodB),
  };
}

/** Resolve a close call: the tie-break answer picks the winner outright. */
export function applyTieBreak(
  c: Classification,
  chosen: Family,
  answers: Answers,
  goodA = 'A',
  goodB = 'B',
): Classification {
  const other = chosen === c.winner ? c.runnerUp : c.winner;
  const reasons = buildReasons(answers, chosen, goodA, goodB);
  reasons.splice(
    reasons.length - 1,
    0,
    `It was a close call between ${FAMILY_INFO[c.winner].short} and ${FAMILY_INFO[c.runnerUp].short}, and your tie-break answer settled it.`,
  );
  return {
    ...c,
    winner: chosen,
    runnerUp: other,
    confidence: Math.abs(c.scores[chosen] - c.scores[other]),
    needsTieBreak: false,
    settledByTieBreak: true,
    reasons,
  };
}

export type ConfidenceLabel = 'Clear match' | 'Likely match' | 'Close call';

export function confidenceLabel(gap: number): ConfidenceLabel {
  if (gap >= 0.4) return 'Clear match';
  if (gap >= TIE_BREAK_GAP) return 'Likely match';
  return 'Close call';
}
