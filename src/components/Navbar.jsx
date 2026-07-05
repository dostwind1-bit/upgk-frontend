import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, MessageCircle, User, LogOut, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-ink text-paper border-b border-inkLight/60">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center font-display font-bold text-ink text-sm">
            उ
          </span>
          <span className="font-display text-xl tracking-tight">
            UPGK<span className="text-saffron">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-inkLight/60 rounded-full px-4 py-2 w-80">
          <Search size={16} className="text-paper/50" />
          <input
            placeholder="Khoje — Python, SQL, AI..."
            className="bg-transparent outline-none text-sm placeholder:text-paper/40 w-full ml-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/?search=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
          />
        </div>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/create"
                className="hidden sm:flex items-center gap-1.5 bg-saffron text-ink px-4 py-2 rounded-full text-sm font-semibold hover:bg-marigold transition-colors"
              >
                <PenSquare size={15} /> Post
              </Link>
              <Link to="/chat" className="p-2 rounded-full hover:bg-inkLight transition-colors" aria-label="Chat">
                <MessageCircle size={20} />
              </Link>
              <Link to="/profile" className="p-2 rounded-full hover:bg-inkLight transition-colors" aria-label="Profile">
                <User size={20} />
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 rounded-full hover:bg-inkLight transition-colors"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-saffron transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-saffron text-ink px-4 py-2 rounded-full text-sm font-semibold hover:bg-marigold transition-colors"
              >
                Start 
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
