import { useEffect } from 'react';
import { loadPlotly } from './components/usePlotly';
import { scenarioFromQuery, scenarioToQuery } from './lib/url';
import { presetById } from './presets/presets';
import { Landing } from './screens/Landing';
import { Params } from './screens/Params';
import { Presets } from './screens/Presets';
import { Question } from './screens/Question';
import { Result } from './screens/Result';
import { Setup } from './screens/Setup';
import { TieBreak } from './screens/TieBreak';
import { useStore } from './store';

export default function App() {
  const screen = useStore((s) => s.screen);
  const scenario = useStore((s) => s.scenario);
  const go = useStore((s) => s.go);
  const loadScenario = useStore((s) => s.loadScenario);

  // Restore a shared link on first load.
  useEffect(() => {
    const s = scenarioFromQuery(window.location.search);
    if (!s) return;
    const preset = presetById(s.id);
    loadScenario(preset ? { ...s, blurb: preset.blurb, punchline: preset.punchline } : s);
  }, [loadScenario]);

  // Keep the URL in sync with the result view so it can be shared.
  useEffect(() => {
    const url = screen === 'result' && scenario ? `?${scenarioToQuery(scenario)}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [screen, scenario]);

  // Warm the Plotly chunk while the user reads the landing page, so the first graph appears fast.
  useEffect(() => {
    const t = window.setTimeout(() => void loadPlotly(), 300);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go('landing')}>
          Indifference <span>· Consumer Theory Lab</span>
        </button>
        {screen !== 'presets' && screen !== 'landing' && (
          <button className="btn link" onClick={() => go('presets')}>
            Presets
          </button>
        )}
      </header>
      {screen === 'landing' && <Landing />}
      {screen === 'setup' && <Setup />}
      {screen === 'question' && <Question />}
      {screen === 'tiebreak' && <TieBreak />}
      {screen === 'params' && <Params />}
      {screen === 'presets' && <Presets />}
      {screen === 'result' && <Result />}
    </div>
  );
}
