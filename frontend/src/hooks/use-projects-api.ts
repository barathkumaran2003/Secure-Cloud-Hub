import { useQueryClient } from "@tanstack/react-query";
import {
  useListProjects,
  useCreateProject,
  useGetProject,
  useDeleteProject,
  getListProjectsQueryKey,
  getGetProjectQueryKey
} from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export function useProjectsWithCache() {
  return useListProjects();
}

export function useProjectWithCache(id: string) {
  return useGetProject(id);
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        toast({
          title: "Project created",
          description: "Your new project has been initialized.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Creation failed",
          description: error?.message || "Failed to create project",
          variant: "destructive",
        });
      },
    }
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useDeleteProject({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        queryClient.removeQueries({ queryKey: getGetProjectQueryKey(variables.id) });
        toast({
          title: "Project deleted",
          description: "The project has been permanently removed.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Deletion failed",
          description: error?.message || "Failed to delete project",
          variant: "destructive",
        });
      },
    }
  });
}
