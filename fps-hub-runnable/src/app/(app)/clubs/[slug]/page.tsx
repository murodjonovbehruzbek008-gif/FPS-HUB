'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Users, PlusCircle, LogIn, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Badge';
import { PostCard, type PostData } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { CommentsDrawer } from '@/components/CommentsDrawer';
import { useSession } from '@/components/SessionProvider';

interface ClubDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconEmoji: string;
  joinOpen: boolean;
  leader: { id: string; displayName: string; username: string; avatarUrl: string | null };
  members: { id: string; displayName: string; username: string; avatarUrl: string | null; role: string }[];
  memberCount: number;
  postCount: number;
  isMember: boolean;
}

export default function ClubDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const me = useSession();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clubs/${slug}`).then((r) => r.json()),
    ]).then(async ([clubData]) => {
      if (clubData && !clubData.error) {
        setClub(clubData);
        setIsMember(clubData.isMember);
        if (clubData.id) {
          const pRes = await fetch(`/api/posts?clubId=${clubData.id}`);
          if (pRes.ok) {
            const pData = await pRes.json();
            setPosts(pData.posts ?? []);
          }
        }
      }
      setLoading(false);
    });
  }, [slug]);

  async function handleJoinLeave() {
    setJoinLoading(true);
    const res = await fetch(`/api/clubs/${slug}/join`, { method: 'POST' });
    if (res.ok) {
      const { joined } = await res.json();
      setIsMember(joined);
      setClub((prev) => prev ? { ...prev, memberCount: prev.memberCount + (joined ? 1 : -1), isMember: joined } : prev);
    }
    setJoinLoading(false);
  }

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

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!club) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-[hsl(var(--fg-muted))]">Club not found.</div>;

  const isLeader = me?.id === club.leader.id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="card p-6 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--bg-subtle))] flex items-center justify-center text-3xl flex-shrink-0">
            {club.iconEmoji}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[hsl(var(--fg))]">{club.name}</h1>
            <p className="text-sm text-[hsl(var(--fg-muted))] flex items-center gap-1">
              <Users size={13} /> {club.memberCount} members · {club.postCount} posts
            </p>
            <p className="text-xs text-[hsl(var(--fg-muted))] mt-1">
              Led by{' '}
              <Link href={`/profile/${club.leader.username}`} className="text-[hsl(var(--brand))] hover:underline">
                {club.leader.displayName}
              </Link>
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {isMember && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <PlusCircle size={14} /> Post
              </Button>
            )}
            {!isLeader && club.joinOpen && (
              <Button
                variant={isMember ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleJoinLeave}
                loading={joinLoading}
              >
                {isMember ? <><LogOut size={14} /> Leave</> : <><LogIn size={14} /> Join</>}
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-[hsl(var(--fg))]">{club.description}</p>

        {/* Members preview */}
        <div className="mt-4">
          <p className="text-xs font-medium text-[hsl(var(--fg-muted))] mb-2">Members</p>
          <div className="flex -space-x-2">
            {club.members.slice(0, 8).map((m) => (
              <Link key={m.id} href={`/profile/${m.username}`} title={m.displayName}>
                <Avatar src={m.avatarUrl} name={m.displayName} size="sm" className="ring-2 ring-[hsl(var(--bg-card))]" />
              </Link>
            ))}
            {club.memberCount > 8 && (
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--bg-subtle))] ring-2 ring-[hsl(var(--bg-card))] flex items-center justify-center text-xs text-[hsl(var(--fg-muted))]">
                +{club.memberCount - 8}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-sm font-semibold text-[hsl(var(--fg-muted))] uppercase tracking-wide mb-3">Posts</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--fg-muted))]">
          <p className="mb-3">No posts yet in this club.</p>
          {isMember && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>Be the first to post</Button>
          )}
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
        </div>
      )}

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(post) => setPosts((prev) => [post, ...prev])}
        clubId={club.id}
      />
      <CommentsDrawer
        postId={commentPostId}
        onClose={() => setCommentPostId(null)}
        onCommentAdded={(postId) => setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))}
      />
    </div>
  );
}
