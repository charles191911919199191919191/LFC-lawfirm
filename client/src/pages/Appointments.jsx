import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const pageSize = 6;

function AppointmentRow({ appointment, onEdit, onDelete }) {
  return (
    <tr className={appointment.caseType === 'Urgent' ? 'bg-rose-50' : ''}>
      <td className="px-4 py-4 text-sm text-slate-700">{new Date(appointment.date).toISOString().slice(0, 10)}</td>
      <td className="px-4 py-4 text-sm text-slate-700">{appointment.clientName}</td>
      <td className="px-4 py-4 text-sm text-slate-700">{appointment.assignedLawyer?.user?.name || 'Unassigned'}</td>
      <td className="px-4 py-4 text-sm font-semibold text-slate-900">{appointment.caseType}</td>
      <td className="px-4 py-4 text-sm text-slate-700">{appointment.status}</td>
      <td className="px-4 py-4 text-right text-sm text-slate-600 space-x-2">
        <button onClick={() => onEdit(appointment)} className="rounded-2xl bg-slate-100 px-3 py-2 hover:bg-slate-200">Edit</button>
        <button onClick={() => onDelete(appointment.id)} className="rounded-2xl bg-rose-500 px-3 py-2 text-white hover:bg-rose-600">Delete</button>
      </td>
    </tr>
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    clientName: '',
    contactInfo: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    caseType: 'Regular',
    assignedLawyerId: '',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
    loadLawyers();
  }, []);

  async function loadAppointments() {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      toast.error('Unable to load appointments');
    }
  }

  async function loadLawyers() {
    try {
      const res = await api.get('/lawyers');
      setLawyers(res.data);
      setForm((prev) => ({ ...prev, assignedLawyerId: res.data[0]?.id || '' }));
    } catch (error) {
      toast.error('Unable to load lawyers');
    }
  }

  function openModal(appointment = null) {
    if (appointment) {
      setEditing(appointment);
      setForm({
        clientName: appointment.clientName,
        contactInfo: appointment.contactInfo,
        date: appointment.date.slice(0, 10),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        caseType: appointment.caseType,
        assignedLawyerId: appointment.assignedLawyerId || '',
        status: appointment.status,
        notes: appointment.notes || ''
      });
    } else {
      setEditing(null);
      setForm((prev) => ({ ...prev, clientName: '', contactInfo: '', date: '', notes: '' }));
    }
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (editing) {
        await api.put(`/appointments/${editing.id}`, form);
        toast.success('Appointment updated');
      } else {
        await api.post('/appointments', form);
        toast.success('Appointment created');
      }
      closeModal();
      loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save appointment');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment deleted');
      loadAppointments();
    } catch (error) {
      toast.error('Unable to delete appointment');
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const query = search.toLowerCase();
      return (
        appointment.clientName.toLowerCase().includes(query) ||
        appointment.contactInfo.toLowerCase().includes(query) ||
        appointment.caseType.toLowerCase().includes(query) ||
        appointment.status.toLowerCase().includes(query) ||
        appointment.assignedLawyer?.user?.name.toLowerCase().includes(query)
      );
    });
  }, [appointments, search]);

  const pageCount = Math.ceil(filteredAppointments.length / pageSize);
  const pageItems = filteredAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
          <p className="text-slate-500">Create, update, and manage case schedules efficiently.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400"
            placeholder="Search appointments"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => openModal()} className="rounded-2xl bg-brand-600 px-5 py-3 text-white hover:bg-brand-700 transition">
            New appointment
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Lawyer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} onEdit={openModal} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
        {filteredAppointments.length === 0 && <p className="py-6 text-center text-slate-500">No appointments found.</p>}
      </div>

      {pageCount > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: pageCount }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-2xl px-4 py-2 ${page === currentPage ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{editing ? 'Edit Appointment' : 'New Appointment'}</h2>
                <p className="text-sm text-slate-500">Add or update case details with priority and assignment.</p>
              </div>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Client Name</span>
                <input value={form.clientName} onChange={(e) => updateForm('clientName', e.target.value)} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Contact Info</span>
                <input value={form.contactInfo} onChange={(e) => updateForm('contactInfo', e.target.value)} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Date</span>
                <input type="date" value={form.date} onChange={(e) => updateForm('date', e.target.value)} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Start Time</span>
                <input type="time" value={form.startTime} onChange={(e) => updateForm('startTime', e.target.value)} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">End Time</span>
                <input type="time" value={form.endTime} onChange={(e) => updateForm('endTime', e.target.value)} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Case Type</span>
                <select value={form.caseType} onChange={(e) => updateForm('caseType', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400">
                  <option value="Regular">Regular</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Assigned Lawyer</span>
                <select value={form.assignedLawyerId} onChange={(e) => updateForm('assignedLawyerId', e.target.value)} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400">
                  {lawyers.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>{lawyer.name} — {lawyer.specialization}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <select value={form.status} onChange={(e) => updateForm('status', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400">
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
              <label className="md:col-span-2 space-y-2">
                <span className="text-sm font-medium text-slate-700">Notes</span>
                <textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} rows="4" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-400" />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="rounded-2xl bg-brand-600 px-5 py-3 text-white hover:bg-brand-700 transition">Save appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
