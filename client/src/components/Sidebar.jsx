import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Analytics', path: '/analytics' }
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Users', path: '/users' });
    navItems.push({ label: 'Lawyers', path: '/lawyers' });
    navItems.push({ label: 'Settings', path: '/settings' });
  }

  return (
    <aside className={`transition-all duration-300 bg-white rounded-3xl shadow-xl p-5 ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className="flex items-center justify-between mb-10">
        {!collapsed && <div className="text-lg font-semibold text-slate-900">LFC Legal</div>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-500 hover:text-slate-900">
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <div className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            end
            to={item.path}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-10 text-sm text-slate-500">
        <p className="font-semibold text-slate-800">{user?.role}</p>
        {collapsed ? null : <p>{user?.name}</p>}
      </div>
    </aside>
  );
}
