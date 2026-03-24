import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Activity, Folder, Cpu, HardDrive, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { useProjectsWithCache } from "@/hooks/use-projects-api";
import { StatusBadge } from "@/components/StatusBadge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const mockChartData = [
  { name: 'Mon', builds: 12 },
  { name: 'Tue', builds: 19 },
  { name: 'Wed', builds: 15 },
  { name: 'Thu', builds: 25 },
  { name: 'Fri', builds: 22 },
  { name: 'Sat', builds: 30 },
  { name: 'Sun', builds: 28 },
];

export default function Dashboard() {
  const { data: projects, isLoading } = useProjectsWithCache();

  const stats = [
    { label: "Total Projects", value: projects?.length || 0, icon: Folder, trend: "+2 this week" },
    { label: "Total Builds", value: projects?.reduce((acc, p) => acc + p.buildsCount, 0) || 0, icon: Cpu, trend: "+14 this week" },
    { label: "Success Rate", value: "94.2%", icon: Activity, trend: "+1.2% this week" },
    { label: "Storage Used", value: "2.4 GB", icon: HardDrive, trend: "48% of quota" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Overview</h1>
            <p className="text-muted-foreground">Welcome back, Alice. Here's what's happening today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-white/5 text-primary border border-white/10">
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-emerald-400">{stat.trend}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </GlassCard>
          ))}
        </div>

        {/* Charts & Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Build Activity</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBuilds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="builds" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorBuilds)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Recent Projects</h3>
              <Link href="/app/projects" className="text-sm text-primary hover:text-primary/80 flex items-center">
                View All <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl" />
                  ))}
                </div>
              ) : projects?.slice(0, 5).map((project) => (
                <Link key={project.id} href={`/app/projects/${project.id}`}>
                  <div className="p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white group-hover:text-primary transition-colors">{project.name}</h4>
                      <StatusBadge status={project.lastBuildStatus || 'No builds'} />
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-4">
                      <span className="uppercase tracking-wider">{project.type}</span>
                      <span>{project.buildsCount} builds</span>
                    </div>
                  </div>
                </Link>
              ))}
              {!isLoading && projects?.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No projects yet.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
