import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      grade: true,
      interests: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
          achievements: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isFollowing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.id, followingId: user.id } },
  });

  return NextResponse.json({
    ...user,
    postCount: user._count.posts,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    achievementCount: user._count.achievements,
    isFollowing: !!isFollowing,
    isMe: session.id === user.id,
  });
}
