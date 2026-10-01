import { describe, it, expect, beforeEach } from 'vitest';
import { randomBytes } from 'node:crypto';
import { can, Actor } from '../src/lib/policy';
import { ProfileUpdate, GradeInput } from '../src/lib/schemas';
import { AnonService } from '../src/lib/anon';
import { AuditLog } from '../src/lib/audit';

const mk = (id: string, role: Actor['role'], extra: Partial<Actor> = {}): Actor => ({ id, role, active: true, perms: [], teaches: [], ...extra });
const s123 = mk('s123', 'STUDENT');
const t8A = mk('t1', 'TEACHER', { teaches: [{ classId: '8A', subjectId: 'math' }] });
const adm1 = mk('a1', 'ADMIN', { perms: ['safeguarding'] }), adm2 = mk('a2', 'ADMIN', { perms: ['safeguarding'] }), admPlain = mk('a3', 'ADMIN');

describe('IDOR / unauthorized data access', () => {
  it('student reads own grades only', () => {
    expect(can(s123, 'grade:read', { studentId: 's123' })).toBe(true);
    expect(can(s123, 'grade:read', { studentId: 's124' })).toBe(false);
    expect(can(s123, 'grade:read', {})).toBe(false);
  });
  it('teacher limited to assigned class/subject', () => {
    expect(can(t8A, 'grade:read', { classId: '8A', studentId: 's1' })).toBe(true);
    expect(can(t8A, 'grade:read', { classId: '9B', studentId: 's1' })).toBe(false);
    expect(can(t8A, 'grade:write', { classId: '8A', subjectId: 'math' })).toBe(true);
    expect(can(t8A, 'grade:write', { classId: '8A', subjectId: 'physics' })).toBe(false);
    expect(can(t8A, 'grade:write', { classId: '8A' })).toBe(false);
  });
  it('suspended accounts and anonymous callers are denied', () => {
    expect(can({ ...adm1, active: false }, 'grade:read')).toBe(false);
    expect(can(null, 'grade:read')).toBe(false);
  });
});
describe('privilege escalation', () => {
  it('students cannot write grades or reach admin actions', () => {
    for (const act of ['grade:write', 'report:read', 'deanon:request', 'audit:read'] as const) expect(can(s123, act, { classId: '8A', subjectId: 'math' })).toBe(false);
  });
  it('teachers cannot read or de-anonymize reports', () => {
    expect(can(t8A, 'report:read')).toBe(false);
    expect(can(t8A, 'deanon:approve')).toBe(false);
    expect(can(admPlain, 'report:read')).toBe(false);
  });
});
describe('mass assignment', () => {
  it('rejects role/perms/status in profile update', () => {
    expect(ProfileUpdate.safeParse({ displayName: 'Ali', role: 'ADMIN' }).success).toBe(false);
    expect(ProfileUpdate.safeParse({ perms: ['safeguarding'] }).success).toBe(false);
    expect(ProfileUpdate.safeParse({ displayName: 'Ali' }).success).toBe(true);
  });
  it('rejects teacherId/extra keys in grade input', () => {
    expect(GradeInput.safeParse({ studentId: 's', subjectId: 'm', classId: '8A', score: 90, assessmentType: 'quiz', teacherId: 'x' }).success).toBe(false);
  });
});
describe('anonymous support', () => {
  let svc: AnonService, audit: AuditLog, rid: string, token: string;
  beforeEach(() => { audit = new AuditLog(); svc = new AnonService(randomBytes(32), audit); ({ reportId: rid, followUpToken: token } = svc.submit(s123, 'Bullying', 'help')); });
  it('shows only "Anonymous Student" and no identity fields', () => {
    const v = svc.view(adm1, rid, 'weekly review');
    expect(v.author).toBe('Anonymous Student');
    expect(JSON.stringify(v)).not.toContain('s123');
  });
  it('teachers cannot view; denied attempt is audited', () => {
    expect(() => svc.view(t8A, rid, 'curious')).toThrow();
    expect(audit.all().at(-1)).toMatchObject({ actorId: 't1', outcome: 'denied' });
  });
  it('confidential follow-up works without revealing identity', () => {
    svc.reporterReply(token, 'more detail'); svc.staffReply(adm1, rid, 'we are looking into it');
    expect(svc.view(adm1, rid, 'follow-up').thread).toHaveLength(2);
  });
  it('de-anonymization needs two distinct approvers', () => {
    const q = svc.requestDeanon(adm1, rid, 'Credible risk of imminent harm to student');
    expect(svc.approveDeanon(adm1, q)).toBeNull();
    expect(() => svc.approveDeanon(admPlain, q)).toThrow();
    expect(svc.approveDeanon(adm2, q)).toBe('s123');
    expect(() => svc.approveDeanon(adm2, q)).toThrow();
  });
  it('rejects vague reasons and keeps a tamper-evident audit chain', () => {
    expect(() => svc.requestDeanon(adm1, rid, 'because')).toThrow();
    svc.view(adm1, rid, 'review'); expect(audit.verify()).toBe(true);
    (audit.all() as any)[0] = { ...audit.all()[0], outcome: 'tampered' }; expect(audit.verify()).toBe(false);
  });
});
