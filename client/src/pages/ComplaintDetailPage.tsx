import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => (await api.get(`/complaints/${id}`)).data,
    enabled: Boolean(id)
  });

  if (isLoading) return <p>Loading complaint...</p>;
  if (isError || !data) return <p>Unable to fetch complaint details.</p>;

  const { complaint, history } = data;

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">{complaint.title}</h1>
      <p className="text-sm text-slate-600">
        ID {complaint.publicId} · {complaint.category} · {complaint.severity}
      </p>
      <p>{complaint.description}</p>
      <p className="text-sm">Status: {complaint.status}</p>
      <p className="text-sm">Priority: {complaint.priorityScore} ({complaint.priorityExplanation})</p>
      <p className="text-sm">Locality: {complaint.locality || 'Not specified'}</p>
      <div>
        <h2 className="font-semibold">Timeline</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {history.map((event: any) => (
            <li key={event._id}>
              {event.previousStatus} → {event.newStatus} ({new Date(event.createdAt).toLocaleString()})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
