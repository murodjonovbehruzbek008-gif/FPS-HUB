import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: { select: { displayName: true, username: true, avatarUrl: true, role: true } },
      club: { select: { name: true, slug: true, iconEmoji: true } },
    },
  });

  return NextResponse.json({ announcements });
}
