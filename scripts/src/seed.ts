import { db, projectsTable, buildsTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  const projects = await db
    .insert(projectsTable)
    .values([
      {
        name: "React Native E-Commerce App",
        description: "A full-featured e-commerce mobile app built with React Native",
        type: "fullstack",
        status: "active",
        buildsCount: 5,
        lastBuildStatus: "success",
      },
      {
        name: "Express REST API",
        description: "RESTful API server with authentication and database integration",
        type: "backend",
        status: "active",
        buildsCount: 12,
        lastBuildStatus: "success",
      },
      {
        name: "Next.js Portfolio",
        description: "Personal portfolio website with blog and project showcase",
        type: "frontend",
        status: "active",
        buildsCount: 3,
        lastBuildStatus: "failed",
      },
      {
        name: "Python Desktop Tool",
        description: "A utility tool for file management and batch processing",
        type: "backend",
        status: "archived",
        buildsCount: 8,
        lastBuildStatus: "success",
      },
    ])
    .returning();

  console.log(`Created ${projects.length} projects`);

  const builds = await db
    .insert(buildsTable)
    .values([
      {
        projectId: projects[0].id,
        status: "success",
        targetPlatform: "apk",
        progress: 100,
        logs: "Initializing build...\nCompiling...\nBundling assets...\nPackaging APK...\nBuild complete!",
        downloadUrl: "https://cdn.autobuilder.ai/builds/1/app.apk",
        fileSize: "24MB",
        duration: 45,
      },
      {
        projectId: projects[0].id,
        status: "success",
        targetPlatform: "both",
        progress: 100,
        logs: "Initializing build...\nCompiling...\nBundling assets...\nPackaging...\nBuild complete!",
        downloadUrl: "https://cdn.autobuilder.ai/builds/2/app.apk, https://cdn.autobuilder.ai/builds/2/app.exe",
        fileSize: "48MB",
        duration: 67,
      },
      {
        projectId: projects[1].id,
        status: "success",
        targetPlatform: "exe",
        progress: 100,
        logs: "Setting up environment...\nCompiling TypeScript...\nBundling...\nPackaging EXE...\nBuild complete!",
        downloadUrl: "https://cdn.autobuilder.ai/builds/3/server.exe",
        fileSize: "18MB",
        duration: 32,
      },
      {
        projectId: projects[2].id,
        status: "failed",
        targetPlatform: "exe",
        progress: 45,
        logs: "Setting up environment...\nCompiling...\nError: Missing dependency 'sharp'\nBuild failed!",
        downloadUrl: null,
        fileSize: null,
        duration: null,
      },
    ])
    .returning();

  console.log(`Created ${builds.length} builds`);
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
