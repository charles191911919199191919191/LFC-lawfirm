import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Unable to load users');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', form);
      toast.success('User added successfully');
      setForm({ name: '', email: '', password: '', role: 'STAFF' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create user');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User removed');
      loadUsers();
    } catch (error) {
      toast.error('Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-2">Create and manage staff or lawyer accounts from one place.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Existing Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="px-4 py-4">{user.name}</td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4 uppercase text-slate-600">{user.role}</td>
                    <td className="px-4 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => handleDelete(user.id)} className="rounded-2xl bg-rose-500 px-3 py-2 text-white hover:bg-rose-600">Delete</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No users available.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Add New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} type="email" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} type="password" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400">
              <option value="STAFF">Staff</option>
              <option value="LAWYER">Lawyer</option>
            </select>
            <button disabled={loading} className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-white font-semibold hover:bg-brand-700 transition">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
