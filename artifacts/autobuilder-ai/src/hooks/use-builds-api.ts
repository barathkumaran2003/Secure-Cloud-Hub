import { useQueryClient } from "@tanstack/react-query";
import {
  useListBuilds,
  useTriggerBuild,
  useGetBuild,
  getListBuildsQueryKey,
  getGetProjectQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function useProjectBuilds(projectId: string) {
  return useListBuilds(projectId);
}

export function useBuildWithPolling(buildId: string) {
  return useGetBuild(buildId, {
    query: {
      // Poll every 2 seconds if the build is still running
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === 'pending' || status === 'building') {
          return 2000;
        }
        return false;
      },
    }
  });
}

export function useTriggerBuildMutation(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useTriggerBuild({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBuildsQueryKey(projectId) });
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        toast({
          title: "Build triggered",
          description: "Your compilation process has started.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Failed to trigger build",
          description: error?.message || "An unexpected error occurred",
          variant: "destructive",
        });
      },
    }
  });
}
