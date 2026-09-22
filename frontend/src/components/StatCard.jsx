export default function StatCard({ label, value, accent = 'honey' }) {
  const accentClasses = {
    honey: 'text-honey-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-700',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 shadow-sm p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accentClasses[accent] || accentClasses.honey}`}>{value}</p>
    </div>
  );
}
