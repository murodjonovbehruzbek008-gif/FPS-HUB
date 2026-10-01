import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const achievements = await prisma.achievement.findMany({
    where: { userId: session.id },
    orderBy: { date: 'desc' },
    include: {
      verifier: { select: { displayName: true, username: true } },
      club: { select: { name: true, slug: true, iconEmoji: true } },
    },
  });

  return NextResponse.json({ achievements });
}

const AchievementInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.string().min(1).max(80),
  date: z.string(),
  issuer: z.string().max(200).optional(),
  clubId: z.string().optional(),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = AchievementInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { title, description, category, date, issuer, clubId, evidenceUrl } = parsed.data;

  const achievement = await prisma.achievement.create({
    data: {
      userId: session.id,
      title,
      description,
      category,
      date: new Date(date),
      issuer: issuer ?? '',
      clubId: clubId ?? null,
      evidenceUrl: evidenceUrl || null,
      status: 'PENDING',
    },
    include: {
      verifier: { select: { displayName: true, username: true } },
      club: { select: { name: true, slug: true, iconEmoji: true } },
    },
  });

  return NextResponse.json({ achievement }, { status: 201 });
}
