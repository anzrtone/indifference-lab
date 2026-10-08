import { useEffect, useRef } from 'react';
import { classify, confidenceLabel } from '../classifier/classify';
import { ScoreBars } from '../components/ScoreBars';
import { Sketch } from '../components/Sketch';
import { FAMILY_INFO } from '../content/families';
import { QUESTIONS, fillNames } from '../content/questions';
import { draftAnswers, useStore } from '../store';

export function Question() {
  const { draft, qIndex, setQIndex, answer, go, finishQuestions } = useStore();
  const q = QUESTIONS[qIndex];
  const goodA = draft.goodA.trim() || 'A';
  const goodB = draft.goodB.trim() || 'B';
  const chosen = draft.answers[q.id];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const last = qIndex === QUESTIONS.length - 1;

  useEffect(() => headingRef.current?.focus(), [qIndex]);

  const next = () => {
    if (!chosen) return;
    if (last) finishQuestions();
    else setQIndex(qIndex + 1);
  };

  // In "see which answers lead here" mode, show the live classification as answers change.
  const all = draftAnswers(draft);
  const live = draft.fromPresetId && all ? classify(all, goodA, goodB) : null;

  return (
    <main className="card stack" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={6}
          aria-valuenow={qIndex + 2}
          aria-label="Questionnaire progress"
        >
          <div style={{ width: `${((qIndex + 2) / 6) * 100}%` }} />
        </div>
        <p className="muted small">
          Step {qIndex + 2} of 6 · Question {qIndex + 1} of 4
        </p>
      </div>
      <div className="question-layout">
        <div className="stack">
          <div>
            <p className="muted small" style={{ marginBottom: 4 }}>
              {q.title}
            </p>
            <h2 ref={headingRef} tabIndex={-1} id={`${q.id}-prompt`}>
              {fillNames(q.prompt, goodA, goodB)}
            </h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <fieldset className="options" aria-labelledby={`${q.id}-prompt`}>
              {q.options.map((o) => (
                <label key={o.key} className={`option ${chosen === o.key ? 'checked' : ''}`}>
                  <input
                    type="radio"
                    name={q.id}
                    value={o.key}
                    checked={chosen === o.key}
                    onChange={() => answer(q.id, o.key)}
                  />
                  <span className="key" aria-hidden="true">
                    {o.key.toUpperCase()}
                  </span>
                  <span>{fillNames(o.text, goodA, goodB)}</span>
                </label>
              ))}
            </fieldset>
            <div className="row" style={{ marginTop: 16 }}>
              <button type="button" className="btn" onClick={() => (qIndex === 0 ? go('setup') : setQIndex(qIndex - 1))}>
                ← Back
              </button>
              <span className="spacer" />
              <button type="submit" className="btn primary" disabled={!chosen}>
                {last ? 'See my result →' : 'Next →'}
              </button>
            </div>
          </form>
        </div>
        <Sketch q={q.id} />
      </div>
      {live && (
        <div className="notice stack" aria-live="polite">
          <p style={{ margin: 0 }}>
            <strong>Live:</strong> these answers currently point to{' '}
            <strong style={{ color: FAMILY_INFO[live.winner].color }}>{FAMILY_INFO[live.winner].label}</strong> (
            {confidenceLabel(live.confidence).toLowerCase()}). Change an answer to watch it move.
          </p>
          <ScoreBars scores={live.scores} />
        </div>
      )}
    </main>
  );
}
