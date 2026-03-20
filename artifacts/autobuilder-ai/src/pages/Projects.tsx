import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { GlowingButton } from "@/components/GlowingButton";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, FolderKanban, Terminal } from "lucide-react";
import { useProjectsWithCache, useCreateProjectMutation } from "@/hooks/use-projects-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateProjectRequestType } from "@workspace/api-client-react";

export default function Projects() {
  const { data: projects, isLoading } = useProjectsWithCache();
  const createProject = useCreateProjectMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "frontend" as CreateProjectRequestType
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({ data: formData }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({ name: "", description: "", type: "frontend" });
      }
    });
  };

  const filteredProjects = projects?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage and build your applications.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <GlowingButton>
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </GlowingButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-foreground shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">Create Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input 
                    id="name" 
                    required 
                    placeholder="e.g. NextJS E-commerce"
                    className="bg-black/50 border-white/10 focus-visible:ring-primary"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    placeholder="Short description..."
                    className="bg-black/50 border-white/10 focus-visible:ring-primary"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select value={formData.type} onValueChange={(val: CreateProjectRequestType) => setFormData({ ...formData, type: val })}>
                    <SelectTrigger className="bg-black/50 border-white/10 focus:ring-primary">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 text-foreground">
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="fullstack">Fullstack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 flex justify-end">
                  <GlowingButton type="submit" isLoading={createProject.isPending}>
                    Create Project
                  </GlowingButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-12 bg-white/5 border-white/10 focus-visible:ring-primary h-12 rounded-xl text-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <GlassCard key={i} className="h-48 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : filteredProjects?.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl border-dashed">
            <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No projects found</h3>
            <p className="text-muted-foreground">Get started by creating a new project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects?.map(project => (
              <Link key={project.id} href={`/app/projects/${project.id}`}>
                <GlassCard hoverable className="p-6 cursor-pointer h-full flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                      <Terminal className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{project.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
                    {project.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-1 bg-white/5 rounded text-muted-foreground uppercase">
                        {project.type}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.buildsCount} Builds
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
