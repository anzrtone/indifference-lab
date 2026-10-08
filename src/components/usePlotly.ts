import { useEffect, useRef, useState } from 'react';

type PlotlyModule = typeof import('plotly.js-dist-min');

let plotlyPromise: Promise<PlotlyModule> | null = null;

/** Plotly is ~3 MB, so load it on first use rather than in the landing bundle. */
export function loadPlotly(): Promise<PlotlyModule> {
  plotlyPromise ??= import('plotly.js-dist-min').then((m) => ((m as unknown as { default?: PlotlyModule }).default ?? m) as PlotlyModule);
  return plotlyPromise;
}

export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function usePlot(build: () => { data: Plotly.Data[]; layout: Partial<Plotly.Layout> }, deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [plotly, setPlotly] = useState<PlotlyModule | null>(null);

  useEffect(() => {
    let alive = true;
    loadPlotly().then((p) => alive && setPlotly(p));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!plotly || !ref.current) return;
    const { data, layout } = build();
    plotly.react(ref.current, data, layout, { responsive: true, displaylogo: false, displayModeBar: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotly, ...deps]);

  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el && plotly) plotly.purge(el);
    };
  }, [plotly]);

  return { ref, ready: plotly !== null };
}

export function baseLayout(): Partial<Plotly.Layout> {
  const text = cssVar('--text');
  const grid = cssVar('--plot-grid');
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: text, family: 'Inter, system-ui, sans-serif', size: 12 },
    margin: { l: 56, r: 16, t: 8, b: 48 },
    xaxis: { gridcolor: grid, zerolinecolor: grid },
    yaxis: { gridcolor: grid, zerolinecolor: grid },
    // Above the plot so it never collides with the x-axis title; Plotly grows the top margin to fit.
    legend: { orientation: 'h', x: 0, y: 1.02, yanchor: 'bottom' },
    hovermode: 'closest',
  };
}
