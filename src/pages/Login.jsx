import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login fail hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink font-medium text-center mb-2">Wapas swagat hai</h1>
        <p className="text-muted text-sm text-center mb-8">UPGK community me login karo</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-paper py-2.5 rounded-lg font-semibold hover:bg-inkLight transition-colors disabled:opacity-50"
          >
            {loading ? 'Login ho raha hai...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Account nahi hai?{' '}
          <Link to="/register" className="text-teal font-medium">Register karo</Link>
        </p>
      </div>
    </div>
  );
}
