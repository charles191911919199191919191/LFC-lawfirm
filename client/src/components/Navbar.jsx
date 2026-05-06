import { useAuthStore } from '../stores/useAuthStore';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <div className="flex items-center justify-between gap-4 py-4 px-6 bg-white rounded-3xl shadow-xl">
      <div>
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h1 className="text-2xl font-semibold text-slate-900">{user?.name || 'Legal User'}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{user?.role}</div>
        <button
          onClick={clearAuth}
          className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
