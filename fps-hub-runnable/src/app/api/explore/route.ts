import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (!q) {
    // Return suggested users and popular posts
    const users = await prisma.user.findMany({
      where: { id: { not: session.id }, status: 'ACTIVE' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, username: true, displayName: true, avatarUrl: true, role: true, grade: true, bio: true,
        _count: { select: { followers: true, posts: true } },
      },
    });

    const posts = await prisma.post.findMany({
      take: 10,
      orderBy: { likes: { _count: 'desc' } },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, role: true } },
        club: { select: { id: true, slug: true, name: true, iconEmoji: true } },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
        likes: { where: { userId: session.id }, select: { userId: true } },
        bookmarks: { where: { userId: session.id }, select: { userId: true } },
      },
    });

    return NextResponse.json({
      users: users.map((u) => ({ ...u, postCount: u._count.posts, followerCount: u._count.followers })),
      posts: posts.map((p) => ({
        id: p.id, body: p.body, category: p.category, mediaUrl: p.mediaUrl, hashtags: p.hashtags, createdAt: p.createdAt,
        author: p.author, club: p.club,
        likeCount: p._count.likes, commentCount: p._count.comments, bookmarkCount: p._count.bookmarks,
        liked: p.likes.length > 0, bookmarked: p.bookmarks.length > 0,
      })),
    });
  }

  // Search
  const [users, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { displayName: { contains: q } },
          { username: { contains: q } },
          { bio: { contains: q } },
        ],
      },
      take: 8,
      select: {
        id: true, username: true, displayName: true, avatarUrl: true, role: true, grade: true, bio: true,
        _count: { select: { followers: true, posts: true } },
      },
    }),
    prisma.post.findMany({
      where: { body: { contains: q } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, role: true } },
        club: { select: { id: true, slug: true, name: true, iconEmoji: true } },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
        likes: { where: { userId: session.id }, select: { userId: true } },
        bookmarks: { where: { userId: session.id }, select: { userId: true } },
      },
    }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({ ...u, postCount: u._count.posts, followerCount: u._count.followers })),
    posts: posts.map((p) => ({
      id: p.id, body: p.body, category: p.category, mediaUrl: p.mediaUrl, hashtags: p.hashtags, createdAt: p.createdAt,
      author: p.author, club: p.club,
      likeCount: p._count.likes, commentCount: p._count.comments, bookmarkCount: p._count.bookmarks,
      liked: p.likes.length > 0, bookmarked: p.bookmarks.length > 0,
    })),
  });
}
