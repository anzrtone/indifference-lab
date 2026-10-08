export const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '–';
  const r = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toLocaleString(undefined, { maximumFractionDigits: 2 });
};
