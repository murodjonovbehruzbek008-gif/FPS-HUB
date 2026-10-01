import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: user.id, postId } } });

  if (existing) {
    await prisma.like.delete({ where: { userId_postId: { userId: user.id, postId } } });
    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: false, likeCount: count });
  } else {
    await prisma.like.create({ data: { userId: user.id, postId } });
    // Notify post author
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'LIKE',
          title: `${user.displayName} liked your post`,
          body: 'Someone liked your post',
          href: `/`,
          actorId: user.id,
        },
      }).catch(() => {});
    }
    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: true, likeCount: count });
  }
}
