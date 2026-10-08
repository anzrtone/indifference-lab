import type { QuestionId } from '../types';

/** Small animated bundle sketches beside each question (decorative). */
export function Sketch({ q }: { q: QuestionId }) {
  return (
    <svg className="sketch" viewBox="0 0 200 140" aria-hidden="true">
      <style>{`
        .sk-a { fill: var(--c-comp); }
        .sk-b { fill: var(--c-cd); }
        .sk-line { stroke: var(--muted); stroke-width: 2; fill: none; }
        .sk-text { fill: var(--muted); font: 600 12px system-ui, sans-serif; }
        @keyframes sk-swap { 0%,20% { transform: translateX(0) } 50%,70% { transform: translateX(90px) } 100% { transform: translateX(0) } }
        @keyframes sk-pop { 0%,30% { opacity: 0; transform: translateY(-10px) } 50%,90% { opacity: 1; transform: none } 100% { opacity: 0 } }
        @keyframes sk-grow { 0%,25% { transform: scaleX(1) } 55%,90% { transform: scaleX(2) } 100% { transform: scaleX(1) } }
        @keyframes sk-tag { 0%,25% { opacity: 1 } 45%,90% { opacity: 0 } 100% { opacity: 1 } }
        @keyframes sk-tag2 { 0%,25% { opacity: 0 } 45%,90% { opacity: 1 } 100% { opacity: 0 } }
        .anim-swap { animation: sk-swap 3.5s ease-in-out infinite; }
        .anim-pop { animation: sk-pop 3s ease-out infinite; transform-box: fill-box; }
        .anim-grow { animation: sk-grow 3.5s ease-in-out infinite; transform-origin: 20px 0; transform-box: view-box; }
        .anim-tag { animation: sk-tag 3.5s infinite; }
        .anim-tag2 { animation: sk-tag2 3.5s infinite; }
      `}</style>
      {q === 'q1' && (
        <>
          <circle className="sk-a anim-swap" cx="50" cy="60" r="16" />
          <rect className="sk-b" x="125" y="44" width="32" height="32" rx="6" />
          <path className="sk-line" d="M70 100 h60 m-8 -6 l8 6 l-8 6 M130 116 h-60 m8 -6 l-8 6 l8 6" />
          <text className="sk-text" x="100" y="135" textAnchor="middle">swap?</text>
        </>
      )}
      {q === 'q2' && (
        <>
          {[0, 1, 2].map((i) => (
            <circle key={i} className="sk-a" cx={40 + i * 26} cy="90" r="11" />
          ))}
          {[0, 1].map((i) => (
            <circle key={`n${i}`} className="sk-a anim-pop" cx={52 + i * 26} cy="62" r="11" opacity="0.8" />
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={`b${i}`} className="sk-b" x={124 + i * 24} y="80" width="20" height="20" rx="4" />
          ))}
          <text className="sk-text" x="66" y="125" textAnchor="middle">+5 more</text>
        </>
      )}
      {q === 'q3' && (
        <>
          <rect x="20" y="40" width="70" height="44" rx="8" className="sk-line" />
          <text className="sk-text" x="55" y="67" textAnchor="middle">budget</text>
          <g className="anim-grow">
            <rect x="20" y="100" width="70" height="14" rx="4" className="sk-a" opacity="0.85" />
          </g>
          <circle className="sk-a" cx="140" cy="60" r="14" />
          <rect className="sk-b" x="160" y="46" width="28" height="28" rx="6" />
          <text className="sk-text" x="160" y="125" textAnchor="middle">×2 ?</text>
        </>
      )}
      {q === 'q4' && (
        <>
          <circle className="sk-a" cx="60" cy="60" r="20" />
          <path className="sk-line" d="M95 40 l30 0 l12 12 l-12 12 l-30 0 z" />
          <text className="sk-text anim-tag" x="112" y="56" textAnchor="middle">£2</text>
          <text className="sk-text anim-tag2" x="112" y="56" textAnchor="middle" style={{ fill: 'var(--c-comp)' }}>£4</text>
          <text className="sk-text" x="100" y="120" textAnchor="middle">price doubles</text>
        </>
      )}
    </svg>
  );
}
