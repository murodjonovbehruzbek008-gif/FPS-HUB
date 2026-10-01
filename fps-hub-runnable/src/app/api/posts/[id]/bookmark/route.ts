import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.bookmark.findUnique({ where: { userId_postId: { userId: user.id, postId } } });

  if (existing) {
    await prisma.bookmark.delete({ where: { userId_postId: { userId: user.id, postId } } });
    return NextResponse.json({ bookmarked: false });
  } else {
    await prisma.bookmark.create({ data: { userId: user.id, postId } });
    return NextResponse.json({ bookmarked: true });
  }
}
