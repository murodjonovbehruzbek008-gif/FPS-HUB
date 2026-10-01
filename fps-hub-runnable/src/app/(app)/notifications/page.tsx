'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Heart, MessageCircle, UserPlus, Trophy, Megaphone, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
  actorId?: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  LIKE: <Heart size={15} className="text-red-500" />,
  COMMENT: <MessageCircle size={15} className="text-[hsl(var(--brand))]" />,
  FOLLOW: <UserPlus size={15} className="text-green-500" />,
  ACHIEVEMENT: <Trophy size={15} className="text-yellow-500" />,
  CLUB_ACTIVITY: <Users size={15} className="text-purple-500" />,
  EVENT_REMINDER: <Calendar size={15} className="text-blue-500" />,
  ANNOUNCEMENT: <Megaphone size={15} className="text-orange-500" />,
  MENTION: <MessageCircle size={15} className="text-[hsl(var(--brand))]" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--fg))]">Notifications</h1>
          <p className="text-sm text-[hsl(var(--fg-muted))]">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--fg-muted))]">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.href ?? '/'}
              className={cn(
                'flex items-start gap-3 px-4 py-3.5 rounded-[var(--radius)] transition-colors hover:bg-[hsl(var(--bg-subtle))]',
                !n.read && 'bg-[hsl(var(--brand)/0.05)]'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--bg-subtle))] flex items-center justify-center flex-shrink-0 mt-0.5">
                {iconMap[n.type] ?? <Bell size={15} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', !n.read && 'font-semibold text-[hsl(var(--fg))]', n.read && 'text-[hsl(var(--fg))]')}>
                  {n.title}
                </p>
                <p className="text-xs text-[hsl(var(--fg-muted))] mt-0.5">{n.body}</p>
                <p className="text-xs text-[hsl(var(--fg-subtle))] mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--brand))] flex-shrink-0 mt-2" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
