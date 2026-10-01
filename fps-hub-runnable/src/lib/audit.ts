import { createHash } from 'node:crypto';

export interface AuditEntry {
  seq: number;
  actorId: string;
  action: string;
  target: string;
  reason: string;
  outcome: string;
  at: string;
  prevHash: string;
  hash: string;
}

const h = (s: string) => createHash('sha256').update(s).digest('hex');

/** Append-only, hash-chained. Persistence never updates or deletes rows. */
export class AuditLog {
  private rows: AuditEntry[] = [];
  append(e: Omit<AuditEntry, 'seq' | 'at' | 'prevHash' | 'hash'>): AuditEntry {
    const prevHash = this.rows.at(-1)?.hash ?? 'GENESIS';
    const base = { ...e, seq: this.rows.length + 1, at: new Date().toISOString(), prevHash };
    const row = Object.freeze({ ...base, hash: h(prevHash + JSON.stringify(base)) });
    this.rows.push(row);
    return row;
  }
  all(): readonly AuditEntry[] {
    return this.rows;
  }
  verify(): boolean {
    let prev = 'GENESIS';
    return this.rows.every(({ hash, ...b }) => {
      const ok = b.prevHash === prev && hash === h(prev + JSON.stringify(b));
      prev = hash;
      return ok;
    });
  }
}

export function chainHash(prevHash: string, payload: object): string {
  return h(prevHash + JSON.stringify(payload));
}
