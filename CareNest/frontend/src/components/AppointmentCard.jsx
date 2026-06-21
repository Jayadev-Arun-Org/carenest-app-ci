import StatusBadge from './StatusBadge';
import { Calendar, Clock, User, FileText } from 'lucide-react';

export default function AppointmentCard({ appointment, onAction, userRole }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {userRole === 'patient'
                  ? `Dr. ${appointment.doctorName}`
                  : appointment.patientName}
              </h3>
              <p className="text-sm text-slate-500">
                {userRole === 'patient' ? 'Doctor' : 'Patient'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-teal-500" />
              {appointment.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-teal-500" />
              {appointment.time}
            </span>
          </div>

          <div className="flex items-start gap-1.5 text-sm text-slate-600">
            <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
            <span>{appointment.reason}</span>
          </div>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      {/* Actions */}
      {appointment.status === 'pending' && (
        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          {userRole === 'doctor' && (
            <button
              onClick={() => onAction(appointment._id, 'confirmed')}
              className="rounded-lg bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
            >
              Confirm
            </button>
          )}
          <button
            onClick={() => onAction(appointment._id, 'cancelled')}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {appointment.status === 'confirmed' && userRole === 'doctor' && (
        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => onAction(appointment._id, 'completed')}
            className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            Mark Completed
          </button>
        </div>
      )}
    </div>
  );
}
