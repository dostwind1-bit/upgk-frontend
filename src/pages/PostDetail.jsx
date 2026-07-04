import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart, Flag, ShieldCheck, Send, Loader2 } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'General',
  'Education',
  'Technology',
  'Health & Fitness',
  'Business & Finance',
  'Career & Jobs',
  'Relationships',
  'Entertainment',
  'Sports',
  'Science',
  'Personal Development',
  'Travel',
  'Food',
  'Sawaal',
];

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editTags, setEditTags] = useState('');
  const [editImageAltText, setEditImageAltText] = useState('');
  const [editMetaDescription, setEditMetaDescription] = useState('');
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.get(`/posts/${slug}`).then(({ data }) => {
      if (!isMounted) return;
      setPost(data);
      setLikeCount(data.likes?.length || 0);
      setLiked(user ? data.likes?.includes(user._id) : false);
      setEditTitle(data.title || '');
      setEditContent(data.content || '');
      setEditCategory(data.category || 'General');
      setEditTags((data.tags || []).join(', '));
      setEditImageAltText(data.imageAltText || '');
      setEditMetaDescription(data.metaDescription || '');
      return api.get(`/comments/${data._id}`).then((res) => {
        if (isMounted) setComments(res.data);
      });
    }).catch(() => {
      if (isMounted) setPost(null);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug, user?._id]);

  const handleLike = async () => {
    if (!user) return toast.error('Login karo like karne ke liye');
    const { data } = await api.put(`/posts/${post._id}/like`);
    setLiked(data.liked);
    setLikeCount(data.likes);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post('/comments', { postId: post._id, content: commentText });
      setComments((prev) => [data, ...prev]);
      setCommentText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Comment blocked by AI moderation');
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!post) return;

    const hasTitleChanged = editTitle.trim() !== (post.title || '').trim();
    const hasContentChanged = editContent !== (post.content || '');
    const hasCategoryChanged = editCategory !== (post.category || 'General');
    const hasTagsChanged = editTags !== (post.tags || []).join(', ');
    const hasAltChanged = editImageAltText !== (post.imageAltText || '');
    const hasMetaChanged = editMetaDescription !== (post.metaDescription || '');
    const hasImageChanges = editImageFiles.length > 0;

    if (!hasTitleChanged && !hasContentChanged && !hasCategoryChanged && !hasTagsChanged && !hasAltChanged && !hasMetaChanged && !hasImageChanges) {
      toast.error('Kuch change karo');
      return;
    }

    setSavingEdit(true);
    try {
      const fd = new FormData();
      if (hasTitleChanged) fd.append('title', editTitle.trim());
      if (hasContentChanged) fd.append('content', editContent);
      if (hasCategoryChanged) fd.append('category', editCategory);
      if (hasTagsChanged) fd.append('tags', editTags);
      if (hasAltChanged) fd.append('imageAltText', editImageAltText);
      if (hasMetaChanged) fd.append('metaDescription', editMetaDescription);
      editImageFiles.forEach((file) => fd.append('images', file));

      const { data } = await api.put(`/posts/${post._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPost(data);
      setEditing(false);
      setEditImageFiles([]);
      toast.success('Post update ho gaya');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Post update failed');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt('Report karne ka reason likho:');
    if (!reason) return;
    await api.post('/reports', { targetType: 'post', targetId: post._id, reason });
    toast.success('Report submit ho gaya, admin dekhega');
  };

  const isAuthor = Boolean(user && post?.author && String(post.author._id || post.author) === String(user._id));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!post) return <div className="text-center py-20 text-muted">Post nahi mila</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-xs text-muted mb-3">
        <span className="uppercase font-semibold text-teal">{post.category}</span>
        <span>&middot;</span>
        <span>{post.author?.name}</span>
        {post.moderationStatus === 'approved' && (
          <span className="ml-auto flex items-center gap-1 text-teal"><ShieldCheck size={13} /> AI Verified</span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 mb-4">
        <h1 className="font-display text-3xl text-ink font-medium">{post.title}</h1>
        {isAuthor && (
          <button type="button" onClick={() => setEditing(true)} className="text-sm font-medium text-teal hover:text-ink shrink-0">
            Edit
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={handleEditSave} className="mb-6 rounded-card border border-ink/10 bg-paperDim p-4 space-y-3">
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
          <div className="grid gap-3 md:grid-cols-2">
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full border border-ink/20 rounded-lg px-3 py-2 text-sm">
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full border border-ink/20 rounded-lg px-3 py-2 text-sm" placeholder="Tags (comma separated)" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={editImageAltText} onChange={(e) => setEditImageAltText(e.target.value)} className="w-full border border-ink/20 rounded-lg px-3 py-2 text-sm" placeholder="Image alt text" />
            <input value={editMetaDescription} onChange={(e) => setEditMetaDescription(e.target.value)} className="w-full border border-ink/20 rounded-lg px-3 py-2 text-sm" placeholder="Meta description" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Replace images (optional)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setEditImageFiles(Array.from(e.target.files || []).slice(0, 5))} className="text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={savingEdit} className="bg-ink text-paper px-3 py-2 rounded-lg text-sm disabled:opacity-60">
              {savingEdit ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => { setEditing(false); setEditImageFiles([]); }} className="px-3 py-2 rounded-lg text-sm border border-ink/20">
              Cancel
            </button>
          </div>
        </form>
      )}

      {post.images?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt={post.imageAltText || ''} className="rounded-lg w-full object-cover" />
          ))}
        </div>
      )}

      {post.postType === 'video' && (
        <div className="mb-4 aspect-video rounded-lg overflow-hidden bg-black">
          {post.videoType === 'youtube' ? (
            <iframe
              className="w-full h-full"
              src={post.videoUrl.replace('watch?v=', 'embed/')}
              title={post.title}
              allowFullScreen
            />
          ) : (
            <video className="w-full h-full" controls src={post.videoUrl} />
          )}
        </div>
      )}

      <p className="text-charcoal whitespace-pre-wrap leading-relaxed mb-6">{post.content}</p>

      <div className="flex items-center gap-4 py-4 border-y border-ink/10 mb-6">
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm font-medium ${liked ? 'text-red-500' : 'text-muted'}`}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {likeCount}
        </button>
        <button onClick={handleReport} className="flex items-center gap-1.5 text-sm text-muted hover:text-red-500 ml-auto">
          <Flag size={16} /> Report
        </button>
      </div>

      <h2 className="font-display text-xl text-ink font-medium mb-4">Comments ({comments.length})</h2>

      {user && (
        <form onSubmit={handleComment} className="flex gap-2 mb-6">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Apna comment likho..."
            className="flex-1 border border-ink/20 rounded-full px-4 py-2 outline-none focus:border-teal"
          />
          <button type="submit" className="bg-ink text-paper p-2.5 rounded-full">
            <Send size={16} />
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal font-semibold text-sm shrink-0">
              {c.author?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal">{c.author?.name}</p>
              <p className="text-sm text-charcoal/90">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
