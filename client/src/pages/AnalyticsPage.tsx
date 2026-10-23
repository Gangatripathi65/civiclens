import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const toCsv = (rows: any[]) => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(','));
  return [headers.join(','), ...body].join('\n');
};

export const AnalyticsPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data
  });

  if (isLoading) return <p>Loading analytics...</p>;
  if (isError) return <p>Unable to fetch analytics.</p>;

  const handleExport = () => {
    const csv = toCsv(data.volume ?? []);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'civiclens-analytics-volume.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="text-sm text-slate-600">CSV export excludes personal user contact details.</p>
      <button className="rounded bg-navy px-3 py-2 text-white" onClick={handleExport}>
        Export CSV
      </button>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {(data.volume ?? []).map((row: any) => (
          <li key={row._id}>
            {row._id}: {row.count}
          </li>
        ))}
      </ul>
      {(data.volume ?? []).length === 0 && <p className="text-sm text-slate-500">No analytics data for the selected filters.</p>}
    </div>
  );
};
