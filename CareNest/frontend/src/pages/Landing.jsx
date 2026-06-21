import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import {
  Shield,
  CalendarCheck,
  Pill,
  ArrowRight,
  Heart,
  Activity,
  Users,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    desc: 'Role-based access with JWT — separate experiences for patients and doctors.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: CalendarCheck,
    title: 'Smart Scheduling',
    desc: 'Book, confirm, and manage appointments effortlessly in real time.',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    icon: Pill,
    title: 'Prescription Management',
    desc: 'Doctors create prescriptions instantly; patients view and track them.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Activity,
    title: 'Microservices Architecture',
    desc: 'Independently scalable services built for reliability.',
    color: 'from-rose-500 to-pink-500',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] bg-teal-500/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] bg-emerald-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2 rounded-full text-sm text-teal-300 mb-6">
            <Sparkles className="w-4 h-4" />
            Modern Healthcare Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold">
            Healthcare <br />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 text-transparent bg-clip-text">
              Reimagined
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            A unified platform connecting patients and doctors — from booking
            appointments to managing prescriptions, all in one seamless flow.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="group px-8 py-3.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 font-semibold hover:scale-105 transition"
            >
              Get Started Free
              <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/login"
              className="px-8 py-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 🔥 NEW SECTION — CORE CAPABILITIES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-teal-400 mb-2">
              Real-Time Appointments
            </h3>
            <p className="text-slate-400 text-sm">
              Instant booking with live availability and updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-teal-400 mb-2">
              Doctor-Patient Sync
            </h3>
            <p className="text-slate-400 text-sm">
              Seamless communication and medical workflow integration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-teal-400 mb-2">
              Scalable Backend
            </h3>
            <p className="text-slate-400 text-sm">
              Built on Kubernetes & microservices for high availability.
            </p>
          </div>

        </div>
      </section>

      {/* 🔥 NEW SECTION — USER FLOW */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8 text-left">

          <div>
            <CheckCircle className="text-teal-400 mb-3" />
            <h4 className="font-semibold mb-1">1. Register</h4>
            <p className="text-slate-400 text-sm">
              Create your account as a patient or doctor.
            </p>
          </div>

          <div>
            <CheckCircle className="text-teal-400 mb-3" />
            <h4 className="font-semibold mb-1">2. Book Appointment</h4>
            <p className="text-slate-400 text-sm">
              Choose a doctor and schedule instantly.
            </p>
          </div>

          <div>
            <CheckCircle className="text-teal-400 mb-3" />
            <h4 className="font-semibold mb-1">3. Get Prescription</h4>
            <p className="text-slate-400 text-sm">
              Doctors issue prescriptions digitally.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <p className="text-sm uppercase text-teal-400">Features</p>
          <h2 className="text-3xl font-bold mt-3">Everything You Need</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition"
            >
              <div className={`mb-5 h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${f.color}`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="text-slate-400 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-32">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-12 rounded-3xl text-center">
          <Users className="mx-auto w-12 h-12 mb-4" />

          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Healthcare?
          </h2>

          <p className="text-teal-100 mb-8">
            Join CareNest and experience smarter healthcare management.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-3.5 rounded-full font-semibold hover:scale-105 transition"
          >
            Create Your Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 text-center py-8 text-sm text-slate-500">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-teal-500" />
          <span className="text-slate-400 font-semibold">CareNest</span>
        </div>

        <p>© {new Date().getFullYear()} CareNest.</p>
      </footer>
    </div>
  );
}
