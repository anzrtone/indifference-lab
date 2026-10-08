export type Family = 'cobbDouglas' | 'quasilinear' | 'substitutes' | 'complements';

export const FAMILIES: Family[] = ['substitutes', 'complements', 'cobbDouglas', 'quasilinear'];

/** Shape of v(x) in the quasilinear form u = a·v(x) + y. */
export type QlForm = 'ln' | 'sqrt';

export interface Answers {
  q1: 'a' | 'b' | 'c';
  q2: 'a' | 'b' | 'c' | 'd';
  q3: 'a' | 'b' | 'c';
  q4: 'a' | 'b' | 'c';
  bIsMoney: boolean;
}

export type QuestionId = 'q1' | 'q2' | 'q3' | 'q4';

/**
 * Parameter meaning by family:
 *  substitutes  u = a·x + b·y
 *  complements  u = min(a·x, b·y)
 *  cobbDouglas  u = x^a · y^b, a + b = 1
 *  quasilinear  u = a·v(x) + y, v = ln or sqrt (b unused, kept at 1)
 */
export interface Scenario {
  id: string;
  goodA: string;
  goodB: string;
  pA: number;
  pB: number;
  income: number;
  family: Family;
  params: { a: number; b: number };
  qlForm?: QlForm;
  /** Absent for randomised or hand-built scenarios. */
  answers?: Answers;
  blurb: string;
  punchline: string;
}

export interface Classification {
  /** Normalised 0..1 */
  scores: Record<Family, number>;
  winner: Family;
  runnerUp: Family;
  /** Winner minus runner-up */
  confidence: number;
  needsTieBreak: boolean;
  /** True once a tie-break answer has picked the winner. */
  settledByTieBreak?: boolean;
  /** Answer-driven sentences for the result card */
  reasons: string[];
}
