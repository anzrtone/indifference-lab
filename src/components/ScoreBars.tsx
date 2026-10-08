import { confidenceLabel } from '../classifier/classify';
import { FAMILY_INFO } from '../content/families';
import type { Family } from '../types';
import { FAMILIES } from '../types';

export function ScoreBars({ scores, title = 'How well each family fits your answers' }: { scores: Record<Family, number>; title?: string }) {
  return (
    <div className="bars" role="group" aria-label={title}>
      {FAMILIES.map((f) => (
        <div className="bar" key={f}>
          <span>{FAMILY_INFO[f].short}</span>
          <div className="bar-track" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${scores[f] * 100}%`, background: FAMILY_INFO[f].color }} />
          </div>
          <span className="muted">{Math.round(scores[f] * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

/** Three-step meter driven by the gap between first and second place. */
export function ConfidenceMeter({ gap, color, tieBroken = false }: { gap: number; color: string; tieBroken?: boolean }) {
  const label = confidenceLabel(gap);
  const steps = label === 'Clear match' ? 3 : label === 'Likely match' ? 2 : 1;
  return (
    <div className="row" style={{ ['--fc' as string]: color }}>
      <div className="meter" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= steps ? 'on' : ''} />
        ))}
      </div>
      <strong>{tieBroken && label === 'Close call' ? 'Close call, settled by your tie-break' : label}</strong>
      <span className="muted small">(closest match, not a verdict)</span>
    </div>
  );
}
