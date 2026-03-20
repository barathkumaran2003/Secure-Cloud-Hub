import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectsTable, buildsTable } from "@workspace/db/schema";
import {
  CreateProjectBody,
  GetProjectParams,
  DeleteProjectParams,
  ListBuildsParams,
  TriggerBuildBody,
  TriggerBuildParams,
  GetBuildParams,
} from "@workspace/api-zod";
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
      projectId: Number(id),
      status: "building",
      targetPlatform: body.targetPlatform,
      logs: "Initializing build environment...\nCloning repository...\nInstalling dependencies...",
    })
    .returning();

  await db
    .update(projectsTable)
    .set({
      buildsCount: project.buildsCount + 1,
      lastBuildStatus: "building",
      updatedAt: new Date(),
    })
    .where(eq(projectsTable.id, Number(id)));

  simulateBuildProgress(build.id, Number(id));

  res.status(201).json({
    id: String(build.id),
    projectId: String(build.projectId),
    status: build.status as "pending" | "building" | "success" | "failed",
    targetPlatform: build.targetPlatform as "exe" | "apk" | "both",
    progress: build.progress,
    logs: build.logs ?? null,
    downloadUrl: null,
    fileSize: null,
    duration: null,
    createdAt: build.createdAt.toISOString(),
    updatedAt: build.updatedAt.toISOString(),
  });
});

function simulateBuildProgress(buildId: number, projectId: number) {
  const steps = [
    { progress: 10, log: "Setting up build environment...", delay: 2000 },
    { progress: 25, log: "Compiling source files...", delay: 4000 },
    { progress: 45, log: "Bundling assets...", delay: 6000 },
    { progress: 65, log: "Running optimizations...", delay: 8000 },
    { progress: 80, log: "Packaging application...", delay: 10000 },
    { progress: 95, log: "Finalizing build...", delay: 12000 },
    { progress: 100, log: "Build complete!", delay: 15000 },
  ];

  for (const step of steps) {
    setTimeout(async () => {
      const [current] = await db
        .select()
        .from(buildsTable)
        .where(eq(buildsTable.id, buildId));
      if (!current || current.status === "failed") return;

      const isComplete = step.progress === 100;
      const platforms = current.targetPlatform === "both" ? ["exe", "apk"] : [current.targetPlatform];
      const downloadUrls = platforms.map(p => `https://cdn.autobuilder.ai/builds/${buildId}/output.${p}`).join(", ");

      await db
        .update(buildsTable)
        .set({
          progress: step.progress,
          logs: (current.logs ?? "") + "\n" + step.log,
          status: isComplete ? "success" : "building",
          downloadUrl: isComplete ? downloadUrls : null,
          fileSize: isComplete ? `${Math.floor(Math.random() * 50 + 10)}MB` : null,
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
