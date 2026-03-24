import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  buildsCount: integer("builds_count").notNull().default(0),
  lastBuildStatus: text("last_build_status"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Project = typeof projectsTable.$inferSelect;
