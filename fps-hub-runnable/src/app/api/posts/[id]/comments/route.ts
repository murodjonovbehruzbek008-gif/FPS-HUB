import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: postId } = await params;

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: postId } = await params;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = z.object({ body: z.string().min(1).max(2000) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const comment = await prisma.comment.create({
    data: { postId, authorId: user.id, body: parsed.data.body },
    include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
  });

  // Notify post author
  if (post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: 'COMMENT',
        title: `${user.displayName} commented on your post`,
        body: parsed.data.body.slice(0, 100),
        href: `/`,
        actorId: user.id,
      },
    }).catch(() => {});
  }

  return NextResponse.json({ comment }, { status: 201 });
}
