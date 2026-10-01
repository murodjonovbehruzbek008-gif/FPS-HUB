import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const achievements = await prisma.achievement.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    include: {
      verifier: { select: { displayName: true, username: true } },
      club: { select: { name: true, slug: true, iconEmoji: true } },
    },
  });

  return NextResponse.json({ achievements });
}
