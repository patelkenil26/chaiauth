const UNIT_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

/** Parses "15m" / "7d" / "30s" / "2h" into milliseconds. Throws on unsupported input. */
export const parseDurationMs = (value: string): number => {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match) throw new Error(`Unsupported duration "${value}". Use e.g. 30s, 15m, 2h, 7d.`);
  return Number(match[1]) * UNIT_MS[match[2] as keyof typeof UNIT_MS];
};

export const minutes = (n: number) => n * UNIT_MS.m;
export const hours = (n: number) => n * UNIT_MS.h;
export const days = (n: number) => n * UNIT_MS.d;
