import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Stethoscope } from 'lucide-react';
// import { useMsal } from '@azure/msal-react';
// import { loginRequest } from '../auth/msalConfig';

// const isSecureContext =
//   window.location.protocol === 'https:' ||
//   window.location.hostname === 'localhost';


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-teal-500/15 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="animate-float mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-2xl shadow-teal-500/30">
            <Heart className="h-10 w-10" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome back to <br /><span className="text-teal-400">CareNest</span></h2>
          <p className="text-slate-400 leading-relaxed">Your trusted healthcare companion. Sign in to manage appointments, view prescriptions, and connect with your care team.</p>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white"><Heart className="h-5 w-5" /></div>
            <span className="text-xl font-bold text-slate-800">Care<span className="text-teal-600">Nest</span></span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h1>
          <p className="text-slate-500 mb-8">Enter your credentials to access your account</p>
          {error && <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input id="login-email" type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input id="login-password" type="password" required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>
            <button id="login-submit" type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3 font-semibold text-white shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 transition-all hover:scale-[1.02] disabled:opacity-60">
              {loading ? <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><span>Sign In</span><ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">Don't have an account? <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">Create one now</Link></p>
        </div>
      </div>
    </div>
  );
}
