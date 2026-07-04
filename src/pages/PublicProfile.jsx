import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PublicProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/auth/profile/${userId}`);
        setProfile(data);
        setFollowing(Boolean(data.isFollowing));
        setFollowersCount(data.followersCount || 0);
        setFollowingCount(data.followingCount || 0);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!user) return toast.error('Follow karne ke liye login karo');
    if (user._id === userId) return;

    setFollowLoading(true);
    try {
      const endpoint = following ? `/users/${userId}/unfollow` : `/users/${userId}/follow`;
      const { data } = await api.post(endpoint);
      setFollowing(Boolean(data.following));
      setFollowersCount((count) => (data.following ? count + 1 : Math.max(0, count - 1)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Follow action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-muted">Loading...</div>;
  if (!profile) return <div className="max-w-2xl mx-auto px-4 py-8 text-muted">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-card border border-ink/10 p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-saffron flex items-center justify-center text-ink font-display font-bold text-2xl">
              {profile.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl text-ink font-medium">{profile.user?.name}</h1>
              <p className="text-muted text-sm">{profile.user?.bio || 'No bio yet.'}</p>
            </div>
          </div>
          {user && user._id !== userId && (
            <button
              type="button"
              disabled={followLoading}
              onClick={handleFollowToggle}
              className={`rounded-full px-4 py-2 text-sm font-medium ${following ? 'bg-ink text-paper' : 'bg-saffron text-ink'}`}
            >
              {followLoading ? '...' : following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        <div className="flex gap-4 mt-4 text-sm text-muted">
          <span><b className="text-ink">{followersCount}</b> followers</span>
          <span><b className="text-ink">{followingCount}</b> following</span>
        </div>
      </div>

      <h2 className="font-display text-xl text-ink font-medium mb-4">Posts</h2>
      <div className="flex flex-col gap-4">
        {profile.posts?.map((post) => (
          <PostCard key={post._id} post={{ ...post, author: profile.user }} />
        ))}
        {profile.posts?.length === 0 && <p className="text-muted text-sm">No public posts yet.</p>}
      </div>
    </div>
  );
}
