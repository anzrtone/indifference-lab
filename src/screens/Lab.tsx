import { useMemo, useState } from 'react';
import { Plot2D, Plot3D } from '../components/Plots';
import { FAMILY_INFO } from '../content/families';
import { fmt } from '../lib/format';
import { priceChange } from '../solvers/solve';
import { useStore } from '../store';
import type { Scenario } from '../types';

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}

function Slider({ id, label, value, min, max, step, onChange, suffix }: SliderProps) {
  return (
    <div className="slider-row">
      <div className="head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {fmt(value)}
          {suffix}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function niceStep(max: number) {
  if (max <= 5) return 0.05;
  if (max <= 50) return 0.1;
  if (max <= 500) return 1;
  return 10;
}

function rangesFor(s: Scenario) {
  const pAMax = Math.max(5, s.pA * 3);
  const pBMax = Math.max(5, s.pB * 3);
  const iMax = Math.max(50, s.income * 3);
  const paramMax = (v: number) => Math.max(5, Math.ceil(v * 3));
  return {
    pA: { min: niceStep(pAMax), max: pAMax, step: niceStep(pAMax) },
    pB: { min: niceStep(pBMax), max: pBMax, step: niceStep(pBMax) },
    income: { min: niceStep(iMax), max: iMax, step: niceStep(iMax) },
    a: { min: 0.1, max: paramMax(s.params.a), step: paramMax(s.params.a) > 20 ? 0.5 : 0.05 },
    b: { min: 0.1, max: paramMax(s.params.b), step: 0.05 },
  };
}

export function Lab({ scenario: s, hideFamily = false }: { scenario: Scenario; hideFamily?: boolean }) {
  const updateScenario = useStore((st) => st.updateScenario);
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [compare, setCompare] = useState(false);
  const [compareGood, setCompareGood] = useState<'A' | 'B'>('A');
  const [newPrice, setNewPrice] = useState(s.pA * 2);

  // Slider ranges are fixed per loaded scenario so they don't jump while dragging.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const r = useMemo(() => rangesFor(s), [s.id, s.family]);
  const [lastId, setLastId] = useState(s.id);
  if (lastId !== s.id) {
    setLastId(s.id);
    setCompare(false);
    setCompareGood('A');
    setNewPrice(s.pA * 2);
  }

  const model = { family: s.family, a: s.params.a, b: s.params.b, qlForm: s.qlForm };
  const newPrices = {
    pA: compare && compareGood === 'A' ? newPrice : s.pA,
    pB: compare && compareGood === 'B' ? newPrice : s.pB,
  };
  const change = useMemo(
    () => priceChange(model, { pA: s.pA, pB: s.pB }, s.income, newPrices),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.family, s.params.a, s.params.b, s.qlForm, s.pA, s.pB, s.income, newPrices.pA, newPrices.pB],
  );
  const changedGood = compareGood === 'A' ? s.goodA : s.goodB;
  const se = compareGood === 'A' ? change.substitutionEffect.x : change.substitutionEffect.y;
  const ie = compareGood === 'A' ? change.incomeEffect.x : change.incomeEffect.y;
  const total = compareGood === 'A' ? change.after.x - change.before.x : change.after.y - change.before.y;
  const d = change.before;
  const shareA = (s.pA * d.x) / s.income;
  const plotProps = { model, pA: s.pA, pB: s.pB, income: s.income, change, newPrices, goodA: s.goodA, goodB: s.goodB };

  const setParams = (p: Partial<Scenario['params']>) => updateScenario({ params: { ...s.params, ...p } });

  return (
    <section className="lab" aria-label="Lab">
      <div className="card stack">
        <h3>Controls</h3>
        <Slider id="s-pA" label={`Price of ${s.goodA}`} value={s.pA} {...r.pA} onChange={(v) => updateScenario({ pA: v })} />
        <Slider
          id="s-pB"
          label={`Price of ${s.goodB}`}
          value={s.pB}
          {...r.pB}
          onChange={(v) => updateScenario({ pB: v })}
        />
        <Slider id="s-i" label="Budget" value={s.income} {...r.income} onChange={(v) => updateScenario({ income: v })} />
        <hr style={{ border: 0, borderTop: '1px solid var(--border)', width: '100%' }} />
        {s.family === 'cobbDouglas' ? (
          <Slider
            id="s-a"
            label={`Exponent a (share of budget on ${s.goodA})`}
            value={s.params.a}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={(v) => setParams({ a: v, b: Math.round((1 - v) * 100) / 100 })}
          />
        ) : (
          <>
            <Slider
              id="s-a"
              label={s.family === 'quasilinear' ? `Scale a (how much ${s.goodA} matters)` : `Weight a on ${s.goodA}`}
              value={s.params.a}
              {...r.a}
              onChange={(v) => setParams({ a: v })}
            />
            {s.family !== 'quasilinear' && (
              <Slider id="s-b" label={`Weight b on ${s.goodB}`} value={s.params.b} {...r.b} onChange={(v) => setParams({ b: v })} />
            )}
          </>
        )}
        {s.family === 'quasilinear' && (
          <div className="field">
            <label htmlFor="s-qf">Curve shape v(x)</label>
            <select id="s-qf" value={s.qlForm ?? 'ln'} onChange={(e) => updateScenario({ qlForm: e.target.value as 'ln' | 'sqrt' })}>
              <option value="ln">ln(x), logarithm</option>
              <option value="sqrt">√x, square root</option>
            </select>
          </div>
        )}
        <hr style={{ border: 0, borderTop: '1px solid var(--border)', width: '100%' }} />
        <label className="toggle">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
          <span>
            <strong>Compare a price change</strong>
            <br />
            <span className="muted small">Splits the change into substitution and income effects.</span>
          </span>
        </label>
        {compare && (
          <>
            <div className="field">
              <label htmlFor="s-cg">Which price changes?</label>
              <select
                id="s-cg"
                value={compareGood}
                onChange={(e) => {
                  const g = e.target.value as 'A' | 'B';
                  setCompareGood(g);
                  setNewPrice((g === 'A' ? s.pA : s.pB) * 2);
                }}
              >
                <option value="A">{s.goodA}</option>
                <option value="B">{s.goodB}</option>
              </select>
            </div>
            <Slider
              id="s-newp"
              label={`New price of ${changedGood}`}
              value={newPrice}
              {...(compareGood === 'A' ? r.pA : r.pB)}
              onChange={setNewPrice}
            />
          </>
        )}
      </div>

      <div className="stack" style={{ minWidth: 0 }}>
        <div className="card">
          <div className="tabs" role="tablist" aria-label="Graph view">
            {(
              [
                ['2d', '2D: budget & indifference'],
                ['3d', '3D: utility surface'],
              ] as const
            ).map(([k, label]) => (
              <button key={k} role="tab" className="tab" aria-selected={view === k} onClick={() => setView(k)}>
                {label}
              </button>
            ))}
          </div>
          {view === '2d' ? <Plot2D {...plotProps} /> : <Plot3D {...plotProps} />}
          {view === '3d' && (
            <p className="gloss" style={{ marginTop: 8 }}>
              Height is utility. The orange line is the budget line lifted onto the surface; its highest point is the best
              affordable bundle. The coloured rings on the floor are the indifference curves.
            </p>
          )}
        </div>

        <div className="card stack">
          <h3>Solution</h3>
          <p className="gloss">
            <strong>Marshallian demand</strong>: what you buy with your actual budget.{' '}
            <strong>Hicksian (compensated) demand</strong>: what you would buy at the new prices if your budget were
            adjusted to keep you exactly as satisfied as before.
          </p>
          <table className="numbers">
            <thead>
              <tr>
                <th scope="col">Bundle</th>
                <th scope="col">{s.goodA}</th>
                <th scope="col">{s.goodB}</th>
                <th scope="col">Utility</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Marshallian{compare ? ' (before)' : ''}</td>
                <td>{fmt(d.x)}</td>
                <td>{fmt(d.y)}</td>
                <td>{fmt(change.uBefore)}</td>
              </tr>
              {compare && (
                <>
                  <tr>
                    <td>Hicksian at new price</td>
                    <td>{fmt(change.compensated.x)}</td>
                    <td>{fmt(change.compensated.y)}</td>
                    <td>{fmt(change.uBefore)}</td>
                  </tr>
                  <tr>
                    <td>Marshallian (after)</td>
                    <td>{fmt(change.after.x)}</td>
                    <td>{fmt(change.after.y)}</td>
                    <td>{fmt(change.uAfter)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <p className="small" style={{ margin: 0 }}>
            Spending: {Math.round(shareA * 100)}% on {s.goodA}, {Math.round((1 - shareA) * 100)}% on {s.goodB}.
          </p>
          {compare && (
            <div className="notice small">
              <p style={{ margin: '0 0 4px' }}>
                Change in {changedGood}: <strong>{fmt(total)}</strong> = substitution effect <strong>{fmt(se)}</strong> +
                income effect <strong>{fmt(ie)}</strong>
              </p>
              <p style={{ margin: 0 }} className="muted">
                Substitution effect: the switch caused purely by the new relative price, holding satisfaction fixed. Income
                effect: the rest, caused by the price change making you richer or poorer. To stay as well off you would need a
                budget of {fmt(change.compensatedIncome)}.
              </p>
            </div>
          )}
          {!hideFamily && (
            <p className="muted small" style={{ margin: 0 }}>
              Indifference curves: {FAMILY_INFO[s.family].curveShape}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
