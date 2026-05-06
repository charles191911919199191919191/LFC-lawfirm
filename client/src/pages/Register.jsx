import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../stores/useAuthStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', form);
      setAuth(response.data.user, response.data.token);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">Create your account</h1>
        <p className="text-slate-500 mb-8">Start scheduling cases and managing lawyer workloads.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400"
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400"
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
          />
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400"
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
          >
            <option value="STAFF">Staff</option>
            <option value="LAWYER">Lawyer</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-brand-700 transition"
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
