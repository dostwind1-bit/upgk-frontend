import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Eye, ShieldCheck, PlayCircle, HelpCircle } from 'lucide-react';

const CATEGORY_COLORS = {
  python: 'bg-teal',
  ai: 'bg-saffron',
  sql: 'bg-marigold',
  general: 'bg-ink/50',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'abhi';
  if (diff < 3600) return `${Math.floor(diff / 60)}m pehle`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h pehle`;
  return `${Math.floor(diff / 86400)}d pehle`;
}

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const tabColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general;
  const authorId = post.author?._id || post.author;

  return (
    <Link
      to={`/post/${post.slug}`}
      className="group flex bg-white rounded-card border border-ink/10 overflow-hidden hover:shadow-md hover:border-ink/20 transition-all"
    >
      <div className={`w-1.5 shrink-0 ${tabColor}`} />

      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-muted mb-2">
          <span className="uppercase tracking-wide font-semibold text-teal">{post.category}</span>
          <span>&middot;</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (authorId) navigate(`/profile/${authorId}`);
            }}
            className="hover:text-teal"
          >
            {post.author?.name}
          </button>
          <span>&middot;</span>
          <span>{timeAgo(post.createdAt)}</span>
          {post.moderationStatus === 'approved' && (
            <span className="ml-auto flex items-center gap-1 text-teal" title="AI se verify hua content">
              <ShieldCheck size={13} /> AI Verified
            </span>
          )}
        </div>

        <h3 className="font-display text-xl text-charcoal font-medium leading-snug group-hover:text-ink flex items-start gap-2">
          {post.postType === 'question' && <HelpCircle size={18} className="mt-1 text-marigold shrink-0" />}
          {post.postType === 'video' && <PlayCircle size={18} className="mt-1 text-teal shrink-0" />}
          {post.title}
        </h3>

        {post.content && (
          <p className="text-sm text-muted mt-2 line-clamp-2">{post.content.replace(/<[^>]*>/g, '')}</p>
        )}

        {post.images?.length > 0 && (
          <div className="flex gap-2 mt-3">
            {post.images.slice(0, 3).map((img, i) => (
              <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-ink/10" />
            ))}
          </div>
        )}

        {post.postType === 'video' && post.videoThumbnail && (
          <div className="relative mt-3 w-40 h-24 rounded-lg overflow-hidden border border-ink/10">
            <img src={post.videoThumbnail} alt="" className="w-full h-full object-cover" />
            <PlayCircle className="absolute inset-0 m-auto text-white drop-shadow" size={32} />
          </div>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1"><Heart size={14} /> {post.likes?.length || 0}</span>
          <span className="flex items-center gap-1"><MessageSquare size={14} /> Comments</span>
          <span className="flex items-center gap-1"><Eye size={14} /> {post.views || 0}</span>
        </div>
      </div>
    </Link>
  );
}
