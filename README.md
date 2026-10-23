# CivicLens

CivicLens is a TypeScript civic-tech platform that helps citizens and civic authorities report, track, analyze, and resolve urban infrastructure issues (roads, sanitation, streetlights, drainage, water supply, and public safety).

> **Demo data notice:** Seeded records are clearly marked as demonstration data and are not real verified citizen reports.

## Monorepo structure

- `/client` – React + Vite + Tailwind + React Router + TanStack Query + Recharts + React Leaflet
- `/server` – Express + TypeScript + Zod + Mongoose + JWT cookie auth + security middleware
- `/shared` – shared domain enums/types
- `/.env.example` – required environment variables

## Features

- Public landing page with headline: **“Smarter Cities Start with Better Reporting.”**
- Citizen registration/login/logout and secure session cookies
- Role-based authorization (citizen/admin) fully enforced in backend
- Complaint reporting with validation, geolocation coordinates, category/severity, notes, and optional images
- Complaint tracking with public complaint ID, timeline/history, priority explanation, and status workflow
- Workflow statuses: Reported → Under Review → Assigned → In Progress → Resolved (+ Rejected/Reopened paths)
- Civic map (Leaflet + OpenStreetMap) powered by DB coordinates with accessible list alternative
- Admin dashboard/analytics from real DB aggregations (no hardcoded totals)
- In-app notifications with read/unread state
- Audit logs for sensitive admin actions
- Provider-independent AI service layer with deterministic fallback labels:
  - issue classification
  - summarization
  - priority scoring (recommendation explanation)
  - duplicate detection (text/category/recency/geo)
  - hotspot insights
- Upload storage abstraction endpoint (`/api/uploads`) with fallback provider label

## Security and reliability

- Password hashing via bcrypt
- JWT in HttpOnly cookies
- Helmet, CORS allowlist, rate limiting, request body limits
- Upload MIME/size validation
- Zod validation and centralized error handling
- Safe production error responses

## Demo accounts (seed)

After seeding:

- Citizen: `citizen@civiclens.demo` / `ChangeMe123!`
- Admin: `admin@civiclens.demo` / `ChangeMe123!`

> Change these credentials immediately for production deployments.

## Local setup (Windows-friendly)

1. Install Node.js 20+ and MongoDB (or use MongoDB Atlas).
2. Copy `.env.example` to `.env` and fill values.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed demo data:
   ```bash
   npm run seed
   ```
5. Run backend:
   ```bash
   npm run dev:server
   ```
6. In another terminal run frontend:
   ```bash
   npm run dev:client
   ```

Client: `http://localhost:5173`  
Server health: `http://localhost:4000/api/health`

## Build and test commands

- Type checks: `npm run typecheck`
- Backend tests: `npm test`
- Production builds: `npm run build`

## Key API endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Complaints
- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/map`
- `GET /api/complaints/:id`
- `PATCH /api/complaints/:id/status` (admin)
- `PATCH /api/complaints/:id/assign` (admin)
- `GET /api/complaints/:id/suggestions`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/complaints`
- `GET /api/admin/analytics`
- `GET /api/admin/activity`

### Uploads + health
- `POST /api/uploads`
- `GET /api/health`

## Deployment notes

- `render.yaml` and `railway.json` are included as starter deployment configs.
- For Vercel frontend deployment, set `VITE_API_BASE_URL` to your API URL.
- Configure MongoDB Atlas network rules and CORS `CLIENT_URL` allowlist.

## Known limitations / future improvements

- Map clustering and advanced geocoding search can be extended.
- Current upload provider is fallback memory reference; configure cloud storage for production persistence.
- Email notification hook is present but disabled without provider credentials.
- AI fallback is deterministic when no external AI provider key is configured.
