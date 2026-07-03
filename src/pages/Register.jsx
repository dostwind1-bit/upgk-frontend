import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account ban gaya! Welcome to UPGK');
      navigate('/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      toast.error(errors?.[0]?.msg || err.response?.data?.message || 'Registration fail hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink font-medium text-center mb-2">UPGK join karo</h1>
        <p className="text-muted text-sm text-center mb-8">Ek platform, gyaan ke kai raaste</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            placeholder="Poora naam"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal"
          />
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
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-ink/20 rounded-lg px-4 py-2.5 outline-none focus:border-teal"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-saffron text-ink py-2.5 rounded-lg font-semibold hover:bg-marigold transition-colors disabled:opacity-50"
          >
            {loading ? 'Ban raha hai...' : 'Account banao'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Pehle se account hai?{' '}
          <Link to="/login" className="text-teal font-medium">Login karo</Link>
        </p>
      </div>
    </div>
  );
}
