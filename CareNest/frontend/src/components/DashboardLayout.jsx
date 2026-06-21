import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
