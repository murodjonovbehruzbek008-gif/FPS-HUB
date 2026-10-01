'use client';

import Link from 'next/link';
import { BookOpen, Bell } from 'lucide-react';
import { useSession } from '@/components/SessionProvider';
import { Avatar } from '@/components/ui/Avatar';

export function MobileHeader() {
  const user = useSession();

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[hsl(var(--bg-card))] border-b border-[hsl(var(--border))] px-4 h-14 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[hsl(var(--brand))] flex items-center justify-center">
          <BookOpen className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-[hsl(var(--fg))]">FPS Hub</span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/notifications"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[hsl(var(--bg-subtle))] transition-colors"
        >
          <Bell size={18} className="text-[hsl(var(--fg-muted))]" />
        </Link>
        {user && (
          <Link href={`/profile/${user.username}`}>
            <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}
