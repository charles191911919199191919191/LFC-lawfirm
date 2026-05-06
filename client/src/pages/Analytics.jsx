import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        setDashboard(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Failed to load analytics');
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-xl border-l-4 border-rose-500">
        <p className="text-sm font-semibold text-rose-600">Error Loading Analytics</p>
        <p className="text-slate-600 mt-2">Unable to load analytics data. Please check your connection and try refreshing the page.</p>
      </div>
    );
  }

  if (loading || !dashboard) {
    return <div className="rounded-3xl bg-white p-8 shadow-xl text-slate-500">Loading analytics…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
            <p className="text-slate-500">Real-time workload and trend information for your legal operations.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total appointments</p>
            <p className="mt-4 text-3xl font-semibold text-brand-600">{dashboard.overview.totalAppointments}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Urgent cases</p>
            <p className="mt-4 text-3xl font-semibold text-rose-600">{dashboard.overview.urgentCases}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active lawyers</p>
            <p className="mt-4 text-3xl font-semibold text-sky-600">{dashboard.overview.activeLawyers}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Appointment Trends</h2>
          <Line
            data={{
              labels: dashboard.appointmentTrends.labels,
              datasets: [{ label: 'Appointments', data: dashboard.appointmentTrends.values, borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.12)', tension: 0.3 }]
            }}
          />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Insights</h2>
          <p className="text-slate-600 leading-7">Use this page to identify overloaded schedules and to plan urgent case assignments. The system highlights the lawyer workload distribution and recommends balanced appointment planning.</p>
        </div>
      </div>
    </div>
  );
}
