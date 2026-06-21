export default function StatsCard({ icon: Icon, label, value, color = 'teal', delay = '0' }) {
  const colors = {
    teal:   'from-teal-500 to-teal-600   shadow-teal-200',
    blue:   'from-blue-500 to-blue-600   shadow-blue-200',
    amber:  'from-amber-500 to-amber-600 shadow-amber-200',
    emerald:'from-emerald-500 to-emerald-600 shadow-emerald-200',
    rose:   'from-rose-500 to-rose-600   shadow-rose-200',
  };

  return (
    <div
      className={`animate-fade-in-up delay-${delay} group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>
      {/* Decorative bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${colors[color]} opacity-60 group-hover:opacity-100 transition-opacity`}
      />
    </div>
  );
}
