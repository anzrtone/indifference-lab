import type { Answers, Family, QlForm, Scenario } from '../types';
import { FAMILIES } from '../types';

/** Encode the full scenario in a query string so links can be shared without a backend. */
export function scenarioToQuery(s: Scenario): string {
  const q = new URLSearchParams({
    f: s.family,
    ga: s.goodA,
    gb: s.goodB,
    pa: String(s.pA),
    pb: String(s.pB),
    i: String(s.income),
    a: String(round(s.params.a)),
    b: String(round(s.params.b)),
  });
  if (s.qlForm) q.set('qf', s.qlForm);
  if (s.answers) {
    const { q1, q2, q3, q4, bIsMoney } = s.answers;
    q.set('ans', `${q1}${q2}${q3}${q4}${bIsMoney ? 'm' : ''}`);
  }
  if (!s.id.startsWith('random') && !s.id.startsWith('custom')) q.set('id', s.id);
  return q.toString();
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;

export function scenarioFromQuery(search: string): Scenario | null {
  const q = new URLSearchParams(search);
  const f = q.get('f') as Family | null;
  if (!f || !FAMILIES.includes(f)) return null;
  const num = (k: string) => {
    const v = Number(q.get(k));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  const pA = num('pa');
  const pB = num('pb');
  const income = num('i');
  const a = num('a');
  const b = num('b');
  if (pA === null || pB === null || income === null || a === null || b === null) return null;
  let answers: Answers | undefined;
  const ans = q.get('ans');
  if (ans && /^[abc][abcd][abc][abc]m?$/.test(ans)) {
    answers = {
      q1: ans[0] as Answers['q1'],
      q2: ans[1] as Answers['q2'],
      q3: ans[2] as Answers['q3'],
      q4: ans[3] as Answers['q4'],
      bIsMoney: ans.endsWith('m'),
    };
  }
  const qf = q.get('qf');
  return {
    id: q.get('id') ?? 'custom-shared',
    goodA: (q.get('ga') ?? 'A').slice(0, 40),
    goodB: (q.get('gb') ?? 'B').slice(0, 40),
    pA,
    pB,
    income,
    family: f,
    params: { a, b },
    qlForm: qf === 'sqrt' || qf === 'ln' ? (qf as QlForm) : f === 'quasilinear' ? 'ln' : undefined,
    answers,
    blurb: '',
    punchline: '',
  };
}
