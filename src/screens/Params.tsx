import { useEffect } from 'react';
import { FAMILY_INFO } from '../content/families';
import { fillNames } from '../content/questions';
import { clamp, defaultFriendly, friendlyParam } from '../lib/params';
import { useStore } from '../store';

export function Params() {
  const { classification: c, draft, updateDraft, finishParams, go, setQIndex } = useStore();
  const family = c?.winner;
  const ctx = { pA: draft.pA, pB: draft.pB, income: draft.income, qlForm: draft.qlForm };
  const fp = family ? friendlyParam(family, ctx) : null;

  // Clamp a pre-filled value into range (e.g. after prices changed), or fall back to the default.
  useEffect(() => {
    if (!family || !fp) return;
    const v = draft.friendly ?? defaultFriendly(family, ctx);
    const clamped = clamp(v, fp.min, fp.max);
    if (clamped !== draft.friendly) updateDraft({ friendly: clamped });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family]);

  if (!c || !family || !fp) return null;
  const goodA = draft.goodA.trim() || 'A';
  const goodB = draft.goodB.trim() || 'B';
  const value = draft.friendly ?? defaultFriendly(family, ctx);
  const info = FAMILY_INFO[family];

  return (
    <main className="card stack" style={{ maxWidth: 640, margin: '0 auto', ['--fc' as string]: info.color }}>
      <div>
        <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={6} aria-valuenow={6} aria-label="Questionnaire progress">
          <div style={{ width: '100%' }} />
        </div>
        <p className="muted small">Step 6 of 6 · optional</p>
        <h2>
          Closest match: <span style={{ color: info.color }}>{info.label}</span>
        </h2>
        <p className="muted">One last question to set the numbers. The default is sensible, so you can skip it.</p>
      </div>
      <div className="slider-row">
        <div className="head">
          <label htmlFor="friendly">{fillNames(fp.question, goodA, goodB)}</label>
        </div>
        <div className="row">
          <input
            id="friendly"
            type="range"
            min={fp.min}
            max={fp.max}
            step={fp.step}
            value={value}
            onChange={(e) => updateDraft({ friendly: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <output htmlFor="friendly" style={{ minWidth: 90, textAlign: 'right', fontWeight: 700 }}>
            {value} {fp.unit(goodA, goodB)}
          </output>
        </div>
      </div>
      {family === 'quasilinear' && (
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend className="label">How fast does the appeal of extra {goodA} fade?</legend>
          <div className="row">
            {(
              [
                ['ln', 'Gradually (log curve)'],
                ['sqrt', 'More slowly at first (square-root curve)'],
              ] as const
            ).map(([k, text]) => (
              <label key={k} className="toggle" style={{ flex: 1, minWidth: 200 }}>
                <input type="radio" name="qlForm" checked={draft.qlForm === k} onChange={() => updateDraft({ qlForm: k })} />
                <span>{text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="row">
        <button
          className="btn"
          onClick={() => {
            setQIndex(3);
            go('question');
          }}
        >
          ← Back
        </button>
        <span className="spacer" />
        <button
          className="btn"
          onClick={() => {
            updateDraft({ friendly: null });
            finishParams();
          }}
        >
          Skip
        </button>
        <button className="btn primary" onClick={finishParams}>
          Show my result →
        </button>
      </div>
    </main>
  );
}
