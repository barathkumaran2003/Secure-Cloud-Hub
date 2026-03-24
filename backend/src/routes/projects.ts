import { Router, type IRouter } from "express";
import { db, projectsTable, buildsTable } from "../db/index.js";
import {
  CreateProjectBody,
  GetProjectParams,
  DeleteProjectParams,
  ListBuildsParams,
  TriggerBuildBody,
  TriggerBuildParams,
  GetBuildParams,
} from "../validation/index.js";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/projects", async (_req, res) => {
  const projects = await db
    .select()
    .from(projectsTable)
    .orderBy(desc(projectsTable.createdAt));

  const result = projects.map((p) => ({
    id: String(p.id),
    name: p.name,
    description: p.description ?? undefined,
    type: p.type as "frontend" | "backend" | "fullstack",
    status: p.status as "active" | "archived",
    buildsCount: p.buildsCount,
    lastBuildStatus: p.lastBuildStatus as
      | "pending"
      | "building"
      | "success"
      | "failed"
      | null
      | undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  res.json(result);
});

router.post("/projects", async (req, res) => {
  const body = CreateProjectBody.parse(req.body);

  const [project] = await db
    .insert(projectsTable)
    .values({
      name: body.name,
      description: body.description,
      type: body.type,
      status: "active",
    })
    .returning();

  res.status(201).json({
    id: String(project.id),
    name: project.name,
    description: project.description ?? undefined,
    type: project.type as "frontend" | "backend" | "fullstack",
    status: project.status as "active" | "archived",
    buildsCount: project.buildsCount,
    lastBuildStatus: null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  });
});

router.get("/projects/:id", async (req, res) => {
  const { id } = GetProjectParams.parse(req.params);

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, Number(id)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({
    id: String(project.id),
    name: project.name,
    description: project.description ?? undefined,
    type: project.type as "frontend" | "backend" | "fullstack",
    status: project.status as "active" | "archived",
    buildsCount: project.buildsCount,
    lastBuildStatus: project.lastBuildStatus as
      | "pending"
      | "building"
      | "success"
      | "failed"
      | null
      | undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  });
});

router.delete("/projects/:id", async (req, res) => {
  const { id } = DeleteProjectParams.parse(req.params);

  await db.delete(projectsTable).where(eq(projectsTable.id, Number(id)));

  res.status(204).send();
});

router.get("/projects/:id/builds", async (req, res) => {
  const { id } = ListBuildsParams.parse(req.params);

  const builds = await db
    .select()
    .from(buildsTable)
    .where(eq(buildsTable.projectId, Number(id)))
    .orderBy(desc(buildsTable.createdAt));

  const result = builds.map((b) => ({
    id: String(b.id),
    projectId: String(b.projectId),
    status: b.status as "pending" | "building" | "success" | "failed",
    targetPlatform: b.targetPlatform as "exe" | "apk" | "both",
    progress: b.progress,
    logs: b.logs ?? null,
    downloadUrl: b.downloadUrl ?? null,
    fileSize: b.fileSize ?? null,
    duration: b.duration ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  res.json(result);
});

router.post("/projects/:id/builds", async (req, res) => {
  const { id } = TriggerBuildParams.parse(req.params);
  const body = TriggerBuildBody.parse(req.body);

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, Number(id)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [build] = await db
    .insert(buildsTable)
    .values({
      projectId: project.id,
      status: "pending",
      targetPlatform: body.targetPlatform,
      progress: 0,
    })
    .returning();

  await db
    .update(projectsTable)
    .set({
      buildsCount: project.buildsCount + 1,
      lastBuildStatus: "pending",
      updatedAt: new Date(),
    })
    .where(eq(projectsTable.id, project.id));

  simulateBuild(build.id, project.id, body.targetPlatform);

  res.status(202).json({
    id: String(build.id),
    projectId: String(build.projectId),
    status: build.status as "pending" | "building" | "success" | "failed",
    targetPlatform: build.targetPlatform as "exe" | "apk" | "both",
    progress: build.progress,
    logs: build.logs ?? null,
    downloadUrl: build.downloadUrl ?? null,
    fileSize: build.fileSize ?? null,
    duration: build.duration ?? null,
    createdAt: build.createdAt.toISOString(),
    updatedAt: build.updatedAt.toISOString(),
  });
});

const buildSteps = [
  { delay: 500, progress: 5, log: "[0:00] Initializing build environment..." },
  { delay: 1500, progress: 15, log: "[0:01] Installing dependencies..." },
  { delay: 3000, progress: 30, log: "[0:03] Compiling source files..." },
  { delay: 4500, progress: 45, log: "[0:04] Running type checks..." },
  { delay: 6000, progress: 60, log: "[0:06] Bundling assets..." },
  { delay: 8000, progress: 70, log: "[0:08] Optimizing output..." },
  { delay: 10000, progress: 80, log: "[0:10] Packaging executable..." },
  { delay: 12000, progress: 90, log: "[0:12] Running post-build checks..." },
  { delay: 14000, progress: 95, log: "[0:14] Finalizing build..." },
  { delay: 15000, progress: 100, log: "[0:15] Build completed successfully!" },
];

function simulateBuild(buildId: number, projectId: number, platform: string) {
  const downloadUrls =
    platform === "exe"
      ? "https://example.com/downloads/app.exe"
      : platform === "apk"
        ? "https://example.com/downloads/app.apk"
        : "https://example.com/downloads/app.exe,https://example.com/downloads/app.apk";

  for (const step of buildSteps) {
    const isComplete = step.progress === 100;

    setTimeout(async () => {
      const [current] = await db
        .select()
        .from(buildsTable)
        .where(eq(buildsTable.id, buildId));

      if (!current) return;

      await db
        .update(buildsTable)
        .set({
          progress: step.progress,
          logs: (current.logs ?? "") + "\n" + step.log,
          status: isComplete ? "success" : "building",
          downloadUrl: isComplete ? downloadUrls : null,
          fileSize: isComplete
            ? `${Math.floor(Math.random() * 50 + 10)}MB`
            : null,
          duration: isComplete ? 15 : null,
          updatedAt: new Date(),
        })
        .where(eq(buildsTable.id, buildId));

      if (isComplete) {
        await db
          .update(projectsTable)
          .set({ lastBuildStatus: "success", updatedAt: new Date() })
          .where(eq(projectsTable.id, projectId));
      }
    }, step.delay);
  }
}

router.get("/builds/:id", async (req, res) => {
  const { id } = GetBuildParams.parse(req.params);

  const [build] = await db
    .select()
    .from(buildsTable)
    .where(eq(buildsTable.id, Number(id)));

  if (!build) {
    res.status(404).json({ error: "Build not found" });
    return;
  }

  res.json({
    id: String(build.id),
    projectId: String(build.projectId),
    status: build.status as "pending" | "building" | "success" | "failed",
    targetPlatform: build.targetPlatform as "exe" | "apk" | "both",
    progress: build.progress,
    logs: build.logs ?? null,
    downloadUrl: build.downloadUrl ?? null,
    fileSize: build.fileSize ?? null,
    duration: build.duration ?? null,
    createdAt: build.createdAt.toISOString(),
    updatedAt: build.updatedAt.toISOString(),
  });
});

export default router;
