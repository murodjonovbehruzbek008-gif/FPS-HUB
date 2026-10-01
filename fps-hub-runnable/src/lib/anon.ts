import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { Actor, assertCan, can } from './policy';
import { AuditLog } from './audit';

export const ANON_NOTICE = 'Your identity will not be shown to other users. The system is designed to protect your anonymity, but the school may have procedures that require disclosing your identity in exceptional safeguarding circumstances.';
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
export const seal = (key: Buffer, v: string) => { const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key, iv); const ct = Buffer.concat([c.update(v, 'utf8'), c.final()]); return Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64'); };
export const unseal = (key: Buffer, s: string) => { const b = Buffer.from(s, 'base64'), d = createDecipheriv('aes-256-gcm', key, b.subarray(0, 12)); d.setAuthTag(b.subarray(12, 28)); return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8'); };

interface Report { id: string; category: string; body: string; tokenHash: string }
interface Msg { reportId: string; fromReporter: boolean; body: string }
interface Req { id: string; reportId: string; requesterId: string; reason: string; approvals: string[]; done: boolean }
/** Separate maps mirror the separate tables; identity is private to this service. A Prisma-backed store replaces the maps later. */
export class AnonService {
  private reports = new Map<string, Report>(); private identities = new Map<string, string>();
  private msgs: Msg[] = []; private reqs = new Map<string, Req>();
  constructor(private key: Buffer, private audit: AuditLog) {}

  submit(a: Actor, category: string, body: string) {
    assertCan(a, 'report:create');
    const id = randomUUID(), token = randomBytes(24).toString('hex');
    this.reports.set(id, { id, category, body, tokenHash: sha(token) });
    this.identities.set(id, seal(this.key, a.id));
    return { reportId: id, followUpToken: token }; // token shown once; only its hash is stored
  }
  view(a: Actor, reportId: string, reason: string) {
    const ok = can(a, 'report:read');
    this.audit.append({ actorId: a?.id ?? 'unknown', action: 'report:view', target: reportId, reason, outcome: ok ? 'allowed' : 'denied' });
    assertCan(a, 'report:read');
    const r = this.reports.get(reportId); if (!r) throw new Error('Not found');
    return { id: r.id, category: r.category, body: r.body, author: 'Anonymous Student', thread: this.msgs.filter(m => m.reportId === reportId) };
  }
  reporterReply(token: string, body: string) {
    const r = [...this.reports.values()].find(x => x.tokenHash === sha(token)); if (!r) throw new Error('Not found');
    this.msgs.push({ reportId: r.id, fromReporter: true, body });
  }
  staffReply(a: Actor, reportId: string, body: string) { assertCan(a, 'report:read'); this.msgs.push({ reportId, fromReporter: false, body }); }

  requestDeanon(a: Actor, reportId: string, reason: string) {
    const ok = can(a, 'deanon:request') && reason.trim().length >= 20;
    this.audit.append({ actorId: a?.id ?? 'unknown', action: 'deanon:request', target: reportId, reason, outcome: ok ? 'allowed' : 'denied' });
    if (!ok) throw new Error('Forbidden or reason too short');
    const id = randomUUID(); this.reqs.set(id, { id, reportId, requesterId: a.id, reason, approvals: [a.id], done: false }); return id;
  }
  /** Reveals identity only after two DISTINCT authorized approvers. Returns null until then. */
  approveDeanon(a: Actor, reqId: string): string | null {
    const q = this.reqs.get(reqId), ok = can(a, 'deanon:approve') && !!q && !q.done;
    this.audit.append({ actorId: a?.id ?? 'unknown', action: 'deanon:approve', target: reqId, reason: q?.reason ?? '', outcome: ok ? 'allowed' : 'denied' });
    if (!ok || !q) throw new Error('Forbidden');
    if (!q.approvals.includes(a.id)) q.approvals.push(a.id);
    if (q.approvals.length < 2) return null;
    q.done = true;
    const author = unseal(this.key, this.identities.get(q.reportId)!);
    this.audit.append({ actorId: a.id, action: 'deanon:revealed', target: q.reportId, reason: q.reason, outcome: 'executed' });
    return author;
  }
}
