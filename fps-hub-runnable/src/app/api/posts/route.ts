import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const category = searchParams.get('category') ?? undefined;
  const clubId = searchParams.get('clubId') ?? undefined;
  const authorId = searchParams.get('authorId') ?? undefined;

  const posts = await prisma.post.findMany({
    where: {
      ...(category ? { category: category as never } : {}),
      ...(clubId ? { clubId } : {}),
      ...(authorId ? { authorId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, role: true },
      },
      club: { select: { id: true, slug: true, name: true, iconEmoji: true } },
      _count: { select: { likes: true, comments: true, bookmarks: true } },
      likes: { where: { userId: user.id }, select: { userId: true } },
      bookmarks: { where: { userId: user.id }, select: { userId: true } },
    },
  });

  const hasMore = posts.length > PAGE_SIZE;
  if (hasMore) posts.pop();

  const formatted = posts.map((p) => ({
    id: p.id,
    body: p.body,
    category: p.category,
    mediaUrl: p.mediaUrl,
    hashtags: p.hashtags,
    createdAt: p.createdAt,
    author: p.author,
    club: p.club,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    bookmarkCount: p._count.bookmarks,
    liked: p.likes.length > 0,
    bookmarked: p.bookmarks.length > 0,
  }));

  return NextResponse.json({
    posts: formatted,
    nextCursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
  });
}

const CreatePostInput = z.object({
  body: z.string().min(1).max(4000),
  category: z.enum(['GENERAL', 'ACHIEVEMENT', 'PROJECT', 'EVENT', 'QUESTION', 'ANNOUNCEMENT']).default('GENERAL'),
  clubId: z.string().optional(),
  mediaUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = CreatePostInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { body: postBody, category, clubId, mediaUrl } = parsed.data;

  // Verify club membership if posting to a club
  if (clubId) {
    const member = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: user.id } },
    });
    if (!member && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not a club member' }, { status: 403 });
    }
  }

  const post = await prisma.post.create({
    data: { authorId: user.id, body: postBody, category, clubId: clubId ?? null, mediaUrl: mediaUrl ?? null, hashtags: '[]' },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true, role: true } },
      club: { select: { id: true, slug: true, name: true, iconEmoji: true } },
      _count: { select: { likes: true, comments: true, bookmarks: true } },
    },
  });

  return NextResponse.json({
    id: post.id,
    body: post.body,
    category: post.category,
    mediaUrl: post.mediaUrl,
    hashtags: post.hashtags,
    createdAt: post.createdAt,
    author: post.author,
    club: post.club,
    likeCount: 0,
    commentCount: 0,
    bookmarkCount: 0,
    liked: false,
    bookmarked: false,
  }, { status: 201 });
}
