import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export const CitizenDashboardPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['citizen-complaints'],
    queryFn: async () => (await api.get('/complaints')).data
  });

  if (isLoading) return <p>Loading dashboard...</p>;
  if (isError) return <p>Unable to load dashboard.</p>;

  const items = data.items as any[];
  const distribution = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Citizen Dashboard</h1>
        <Link className="rounded bg-navy px-3 py-2 text-white" to="/dashboard/report">
          Report New Issue
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded bg-white p-4">Total complaints: {items.length}</div>
        {Object.entries(distribution).map(([status, count]) => (
          <div key={status} className="rounded bg-white p-4">
            {status}: {count}
          </div>
        ))}
      </div>
      <div className="rounded bg-white p-4">
        <h2 className="font-semibold">Recent complaints</h2>
        <div className="mt-3 space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No complaints yet.</p>
          ) : (
            items.map((item) => (
              <Link key={item._id} to={`/complaints/${item._id}`} className="block rounded border p-3 hover:bg-slate-50">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-600">
                  {item.publicId} · {item.status} · {item.category}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
