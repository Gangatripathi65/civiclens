import dotenv from 'dotenv';
import { connectDb, disconnectDb } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Complaint } from '../models/Complaint.js';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory.js';
import { scorePriority } from '../services/aiService.js';
import { toPublicComplaintId } from '../utils/workflow.js';

dotenv.config();

const run = async () => {
  await connectDb();

  await Promise.all([User.deleteMany({}), Department.deleteMany({}), Complaint.deleteMany({}), ComplaintStatusHistory.deleteMany({})]);

  const [citizen, admin] = await User.create([
    { name: 'Demo Citizen', email: 'citizen@civiclens.demo', password: 'ChangeMe123!', role: 'citizen', locality: 'Central Ward' },
    { name: 'Demo Admin', email: 'admin@civiclens.demo', password: 'ChangeMe123!', role: 'admin', locality: 'HQ' }
  ]);

  const [roads, sanitation, utilities] = await Department.create([
    { name: 'Road Works Department', code: 'RWD' },
    { name: 'Sanitation Department', code: 'SAN' },
    { name: 'Public Utilities', code: 'PUT' }
  ]);

  const records = [
    {
      title: 'Pothole near market intersection',
      description: 'Large pothole causing bike skids during rain.',
      category: 'roads',
      severity: 'high',
      status: 'In Progress',
      locality: 'Central Ward',
      location: [78.4867, 17.385],
      department: roads._id
    },
    {
      title: 'Uncollected garbage for three days',
      description: 'Overflowing bins attracting stray animals.',
      category: 'sanitation',
      severity: 'medium',
      status: 'Under Review',
      locality: 'Lake Colony',
      location: [78.4781, 17.4003],
      department: sanitation._id
    },
    {
      title: 'Streetlight not working on 4th main road',
      description: 'Area remains dark after sunset impacting safety.',
      category: 'streetlights',
      severity: 'critical',
      status: 'Reported',
      locality: 'North Block',
      location: [78.4712, 17.4122],
      department: utilities._id
    }
  ] as const;

  for (const entry of records) {
    const priority = scorePriority(entry.severity as any, entry.category);
    const complaint = await Complaint.create({
      publicId: toPublicComplaintId(),
      creator: citizen._id,
      title: entry.title,
      description: entry.description,
      aiSummary: `${entry.title}. ${entry.description}`,
      category: entry.category,
      categoryConfidence: 0.85,
      imageRefs: [],
      location: { type: 'Point', coordinates: entry.location as [number, number] },
      locality: entry.locality,
      severity: entry.severity,
      priorityScore: priority.score,
      priorityExplanation: `${priority.explanation} (${priority.source})`,
      status: entry.status,
      assignedDepartment: entry.department,
      isDemoData: true
    });

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      previousStatus: 'Reported',
      newStatus: entry.status,
      changedBy: admin._id,
      publicNote: 'Demonstration seeded record.'
    });
  }

  console.log('Seed completed with demonstration data and demo accounts.');
  await disconnectDb();
};

run().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});
