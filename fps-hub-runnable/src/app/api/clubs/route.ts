import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clubs = await prisma.club.findMany({
    orderBy: { name: 'asc' },
    include: {
      leader: { select: { displayName: true, username: true, avatarUrl: true } },
      _count: { select: { members: true, posts: true } },
      members: { where: { userId: session.id }, select: { userId: true } },
    },
  });

  return NextResponse.json({
    clubs: clubs.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      iconEmoji: c.iconEmoji,
      joinOpen: c.joinOpen,
      leader: c.leader,
      memberCount: c._count.members,
      postCount: c._count.posts,
      isMember: c.members.length > 0,
    })),
  });
}
