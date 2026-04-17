/** Stable hue 0–359 from a string (for initials avatar background). */
export function hueFromString(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
}

export function teamInitials(name: string, max = 2): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, max);
  }
  return name.slice(0, max).toUpperCase();
}
