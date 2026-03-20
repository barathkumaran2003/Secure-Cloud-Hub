# Workspace

## Overview

AutoBuilder AI — A production-grade SaaS web platform that allows users to upload frontend and backend projects and automatically generate EXE (Windows executable) and APK (Android) files. Premium dark-themed UI inspired by Vercel, Stripe, and Linear.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (routes: health, projects, builds)
│   └── autobuilder-ai/     # React + Vite frontend SaaS app
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # DB seeding script
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
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

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes: `health.ts`, `projects.ts` (projects + builds endpoints).

### `artifacts/autobuilder-ai` (`@workspace/autobuilder-ai`)

React + Vite SaaS frontend. Dark premium UI with:
- `src/pages/` — Landing, Dashboard, Projects, ProjectDetails, BuildDetails, Settings
- `src/components/` — GlowingButton, GlassCard, StatusBadge, Layout
- `src/hooks/` — use-projects-api, use-builds-api

### `lib/db` (`@workspace/db`)

Schema: `projects.ts`, `builds.ts`

Run migrations: `pnpm --filter @workspace/db run push`
Seed data: `pnpm --filter @workspace/scripts run seed`

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec with projects and builds endpoints. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json`. Run `pnpm run typecheck` from root.

## Build Simulation

When a build is triggered, the backend simulates a 15-second build process with realistic progress stages and logs. After completion, a download URL is provided.
