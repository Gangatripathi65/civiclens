import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export const AdminDashboardPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data
  });

  if (isLoading) return <p>Loading admin dashboard...</p>;
  if (isError) return <p>Unable to load admin insights.</p>;

  const categoryData = (data.stats.byCategory ?? []).map((row: any) => ({ name: row._id, count: row.count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Link to="/admin/analytics" className="rounded border px-3 py-2">
          Analytics
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded bg-white p-4">Total: {data.stats.total}</div>
        <div className="rounded bg-white p-4">Pending: {data.stats.pending}</div>
        <div className="rounded bg-white p-4">High Priority: {data.stats.highPriority}</div>
        <div className="rounded bg-white p-4">Resolved: {data.stats.resolved}</div>
      </div>
      <div className="rounded bg-white p-4">
        <h2 className="font-semibold">Category distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="count" fill="#1e2a44" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded bg-white p-4">
        <h2 className="font-semibold">Hotspots</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {data.hotspots.map((hotspot: any) => (
            <li key={hotspot.locality}>
              {hotspot.locality}: {hotspot.unresolvedComplaints} unresolved ({hotspot.insight})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
