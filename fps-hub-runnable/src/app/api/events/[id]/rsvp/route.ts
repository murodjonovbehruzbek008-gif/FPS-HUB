import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: eventId } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = z.object({ status: z.enum(['INTERESTED', 'GOING', 'NOT_GOING']) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.eventAttendee.upsert({
    where: { eventId_userId: { eventId, userId: session.id } },
    update: { status: parsed.data.status },
    create: { eventId, userId: session.id, status: parsed.data.status },
  });

  const count = await prisma.eventAttendee.count({ where: { eventId } });
  return NextResponse.json({ status: parsed.data.status, attendeeCount: count });
}
