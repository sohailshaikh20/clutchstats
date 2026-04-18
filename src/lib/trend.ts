function linearSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const xi = i;
    num += (xi - meanX) * (values[i] - meanY);
    den += (xi - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * Trend from least-squares slope; flat when |slope| is small vs typical magnitude.
 */
export function inferDirection(values: number[]): "up" | "down" | "flat" {
  if (values.length < 2) return "flat";
  const meanAbs = values.reduce((s, v) => s + Math.abs(v), 0) / values.length || 1;
  const slope = linearSlope(values);
  if (Math.abs(slope) < 0.01 * meanAbs) return "flat";
  if (slope > 0) return "up";
  return "down";
}
