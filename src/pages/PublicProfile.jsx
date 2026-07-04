import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/auth/profile/${userId}`);
        setProfile(data);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-muted">Loading...</div>;
  if (!profile) return <div className="max-w-2xl mx-auto px-4 py-8 text-muted">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-card border border-ink/10 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-saffron flex items-center justify-center text-ink font-display font-bold text-2xl">
            {profile.user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink font-medium">{profile.user?.name}</h1>
            <p className="text-muted text-sm">{profile.user?.bio || 'No bio yet.'}</p>
          </div>
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
