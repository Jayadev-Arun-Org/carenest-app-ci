import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Pill, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { summarizePrescription } from '../services/aiApi';

export default function PrescriptionCard({ prescription, userRole, onUpdateStatus }) {
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleGetSummary = async () => {
    if (aiSummary) {
      setShowSummary(!showSummary);
      return;
    }
    setLoadingSummary(true);
    setShowSummary(true);
    try {
      const res = await summarizePrescription(prescription._id);
      setAiSummary(res.summary);
    } catch (err) {
      setAiSummary('Failed to load AI summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {userRole === 'patient'
                ? `Dr. ${prescription.doctorName}`
                : prescription.patientName}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {new Date(prescription.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusBadge status={prescription.status} />
      </div>

      {/* Medications list */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Medications
        </p>
        <div className="space-y-2">
          {prescription.medications.map((med, i) => (
            <div
              key={i}
              className="rounded-xl bg-slate-50 p-3 text-sm"
            >
              <p className="font-medium text-slate-700">{med.name}</p>
              <p className="text-slate-500 text-xs mt-1">
                {med.dosage} · {med.frequency} · {med.duration}
              </p>
            </div>
          ))}
        </div>
      </div>

      {prescription.notes && (
        <p className="text-sm text-slate-500 italic mb-4">"{prescription.notes}"</p>
      )}

      {/* Actions */}
      {prescription.status === 'pending' && (
        <div className="flex gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => onUpdateStatus(prescription._id, 'dispensed')}
            className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            Mark Dispensed
          </button>
          <button
            onClick={() => onUpdateStatus(prescription._id, 'cancelled')}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* AI Summary Section for Patients */}
      {userRole === 'patient' && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            onClick={handleGetSummary}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {showSummary && aiSummary ? 'Hide AI Summary' : 'Ask AI to Explain'}
            {showSummary && aiSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSummary && (
            <div className="mt-3 rounded-xl bg-indigo-50 p-4 border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
              {loadingSummary ? (
                <div className="flex items-center gap-2 text-indigo-600 text-sm animate-pulse">
                  <Sparkles className="h-4 w-4" /> Generating plain-language explanation...
                </div>
              ) : (
                <p className="text-sm text-indigo-900 leading-relaxed">
                  {aiSummary}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
