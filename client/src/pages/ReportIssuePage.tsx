import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintCategories, severityLevels } from '@civiclens/shared';
import { api } from '../lib/api';
import { useState } from 'react';

const schema = z.object({
  title: z.string().min(4),
  description: z.string().min(10),
  category: z.enum(complaintCategories).optional(),
  severity: z.enum(severityLevels),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  locality: z.string().optional(),
  additionalNotes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export const ReportIssuePage = () => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'medium', latitude: 17.385, longitude: 78.4867 }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await api.post('/complaints', values);
      setError(null);
      setResult(`Submitted complaint ${res.data.complaint.publicId}. AI source: ${res.data.ai.classificationSource}`);
    } catch {
      setError('Unable to submit complaint. Please check form inputs and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Report New Issue</h1>
      {result && <p className="rounded bg-emerald-50 p-2 text-sm text-emerald-700">{result}</p>}
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <input className="w-full rounded border p-2" placeholder="Title" {...register('title')} />
      {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      <textarea className="w-full rounded border p-2" placeholder="Description" rows={4} {...register('description')} />
      <div className="grid gap-4 md:grid-cols-2">
        <select className="rounded border p-2" {...register('category')}>
          <option value="">Use AI suggestion</option>
          {complaintCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select className="rounded border p-2" {...register('severity')}>
          {severityLevels.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="rounded border p-2" type="number" step="any" placeholder="Latitude" {...register('latitude', { valueAsNumber: true })} />
        <input className="rounded border p-2" type="number" step="any" placeholder="Longitude" {...register('longitude', { valueAsNumber: true })} />
      </div>
      <input className="w-full rounded border p-2" placeholder="Address" {...register('address')} />
      <input className="w-full rounded border p-2" placeholder="Locality" {...register('locality')} />
      <textarea className="w-full rounded border p-2" placeholder="Additional notes" rows={2} {...register('additionalNotes')} />
      <button className="rounded bg-navy px-4 py-2 text-white" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit complaint'}
      </button>
      <p className="text-xs text-slate-500">Geolocation is optional and should only be used after user permission in production clients.</p>
    </form>
  );
};
