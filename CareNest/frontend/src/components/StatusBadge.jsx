const variants = {
  pending:   'bg-amber-100 text-amber-700 ring-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 ring-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
  cancelled: 'bg-red-100 text-red-700 ring-red-300',
  dispensed: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset capitalize ${
        variants[status] || 'bg-gray-100 text-gray-700 ring-gray-300'
      }`}
    >
      {status}
    </span>
  );
}
