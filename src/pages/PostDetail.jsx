import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart, Flag, ShieldCheck, Send, Loader2 } from 'lucide-react';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    api.get(`/posts/${slug}`).then(({ data }) => {
      setPost(data);
      setLikeCount(data.likes?.length || 0);
      setLiked(user ? data.likes?.includes(user._id) : false);
      api.get(`/comments/${data._id}`).then((res) => setComments(res.data));
    }).finally(() => setLoading(false));
  }, [slug]);

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
      setComments([data, ...comments]);
      setCommentText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Comment blocked by AI moderation');
    }
  };

  const handleReport = async () => {
    const reason = prompt('Report karne ka reason likho:');
    if (!reason) return;
    await api.post('/reports', { targetType: 'post', targetId: post._id, reason });
    toast.success('Report submit ho gaya, admin dekhega');
  };

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

      <h1 className="font-display text-3xl text-ink font-medium mb-4">{post.title}</h1>

      {post.images?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" className="rounded-lg w-full object-cover" />
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
