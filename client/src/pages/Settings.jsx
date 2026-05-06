import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Settings() {
  const [settings, setSettings] = useState({ overloadThreshold: 5 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => toast.error('Unable to load settings'));
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/settings', { overloadThreshold: Number(settings.overloadThreshold) });
      setSettings(response.data);
      toast.success('System settings saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-2">Configure the overload threshold and priority rules used by the scheduling engine.</p>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-5">
          <label className="block text-sm font-medium text-slate-700">Daily overload threshold</label>
          <input
            type="number"
            min="1"
            value={settings.overloadThreshold}
            onChange={(e) => setSettings((prev) => ({ ...prev, overloadThreshold: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400"
          />
          <p className="text-sm text-slate-500">If a lawyer has more than this number of appointments in one day, they are flagged as overloaded.</p>
          <button type="submit" className="rounded-2xl bg-brand-600 px-5 py-3 text-white font-semibold hover:bg-brand-700 transition" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
