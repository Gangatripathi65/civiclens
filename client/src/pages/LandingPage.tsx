import { Link } from 'react-router-dom';
import { BarChart3, ClipboardCheck, MapPin, ShieldCheck } from 'lucide-react';

const featureCards = [
  { icon: MapPin, title: 'Geo-tagged Reporting', body: 'Report infrastructure issues with map coordinates and evidence.' },
  { icon: ClipboardCheck, title: 'Transparent Workflow', body: 'Track status updates from report to resolution.' },
  { icon: BarChart3, title: 'Civic Analytics', body: 'Data-backed insights for local authorities.' },
  { icon: ShieldCheck, title: 'Secure by Design', body: 'Role-based access, audit trails, and moderation controls.' }
];

export const LandingPage = () => (
  <div className="space-y-16 py-8">
    <section className="rounded-2xl bg-white p-10 shadow-sm">
      <p className="text-sm uppercase text-accent">Civic-tech platform</p>
      <h1 className="mt-2 text-4xl font-bold text-navy">Smarter Cities Start with Better Reporting.</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        CivicLens connects citizens and authorities to report, verify, and resolve urban issues with accountable workflows and data-backed planning.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/dashboard/report" className="rounded bg-navy px-4 py-2 text-white">
          Report New Issue
        </Link>
        <Link to="/map" className="rounded border px-4 py-2">
          Explore Civic Map
        </Link>
      </div>
      <p className="mt-4 text-xs text-slate-500">Demo records are clearly marked as demonstration data for product preview only.</p>
    </section>

    <section className="grid gap-4 md:grid-cols-2">
      {featureCards.map(({ icon: Icon, title, body }) => (
        <div key={title} className="rounded-xl bg-white p-5 shadow-sm">
          <Icon className="text-accent" />
          <h2 className="mt-3 text-lg font-semibold">{title}</h2>
          <p className="text-sm text-slate-600">{body}</p>
        </div>
      ))}
    </section>

    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-navy">How it works</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700">
        <li>Citizens submit geotagged reports with details and optional photos.</li>
        <li>Authorities review, classify, and assign responsible departments.</li>
        <li>Status changes and resolution evidence are tracked transparently.</li>
      </ol>
    </section>
  </div>
);
