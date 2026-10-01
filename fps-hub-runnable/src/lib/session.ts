import { cookies } from 'next/headers';
import { prisma } from './db';
import type { Role } from './policy';

const SESSION_COOKIE = 'fps_session';
const SESSION_DURATION_DAYS = 30;

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  username: string;
  role: Role;
  avatarUrl: string | null;
  theme: string;
  locale: string;
  classId: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        include: { student: { select: { classId: true } } },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }

  const u = session.user;
  if (u.status !== 'ACTIVE') return null;

  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    username: u.username,
    role: u.role as Role,
    avatarUrl: u.avatarUrl,
    theme: u.theme,
    locale: u.locale,
    classId: u.student?.classId ?? null,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) throw new Error('UNAUTHORIZED');
  return s;
}

export async function requireAdmin(): Promise<SessionUser> {
  const s = await requireSession();
  if (s.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return s;
}

export async function createSession(userId: string): Promise<string> {
  const { randomBytes } = await import('node:crypto');
  const id = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 86400_000);
  await prisma.session.create({ data: { id, userId, expiresAt } });
  return id;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_DAYS * 86400,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' });
}
