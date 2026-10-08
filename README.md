# Indifference: Consumer Theory Lab

Answer four questions about two goods (or pick a preset) and the app classifies your preferences into one of four utility families, then shows Marshallian and Hicksian demand with 2D and 3D graphs.

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # Vitest: classifier + solvers
npm run build
```

## Layout

| Path | What |
| --- | --- |
| `src/classifier/` | Score table, `classify()`, tie-break questions. Pure code, no UI. |
| `src/presets/` | The eight scenarios from PRD §6 (also test fixtures). |
| `src/solvers/` | Marshallian / Hicksian demand, indifference curves, Slutsky decomposition. |
| `src/content/` | Question copy, family descriptions. |
| `src/lib/` | Friendly-parameter mapping, randomiser, URL state. |
| `src/screens/`, `src/components/` | React UI. Plotly is lazy-loaded. |
| `src/store.ts` | Zustand store; the `Scenario` object is the contract between entry flow and lab. |

## Deviations from PRD v0.1

- **Substitutes parameter (§5.4):** "how many A is one B worth" = k gives **b/a = k** (the PRD says a/b). The coffee preset (x + 2y) confirms this.
- **Complements question:** asked as "how many B go with one A" so the pancake example (2 eggs per cup) reads naturally; maps to `min(r·x, y)`.
- **Q2d wording:** changed from satiation ("wouldn't want more at any price") to income-invariance, which is what quasilinear actually means.
- **Quasilinear shape:** `Scenario.qlForm: 'ln' | 'sqrt'` added so the tea preset (4√x + y) is representable.
- **Tie-break:** ~38% of the 216 answer combinations fall under the 0.15 gap, so it is fully implemented: one question per family pair, and the answer picks the winner.
- **Confidence meter:** shown as Clear / Likely / Close call rather than a raw percentage (a perfect quasilinear answer key has a gap of only 0.5).
- **Housing preset:** money toggle on (B is "everything else" at price 1). Still classifies Cobb-Douglas with a 0.45 gap.
- **`Scenario.answers`** is optional (random and shared scenarios may have none).
- **Price comparison** works for either good, so the pancake "price of eggs rises" punchline can be demonstrated.
- The solver/plot lab (separate PRD) is implemented in a basic form so the app is demo-ready.
