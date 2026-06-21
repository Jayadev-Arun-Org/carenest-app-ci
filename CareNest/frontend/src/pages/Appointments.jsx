import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/Toast';
import { Plus, X, CalendarDays } from 'lucide-react';
import SymptomChecker from '../components/SymptomChecker';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ doctorId: '', doctorName: '', date: '', time: '', reason: '' });
  const [suggestedSpecialty, setSuggestedSpecialty] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, dRes] = await Promise.all([
          api.get('/api/appointments'),
          user.role === 'patient' ? api.get('/api/auth/doctors') : Promise.resolve({ data: { doctors: [] } }),
        ]);
        setAppointments(aRes.data.appointments || []);
        setDoctors(dRes.data.doctors || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.role]);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/api/appointments/${id}`, { status });
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
    } catch (e) { console.error(e); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/appointments', form);
      setAppointments((prev) => [res.data.appointment, ...prev]);
      setShowModal(false);
      setForm({ doctorId: '', doctorName: '', date: '', time: '', reason: '' });

      // Show toast popup
      showToast(`Appointment booked with Dr. ${form.doctorName} on ${form.date}`);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const selectDoctor = (e) => {
    const doc = doctors.find((d) => d._id === e.target.value);
    setForm({ ...form, doctorId: doc?._id || '', doctorName: doc?.name || '' });
  };

  const handleAnalysisComplete = (specialty) => {
    setSuggestedSpecialty(specialty);
  };

  const sortedDoctors = useMemo(() => {
    if (!suggestedSpecialty) return doctors;
    return [...doctors].sort((a, b) => {
      const aMatches = a.specialization?.toLowerCase().includes(suggestedSpecialty.toLowerCase());
      const bMatches = b.specialization?.toLowerCase().includes(suggestedSpecialty.toLowerCase());
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }, [doctors, suggestedSpecialty]);

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all';

  if (loading) return <DashboardLayout><div className="flex h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your scheduled appointments</p>
        </div>
        {user.role === 'patient' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 transition-all hover:scale-105">
            <Plus className="h-4 w-4" /> Book Appointment
          </button>
        )}
      </div>

      {user.role === 'patient' && (
        <SymptomChecker 
          onAnalysisComplete={handleAnalysisComplete} 
          doctors={doctors}
          onBookDoctor={(doctorId) => {
            const doc = doctors.find(d => d._id === doctorId);
            setForm({ ...form, doctorId: doc?._id || '', doctorName: doc?.name || '' });
            setShowModal(true);
          }}
        />
      )}

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-500">No appointments yet</p>
          <p className="text-sm text-slate-400 mt-1">Book your first appointment to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((a) => <AppointmentCard key={a._id} appointment={a} onAction={handleAction} userRole={user.role} />)}
        </div>
      )}

      {/* Book Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Book Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor</label>
                <select required value={form.doctorId} onChange={selectDoctor} className={inputCls}>
                  <option value="">Select a doctor</option>
                  {sortedDoctors.map((d) => {
                    const isRecommended = suggestedSpecialty && d.specialization?.toLowerCase().includes(suggestedSpecialty.toLowerCase());
                    return (
                      <option key={d._id} value={d._id}>
                        {d.name}{d.specialization ? ` — ${d.specialization}` : ''} {isRecommended ? '(✨ AI Recommended)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Time</label>
                  <input type="time" required value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
                <textarea required rows={3} value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} className={inputCls} placeholder="Describe the reason for your visit" />
              </div>
              <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
