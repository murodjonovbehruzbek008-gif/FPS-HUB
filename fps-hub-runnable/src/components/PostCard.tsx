'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

export interface PostData {
  id: string;
  body: string;
  category: string;
  mediaUrl?: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    role: string;
  };
  club?: { id: string; slug: string; name: string; iconEmoji: string } | null;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  liked: boolean;
  bookmarked: boolean;
}

interface PostCardProps {
  post: PostData;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onComment: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(dateStr).toLocaleDateString();
}

export function PostCard({ post, onLike, onBookmark, onComment }: PostCardProps) {
  const [showFull, setShowFull] = useState(false);
  const isLong = post.body.length > 300;
  const displayBody = isLong && !showFull ? post.body.slice(0, 300) + '…' : post.body;

  return (
    <article className="card p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/profile/${post.author.username}`} className="flex-shrink-0">
            <Avatar src={post.author.avatarUrl} name={post.author.displayName} size="md" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-sm text-[hsl(var(--fg))] hover:underline truncate"
              >
                {post.author.displayName}
              </Link>
              {post.author.role !== 'STUDENT' && (
                <Badge label={post.author.role} variant={post.author.role} />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--fg-muted))]">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
              {post.club && (
                <>
                  <span>·</span>
                  <Link
                    href={`/clubs/${post.club.slug}`}
                    className="text-[hsl(var(--brand))] hover:underline flex items-center gap-1"
                  >
                    {post.club.iconEmoji} {post.club.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge label={post.category} variant={post.category} />
        </div>
      </div>

      {/* Body */}
      <div className="mb-3">
        <p className="text-sm text-[hsl(var(--fg))] leading-relaxed whitespace-pre-wrap">
          {displayBody}
        </p>
        {isLong && (
          <button
            onClick={() => setShowFull(!showFull)}
            className="text-xs text-[hsl(var(--brand))] hover:underline mt-1"
          >
            {showFull ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <div className="mb-3 rounded-[var(--radius-sm)] overflow-hidden">
          <img src={post.mediaUrl} alt="Post media" className="w-full object-cover max-h-96" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-[hsl(var(--border))]">
        <button
          onClick={() => onLike(post.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors',
            post.liked
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
              : 'text-[hsl(var(--fg-muted))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          )}
          aria-label="Like post"
        >
          <Heart size={15} className={cn(post.liked && 'fill-current')} />
          <span>{post.likeCount}</span>
        </button>

        <button
          onClick={() => onComment(post.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.08)] transition-colors"
          aria-label="Comment"
        >
          <MessageCircle size={15} />
          <span>{post.commentCount}</span>
        </button>

        <button
          onClick={() => onBookmark(post.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ml-auto',
            post.bookmarked
              ? 'text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]'
              : 'text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.08)]'
          )}
          aria-label="Bookmark post"
        >
          <Bookmark size={15} className={cn(post.bookmarked && 'fill-current')} />
          <span>{post.bookmarkCount}</span>
        </button>
      </div>
    </article>
  );
}
