'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Badge';
import { useSession } from '@/components/SessionProvider';
import Link from 'next/link';

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; username: string; displayName: string; avatarUrl: string | null };
}

interface CommentsDrawerProps {
  postId: string | null;
  onClose: () => void;
  onCommentAdded: (postId: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function CommentsDrawer({ postId, onClose, onCommentAdded }: CommentsDrawerProps) {
  const user = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (!postId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !postId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text.trim() }),
      });
      if (res.ok) {
        const { comment } = await res.json();
        setComments((prev) => [...prev, comment]);
        setText('');
        onCommentAdded(postId);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-[85vh] md:h-[70vh] card flex flex-col shadow-xl rounded-b-none md:rounded-[var(--radius)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <h3 className="font-semibold text-sm">Comments</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[hsl(var(--bg-subtle))]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-[hsl(var(--fg-muted))] py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Link href={`/profile/${c.author.username}`} className="flex-shrink-0">
                  <Avatar src={c.author.avatarUrl} name={c.author.displayName} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/profile/${c.author.username}`} className="text-xs font-semibold text-[hsl(var(--fg))] hover:underline">
                      {c.author.displayName}
                    </Link>
                    <span className="text-xs text-[hsl(var(--fg-muted))]">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--fg))] leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {user && (
          <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 border-t border-[hsl(var(--border))]">
            <Avatar src={user.avatarUrl} name={user.displayName} size="sm" className="flex-shrink-0" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-[hsl(var(--bg-subtle))] rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--brand))] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-subtle))]"
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white disabled:opacity-50 transition-opacity"
            >
              {submitting ? <Spinner className="w-4 h-4 text-white" /> : <Send size={14} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
