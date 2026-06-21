import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { CalendarDays, Clock, CheckCircle2, XCircle, Pill, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, pRes] = await Promise.all([
          api.get('/api/appointments'),
          api.get('/api/prescriptions'),
        ]);
        setAppointments(aRes.data.appointments || []);
        setPrescriptions(pRes.data.prescriptions || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/api/appointments/${id}`, { status });
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status } : a));
    } catch (e) { console.error(e); }
  };

  const pending = appointments.filter((a) => a.status === 'pending').length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const recent = appointments.slice(0, 5);

  if (loading) return <DashboardLayout><div className="flex h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Here's an overview of your healthcare activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        <StatsCard icon={CalendarDays} label="Total Appointments" value={appointments.length} color="teal" delay="100" />
        <StatsCard icon={Clock} label="Pending" value={pending} color="amber" delay="200" />
        <StatsCard icon={CheckCircle2} label="Completed" value={completed} color="emerald" delay="300" />
        <StatsCard icon={Pill} label="Prescriptions" value={prescriptions.length} color="blue" delay="400" />
      </div>

      {/* Recent appointments */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Appointments</h2>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Activity className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500">No appointments yet</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recent.map((a) => (
              <AppointmentCard key={a._id} appointment={a} onAction={handleAction} userRole={user.role} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
