import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [userCount, postCount, clubCount, reportCount, users, reports] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.club.count(),
    prisma.moderationReport.count({ where: { status: 'OPEN' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, username: true, displayName: true, email: true, role: true, status: true, createdAt: true },
    }),
    prisma.moderationReport.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { reporter: { select: { displayName: true, username: true } } },
    }),
  ]);

  return NextResponse.json({ stats: { userCount, postCount, clubCount, reportCount }, users, reports });
}
