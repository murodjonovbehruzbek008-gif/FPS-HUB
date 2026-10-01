import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await params;
  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.id === session.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.id, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { followerId_followingId: { followerId: session.id, followingId: target.id } } });
    const count = await prisma.follow.count({ where: { followingId: target.id } });
    return NextResponse.json({ following: false, followerCount: count });
  } else {
    await prisma.follow.create({ data: { followerId: session.id, followingId: target.id } });
    await prisma.notification.create({
      data: {
        userId: target.id,
        type: 'FOLLOW',
        title: `${session.displayName} started following you`,
        body: `${session.displayName} is now following you`,
        href: `/profile/${session.username}`,
        actorId: session.id,
      },
    }).catch(() => {});
    const count = await prisma.follow.count({ where: { followingId: target.id } });
    return NextResponse.json({ following: true, followerCount: count });
  }
}
