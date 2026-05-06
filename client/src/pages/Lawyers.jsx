import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Lawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', phone: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadLawyers();
  }, []);

  async function loadLawyers() {
    try {
      const response = await api.get('/lawyers');
      setLawyers(response.data);
    } catch (error) {
      toast.error('Unable to load lawyer profiles');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setCreating(true);
    try {
      await api.post('/lawyers', form);
      toast.success('Lawyer created successfully');
      setForm({ name: '', email: '', password: '', specialization: '', phone: '' });
      loadLawyers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create lawyer');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(id) {
    try {
      await api.patch(`/lawyers/${id}/toggle`);
      toast.success('Lawyer status updated');
      loadLawyers();
    } catch (error) {
      toast.error('Unable to update status');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Lawyer Management</h1>
        <p className="text-slate-500 mt-2">Add new lawyers, monitor status, and keep profiles up to date.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Active Lawyers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Specialization</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {lawyers.map((lawyer) => (
                  <tr key={lawyer.id} className="border-b border-slate-100">
                    <td className="px-4 py-4">{lawyer.name}</td>
                    <td className="px-4 py-4">{lawyer.email}</td>
                    <td className="px-4 py-4">{lawyer.specialization}</td>
                    <td className="px-4 py-4 uppercase text-slate-600">{lawyer.active ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => toggleActive(lawyer.id)} className="rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                        {lawyer.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {lawyers.length === 0 && <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No lawyers found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Add New Lawyer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} type="email" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} type="password" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
            <label className="block text-sm font-medium text-slate-700">Specialization</label>
            <input value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
            <button disabled={creating} className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-white font-semibold hover:bg-brand-700 transition">
              {creating ? 'Saving...' : 'Create Lawyer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
