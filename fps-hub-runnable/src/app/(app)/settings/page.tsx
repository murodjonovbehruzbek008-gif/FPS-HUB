'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Badge';
import { useSession } from '@/components/SessionProvider';
import { cn } from '@/lib/cn';

interface FullUser {
  id: string; email: string; username: string; displayName: string;
  bio: string; avatarUrl: string | null; role: string; grade: string;
  interests: string; theme: string; locale: string;
}

type Tab = 'profile' | 'security' | 'appearance';

export default function SettingsPage() {
  const session = useSession();
  const [tab, setTab] = useState<Tab>('profile');
  const [user, setUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [grade, setGrade] = useState('');
  const [interests, setInterests] = useState('');

  // Password fields
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setDisplayName(d.user.displayName);
          setBio(d.user.bio ?? '');
          setGrade(d.user.grade ?? '');
          setInterests(d.user.interests ?? '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio, grade, interests }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const d = await res.json();
        setError(d.error ?? 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwSaving(true); setPwError(''); setPwSaved(false);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: curPw, next: newPw }),
      });
      if (res.ok) {
        setPwSaved(true);
        setCurPw(''); setNewPw('');
        setTimeout(() => setPwSaved(false), 2500);
      } else {
        const d = await res.json();
        setPwError(d.error ?? 'Failed to update password');
      }
    } finally {
      setPwSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'profile', icon: <User size={15} />, label: 'Profile' },
    { key: 'security', icon: <Lock size={15} />, label: 'Security' },
    { key: 'appearance', icon: <Palette size={15} />, label: 'Appearance' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[hsl(var(--fg))] mb-6">Settings</h1>

      {/* Tab bar */}
      <div className="flex border-b border-[hsl(var(--border))] mb-6">
        {tabs.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === key
                ? 'border-[hsl(var(--brand))] text-[hsl(var(--brand))]'
                : 'border-transparent text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))]'
            )}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && user && (
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-[hsl(var(--border))]">
            <Avatar src={user.avatarUrl} name={user.displayName} size="xl" />
            <div>
              <p className="font-semibold text-[hsl(var(--fg))]">{user.displayName}</p>
              <p className="text-sm text-[hsl(var(--fg-muted))]">@{user.username} · {user.email}</p>
              <p className="text-xs text-[hsl(var(--fg-muted))] mt-0.5 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>

          <div>
            <label className="label">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} required />
          </div>
          <div>
            <label className="label">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} placeholder="Tell the community about yourself..." />
          </div>
          {user.role === 'STUDENT' && (
            <div>
              <label className="label">Grade</label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. Grade 11" maxLength={40} />
            </div>
          )}
          <div>
            <label className="label">Interests <span className="text-[hsl(var(--fg-subtle))] font-normal">(comma-separated)</span></label>
            <Input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Programming, Chess, Music..." maxLength={300} />
          </div>

          {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
          {saved && <p className="text-sm text-[hsl(var(--success))]">✓ Profile saved</p>}

          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <form onSubmit={savePassword} className="space-y-4 max-w-sm">
          <h2 className="font-semibold text-[hsl(var(--fg))]">Change Password</h2>
          <div>
            <label className="label">Current Password</label>
            <Input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} required autoComplete="current-password" />
          </div>
          <div>
            <label className="label">New Password</label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={10} autoComplete="new-password" placeholder="At least 10 characters" />
          </div>
          {pwError && <p className="text-sm text-[hsl(var(--destructive))]">{pwError}</p>}
          {pwSaved && <p className="text-sm text-[hsl(var(--success))]">✓ Password updated</p>}
          <Button type="submit" loading={pwSaving}>Update password</Button>
        </form>
      )}

      {/* Appearance tab */}
      {tab === 'appearance' && (
        <div className="space-y-4">
          <p className="text-sm text-[hsl(var(--fg-muted))]">Theme switching is coming soon.</p>
        </div>
      )}
    </div>
  );
}
