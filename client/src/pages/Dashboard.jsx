import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-4 text-4xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-xl">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Total Appointments" value={data.overview.totalAppointments} accent="text-brand-600" />
        <StatCard label="Urgent Cases" value={data.overview.urgentCases} accent="text-rose-600" />
        <StatCard label="Active Lawyers" value={data.overview.activeLawyers} accent="text-sky-600" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Appointment Trends</h2>
          <Line
            data={{
              labels: data.appointmentTrends.labels,
              datasets: [{ label: 'Appointments', data: data.appointmentTrends.values, borderColor: '#4338ca', backgroundColor: 'rgba(67, 56, 202, 0.12)', tension: 0.4 }]
            }}
          />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Workload Distribution</h2>
          <Bar
            data={{
              labels: data.workloadDistribution.labels,
              datasets: [{ label: 'Assigned cases', data: data.workloadDistribution.values, backgroundColor: '#2563eb' }]
            }}
          />
        </div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Insights</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
            <p className="text-sm text-slate-500">Your case distribution shows urgent appointments prioritized by date and workload.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
            <p className="text-sm text-slate-500">The workload chart helps identify overloaded lawyers and suggest balanced tasking.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
