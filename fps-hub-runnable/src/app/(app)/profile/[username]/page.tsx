'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { UserCheck, UserPlus, MapPin, Trophy, FileText } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Badge';
import { PostCard, type PostData } from '@/components/PostCard';
import { CommentsDrawer } from '@/components/CommentsDrawer';
import { CreatePostModal } from '@/components/CreatePostModal';
import { useSession } from '@/components/SessionProvider';

interface ProfileUser {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  role: string;
  grade: string;
  interests: string;
  createdAt: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  achievementCount: number;
  isFollowing: boolean;
  isMe: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  status: string;
  issuer: string;
  club?: { name: string; slug: string; iconEmoji: string } | null;
  verifier?: { displayName: string; username: string } | null;
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const me = useSession();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [tab, setTab] = useState<'posts' | 'achievements'>('posts');
  const [loading, setLoading] = useState(true);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProfile(null);
    setPosts([]);
    setAchievements([]);

    Promise.all([
      fetch(`/api/users/${username}`).then((r) => r.json()),
      fetch(`/api/users/${username}/achievements`).then((r) => r.json()),
    ]).then(async ([profileData, achievementsData]) => {
      if (profileData && !profileData.error) {
        setProfile(profileData);
        setFollowing(profileData.isFollowing);
        setFollowerCount(profileData.followerCount);

        // Fetch posts by this user's ID
        const pRes = await fetch(`/api/posts?authorId=${profileData.id}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setPosts(pData.posts ?? []);
        }
      }
      if (achievementsData?.achievements) {
        setAchievements(achievementsData.achievements);
      }
      setLoading(false);
    });
  }, [username]);

  async function handleFollow() {
    if (!profile) return;
    setFollowLoading(true);
    const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' });
    if (res.ok) {
      const { following: f, followerCount: fc } = await res.json();
      setFollowing(f);
      setFollowerCount(fc);
    }
    setFollowLoading(false);
  }

  function handleLike(postId: string) {
    fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      .then((r) => r.json())
      .then(({ liked, likeCount }) =>
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, liked, likeCount } : p)))
      );
  }

  function handleBookmark(postId: string) {
    fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' })
      .then((r) => r.json())
      .then(({ bookmarked }) =>
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, bookmarked, bookmarkCount: bookmarked ? p.bookmarkCount + 1 : p.bookmarkCount - 1 }
              : p
          )
        )
      );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-[hsl(var(--fg-muted))]">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="card p-6 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <Avatar src={profile.avatarUrl} name={profile.displayName} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-[hsl(var(--fg))]">{profile.displayName}</h1>
              <Badge label={profile.role} variant={profile.role} />
            </div>
            <p className="text-sm text-[hsl(var(--fg-muted))]">@{profile.username}</p>
            {profile.grade && (
              <p className="text-xs text-[hsl(var(--fg-muted))] flex items-center gap-1 mt-1">
                <MapPin size={12} /> {profile.grade}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {!profile.isMe && me && (
              <Button
                variant={following ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleFollow}
                loading={followLoading}
              >
                {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
                {following ? 'Following' : 'Follow'}
              </Button>
            )}
            {profile.isMe && (
              <Button variant="secondary" size="sm" onClick={() => setCreateOpen(true)}>
                New Post
              </Button>
            )}
          </div>
        </div>

        {profile.bio && <p className="text-sm text-[hsl(var(--fg))] mb-3">{profile.bio}</p>}

        {profile.interests && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {profile.interests.split(',').map((i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs bg-[hsl(var(--bg-subtle))] text-[hsl(var(--fg-muted))]"
              >
                {i.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6">
          {[
            { label: 'Posts', value: profile.postCount },
            { label: 'Followers', value: followerCount },
            { label: 'Following', value: profile.followingCount },
            { label: 'Achievements', value: profile.achievementCount },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold text-[hsl(var(--fg))]">{value}</p>
              <p className="text-xs text-[hsl(var(--fg-muted))]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[hsl(var(--border))] mb-4">
        {[
          { key: 'posts' as const, icon: <FileText size={15} />, label: 'Posts' },
          { key: 'achievements' as const, icon: <Trophy size={15} />, label: 'Achievements' },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-[hsl(var(--brand))] text-[hsl(var(--brand))]'
                : 'border-transparent text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))]'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-[hsl(var(--fg-muted))] py-12">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onComment={(id) => setCommentPostId(id)}
              />
            ))
          )}
        </div>
      )}

      {tab === 'achievements' && (
        <div className="space-y-3">
          {achievements.length === 0 ? (
            <p className="text-center text-[hsl(var(--fg-muted))] py-12">No achievements yet.</p>
          ) : (
            achievements.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-sm text-[hsl(var(--fg))]">{a.title}</h3>
                      <Badge label={a.status} variant={a.status} />
                    </div>
                    <p className="text-xs text-[hsl(var(--fg-muted))] mb-1">{a.description}</p>
                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--fg-muted))]">
                      <span>{a.issuer}</span>
                      {a.issuer && <span>·</span>}
                      <span>{new Date(a.date).toLocaleDateString()}</span>
                      {a.club && (
                        <>
                          <span>·</span>
                          <Link href={`/clubs/${a.club.slug}`} className="text-[hsl(var(--brand))] hover:underline">
                            {a.club.iconEmoji} {a.club.name}
                          </Link>
                        </>
                      )}
                    </div>
                    {a.verifier && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Verified by {a.verifier.displayName}
                      </p>
                    )}
                  </div>
                  <Trophy size={18} className="text-[hsl(var(--warning))] flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <CommentsDrawer
        postId={commentPostId}
        onClose={() => setCommentPostId(null)}
        onCommentAdded={(postId) =>
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
          )
        }
      />
      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(post) => setPosts((prev) => [post, ...prev])}
      />
    </div>
  );
}
