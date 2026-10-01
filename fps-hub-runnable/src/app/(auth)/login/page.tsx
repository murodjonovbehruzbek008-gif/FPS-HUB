'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Login failed');
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[hsl(var(--bg))]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(var(--brand))] mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--fg))]">FPS Hub</h1>
          <p className="text-sm text-[hsl(var(--fg-muted))] mt-1">Sign in to your school community</p>
        </div>

        <div className="card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <Input
                id="email"
                type="email"
                placeholder="you@fps.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))]"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 rounded-[var(--radius-sm)]">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
            <p className="text-xs text-[hsl(var(--fg-muted))] text-center mb-2">Demo credentials</p>
            <div className="space-y-1">
              {[
                { label: 'Admin', email: 'admin@fps.edu' },
                { label: 'Teacher', email: 'sarah.johnson@fps.edu' },
                { label: 'Student', email: 'alex.kim@fps.edu' },
              ].map(({ label, email: demoEmail }) => (
                <button
                  key={demoEmail}
                  type="button"
                  onClick={() => { setEmail(demoEmail); setPassword('FPSDemo123!'); }}
                  className="w-full text-left text-xs px-3 py-2 rounded-[var(--radius-sm)] bg-[hsl(var(--bg-subtle))] hover:bg-[hsl(var(--border))] text-[hsl(var(--fg-muted))] transition-colors"
                >
                  <span className="font-medium text-[hsl(var(--fg))]">{label}</span> — {demoEmail}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[hsl(var(--fg-muted))] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="link font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}
