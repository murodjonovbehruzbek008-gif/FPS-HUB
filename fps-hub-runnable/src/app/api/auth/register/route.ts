import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createSession, setSessionCookie } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const RegisterInput = z.object({
  email: z.string().email().max(254),
  username: z.string().min(3).max(32).regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(1).max(80),
  password: z.string().min(10).max(200),
  role: z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),
  grade: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RegisterInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const { email, username, displayName, password, role, grade } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: email.toLowerCase() }, { username }] },
  });
  if (existing) {
    return NextResponse.json({ error: 'Email or username already taken' }, { status: 409 });
  }

  const passwordHash = hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      displayName,
      passwordHash,
      role,
      grade: grade ?? '',
    },
  });

  if (role === 'STUDENT') {
    await prisma.studentProfile.create({ data: { userId: user.id } });
  } else if (role === 'TEACHER') {
    await prisma.teacherProfile.create({ data: { userId: user.id } });
  }

  const sessionId = await createSession(user.id);
  await setSessionCookie(sessionId);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  }, { status: 201 });
}
