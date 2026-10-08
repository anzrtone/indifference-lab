import type { Family, QlForm } from '../types';

export interface Model {
  family: Family;
  a: number;
  b: number;
  qlForm?: QlForm;
}

export interface Prices {
  pA: number;
  pB: number;
}

export interface Bundle {
  x: number;
  y: number;
}

const v = (form: QlForm | undefined, x: number) => (form === 'sqrt' ? Math.sqrt(x) : Math.log(x));
const vInv = (form: QlForm | undefined, t: number) => (form === 'sqrt' ? t * t : Math.exp(t));

export function utility(m: Model, x: number, y: number): number {
  switch (m.family) {
    case 'substitutes':
      return m.a * x + m.b * y;
    case 'complements':
      return Math.min(m.a * x, m.b * y);
    case 'cobbDouglas':
      return Math.pow(x, m.a) * Math.pow(y, m.b);
    case 'quasilinear':
      return m.a * v(m.qlForm, x) + y;
  }
}

/** Interior quasilinear demand for x (independent of income). */
function qlInteriorX(m: Model, p: Prices): number {
  const r = (m.a * p.pB) / p.pA;
  return m.qlForm === 'sqrt' ? (r / 2) ** 2 : r;
}

/** Marshallian (uncompensated) demand: maximise utility on the budget line. */
export function marshallian(m: Model, p: Prices, income: number): Bundle {
  switch (m.family) {
    case 'substitutes': {
      // Bang per buck decides; on an exact tie we split the budget evenly.
      const ra = m.a / p.pA;
      const rb = m.b / p.pB;
      if (Math.abs(ra - rb) < 1e-12) return { x: income / 2 / p.pA, y: income / 2 / p.pB };
      return ra > rb ? { x: income / p.pA, y: 0 } : { x: 0, y: income / p.pB };
    }
    case 'complements': {
      // a·x = b·y on the budget line.
      const x = income / (p.pA + (p.pB * m.a) / m.b);
      return { x, y: (m.a * x) / m.b };
    }
    case 'cobbDouglas': {
      const s = m.a / (m.a + m.b);
      return { x: (s * income) / p.pA, y: ((1 - s) * income) / p.pB };
    }
    case 'quasilinear': {
      const x = Math.min(qlInteriorX(m, p), income / p.pA);
      return { x, y: (income - p.pA * x) / p.pB };
    }
  }
}

/** Hicksian (compensated) demand: cheapest bundle reaching utility u. */
export function hicksian(m: Model, p: Prices, u: number): Bundle {
  switch (m.family) {
    case 'substitutes': {
      const ra = m.a / p.pA;
      const rb = m.b / p.pB;
      if (Math.abs(ra - rb) < 1e-12) return { x: u / 2 / m.a, y: u / 2 / m.b };
      return ra > rb ? { x: u / m.a, y: 0 } : { x: 0, y: u / m.b };
    }
    case 'complements':
      return { x: u / m.a, y: u / m.b };
    case 'cobbDouglas': {
      // Normalise exponents so the closed form holds for any a, b > 0.
      const s = m.a / (m.a + m.b);
      const t = 1 - s;
      const U = Math.pow(u, 1 / (m.a + m.b));
      return {
        x: U * Math.pow((s * p.pB) / (t * p.pA), t),
        y: U * Math.pow((t * p.pA) / (s * p.pB), s),
      };
    }
    case 'quasilinear': {
      const x = qlInteriorX(m, p);
      const y = u - m.a * v(m.qlForm, x);
      if (y >= 0) return { x, y };
      return { x: vInv(m.qlForm, u / m.a), y: 0 };
    }
  }
}

export function expenditure(p: Prices, b: Bundle): number {
  return p.pA * b.x + p.pB * b.y;
}

/** Points (x, y) on the indifference curve at level u, inside [0, xMax] × [0, yMax]. */
export function indifferenceCurve(m: Model, u: number, xMax: number, yMax: number, n = 200): Bundle[] {
  switch (m.family) {
    case 'substitutes': {
      const x0 = Math.min(u / m.a, xMax);
      return [
        { x: 0, y: u / m.b },
        { x: x0, y: (u - m.a * x0) / m.b },
      ];
    }
    case 'complements': {
      const cx = u / m.a;
      const cy = u / m.b;
      return [
        { x: cx, y: Math.max(yMax, cy) * 1.2 },
        { x: cx, y: cy },
        { x: Math.max(xMax, cx) * 1.2, y: cy },
      ];
    }
    case 'cobbDouglas':
    case 'quasilinear': {
      const pts: Bundle[] = [];
      const yAt = (x: number) =>
        m.family === 'cobbDouglas'
          ? Math.pow(u / Math.pow(x, m.a), 1 / m.b)
          : u - m.a * v(m.qlForm, x);
      // Start where the curve enters the visible box.
      let lo = xMax * 1e-4;
      if (yAt(lo) > yMax * 1.5) {
        let hi = xMax;
        if (yAt(hi) > yMax * 1.5) return [];
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2;
          if (yAt(mid) > yMax * 1.5) lo = mid;
          else hi = mid;
        }
        lo = hi;
      }
      for (let i = 0; i <= n; i++) {
        const x = lo + ((xMax - lo) * i) / n;
        const y = yAt(x);
        if (y < 0) break;
        pts.push({ x, y });
      }
      return pts;
    }
  }
}

export interface PriceChangeAnalysis {
  before: Bundle;
  after: Bundle;
  /** Compensated bundle: new prices, original utility. */
  compensated: Bundle;
  uBefore: number;
  uAfter: number;
  /** Income needed at new prices to stay as well off as before. */
  compensatedIncome: number;
  substitutionEffect: Bundle;
  incomeEffect: Bundle;
}

/** Slutsky/Hicks decomposition of a move from prices p to newPrices. */
export function priceChange(m: Model, p: Prices, income: number, newPrices: Prices): PriceChangeAnalysis {
  const before = marshallian(m, p, income);
  const uBefore = utility(m, before.x, before.y);
  const after = marshallian(m, newPrices, income);
  const compensated = hicksian(m, newPrices, uBefore);
  return {
    before,
    after,
    compensated,
    uBefore,
    uAfter: utility(m, after.x, after.y),
    compensatedIncome: expenditure(newPrices, compensated),
    substitutionEffect: { x: compensated.x - before.x, y: compensated.y - before.y },
    incomeEffect: { x: after.x - compensated.x, y: after.y - compensated.y },
  };
}
