import { FAMILY_INFO } from '../content/families';
import { useStore } from '../store';
import { FAMILIES } from '../types';

export function Landing() {
  const { startQuestionnaire, go, startTour } = useStore();
  return (
    <main className="hero">
      <h1>Which utility function describes you?</h1>
      <p className="muted">
        Answer four everyday questions about two goods and see which of the four classic utility families fits your
        preferences, then explore the demand curves, budget lines and 3D utility surface it implies.
      </p>
      <div className="paths">
        <button className="card path" onClick={startQuestionnaire}>
          <h2>Answer a few questions →</h2>
          <p className="muted">About 2 minutes. Four questions, one per screen, and the reasoning is shown at the end.</p>
        </button>
        <button className="card path" onClick={() => go('presets')}>
          <h2>Just show me →</h2>
          <p className="muted">Pick one of eight ready-made scenarios and go straight to the graphs.</p>
        </button>
      </div>
      <button className="btn link" onClick={startTour}>
        Or take the grand tour: all four families, auto-playing
      </button>
      <div className="family-strip" aria-label="The four utility families">
        {FAMILIES.map((f) => (
          <div key={f} className="family-chip" style={{ ['--fc' as string]: FAMILY_INFO[f].color }}>
            <strong>{FAMILY_INFO[f].label}</strong>
            <span className="muted">{FAMILY_INFO[f].formula()}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
