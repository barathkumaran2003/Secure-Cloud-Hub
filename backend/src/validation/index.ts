import { z } from "zod";

export const HealthCheckResponse = z.object({
  status: z.string(),
});

export const CreateProjectBody = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(["frontend", "backend", "fullstack"]),
});

export const GetProjectParams = z.object({
  id: z.coerce.string(),
});

export const DeleteProjectParams = z.object({
  id: z.coerce.string(),
});

export const ListBuildsParams = z.object({
  id: z.coerce.string(),
});

export const TriggerBuildParams = z.object({
  id: z.coerce.string(),
});

export const TriggerBuildBody = z.object({
  targetPlatform: z.enum(["exe", "apk", "both"]),
});

export const GetBuildParams = z.object({
  id: z.coerce.string(),
});
