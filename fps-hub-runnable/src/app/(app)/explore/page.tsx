'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PostCard, type PostData } from '@/components/PostCard';
import { CommentsDrawer } from '@/components/CommentsDrawer';
import { Spinner } from '@/components/ui/Badge';

interface UserResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  grade: string;
  bio: string;
  postCount: number;
  followerCount: number;
}

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/explore?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users ?? []);
      setPosts(data.posts ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResults('');
  }, [fetchResults]);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  function handleLike(postId: string) {
    fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      .then((r) => r.json())
      .then(({ liked, likeCount }) => setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, liked, likeCount } : p)));
  }

  function handleBookmark(postId: string) {
    fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' })
      .then((r) => r.json())
      .then(({ bookmarked }) => setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, bookmarked, bookmarkCount: bookmarked ? p.bookmarkCount + 1 : p.bookmarkCount - 1 } : p)));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[hsl(var(--fg))] mb-3">Explore</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-muted))]" />
          <input
            type="search"
            placeholder="Search people, posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--bg-card))] text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* People */}
          {users.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-[hsl(var(--fg-muted))] uppercase tracking-wide mb-3">
                {query ? 'People' : 'Suggested People'}
              </h2>
              <div className="space-y-2">
                {users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="card p-3 flex items-center gap-3 hover:shadow-sm transition-shadow"
                  >
                    <Avatar src={u.avatarUrl} name={u.displayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[hsl(var(--fg))]">{u.displayName}</span>
                        <Badge label={u.role} variant={u.role} />
                      </div>
                      <p className="text-xs text-[hsl(var(--fg-muted))]">@{u.username} · {u.followerCount} followers</p>
                      {u.bio && <p className="text-xs text-[hsl(var(--fg-muted))] truncate mt-0.5">{u.bio}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          {posts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[hsl(var(--fg-muted))] uppercase tracking-wide mb-3">
                {query ? 'Posts' : 'Popular Posts'}
              </h2>
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onComment={(id) => setCommentPostId(id)}
                  />
                ))}
              </div>
            </section>
          )}

          {query && users.length === 0 && posts.length === 0 && (
            <p className="text-center text-[hsl(var(--fg-muted))] py-12">No results for &ldquo;{query}&rdquo;</p>
          )}
        </>
      )}

      <CommentsDrawer
        postId={commentPostId}
        onClose={() => setCommentPostId(null)}
        onCommentAdded={(postId) => setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))}
      />
    </div>
  );
}
