import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { connectTestDb, clearTestDb, disconnectTestDb } from './testUtils.js';
import { User } from '../src/models/User.js';
import { Complaint } from '../src/models/Complaint.js';
import { detectDuplicates } from '../src/services/aiService.js';

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearTestDb);

describe('duplicate detection fallback', () => {
  it('returns ranked nearby similar complaints', async () => {
    const citizen = await User.create({ name: 'Citizen', email: 'dup@example.com', password: 'Password123!', role: 'citizen' });
    const existing = await Complaint.create({
      publicId: 'CL-DUP-1',
      creator: citizen._id,
      title: 'Pothole on ring road',
      description: 'Large pothole near bus stop causing traffic.',
      category: 'roads',
      imageRefs: [],
      location: { type: 'Point', coordinates: [78.48, 17.39] },
      severity: 'high',
      priorityScore: 75,
      priorityExplanation: 'high',
      status: 'Reported'
    });

    const matches = await detectDuplicates('000000000000000000000001', 'Pothole near bus stop', 'Ring road pothole', 'roads', [78.4802, 17.3902]);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].complaintId).toBe(existing.id);
  });
});
