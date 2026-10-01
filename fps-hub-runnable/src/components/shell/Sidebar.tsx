'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useSession } from '@/components/SessionProvider';
import { Avatar } from '@/components/ui/Avatar';
import {
  Home, Compass, Users, Trophy, Calendar, Bell, Settings,
  LogOut, ShieldCheck, Megaphone, BookOpen
} from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Feed' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/clubs', icon: Users, label: 'Clubs' },
  { href: '/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];

const bottomItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSession();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-card))] py-4 overflow-y-auto flex-shrink-0">
      {/* Logo */}
      <div className="px-4 mb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand))] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-[hsl(var(--fg))]">FPS Hub</span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors',
                active
                  ? 'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                  : 'text-[hsl(var(--fg-muted))] hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--fg))]'
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {label}
            </Link>
          );
        })}

        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                : 'text-[hsl(var(--fg-muted))] hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--fg))]'
            )}
          >
            <ShieldCheck size={18} />
            Admin
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 mt-4 space-y-0.5 border-t border-[hsl(var(--border))] pt-4">
        {bottomItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                : 'text-[hsl(var(--fg-muted))] hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--fg))]'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {/* User card */}
        {user && (
          <div className="mt-2">
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-[hsl(var(--bg-subtle))] transition-colors group"
            >
              <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[hsl(var(--fg))] truncate">{user.displayName}</p>
                <p className="text-xs text-[hsl(var(--fg-muted))] truncate">@{user.username}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.08)] transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
