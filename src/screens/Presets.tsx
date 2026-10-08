import { FAMILY_INFO } from '../content/families';
import { PRESETS } from '../presets/presets';
import { useStore } from '../store';
import { FAMILIES } from '../types';

export function Presets() {
  const { loadScenario, go, randomise } = useStore();
  return (
    <main className="stack">
      <div className="row">
        <div>
          <h2>Pick a scenario</h2>
          <p className="muted">Two per family. Each loads straight into the lab.</p>
        </div>
        <span className="spacer" />
        <button className="btn" onClick={() => randomise({ quiz: true })}>
          🎲 Quiz me on a random one
        </button>
        <button className="btn" onClick={() => go('landing')}>
          ← Back
        </button>
      </div>
      {FAMILIES.map((f) => (
        <section key={f} className="preset-group" aria-labelledby={`group-${f}`}>
          <h3 id={`group-${f}`}>
            <span className="dot" style={{ background: FAMILY_INFO[f].color }} aria-hidden="true" />
            {FAMILY_INFO[f].label}
          </h3>
          <div className="preset-grid">
            {PRESETS.filter((p) => p.family === f).map((p) => (
              <button
                key={p.id}
                className="card preset-card"
                style={{ ['--fc' as string]: FAMILY_INFO[f].color }}
                onClick={() => loadScenario(p)}
              >
                <strong>
                  {p.goodA} vs {p.goodB}
                </strong>
                <p className="muted small" style={{ margin: '4px 0' }}>
                  {p.blurb}
                </p>
                <p className="small" style={{ margin: 0 }}>
                  {p.punchline}
                </p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
