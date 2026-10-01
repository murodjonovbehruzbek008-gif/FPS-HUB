import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const events = await prisma.event.findMany({
    orderBy: { startsAt: 'asc' },
    include: {
      club: { select: { name: true, slug: true, iconEmoji: true } },
      _count: { select: { attendees: true } },
      attendees: { where: { userId: session.id }, select: { status: true } },
    },
  });

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      location: e.location,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      organizer: e.organizer,
      club: e.club,
      attendeeCount: e._count.attendees,
      myRsvp: e.attendees[0]?.status ?? null,
    })),
  });
}
