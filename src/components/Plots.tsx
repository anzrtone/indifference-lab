import type { Bundle, Model, PriceChangeAnalysis, Prices } from '../solvers/solve';
import { indifferenceCurve, utility } from '../solvers/solve';
import { baseLayout, cssVar, usePlot } from './usePlotly';

export interface PlotProps {
  model: Model;
  pA: number;
  pB: number;
  income: number;
  /** Decomposition for a move to newPrices (equal to the current prices when not comparing). */
  change: PriceChangeAnalysis;
  newPrices: Prices;
  goodA: string;
  goodB: string;
}

function extents(p: PlotProps) {
  const n = p.newPrices;
  const xs = [p.income / p.pA, p.income / n.pA, p.change.compensatedIncome / n.pA];
  const ys = [p.income / p.pB, p.income / n.pB, p.change.compensatedIncome / n.pB];
  return { xMax: Math.max(...xs) * 1.15, yMax: Math.max(...ys) * 1.15 };
}

const line = (pts: Bundle[]) => ({ x: pts.map((p) => p.x), y: pts.map((p) => p.y) });
const fmt = (n: number) => (Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(2));

export function Plot2D(props: PlotProps) {
  const { model, pA, pB, income, change, newPrices, goodA, goodB } = props;
  const { ref, ready } = usePlot(() => {
    const { xMax, yMax } = extents(props);
    const accent = cssVar('--accent');
    const warm = cssVar('--c-comp');
    const muted = cssVar('--muted');
    const data: Plotly.Data[] = [];

    const budget = (I: number, px: number, py: number, name: string, color: string, dash: string) =>
      data.push({
        ...line([
          { x: 0, y: I / py },
          { x: I / px, y: 0 },
        ]),
        mode: 'lines',
        name,
        line: { color, width: 2, dash },
        hoverinfo: 'skip',
      } as Plotly.Data);

    const curve = (u: number, name: string, color: string, dash = 'solid') =>
      data.push({
        ...line(indifferenceCurve(model, u, xMax, yMax)),
        mode: 'lines',
        name,
        line: { color, width: 2.5, dash, shape: 'linear' },
        hovertemplate: `u = ${fmt(u)}<extra></extra>`,
      } as Plotly.Data);

    const point = (b: Bundle, name: string, color: string, symbol = 'circle') =>
      data.push({
        x: [b.x],
        y: [b.y],
        mode: 'markers',
        name,
        marker: { color, size: 12, symbol, line: { color: cssVar('--surface'), width: 2 } },
        hovertemplate: `${name}<br>${goodA}: ${fmt(b.x)}<br>${goodB}: ${fmt(b.y)}<extra></extra>`,
      } as Plotly.Data);

    const comparing = Math.abs(newPrices.pA - pA) > 1e-9 || Math.abs(newPrices.pB - pB) > 1e-9;
    budget(income, pA, pB, comparing ? 'Budget line (before)' : 'Budget line', muted, 'solid');
    curve(change.uBefore, comparing ? 'Indifference curve (before)' : 'Indifference curve', accent);
    if (comparing) {
      budget(income, newPrices.pA, newPrices.pB, 'Budget line (new price)', warm, 'solid');
      curve(change.uAfter, 'Indifference curve (after)', warm);
      budget(change.compensatedIncome, newPrices.pA, newPrices.pB, 'Compensated budget', muted, 'dot');
    }
    point(change.before, comparing ? 'Before' : 'Best affordable bundle', accent);
    if (comparing) {
      point(change.compensated, 'Hicksian (compensated)', muted, 'diamond');
      point(change.after, 'After', warm);
    }
    return {
      data,
      layout: {
        ...baseLayout(),
        xaxis: { ...baseLayout().xaxis, title: { text: goodA }, range: [0, xMax], fixedrange: false },
        yaxis: { ...baseLayout().yaxis, title: { text: goodB }, range: [0, yMax] },
      },
    };
  }, [model.family, model.a, model.b, model.qlForm, pA, pB, income, newPrices.pA, newPrices.pB, change, goodA, goodB]);

  return (
    <div className="plot" ref={ref} role="img" aria-label={`Budget line and indifference curves for ${goodA} and ${goodB}`}>
      {!ready && <div className="plot-loading">Loading graph…</div>}
    </div>
  );
}

export function Plot3D(props: PlotProps) {
  const { model, pA, pB, income, change, goodA, goodB } = props;
  const { ref, ready } = usePlot(() => {
    const { xMax, yMax } = extents({ ...props, newPrices: { pA, pB } });
    const n = 45;
    const xs = Array.from({ length: n }, (_, i) => (xMax * (i + 1)) / n);
    const ys = Array.from({ length: n }, (_, j) => (yMax * j) / (n - 1));
    const z = ys.map((y) => xs.map((x) => utility(model, x, y)));
    const opt = change.before;
    const u0 = change.uBefore;
    const accent = cssVar('--accent');
    const warm = cssVar('--c-comp');
    // Lift the budget line onto the surface.
    const bx = Array.from({ length: 80 }, (_, i) => ((income / pA) * (i + 0.5)) / 80);
    const by = bx.map((x) => (income - pA * x) / pB);
    const bz = bx.map((x, i) => utility(model, x, by[i]));
    const data: Plotly.Data[] = [
      {
        type: 'surface',
        x: xs,
        y: ys,
        z,
        colorscale: 'Viridis',
        opacity: 0.88,
        showscale: false,
        name: 'Utility',
        contours: { z: { show: true, usecolormap: true, project: { z: true }, width: 2 } } as never,
        hovertemplate: `${goodA}: %{x:.2f}<br>${goodB}: %{y:.2f}<br>u: %{z:.2f}<extra></extra>`,
      } as Plotly.Data,
      {
        type: 'scatter3d',
        mode: 'lines',
        x: bx,
        y: by,
        z: bz,
        name: 'Budget line on the surface',
        line: { color: warm, width: 6 },
        hoverinfo: 'skip',
      } as Plotly.Data,
      {
        type: 'scatter3d',
        mode: 'markers',
        x: [opt.x],
        y: [opt.y],
        z: [u0],
        name: 'Best affordable bundle',
        marker: { color: accent, size: 6 },
      } as Plotly.Data,
    ];
    return {
      data,
      layout: {
        ...baseLayout(),
        margin: { l: 0, r: 0, t: 0, b: 0 },
        scene: {
          xaxis: { title: { text: goodA } },
          yaxis: { title: { text: goodB } },
          zaxis: { title: { text: 'utility' } },
          camera: { eye: { x: 1.6, y: -1.6, z: 0.9 } },
        },
        showlegend: false,
      },
    };
  }, [model.family, model.a, model.b, model.qlForm, pA, pB, income, change, goodA, goodB]);

  return (
    <div className="plot" ref={ref} role="img" aria-label={`3D utility surface for ${goodA} and ${goodB}`}>
      {!ready && <div className="plot-loading">Loading 3D view…</div>}
    </div>
  );
}
