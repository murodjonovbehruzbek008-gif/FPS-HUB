import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST() {
  const store = await cookies();
  const sessionId = store.get('fps_session')?.value;
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => {});
    store.set('fps_session', '', { maxAge: 0, path: '/' });
  }
  return NextResponse.json({ ok: true });
}
