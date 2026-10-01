export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export interface Actor {
  id: string;
  role: Role;
  active: boolean;
  perms: string[];
  teaches: { classId: string; subjectId: string }[];
  classId?: string | null;
}
export type Action =
  | 'grade:read'
  | 'grade:write'
  | 'report:create'
  | 'report:read'
  | 'deanon:request'
  | 'deanon:approve'
  | 'audit:read'
  | 'homework:read'
  | 'homework:write'
  | 'announcement:read'
  | 'announcement:write'
  | 'post:create'
  | 'message:read'
  | 'message:send'
  | 'class:read'
  | 'class:manage'
  | 'user:manage'
  | 'library:read'
  | 'library:reserve'
  | 'library:manage'
  | 'activity:join'
  | 'activity:manage'
  | 'achievement:verify'
  | 'recognition:vote'
  | 'recognition:manage'
  | 'moderation:review'
  | 'settings:school';

export interface Res {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  userId?: string;
  conversationId?: string;
}

export class Forbidden extends Error {
  constructor(m = 'Forbidden') {
    super(m);
    this.name = 'Forbidden';
  }
}

const teaches = (a: Actor, r: Res, needSubject: boolean) =>
  !!r.classId &&
  (!needSubject || !!r.subjectId) &&
  a.teaches.some((t) => t.classId === r.classId && (!r.subjectId || t.subjectId === r.subjectId));

const safeguarder = (a: Actor) => a.role === 'ADMIN' && a.perms.includes('safeguarding');

const staff = (a: Actor) => a.role === 'TEACHER' || a.role === 'ADMIN';

/** Single decision point. Default deny. */
export function can(a: Actor | null | undefined, action: Action, r: Res = {}): boolean {
  if (!a || !a.active) return false;
  switch (action) {
    case 'grade:read':
      return (
        a.role === 'ADMIN' ||
        (a.role === 'STUDENT' && !!r.studentId && r.studentId === a.id) ||
        (a.role === 'TEACHER' && teaches(a, r, false))
      );
    case 'grade:write':
      return a.role === 'ADMIN' || (a.role === 'TEACHER' && teaches(a, r, true));
    case 'report:create':
      return a.role === 'STUDENT' || a.role === 'TEACHER';
    case 'report:read':
    case 'deanon:request':
    case 'deanon:approve':
      return safeguarder(a);
    case 'audit:read':
      return a.role === 'ADMIN';
    case 'homework:read':
      return (
        a.role === 'ADMIN' ||
        (a.role === 'STUDENT' && (!r.classId || r.classId === a.classId)) ||
        (a.role === 'TEACHER' && (!r.classId || teaches(a, r, false)))
      );
    case 'homework:write':
      return a.role === 'ADMIN' || (a.role === 'TEACHER' && teaches(a, r, true));
    case 'announcement:read':
      return true;
    case 'announcement:write':
      return a.role === 'ADMIN' || (a.role === 'TEACHER' && (!r.classId || teaches(a, r, false)));
    case 'post:create':
      return true;
    case 'message:read':
    case 'message:send':
      return true;
    case 'class:read':
      return (
        a.role === 'ADMIN' ||
        (a.role === 'STUDENT' && (!r.classId || r.classId === a.classId)) ||
        (a.role === 'TEACHER' && (!r.classId || a.teaches.some((t) => t.classId === r.classId)))
      );
    case 'class:manage':
    case 'user:manage':
    case 'library:manage':
    case 'recognition:manage':
    case 'moderation:review':
    case 'settings:school':
      return a.role === 'ADMIN';
    case 'library:read':
      return true;
    case 'library:reserve':
      return a.role === 'STUDENT';
    case 'activity:join':
      return a.role === 'STUDENT';
    case 'activity:manage':
      return staff(a);
    case 'achievement:verify':
      return staff(a);
    case 'recognition:vote':
      return a.role === 'TEACHER' || a.role === 'ADMIN';
    default:
      return false;
  }
}

export function assertCan(a: Actor | null | undefined, action: Action, r: Res = {}): void {
  if (!can(a, action, r)) throw new Forbidden();
}
