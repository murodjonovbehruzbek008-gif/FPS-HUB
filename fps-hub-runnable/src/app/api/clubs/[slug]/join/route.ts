import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const club = await prisma.club.findUnique({ where: { slug }, select: { id: true, leaderId: true, joinOpen: true } });
  if (!club) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: club.id, userId: session.id } },
  });

  if (existing) {
    // Leave — can't leave if you're the leader
    if (club.leaderId === session.id) {
      return NextResponse.json({ error: 'Club leader cannot leave' }, { status: 400 });
    }
    await prisma.clubMember.delete({ where: { clubId_userId: { clubId: club.id, userId: session.id } } });
    return NextResponse.json({ joined: false });
  } else {
    if (!club.joinOpen && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Club is not open for new members' }, { status: 403 });
    }
    await prisma.clubMember.create({ data: { clubId: club.id, userId: session.id, role: 'MEMBER' } });
    return NextResponse.json({ joined: true });
  }
}
