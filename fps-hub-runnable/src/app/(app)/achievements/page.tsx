'use client';

import { useState, useEffect } from 'react';
import { Trophy, PlusCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Badge';
import Link from 'next/link';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  status: string;
  issuer: string;
  evidenceUrl?: string | null;
  club?: { name: string; slug: string; iconEmoji: string } | null;
  verifier?: { displayName: string; username: string } | null;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Academic', date: '', issuer: '', evidenceUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/achievements')
      .then((r) => r.json())
      .then((d) => setAchievements(d.achievements ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: form.date || new Date().toISOString() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Failed to create');
        return;
      }
      const { achievement } = await res.json();
      setAchievements((prev) => [achievement, ...prev]);
      setCreateOpen(false);
      setForm({ title: '', description: '', category: 'Academic', date: '', issuer: '', evidenceUrl: '' });
    } finally {
      setSubmitting(false);
    }
  }

  const CATEGORIES = ['Academic', 'Technology', 'Arts', 'Competition', 'Leadership', 'Research', 'Sports', 'Community'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--fg))]">Achievements</h1>
          <p className="text-sm text-[hsl(var(--fg-muted))]">Your academic and extracurricular accomplishments</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusCircle size={15} /> Add
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-[hsl(var(--fg-muted))] mx-auto mb-3 opacity-50" />
          <p className="text-[hsl(var(--fg-muted))] mb-3">No achievements yet. Add your first one!</p>
          <Button size="sm" onClick={() => setCreateOpen(true)}>Add achievement</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--warning)/0.15)] flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-[hsl(var(--warning))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-sm text-[hsl(var(--fg))]">{a.title}</h3>
                    <Badge label={a.status} variant={a.status} />
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[hsl(var(--bg-subtle))] text-[hsl(var(--fg-muted))]">
                      {a.category}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--fg-muted))] mb-2 leading-relaxed">{a.description}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[hsl(var(--fg-muted))]">
                    {a.issuer && <span>📋 {a.issuer}</span>}
                    <span>📅 {new Date(a.date).toLocaleDateString()}</span>
                    {a.club && (
                      <Link href={`/clubs/${a.club.slug}`} className="text-[hsl(var(--brand))] hover:underline">
                        {a.club.iconEmoji} {a.club.name}
                      </Link>
                    )}
                  </div>
                  {a.verifier && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Verified by{' '}
                      <Link href={`/profile/${a.verifier.username}`} className="hover:underline">
                        {a.verifier.displayName}
                      </Link>
                    </p>
                  )}
                  {a.evidenceUrl && (
                    <a href={a.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[hsl(var(--brand))] hover:underline mt-1 block">
                      View evidence →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCreateOpen(false)} />
          <div className="relative w-full max-w-md card p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Add Achievement</h2>
              <button onClick={() => setCreateOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[hsl(var(--bg-subtle))]">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="label">Title *</label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required placeholder="e.g. Regional Science Fair — 1st Place" />
              </div>
              <div>
                <label className="label">Description *</label>
                <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required rows={3} placeholder="Describe your achievement..." />
              </div>
              <div>
                <label className="label">Category *</label>
                <select className="input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Issuing Organization</label>
                <Input value={form.issuer} onChange={(e) => setForm((p) => ({ ...p, issuer: e.target.value }))} placeholder="e.g. Regional Science Fair Committee" />
              </div>
              <div>
                <label className="label">Evidence URL (optional)</label>
                <Input type="url" value={form.evidenceUrl} onChange={(e) => setForm((p) => ({ ...p, evidenceUrl: e.target.value }))} placeholder="https://..." />
              </div>
              {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" loading={submitting}>Submit</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
