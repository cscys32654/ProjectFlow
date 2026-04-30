import { useEffect, useState } from 'react';
import { dashboardAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Tasks',     value: stats?.total,      color: 'text-gray-800' },
    { label: 'Completed',       value: stats?.completed,  color: 'text-green-600' },
    { label: 'In Progress',     value: stats?.inProgress, color: 'text-blue-600' },
    { label: 'Pending',         value: stats?.pending,    color: 'text-yellow-600' },
    { label: 'Overdue',         value: stats?.overdue,    color: 'text-red-600' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-medium">{user?.name}</span>
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {/* Overdue warning */}
      {!loading && stats?.overdue > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <p className="text-sm text-red-700">
            You have <strong>{stats.overdue}</strong> overdue task{stats.overdue > 1 ? 's' : ''}.
            Review your projects and update statuses.
          </p>
        </div>
      )}
    </div>
  );
}