const hits = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || row.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (row.n >= limit) return false;
  row.n += 1;
  return true;
}
