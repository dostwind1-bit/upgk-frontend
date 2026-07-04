import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldAlert, ShieldCheck, Clock } from 'lucide-react';

const POST_TYPES = [
  { key: 'blog', label: 'Blog Post' },
  { key: 'question', label: 'Sawaal Puchho' },
  { key: 'image', label: 'Image Post' },
  { key: 'video', label: 'Video Post' },
];

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

export default function CreatePost() {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('blog');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState([]);
  const [videoType, setVideoType] = useState('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let data;

      if (postType === 'video') {
        const fd = new FormData();
        fd.append('title', title);
        fd.append('content', content);
        fd.append('category', category);
        fd.append('tags', tags);
        fd.append('videoType', videoType);
        if (videoType === 'youtube') fd.append('videoUrl', videoUrl);
        if (videoType === 'upload' && videoFile) fd.append('video', videoFile);

        const res = await api.post('/posts/video', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = res.data;
      } else {
        const fd = new FormData();
        fd.append('postType', postType);
        fd.append('title', title);
        fd.append('content', content);
        fd.append('category', category);
        fd.append('tags', tags);
        images.forEach((img) => fd.append('images', img));

        const res = await api.post('/posts', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = res.data;
      }

      setResult(data);

      if (data.moderationStatus === 'approved') {
        toast.success('Post approved ho gaya!');
        setTimeout(() => navigate(`/post/${data.slug}`), 1500);
      } else if (data.moderationStatus === 'flagged_for_review') {
        toast('Admin review ke liye bheja gaya', { icon: '⏳' });
      } else {
        toast.error('Post AI moderation me reject ho gaya');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kuch galat hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-ink font-medium mb-1">Naya Post</h1>
      <p className="text-muted text-sm mb-6">Har post AI se automatically check hota hai — safe rehta hai community.</p>

      <div className="flex gap-2 mb-6">
        {POST_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setPostType(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              postType === t.key ? 'bg-ink text-paper' : 'bg-white border border-ink/15'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-card border border-ink/10">
        <input
          required
          placeholder={postType === 'question' ? 'Aapka sawaal kya hai?' : 'Title'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal"
        />

        <textarea
          placeholder={postType === 'question' ? 'Sawaal detail me likho...' : 'Content likho...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal resize-none"
        />

        <div className="flex gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <input
            placeholder="Tags (comma se separate)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="flex-1 border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal"
          />
        </div>

        {postType === 'image' && (
          <div>
            <label className="text-sm text-muted mb-1 block">Images (max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
              className="text-sm"
            />
          </div>
        )}

        {postType === 'video' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setVideoType('youtube')}
                className={`px-3 py-1.5 rounded-full text-sm ${videoType === 'youtube' ? 'bg-teal text-paper' : 'bg-paperDim'}`}>
                YouTube Link
              </button>
              <button type="button" onClick={() => setVideoType('upload')}
                className={`px-3 py-1.5 rounded-full text-sm ${videoType === 'upload' ? 'bg-teal text-paper' : 'bg-paperDim'}`}>
                Video Upload
              </button>
            </div>

            {videoType === 'youtube' ? (
              <input
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal"
              />
            ) : (
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="text-sm"
              />
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-saffron text-ink py-2.5 rounded-lg font-semibold hover:bg-marigold transition-colors disabled:opacity-50"
        >
          {loading ? 'AI check ho raha hai...' : 'Post Karo'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-card border flex items-start gap-3 ${
          result.moderationStatus === 'approved' ? 'bg-teal/10 border-teal/30' :
          result.moderationStatus === 'flagged_for_review' ? 'bg-saffron/10 border-saffron/30' :
          'bg-red-50 border-red-200'
        }`}>
          {result.moderationStatus === 'approved' && <ShieldCheck className="text-teal shrink-0" />}
          {result.moderationStatus === 'flagged_for_review' && <Clock className="text-marigold shrink-0" />}
          {result.moderationStatus === 'rejected' && <ShieldAlert className="text-red-500 shrink-0" />}
          <div className="text-sm">
            <p className="font-semibold text-charcoal">{result.moderationNote}</p>
            {result.moderationFlags?.length > 0 && (
              <p className="text-muted mt-1">Flags: {result.moderationFlags.join(', ')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
