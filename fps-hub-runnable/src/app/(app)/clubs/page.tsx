'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/Badge';

interface ClubItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconEmoji: string;
  memberCount: number;
  postCount: number;
  isMember: boolean;
  leader: { displayName: string; username: string };
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clubs')
      .then((r) => r.json())
      .then((d) => setClubs(d.clubs ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[hsl(var(--fg))]">Clubs</h1>
        <p className="text-sm text-[hsl(var(--fg-muted))]">Join clubs to connect with students who share your interests</p>
      </div>

      {/* My clubs */}
      {clubs.filter((c) => c.isMember).length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--fg-muted))] uppercase tracking-wide mb-3">My Clubs</h2>
          <div className="space-y-3">
            {clubs.filter((c) => c.isMember).map((club) => <ClubCard key={club.id} club={club} />)}
          </div>
        </div>
      )}

      {/* All clubs */}
      <div>
        <h2 className="text-sm font-semibold text-[hsl(var(--fg-muted))] uppercase tracking-wide mb-3">All Clubs</h2>
        <div className="space-y-3">
          {clubs.map((club) => <ClubCard key={club.id} club={club} />)}
        </div>
      </div>
    </div>
  );
}

function ClubCard({ club }: { club: ClubItem }) {
  return (
    <Link href={`/clubs/${club.slug}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--bg-subtle))] flex items-center justify-center text-2xl flex-shrink-0">
        {club.iconEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-sm text-[hsl(var(--fg))]">{club.name}</h3>
          {club.isMember && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
              Member
            </span>
          )}
        </div>
        <p className="text-xs text-[hsl(var(--fg-muted))] line-clamp-2">{club.description}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-[hsl(var(--fg-muted))]">
          <span className="flex items-center gap-1"><Users size={11} />{club.memberCount} members</span>
          <span>{club.postCount} posts</span>
          <span>Led by {club.leader.displayName}</span>
        </div>
      </div>
      <ArrowRight size={16} className="text-[hsl(var(--fg-muted))] group-hover:text-[hsl(var(--brand))] transition-colors flex-shrink-0" />
    </Link>
  );
}
