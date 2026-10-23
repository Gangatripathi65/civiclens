import { describe, expect, it, vi, afterEach } from 'vitest';
import { Complaint } from '../src/models/Complaint.js';
import { getAdminStats } from '../src/services/analyticsService.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('analytics calculations', () => {
  it('builds admin stats from complaint model data', async () => {
    vi.spyOn(Complaint, 'countDocuments')
      .mockResolvedValueOnce(20 as any)
      .mockResolvedValueOnce(7 as any)
      .mockResolvedValueOnce(4 as any)
      .mockResolvedValueOnce(9 as any);
    vi.spyOn(Complaint, 'aggregate')
      .mockResolvedValueOnce([{ _id: null, avgHours: 32.4 }] as any)
      .mockResolvedValueOnce([{ _id: 'roads', count: 6 }] as any)
      .mockResolvedValueOnce([{ _id: 'Central', count: 5 }] as any);

    const result = await getAdminStats();
    expect(result.total).toBe(20);
    expect(result.pending).toBe(7);
    expect(result.highPriority).toBe(4);
    expect(result.resolved).toBe(9);
    expect(result.averageResolutionHours).toBe(32.4);
    expect(result.byCategory[0]._id).toBe('roads');
  });
});
