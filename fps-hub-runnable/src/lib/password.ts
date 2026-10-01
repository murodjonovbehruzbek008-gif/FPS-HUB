import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(pw: string): string {
  const s = randomBytes(16);
  return `${s.toString('hex')}:${scryptSync(pw, s, 32).toString('hex')}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [s, k] = stored.split(':');
  if (!s || !k) return false;
  try {
    return timingSafeEqual(scryptSync(pw, Buffer.from(s, 'hex'), 32), Buffer.from(k, 'hex'));
  } catch {
    return false;
  }
}
