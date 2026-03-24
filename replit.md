# Workspace

## Overview

AutoBuilder AI — A production-grade SaaS web platform that allows users to upload frontend and backend projects and automatically generate EXE (Windows executable) and APK (Android) files. Premium dark-themed UI inspired by Vercel, Stripe, and Linear.

## Stack

- **Frontend**: React 19 + Vite 6, Tailwind CSS 4, Framer Motion, Lucide React, Recharts — standalone npm project
- **Backend**: Node.js 24 + Express 5 — standalone npm project
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Package manager**: npm (both frontend and backend are independent)

## Structure

```text
project/
├── frontend/                # Standalone React + Vite frontend (npm)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/      # GlowingButton, GlassCard, StatusBadge, Layout + shadcn/ui
│       ├── pages/           # Landing, Dashboard, Projects, ProjectDetails, BuildDetails, Settings
│       ├── hooks/           # use-projects-api, use-builds-api, use-toast, use-mobile
│       └── lib/
│           ├── utils.ts
│           └── api-client/  # Inlined API client (React Query hooks + TypeScript types)
│               ├── index.ts
│               ├── custom-fetch.ts
│               └── generated/
│                   ├── api.ts        # React Query hooks for all endpoints
│                   └── api.schemas.ts # TypeScript types
├── backend/                 # Standalone Express API server (npm)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts         # Entry point (PORT defaults to 5000)
│       ├── app.ts           # Express app setup
│       ├── lib/logger.ts
│       ├── routes/          # health.ts, projects.ts, index.ts
│       ├── db/              # Drizzle ORM (inlined)
│       │   ├── index.ts
│       │   └── schema/      # projects.ts, builds.ts
│       └── validation/      # Zod schemas (index.ts)
├── artifacts/               # Original pnpm monorepo artifacts (preserved)
├── lib/                     # Original pnpm monorepo shared libraries (preserved)
└── scripts/                 # DB seeding scripts
```

## Running the App

### Backend
```bash
cd backend
npm install
npm start          # runs on PORT 5000 by default
# or for dev with watch:
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # runs on PORT 5173 by default, proxies /api to backend
npm run build      # production build
```

### Environment Variables

**Backend** (`.env` in `backend/`):
```
DATABASE_URL=postgresql://...
PORT=5000          # optional, defaults to 5000
```

**Frontend**:
```
PORT=5173          # optional, defaults to 5173
BACKEND_PORT=5000  # optional, used for /api proxy in dev
```

## Features

- **Landing page**: Hero with animated visuals, features, pricing (3 tiers), testimonials
- **Dashboard** (`/app`): Stats (projects, builds, success rate, storage), build activity chart, recent projects
- **Projects** (`/app/projects`): Project cards with type/status badges, create new project
- **Project Details** (`/app/projects/:id`): Project info, build history table, trigger build (EXE/APK/Both)
- **Build Details** (`/app/builds/:id`): Progress bar, logs, download button
- **Settings** (`/app/settings`): Profile, API keys, plan, notifications

## API Endpoints

- `GET /api/healthz` — Health check
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project
- `DELETE /api/projects/:id` — Delete project
- `GET /api/projects/:id/builds` — List builds
- `POST /api/projects/:id/builds` — Trigger build (body: `{targetPlatform: "exe"|"apk"|"both"}`)
- `GET /api/builds/:id` — Get build details

## Database Schema

- `projects` — id, name, description, type, status, builds_count, last_build_status, timestamps
- `builds` — id, project_id, status, target_platform, progress, logs, download_url, file_size, duration, timestamps

## Build Simulation

When a build is triggered, the backend simulates a 15-second build process with realistic progress stages and logs. After completion, a download URL is provided.

## Notes

- The original pnpm monorepo (`artifacts/`, `lib/`) is preserved for reference.
- The frontend dev server proxies `/api/*` requests to the backend automatically.
- No Replit-specific plugins (cartographer, runtime-error-modal) in the standalone version.
