'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useSession } from '@/components/SessionProvider';
import type { PostData } from '@/components/PostCard';

const CATEGORIES = ['GENERAL', 'ACHIEVEMENT', 'PROJECT', 'EVENT', 'QUESTION'] as const;

interface CreatePostProps {
  open: boolean;
  onClose: () => void;
  onCreated: (post: PostData) => void;
  clubId?: string;
}

export function CreatePostModal({ open, onClose, onCreated, clubId }: CreatePostProps) {
  const user = useSession();
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<string>('GENERAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) { setBody(''); setCategory('GENERAL'); setError(''); }
  }, [open]);

  if (!open || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), category, ...(clubId ? { clubId } : {}) }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Failed to post');
        return;
      }
      const post = await res.json();
      onCreated(post);
      onClose();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[hsl(var(--fg))]">Create Post</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[hsl(var(--bg-subtle))] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Avatar src={user.avatarUrl} name={user.displayName} size="md" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's on your mind? Share a project, achievement, or question..."
                rows={4}
                maxLength={4000}
                className="text-base"
                autoFocus
              />
              <div className="text-xs text-[hsl(var(--fg-subtle))] text-right mt-1">
                {body.length}/4000
              </div>
            </div>
          </div>

          {/* Category picker */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  category === cat
                    ? 'bg-[hsl(var(--brand))] text-white'
                    : 'bg-[hsl(var(--bg-subtle))] text-[hsl(var(--fg-muted))] hover:bg-[hsl(var(--border))]'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" loading={loading} disabled={!body.trim()}>Post</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
