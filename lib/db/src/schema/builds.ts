import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const buildsTable = pgTable("builds", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  status: text("status").notNull().default("pending"),
  targetPlatform: text("target_platform").notNull(),
  progress: integer("progress").notNull().default(0),
  logs: text("logs"),
  downloadUrl: text("download_url"),
  fileSize: text("file_size"),
  duration: integer("duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBuildSchema = createInsertSchema(buildsTable).omit({
  id: true,
  progress: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBuild = z.infer<typeof insertBuildSchema>;
export type Build = typeof buildsTable.$inferSelect;
