import { create } from 'zustand';
import { applyTieBreak, classify } from './classifier/classify';
import { defaultFriendly, friendlyFromParams, paramsFromFriendly } from './lib/params';
import { randomFamily, randomScenario } from './lib/random';
import { presetById, TOUR_IDS } from './presets/presets';
import type { Answers, Classification, Family, QlForm, QuestionId, Scenario } from './types';

export type Screen = 'landing' | 'setup' | 'question' | 'tiebreak' | 'params' | 'result' | 'presets';

export interface Draft {
  goodA: string;
  goodB: string;
  pA: number;
  pB: number;
  income: number;
  bIsMoney: boolean;
  answers: Partial<Record<QuestionId, string>>;
  qlForm: QlForm;
  /** Friendly parameter value from the Parameters step; null means use the default. */
  friendly: number | null;
  /** Set when the questionnaire was opened pre-filled from a preset. */
  fromPresetId?: string;
}

export const DEFAULT_DRAFT: Draft = {
  goodA: 'Apple',
  goodB: 'Pear',
  pA: 2,
  pB: 3,
  income: 30,
  bIsMoney: false,
  answers: {},
  qlForm: 'ln',
  friendly: null,
};

interface Tour {
  active: boolean;
  index: number;
  paused: boolean;
}

interface State {
  screen: Screen;
  qIndex: number;
  draft: Draft;
  classification: Classification | null;
  scenario: Scenario | null;
  quiz: { active: boolean; guess: Family | null };
  tour: Tour;

  go: (s: Screen) => void;
  startQuestionnaire: () => void;
  updateDraft: (patch: Partial<Draft>) => void;
  answer: (q: QuestionId, key: string) => void;
  setQIndex: (i: number) => void;
  finishQuestions: () => void;
  resolveTieBreak: (f: Family) => void;
  finishParams: () => void;
  loadScenario: (s: Scenario) => void;
  updateScenario: (patch: Partial<Scenario>) => void;
  overrideFamily: (f: Family) => void;
  prefillFromScenario: () => void;
  randomise: (opts: { quiz: boolean }) => void;
  guessFamily: (f: Family) => void;
  startTour: () => void;
  setTour: (patch: Partial<Tour>) => void;
}

export function draftAnswers(d: Draft): Answers | null {
  const { q1, q2, q3, q4 } = d.answers;
  if (!q1 || !q2 || !q3 || !q4) return null;
  return { q1, q2, q3, q4, bIsMoney: d.bIsMoney } as Answers;
}

function cleanName(s: string, fallback: string) {
  return s.trim() || fallback;
}

export const useStore = create<State>((set, get) => ({
  screen: 'landing',
  qIndex: 0,
  draft: DEFAULT_DRAFT,
  classification: null,
  scenario: null,
  quiz: { active: false, guess: null },
  tour: { active: false, index: 0, paused: false },

  go: (screen) => set({ screen, tour: { ...get().tour, active: false } }),

  startQuestionnaire: () =>
    set({ draft: { ...DEFAULT_DRAFT }, qIndex: 0, classification: null, screen: 'setup', quiz: { active: false, guess: null } }),

  updateDraft: (patch) => set({ draft: { ...get().draft, ...patch } }),

  answer: (q, key) => set({ draft: { ...get().draft, answers: { ...get().draft.answers, [q]: key } } }),

  setQIndex: (qIndex) => set({ qIndex }),

  finishQuestions: () => {
    const d = get().draft;
    const a = draftAnswers(d);
    if (!a) return;
    const c = classify(a, cleanName(d.goodA, 'A'), cleanName(d.goodB, 'B'));
    set({ classification: c, screen: c.needsTieBreak ? 'tiebreak' : 'params' });
  },

  resolveTieBreak: (f) => {
    const { classification: c, draft: d } = get();
    const answers = draftAnswers(d);
    if (!c || !answers) return;
    set({
      classification: applyTieBreak(c, f, answers, cleanName(d.goodA, 'A'), cleanName(d.goodB, 'B')),
      screen: 'params',
    });
  },

  finishParams: () => {
    const { draft: d, classification: c } = get();
    const answers = draftAnswers(d);
    if (!c || !answers) return;
    const family = c.winner;
    const ctx = { pA: d.pA, pB: d.pB, income: d.income, qlForm: d.qlForm };
    const value = d.friendly ?? defaultFriendly(family, ctx);
    const base = d.fromPresetId ? presetById(d.fromPresetId) : undefined;
    set({
      scenario: {
        id: `custom-${Date.now().toString(36)}`,
        goodA: cleanName(d.goodA, 'A'),
        goodB: cleanName(d.goodB, 'B'),
        pA: d.pA,
        pB: d.pB,
        income: d.income,
        family,
        params: paramsFromFriendly(family, value, ctx),
        qlForm: family === 'quasilinear' ? d.qlForm : undefined,
        answers,
        blurb: base && base.family === family ? base.blurb : 'Built from your answers.',
        punchline: base && base.family === family ? base.punchline : '',
      },
      screen: 'result',
    });
  },

  loadScenario: (s) => {
    let c = s.answers ? classify(s.answers, s.goodA, s.goodB) : null;
    // A shared link from a close call: the stored family is the tie-break answer.
    if (c && s.answers && c.needsTieBreak && (s.family === c.winner || s.family === c.runnerUp)) {
      c = applyTieBreak(c, s.family, s.answers, s.goodA, s.goodB);
    }
    set({ scenario: s, classification: c, screen: 'result', quiz: { active: false, guess: null } });
  },

  updateScenario: (patch) => {
    const s = get().scenario;
    if (s) set({ scenario: { ...s, ...patch } });
  },

  overrideFamily: (family) => {
    const s = get().scenario;
    if (!s || s.family === family) return;
    const qlForm: QlForm = s.qlForm ?? 'ln';
    const ctx = { pA: s.pA, pB: s.pB, income: s.income, qlForm };
    set({
      scenario: {
        ...s,
        family,
        qlForm: family === 'quasilinear' ? qlForm : undefined,
        params: paramsFromFriendly(family, defaultFriendly(family, ctx), ctx),
        punchline: family === s.family ? s.punchline : '',
      },
    });
  },

  prefillFromScenario: () => {
    const s = get().scenario;
    if (!s) return;
    const qlForm = s.qlForm ?? 'ln';
    const ctx = { pA: s.pA, pB: s.pB, income: s.income, qlForm };
    set({
      draft: {
        goodA: s.goodA,
        goodB: s.goodB,
        pA: s.pA,
        pB: s.pB,
        income: s.income,
        bIsMoney: s.answers?.bIsMoney ?? false,
        answers: s.answers ? { q1: s.answers.q1, q2: s.answers.q2, q3: s.answers.q3, q4: s.answers.q4 } : {},
        qlForm,
        friendly: friendlyFromParams(s.family, s.params, ctx),
        fromPresetId: s.id,
      },
      qIndex: 0,
      screen: 'question',
      tour: { ...get().tour, active: false },
    });
  },

  randomise: ({ quiz }) => {
    const family = quiz ? randomFamily() : (get().scenario?.family ?? randomFamily());
    set({
      scenario: randomScenario(family),
      classification: null,
      screen: 'result',
      quiz: { active: quiz, guess: null },
      tour: { ...get().tour, active: false },
    });
  },

  guessFamily: (f) => set({ quiz: { ...get().quiz, guess: f } }),

  startTour: () => {
    get().loadScenario(presetById(TOUR_IDS[0])!);
    set({ tour: { active: true, index: 0, paused: false } });
  },

  setTour: (patch) => {
    const tour = { ...get().tour, ...patch };
    if (patch.index !== undefined && patch.index !== get().tour.index) {
      get().loadScenario(presetById(TOUR_IDS[tour.index % TOUR_IDS.length])!);
    }
    set({ tour });
  },
}));
