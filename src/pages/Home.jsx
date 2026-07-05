import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { Loader2 } from 'lucide-react';

const CATEGORIES = [
  { key: '', label: 'Sabhi' },
  { key: 'General', label: 'General' },
  { key: 'Education', label: 'Education' },
  { key: 'Technology', label: 'Technology' },
  { key: 'Career & Jobs', label: 'Career' },
  { key: 'Entertainment', label: 'Entertainment' },
  { key: 'Sawaal', label: 'Sawaal' },
];

const ALL_CATEGORIES = [
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

const TYPES = [
  { key: '', label: 'Sab types' },
  { key: 'blog', label: 'Blog' },
  { key: 'question', label: 'Sawaal' },
  { key: 'image', label: 'Image' },
  { key: 'video', label: 'Video' },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [postType, setPostType] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (category) params.category = category;
    if (postType) params.postType = postType;
    if (search) params.search = search;

    api
      .get('/posts', { params })
      .then(({ data }) => {
        setPosts(data.posts);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [category, postType, page, search]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink font-medium">
          {search ? `"${search}" ke results` : 'Community Feed'}
        </h1>
        <p className="text-muted text-sm mt-1">Ask questions. Share your world. Join the conversation.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => { setCategory(c.key); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === c.key ? 'bg-ink text-paper' : 'bg-white border border-ink/15 text-charcoal hover:border-ink/40'
            }`}
          >
            {c.label}
          </button>
        ))}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">Explore More</option>
          {ALL_CATEGORIES.filter((value) => !CATEGORIES.some((item) => item.key === value)).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <span className="w-px bg-ink/15 mx-1" />
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => { setPostType(t.key); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              postType === t.key ? 'bg-teal text-paper' : 'bg-white border border-ink/15 text-charcoal hover:border-ink/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-muted"><Loader2 className="animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted">
          No posts yet. Be the first to share!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm ${page === p ? 'bg-ink text-paper' : 'bg-white border border-ink/15'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
