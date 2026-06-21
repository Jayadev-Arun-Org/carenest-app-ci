import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

let toastId = 0;
const listeners = new Set();
let toasts = [];

function notify(msg) {
  const id = ++toastId;
  toasts = [...toasts, { id, msg }];
  listeners.forEach((fn) => fn(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((fn) => fn(toasts));
  }, 4000);
}

export function showToast(msg) {
  notify(msg);
}

export default function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  const dismiss = (id) => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((fn) => fn(toasts));
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-2xl border border-slate-200 animate-fade-in-up min-w-[300px] max-w-[420px]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="flex-1 text-sm font-medium text-slate-700">{t.msg}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
