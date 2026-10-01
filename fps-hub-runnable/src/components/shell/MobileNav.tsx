'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Home, Compass, Users, Trophy, Bell } from 'lucide-react';

const items = [
  { href: '/', icon: Home, label: 'Feed' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/clubs', icon: Users, label: 'Clubs' },
  { href: '/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--bg-card))] border-t border-[hsl(var(--border))] flex">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
              active ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-muted))]'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
