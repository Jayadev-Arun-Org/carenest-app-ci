import React, { useState, useMemo } from 'react';
import { checkSymptoms } from '../services/aiApi';
import { Sparkles, Stethoscope, AlertTriangle, ArrowRight } from 'lucide-react';

export default function SymptomChecker({ onAnalysisComplete, doctors = [], onBookDoctor }) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await checkSymptoms(symptoms);
      setResult(res);
      if (onAnalysisComplete) {
        onAnalysisComplete(res.specialty);
      }
    } catch (err) {
      setError('Unable to analyze symptoms at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const matchingDoctors = useMemo(() => {
    if (!result || !doctors) return [];
    return doctors.filter(d => 
      d.specialization && result.specialty && 
      d.specialization.toLowerCase().includes(result.specialty.toLowerCase())
    );
  }, [result, doctors]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
        <Sparkles className="h-24 w-24 text-indigo-500" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Unsure who to see? Ask AI</h2>
          <p className="text-sm text-slate-500">Describe your symptoms and we'll suggest the right specialist.</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="E.g., I have been experiencing a sharp chest pain for the last 2 days..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 min-h-[100px] resize-none"
        ></textarea>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" /> Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Analyze Symptoms
              </span>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className={`rounded-xl border p-5 ${getUrgencyColor(result.urgency)}`}>
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  {result.urgency?.toLowerCase() === 'high' ? (
                    <AlertTriangle className="h-6 w-6" />
                  ) : (
                    <Stethoscope className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold mb-1 flex items-center gap-2">
                    Recommended Specialty: <span className="underline decoration-2 underline-offset-4">{result.specialty}</span>
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-3">{result.reason}</p>
                  
                  <div className="inline-flex items-center rounded-full bg-white/50 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    Urgency: {result.urgency?.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t border-black/5 pt-4">
                <h4 className="text-sm font-bold opacity-80 mb-3">Matching Doctors Found:</h4>
                {matchingDoctors.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {matchingDoctors.map(doc => (
                      <div key={doc._id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.specialization}</p>
                        </div>
                        {onBookDoctor && (
                          <button 
                            onClick={() => onBookDoctor(doc._id)}
                            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                          >
                            Book
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm opacity-80">No available doctors perfectly match "{result.specialty}" right now, but you can still select a doctor manually from the Booking menu.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
