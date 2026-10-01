'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, AlertCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

interface Announcement {
  id: string;
  title: string;
  content: string;
  important: boolean;
  schoolWide: boolean;
  createdAt: string;
  author: { displayName: string; username: string; avatarUrl: string | null; role: string };
  club?: { name: string; slug: string; iconEmoji: string } | null;
}

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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  const important = announcements.filter((a) => a.important);
  const regular = announcements.filter((a) => !a.important);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[hsl(var(--fg))]">Announcements</h1>
        <p className="text-sm text-[hsl(var(--fg-muted))]">School-wide and club announcements</p>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--fg-muted))]">
          <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {important.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
          {regular.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ announcement: a }: { announcement: Announcement }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = a.content.length > 200;

  return (
    <div className={cn(
      'card p-4',
      a.important && 'border-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.04)]'
    )}>
      <div className="flex items-start gap-3">
        {a.important ? (
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--warning)/0.15)] flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} className="text-[hsl(var(--warning))]" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--brand)/0.1)] flex items-center justify-center flex-shrink-0">
            <Megaphone size={16} className="text-[hsl(var(--brand))]" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-[hsl(var(--fg))]">{a.title}</h3>
            <span className="text-xs text-[hsl(var(--fg-muted))] flex-shrink-0">{timeAgo(a.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            {a.schoolWide && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
                School-wide
              </span>
            )}
            {a.club && (
              <Link href={`/clubs/${a.club.slug}`} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(var(--bg-subtle))] text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--brand))]">
                {a.club.iconEmoji} {a.club.name}
              </Link>
            )}
            {a.important && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(var(--warning)/0.2)] text-yellow-700 dark:text-yellow-400">
                Important
              </span>
            )}
          </div>

          <p className="text-sm text-[hsl(var(--fg))] leading-relaxed whitespace-pre-wrap">
            {isLong && !expanded ? a.content.slice(0, 200) + '…' : a.content}
          </p>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-[hsl(var(--brand))] hover:underline mt-1">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Link href={`/profile/${a.author.username}`}>
              <Avatar src={a.author.avatarUrl} name={a.author.displayName} size="xs" />
            </Link>
            <Link href={`/profile/${a.author.username}`} className="text-xs text-[hsl(var(--fg-muted))] hover:underline">
              {a.author.displayName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
