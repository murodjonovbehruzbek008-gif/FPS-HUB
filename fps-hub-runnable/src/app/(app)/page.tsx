'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import { PostCard, type PostData } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { CommentsDrawer } from '@/components/CommentsDrawer';
import { Spinner } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/components/SessionProvider';
import { cn } from '@/lib/cn';

const CATEGORIES = ['All', 'ACHIEVEMENT', 'PROJECT', 'QUESTION', 'EVENT', 'GENERAL'] as const;

export default function FeedPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState<string>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const fetchPosts = useCallback(async (cat: string, nextCursor?: string) => {
    const params = new URLSearchParams();
    if (cat !== 'All') params.set('category', cat);
    if (nextCursor) params.set('cursor', nextCursor);

    const res = await fetch(`/api/posts?${params}`);
    if (!res.ok) return null;
    return res.json() as Promise<{ posts: PostData[]; nextCursor: string | null }>;
  }, []);

  useEffect(() => {
    setLoading(true);
    setCursor(null);
    fetchPosts(category).then((data) => {
      if (data) {
        setPosts(data.posts);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
      setLoading(false);
    });
  }, [category, fetchPosts]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const data = await fetchPosts(category, cursor);
    if (data) {
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    }
    setLoadingMore(false);
  }

  function handleLike(postId: string) {
    fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      .then((r) => r.json())
      .then(({ liked, likeCount }) => {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, liked, likeCount } : p))
        );
      });
  }

  function handleBookmark(postId: string) {
    fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' })
      .then((r) => r.json())
      .then(({ bookmarked }) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, bookmarked, bookmarkCount: bookmarked ? p.bookmarkCount + 1 : p.bookmarkCount - 1 }
              : p
          )
        );
      });
  }

  function handleCommentAdded(postId: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
    );
  }

  function handleCreated(post: PostData) {
    setPosts((prev) => [post, ...prev]);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--fg))]">Feed</h1>
          <p className="text-sm text-[hsl(var(--fg-muted))]">What's happening at FPS</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <PlusCircle size={15} />
          Post
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              category === cat
                ? 'bg-[hsl(var(--brand))] text-white'
                : 'bg-[hsl(var(--bg-subtle))] text-[hsl(var(--fg-muted))] hover:bg-[hsl(var(--border))]'
            )}
          >
            {cat === 'All' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[hsl(var(--fg-muted))] mb-3">No posts yet</p>
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            Be the first to post
          </Button>
        </div>
      ) : (
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

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={loadMore} loading={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <CommentsDrawer
        postId={commentPostId}
        onClose={() => setCommentPostId(null)}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}
