import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Stethoscope } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'patient', specialization: '',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all';

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-teal-500/15 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="animate-float mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-2xl shadow-teal-500/30">
            <Heart className="h-10 w-10" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Join <span className="text-teal-400">CareNest</span></h2>
          <p className="text-slate-400 leading-relaxed">Create your account and start managing your healthcare journey with ease.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white"><Heart className="h-5 w-5" /></div>
            <span className="text-xl font-bold text-slate-800">Care<span className="text-teal-600">Nest</span></span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Create account</h1>
          <p className="text-slate-500 mb-8">Fill in your details to get started</p>

          {error && <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {['patient', 'doctor'].map((r) => (
                  <button key={r} type="button" onClick={() => setForm({...form, role: r})}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${form.role === r ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                    {r === 'patient' ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                    <span className="capitalize">{r}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input id="reg-name" required value={form.name} onChange={set('name')} className={inputCls} placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input id="reg-email" type="email" required value={form.email} onChange={set('email')} className={inputCls} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input id="reg-phone" value={form.phone} onChange={set('phone')} className={inputCls} placeholder="+1 234 567 890" />
              </div>
            </div>
            {form.role === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="reg-spec" value={form.specialization} onChange={set('specialization')} className={inputCls} placeholder="e.g. Cardiology" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="reg-pass" type="password" required minLength={6} value={form.password} onChange={set('password')} className={inputCls} placeholder="••••••" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input id="reg-confirm" type="password" required value={form.confirmPassword} onChange={set('confirmPassword')} className={inputCls} placeholder="••••••" />
                </div>
              </div>
            </div>
            <button id="reg-submit" type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3 font-semibold text-white shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 transition-all hover:scale-[1.02] disabled:opacity-60">
              {loading ? <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><span>Create Account</span><ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
