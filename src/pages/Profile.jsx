import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [bio, setBio] = useState(user?.bio || '');
  const [editing, setEditing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get('/posts/user/my-posts').then(({ data }) => setPosts(data));
  }, []);

  const statusCounts = posts.reduce((acc, p) => {
    acc[p.moderationStatus] = (acc[p.moderationStatus] || 0) + 1;
    return acc;
  }, {});

  const saveBio = async () => {
    const { data } = await api.put('/auth/profile', { bio });
    setUser({ ...user, bio: data.bio });
    localStorage.setItem('upgk_user', JSON.stringify({ ...user, bio: data.bio }));
    setEditing(false);
    toast.success('Profile update ho gaya');
  };

  const startEdit = (post) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    setUpdating(true);
    try {
      const { data } = await api.put(`/posts/${editingPost._id}`, { title: editTitle, content: editContent });
      setPosts((prev) => prev.map((post) => (post._id === data._id ? data : post)));
      setEditingPost(null);
      toast.success('Post update ho gaya');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Post update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-card border border-ink/10 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-saffron flex items-center justify-center text-ink font-display font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink font-medium">{user?.name}</h1>
            <p className="text-muted text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4">
          {editing ? (
            <div className="flex gap-2">
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Apne baare me likho..."
                className="flex-1 border border-ink/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
              />
              <button onClick={saveBio} className="bg-ink text-paper px-4 rounded-lg text-sm">Save</button>
            </div>
          ) : (
            <p onClick={() => setEditing(true)} className="text-sm text-charcoal cursor-pointer hover:text-teal">
              {user?.bio || 'Bio add karne ke liye click karo'}
            </p>
          )}
        </div>

        <div className="flex gap-4 mt-4 text-sm text-muted">
          <span>Approved: <b className="text-teal">{statusCounts.approved || 0}</b></span>
          <span>Pending: <b className="text-marigold">{statusCounts.pending || 0}</b></span>
          <span>Rejected: <b className="text-red-500">{statusCounts.rejected || 0}</b></span>
        </div>
      </div>

      <h2 className="font-display text-xl text-ink font-medium mb-4">Aapke Posts</h2>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div key={post._id} className="relative">
            <PostCard post={post} />
            <button
              type="button"
              onClick={() => startEdit(post)}
              className="absolute top-4 right-4 text-xs font-medium text-teal hover:text-ink"
            >
              Edit
            </button>
            {editingPost?._id === post._id && (
              <form onSubmit={saveEdit} className="mt-3 rounded-card border border-ink/10 bg-paperDim p-4 space-y-3">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-ink/20 rounded-lg px-3 py-2 text-sm"
                  placeholder="Title"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-24 border border-ink/20 rounded-lg px-3 py-2 text-sm"
                  placeholder="Content"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={updating} className="bg-ink text-paper px-3 py-2 rounded-lg text-sm disabled:opacity-60">
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setEditingPost(null)} className="px-3 py-2 rounded-lg text-sm border border-ink/20">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
        {posts.length === 0 && <p className="text-muted text-sm">Abhi koi post nahi hai.</p>}
      </div>
    </div>
  );
}
