import { tieBreakFor } from '../classifier/tiebreak';
import { ScoreBars } from '../components/ScoreBars';
import { FAMILY_INFO } from '../content/families';
import { fillNames } from '../content/questions';
import { useStore } from '../store';

export function TieBreak() {
  const { classification: c, draft, resolveTieBreak, go, setQIndex } = useStore();
  if (!c) return null;
  const goodA = draft.goodA.trim() || 'A';
  const goodB = draft.goodB.trim() || 'B';
  const q = tieBreakFor(c.winner, c.runnerUp);

  return (
    <main className="card stack" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div>
        <p className="muted small">One more question</p>
        <h2>
          It's close between {FAMILY_INFO[c.winner].label} and {FAMILY_INFO[c.runnerUp].label}
        </h2>
        <p className="muted">Your answers fit both about equally. This question tells them apart.</p>
      </div>
      <ScoreBars scores={c.scores} />
      <h3>{fillNames(q.prompt, goodA, goodB)}</h3>
      <div className="options">
        {q.options.map((o) => (
          <button key={o.family} className="option" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => resolveTieBreak(o.family)}>
            {fillNames(o.text, goodA, goodB)}
          </button>
        ))}
      </div>
      <div className="row">
        <button
          className="btn"
          onClick={() => {
            setQIndex(3);
            go('question');
          }}
        >
          ← Back to questions
        </button>
      </div>
    </main>
  );
}
