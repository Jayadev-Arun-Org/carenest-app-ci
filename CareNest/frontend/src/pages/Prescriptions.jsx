import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import PrescriptionCard from '../components/PrescriptionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../components/Toast';
import { Plus, X, Pill } from 'lucide-react';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ patientId: '', patientName: '', notes: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }] });

  useEffect(() => {
    api.get('/api/prescriptions').then((r) => setPrescriptions(r.data.prescriptions || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/prescriptions/${id}/status`, { status });
      setPrescriptions((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
    } catch (e) { console.error(e); }
  };

  const addMed = () => setForm({ ...form, medications: [...form.medications, { name: '', dosage: '', frequency: '', duration: '' }] });
  const removeMed = (i) => setForm({ ...form, medications: form.medications.filter((_, idx) => idx !== i) });
  const updateMed = (i, k, v) => {
    const meds = [...form.medications];
    meds[i] = { ...meds[i], [k]: v };
    setForm({ ...form, medications: meds });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/prescriptions', form);
      setPrescriptions((prev) => [res.data.prescription, ...prev]);
      setShowModal(false);
      setForm({ patientId: '', patientName: '', notes: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }] });

      // Show toast popup
      showToast(`Prescription created for ${form.patientName}`);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all';

  if (loading) return <DashboardLayout><div className="flex h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-slate-500 mt-1">{user.role === 'doctor' ? 'Create and manage prescriptions' : 'View your prescriptions'}</p>
        </div>
        {user.role === 'doctor' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 transition-all hover:scale-105">
            <Plus className="h-4 w-4" /> New Prescription
          </button>
        )}
      </div>

      {prescriptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <Pill className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-500">No prescriptions yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {prescriptions.map((p) => <PrescriptionCard key={p._id} prescription={p} userRole={user.role} onUpdateStatus={handleUpdateStatus} />)}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">New Prescription</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID</label>
                  <input required value={form.patientId} onChange={(e) => setForm({...form, patientId: e.target.value})} className={inputCls} placeholder="Patient ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                  <input required value={form.patientName} onChange={(e) => setForm({...form, patientName: e.target.value})} className={inputCls} placeholder="Patient name" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Medications</label>
                  <button type="button" onClick={addMed} className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ Add</button>
                </div>
                <div className="space-y-3">
                  {form.medications.map((m, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-3 space-y-2 relative">
                      {form.medications.length > 1 && <button type="button" onClick={() => removeMed(i)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>}
                      <input required value={m.name} onChange={(e) => updateMed(i, 'name', e.target.value)} className={inputCls} placeholder="Medication name" />
                      <div className="grid grid-cols-3 gap-2">
                        <input required value={m.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} className={inputCls} placeholder="Dosage" />
                        <input required value={m.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} className={inputCls} placeholder="Frequency" />
                        <input required value={m.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} className={inputCls} placeholder="Duration" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className={inputCls} placeholder="Additional notes" />
              </div>
              <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                {submitting ? 'Creating...' : 'Create Prescription'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
