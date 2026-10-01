'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, Users2, Flag, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Badge';
import { useSession } from '@/components/SessionProvider';
import Link from 'next/link';

interface AdminData {
  stats: { userCount: number; postCount: number; clubCount: number; reportCount: number };
  users: { id: string; username: string; displayName: string; email: string; role: string; status: string; createdAt: string }[];
  reports: { id: string; reason: string; targetType: string; targetId: string; createdAt: string; details: string; reporter: { displayName: string; username: string } }[];
}

export default function AdminPage() {
  const session = useSession();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'reports'>('overview');

  useEffect(() => {
    if (session && session.role !== 'ADMIN') {
      window.location.href = '/';
      return;
    }
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session || session.role !== 'ADMIN') {
    return <div className="p-8 text-center text-[hsl(var(--fg-muted))]">Access denied.</div>;
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!data) return <div className="p-8 text-center">Failed to load admin data.</div>;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: `Users (${data.stats.userCount})` },
    { key: 'reports', label: `Reports (${data.stats.reportCount})` },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck size={22} className="text-[hsl(var(--brand))]" />
        <h1 className="text-xl font-bold text-[hsl(var(--fg))]">Admin Panel</h1>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[hsl(var(--border))] mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-[hsl(var(--brand))] text-[hsl(var(--brand))]'
                : 'border-transparent text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: <Users size={20} />, label: 'Users', value: data.stats.userCount, color: 'text-blue-500' },
              { icon: <FileText size={20} />, label: 'Posts', value: data.stats.postCount, color: 'text-green-500' },
              { icon: <Users2 size={20} />, label: 'Clubs', value: data.stats.clubCount, color: 'text-purple-500' },
              { icon: <Flag size={20} />, label: 'Open Reports', value: data.stats.reportCount, color: 'text-red-500' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="card p-4">
                <div className={`mb-2 ${color}`}>{icon}</div>
                <p className="text-2xl font-bold text-[hsl(var(--fg))]">{value}</p>
                <p className="text-xs text-[hsl(var(--fg-muted))]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-2">
          {data.users.map((u) => (
            <div key={u.id} className="card p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${u.username}`} className="font-medium text-sm text-[hsl(var(--fg))] hover:underline">
                    {u.displayName}
                  </Link>
                  <Badge label={u.role} variant={u.role} />
                  {u.status !== 'ACTIVE' && <Badge label={u.status} variant="REJECTED" />}
                </div>
                <p className="text-xs text-[hsl(var(--fg-muted))]">{u.email} · @{u.username}</p>
              </div>
              <p className="text-xs text-[hsl(var(--fg-subtle))]">
                {new Date(u.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {data.reports.length === 0 ? (
            <p className="text-center text-[hsl(var(--fg-muted))] py-12">No open reports.</p>
          ) : data.reports.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm text-[hsl(var(--fg))]">
                    {r.reason} · {r.targetType} #{r.targetId.slice(0, 8)}
                  </p>
                  {r.details && <p className="text-xs text-[hsl(var(--fg-muted))] mt-1">{r.details}</p>}
                  <p className="text-xs text-[hsl(var(--fg-muted))] mt-1">
                    Reported by{' '}
                    <Link href={`/profile/${r.reporter.username}`} className="text-[hsl(var(--brand))] hover:underline">
                      {r.reporter.displayName}
                    </Link>
                    {' · '}{new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge label="OPEN" variant="PENDING" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
