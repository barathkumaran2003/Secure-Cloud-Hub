import { useState } from "react";
import { Link, useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { GlowingButton } from "@/components/GlowingButton";
import { StatusBadge } from "@/components/StatusBadge";
import { Play, Settings, Trash2, ArrowLeft, Clock, DownloadCloud } from "lucide-react";
import { useProjectWithCache, useDeleteProjectMutation } from "@/hooks/use-projects-api";
import { useProjectBuilds, useTriggerBuildMutation } from "@/hooks/use-builds-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { TriggerBuildRequestTargetPlatform } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetails() {
  const [, params] = useRoute("/app/projects/:id");
  const projectId = params?.id || "";
  
  const { data: project, isLoading: projLoading } = useProjectWithCache(projectId);
  const { data: builds, isLoading: buildsLoading } = useProjectBuilds(projectId);
  const triggerBuild = useTriggerBuildMutation(projectId);
  const deleteProject = useDeleteProjectMutation();
  const { toast } = useToast();
  
  const [isBuildDialogOpen, setIsBuildDialogOpen] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState<TriggerBuildRequestTargetPlatform>("both");

  const handleTriggerBuild = () => {
    triggerBuild.mutate({ id: projectId, data: { targetPlatform } }, {
      onSuccess: () => {
        setIsBuildDialogOpen(false);
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProject.mutate({ id: projectId }, {
        onSuccess: () => {
          window.location.href = "/app/projects";
        }
      });
    }
  };

  if (projLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-white/5 rounded-xl w-1/3" />
          <div className="h-32 bg-white/5 rounded-xl" />
          <div className="h-96 bg-white/5 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-20">Project not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <Link href="/app/projects" className="text-muted-foreground hover:text-white inline-flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-display font-bold">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground text-lg">{project.description || "No description provided."}</p>
          </div>

          <div className="flex items-center gap-3">
            <GlowingButton variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
              <Trash2 className="w-5 h-5" />
            </GlowingButton>
            
            <Dialog open={isBuildDialogOpen} onOpenChange={setIsBuildDialogOpen}>
              <DialogTrigger asChild>
                <GlowingButton>
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Trigger Build
                </GlowingButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">New Build</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label>Target Platform</Label>
                    <Select value={targetPlatform} onValueChange={(val: TriggerBuildRequestTargetPlatform) => setTargetPlatform(val)}>
                      <SelectTrigger className="bg-black/50 border-white/10 focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-foreground">
                        <SelectItem value="exe">Windows Executable (.exe)</SelectItem>
                        <SelectItem value="apk">Android App (.apk)</SelectItem>
                        <SelectItem value="both">Both (.exe + .apk)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <GlowingButton onClick={handleTriggerBuild} isLoading={triggerBuild.isPending}>
                      Start Compilation
                    </GlowingButton>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard className="p-6 col-span-1">
            <h3 className="font-bold mb-6 text-lg border-b border-white/10 pb-4">Project Details</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Project ID</div>
                <div className="font-mono text-sm">{project.id}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Architecture Type</div>
                <div className="capitalize">{project.type}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Created</div>
                <div>{new Date(project.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Builds</div>
                <div>{project.buildsCount}</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-0 col-span-2 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 bg-white/[0.02]">
              <h3 className="font-bold text-lg">Build History</h3>
            </div>
            
            <div className="flex-1 overflow-auto">
              {buildsLoading ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">Loading builds...</div>
              ) : builds?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No builds yet. Trigger one to see it here.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-black/20 uppercase">
                    <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Target</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Triggered</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {builds?.map(build => (
                      <tr key={build.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={build.status} />
                        </td>
                        <td className="px-6 py-4 uppercase font-mono">{build.targetPlatform}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {build.duration ? `${build.duration}s` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDistanceToNow(new Date(build.createdAt), { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/app/builds/${build.id}`}>
                            <button className="text-primary hover:text-white font-medium transition-colors">
                              View Details
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
