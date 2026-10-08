import { useStore } from '../store';

export function Setup() {
  const { draft, updateDraft, go, setQIndex } = useStore();
  const valid = draft.pA > 0 && draft.pB > 0 && draft.income > 0;

  const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <main className="card stack" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div>
        <p className="muted small">Step 1 of 6</p>
        <h2>Your two goods</h2>
        <p className="muted">Pick any two things you buy. The names are just labels; your answers do the work.</p>
      </div>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          setQIndex(0);
          go('question');
        }}
      >
        <div className="grid-2">
          <div className="field">
            <label htmlFor="goodA">Good A</label>
            <input id="goodA" type="text" maxLength={40} value={draft.goodA} onChange={(e) => updateDraft({ goodA: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="goodB">Good B</label>
            <input
              id="goodB"
              type="text"
              maxLength={40}
              value={draft.goodB}
              onChange={(e) => updateDraft({ goodB: e.target.value })}
            />
          </div>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={draft.bIsMoney}
            onChange={(e) =>
              updateDraft({
                bIsMoney: e.target.checked,
                ...(e.target.checked ? { pB: 1, goodB: draft.goodB === 'Pear' ? 'Other spending' : draft.goodB } : {}),
              })
            }
          />
          <span>
            <strong>Good B is money / all other spending</strong>
            <br />
            <span className="muted small">Its price becomes 1, since a unit of money costs exactly 1.</span>
          </span>
        </label>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="pA">Price of {draft.goodA || 'A'}</label>
            <input id="pA" type="number" min="0.01" step="any" value={draft.pA} onChange={(e) => updateDraft({ pA: num(e.target.value) })} />
          </div>
          <div className="field">
            <label htmlFor="pB">Price of {draft.goodB || 'B'}</label>
            <input
              id="pB"
              type="number"
              min="0.01"
              step="any"
              value={draft.pB}
              disabled={draft.bIsMoney}
              onChange={(e) => updateDraft({ pB: num(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="income">Budget</label>
            <input id="income" type="number" min="0.01" step="any" value={draft.income} onChange={(e) => updateDraft({ income: num(e.target.value) })} />
          </div>
        </div>
        {!valid && <p role="alert" className="notice">Prices and budget need to be above zero.</p>}
        <div className="row">
          <button type="button" className="btn" onClick={() => go('landing')}>
            ← Back
          </button>
          <span className="spacer" />
          <button type="submit" className="btn primary" disabled={!valid}>
            Start questions →
          </button>
        </div>
      </form>
    </main>
  );
}
