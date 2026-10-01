import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/password';
import { PasswordChange } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = PasswordChange.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { passwordHash: true } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!verifyPassword(parsed.data.current, user.passwordHash)) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash: hashPassword(parsed.data.next) },
  });

  return NextResponse.json({ ok: true });
}
