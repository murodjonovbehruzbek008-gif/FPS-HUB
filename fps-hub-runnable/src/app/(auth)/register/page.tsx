'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '', username: '', displayName: '', password: '', role: 'STUDENT', grade: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Registration failed');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[hsl(var(--bg))]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(var(--brand))] mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--fg))]">Join FPS Hub</h1>
          <p className="text-sm text-[hsl(var(--fg-muted))] mt-1">Create your school community account</p>
        </div>

        <div className="card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <Input
                placeholder="Alex Kim"
                value={form.displayName}
                onChange={(e) => update('displayName', e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Username</label>
              <Input
                placeholder="alex_kim"
                value={form.username}
                onChange={(e) => update('username', e.target.value.toLowerCase())}
                pattern="[a-z0-9_]+"
                title="Lowercase letters, numbers, underscores only"
                required
              />
              <p className="text-xs text-[hsl(var(--fg-muted))] mt-1">Letters, numbers, underscores only</p>
            </div>

            <div>
              <label className="label">School email</label>
              <Input
                type="email"
                placeholder="you@fps.edu"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 10 characters"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  minLength={10}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-muted))]"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Role</label>
              <select
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                className="input"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            {form.role === 'STUDENT' && (
              <div>
                <label className="label">Grade (optional)</label>
                <Input
                  placeholder="e.g. Grade 11"
                  value={form.grade}
                  onChange={(e) => update('grade', e.target.value)}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 rounded-[var(--radius-sm)]">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[hsl(var(--fg-muted))] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="link font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
