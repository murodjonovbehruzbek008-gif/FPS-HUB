import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/password';
import { ProfileUpdate, PasswordChange } from '@/lib/schemas';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, email: true, username: true, displayName: true,
      bio: true, avatarUrl: true, role: true, grade: true, interests: true,
      theme: true, locale: true, createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const SettingsInput = z.object({
    displayName: z.string().min(1).max(80).optional(),
    bio: z.string().max(500).optional(),
    grade: z.string().max(40).optional(),
    interests: z.string().max(300).optional(),
    theme: z.enum(['light', 'dark']).optional(),
    locale: z.enum(['en', 'uz']).optional(),
  });

  const parsed = SettingsInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: session.id },
    data: parsed.data,
    select: { id: true, displayName: true, bio: true, grade: true, interests: true, theme: true, locale: true },
  });

  return NextResponse.json({ user });
}
