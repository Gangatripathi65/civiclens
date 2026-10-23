import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { connectTestDb, clearTestDb, disconnectTestDb } from './testUtils.js';
import { User } from '../src/models/User.js';
import { Complaint } from '../src/models/Complaint.js';
import { getAdminStats } from '../src/services/analyticsService.js';

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearTestDb);

describe('analytics calculations', () => {
  it('calculates dashboard aggregates from records', async () => {
    const citizen = await User.create({ name: 'Citizen', email: 'analytics@example.com', password: 'Password123!', role: 'citizen' });

    await Complaint.create([
      {
        publicId: 'CL-1',
        creator: citizen._id,
        title: 'Pothole',
        description: 'Road issue',
        category: 'roads',
        imageRefs: [],
        location: { type: 'Point', coordinates: [78.4, 17.4] },
        severity: 'high',
        priorityScore: 80,
        priorityExplanation: 'high',
        status: 'Reported'
      },
      {
        publicId: 'CL-2',
        creator: citizen._id,
        title: 'Garbage',
        description: 'Sanitation issue',
        category: 'sanitation',
        imageRefs: [],
        location: { type: 'Point', coordinates: [78.5, 17.3] },
        severity: 'medium',
        priorityScore: 50,
        priorityExplanation: 'medium',
        status: 'Resolved'
      }
    ]);

    const stats = await getAdminStats();
    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.highPriority).toBe(1);
    expect(stats.resolved).toBe(1);
  });
});
