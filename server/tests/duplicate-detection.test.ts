import { afterEach, describe, expect, it, vi } from 'vitest';
import { Complaint } from '../src/models/Complaint.js';
import { detectDuplicates } from '../src/services/aiService.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('duplicate detection fallback', () => {
  it('returns ranked explanation for similar complaints', async () => {
    vi.spyOn(Complaint, 'find').mockReturnValue({
      limit: () => ({
        lean: async () => [
          {
            _id: { toString: () => 'abc123' },
            publicId: 'CL-123',
            title: 'Pothole near bus stop',
            description: 'Large road pothole near bus stop causing traffic delays.'
          }
        ]
      })
    } as any);

    const matches = await detectDuplicates('new-1', 'Pothole near stop', 'Road pothole at bus stop', 'roads', [78.48, 17.39]);
    expect(matches).toHaveLength(1);
    expect(matches[0].publicId).toBe('CL-123');
    expect(matches[0].explanation).toContain('Text similarity');
  });
});
