import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      leader: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
      members: {
        take: 20,
        include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true, role: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { members: true, posts: true } },
    },
  });

  if (!club) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isMember = club.members.some((m) => m.userId === session.id);

  return NextResponse.json({
    id: club.id,
    slug: club.slug,
    name: club.name,
    description: club.description,
    iconEmoji: club.iconEmoji,
    coverUrl: club.coverUrl,
    joinOpen: club.joinOpen,
    leader: club.leader,
    members: club.members.map((m) => ({ ...m.user, role: m.role, joinedAt: m.joinedAt })),
    memberCount: club._count.members,
    postCount: club._count.posts,
    isMember,
  });
}
