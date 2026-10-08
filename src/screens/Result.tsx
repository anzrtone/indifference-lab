import { useEffect, useState } from 'react';
import { ConfidenceMeter, ScoreBars } from '../components/ScoreBars';
import { FAMILY_INFO } from '../content/families';
import { fmt } from '../lib/format';
import { PRESETS, TOUR_IDS } from '../presets/presets';
import { useStore } from '../store';
import type { Family, Scenario } from '../types';
import { FAMILIES } from '../types';
import { Lab } from './Lab';

function formulaWithNumbers(s: Scenario): string {
  const { a, b } = s.params;
  switch (s.family) {
    case 'substitutes':
      return `u = ${fmt(a)}·x + ${fmt(b)}·y`;
    case 'complements':
      return `u = min(${fmt(a)}·x, ${fmt(b)}·y)`;
    case 'cobbDouglas':
      return `u = x^${fmt(a)} · y^${fmt(b)}`;
    case 'quasilinear':
      return s.qlForm === 'sqrt' ? `u = ${fmt(a)}·√x + y` : `u = ${fmt(a)}·ln(x) + y`;
  }
}

const TOUR_SECONDS = 8;

function TourBar() {
  const { tour, setTour, go } = useStore();
  const scenario = useStore((s) => s.scenario);

  useEffect(() => {
    if (!tour.active || tour.paused) return;
    const t = window.setTimeout(() => setTour({ index: (tour.index + 1) % TOUR_IDS.length }), TOUR_SECONDS * 1000);
    return () => window.clearTimeout(t);
  }, [tour.active, tour.paused, tour.index, setTour]);

  // Pause on any interaction outside the tour bar itself.
  useEffect(() => {
    if (!tour.active || tour.paused) return;
    const pause = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.('.tour-bar')) return;
      setTour({ paused: true });
    };
    window.addEventListener('pointerdown', pause, true);
    window.addEventListener('keydown', pause, true);
    return () => {
      window.removeEventListener('pointerdown', pause, true);
      window.removeEventListener('keydown', pause, true);
    };
  }, [tour.active, tour.paused, setTour]);

  if (!tour.active || !scenario) return null;
  return (
    <div className="tour-bar" role="region" aria-label="Grand tour" aria-live="polite">
      <strong>
        Tour {tour.index + 1}/{TOUR_IDS.length}: {FAMILY_INFO[scenario.family].label}
      </strong>
      <span style={{ flex: '1 1 240px' }}>{scenario.punchline}</span>
      <button className="btn" onClick={() => setTour({ index: (tour.index + TOUR_IDS.length - 1) % TOUR_IDS.length })}>
        ‹ Prev
      </button>
      <button className="btn" onClick={() => setTour({ paused: !tour.paused })}>
        {tour.paused ? '▶ Resume' : '❚❚ Pause'}
      </button>
      <button className="btn" onClick={() => setTour({ index: (tour.index + 1) % TOUR_IDS.length })}>
        Next ›
      </button>
      <button className="btn" onClick={() => go('result')} aria-label="End tour">
        ✕
      </button>
    </div>
  );
}

function QuizCard({ scenario }: { scenario: Scenario }) {
  const { quiz, guessFamily, randomise } = useStore();
  if (!quiz.active) return null;
  const right = quiz.guess === scenario.family;
  return (
    <div className="card stack" style={{ marginBottom: 16 }}>
      <h2>Quiz: which family is this?</h2>
      <p className="muted">
        {scenario.goodA} at {fmt(scenario.pA)}, {scenario.goodB} at {fmt(scenario.pB)}, budget {fmt(scenario.income)}. Use
        the graphs and the price comparison below for clues.
      </p>
      <div className="row">
        {FAMILIES.map((f) => (
          <button
            key={f}
            className={`btn ${quiz.guess === f ? 'primary' : ''}`}
            disabled={quiz.guess !== null}
            onClick={() => guessFamily(f)}
          >
            {FAMILY_INFO[f].label}
          </button>
        ))}
      </div>
      {quiz.guess && (
        <div className="notice" role="status">
          <p style={{ margin: '0 0 8px' }}>
            {right ? '✅ Correct!' : `❌ Not quite. It's ${FAMILY_INFO[scenario.family].label}.`} The tell-tale sign:{' '}
            {FAMILY_INFO[scenario.family].signature}.
          </p>
          <button className="btn primary" onClick={() => randomise({ quiz: true })}>
            🎲 Another one
          </button>
        </div>
      )}
    </div>
  );
}

export function Result() {
  const { scenario: s, classification: c, quiz, overrideFamily, startQuestionnaire, prefillFromScenario, randomise, go } = useStore();
  const [copied, setCopied] = useState(false);
  if (!s) return null;
  const hidden = quiz.active && quiz.guess === null;
  const info = FAMILY_INFO[s.family];
  const overridden = c && c.winner !== s.family;
  const preset = PRESETS.find((p) => p.id === s.id);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', window.location.href);
    }
  };

  return (
    <main>
      <TourBar />
      <QuizCard scenario={s} />
      {!hidden && (
        <div className="card stack result-head" style={{ ['--fc' as string]: info.color }}>
          <div className="row">
            <span className="badge">{c && !overridden ? 'Closest match' : 'Family'}</span>
            <span className="muted small">
              x = {s.goodA}, y = {s.goodB}
            </span>
          </div>
          <div>
            <h2 style={{ color: info.color }}>{info.label}</h2>
            <p className="formula-big" style={{ margin: 0 }}>
              {formulaWithNumbers(s)}
            </p>
          </div>
          {c && !overridden && <ConfidenceMeter gap={c.confidence} color={info.color} tieBroken={c.settledByTieBreak} />}
          {c && !overridden && c.reasons.map((r, i) => <p key={i} style={{ margin: 0 }}>{r}</p>)}
          {overridden && (
            <p className="notice" style={{ margin: 0 }}>
              You switched family by hand. Your answers pointed to {FAMILY_INFO[c.winner].label}.
            </p>
          )}
          {!c && <p style={{ margin: 0 }}>This family is the signature of {info.signature}.</p>}
          {s.punchline && (
            <p style={{ margin: 0 }}>
              <strong>Try this:</strong> {s.punchline}
            </p>
          )}
          <p className="muted" style={{ margin: 0 }}>
            Indifference curves will be {info.curveShape}.
          </p>
          {c && (
            <details>
              <summary className="small">How each family scored</summary>
              <div style={{ marginTop: 8 }}>
                <ScoreBars scores={c.scores} />
              </div>
            </details>
          )}
          <div className="row">
            <div className="field" style={{ minWidth: 200 }}>
              <label htmlFor="family-override" className="small">
                Change family
              </label>
              <select id="family-override" value={s.family} onChange={(e) => overrideFamily(e.target.value as Family)}>
                {FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {FAMILY_INFO[f].label}
                    {c && c.winner === f ? ' (your answers)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <button className="btn" onClick={startQuestionnaire}>
              ↺ Retake questions
            </button>
            {s.answers && (
              <button className="btn" onClick={prefillFromScenario}>
                See which answers lead here
              </button>
            )}
            <button className="btn" onClick={() => randomise({ quiz: false })} title={`New random ${info.short} scenario`}>
              🎲 Randomise
            </button>
            {!preset && (
              <button className="btn" onClick={() => go('presets')}>
                Presets
              </button>
            )}
            <button className="btn" onClick={share}>
              {copied ? '✓ Link copied' : '🔗 Share link'}
            </button>
          </div>
        </div>
      )}
      <Lab scenario={s} hideFamily={hidden} />
    </main>
  );
}
