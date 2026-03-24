import { useEffect, useRef } from "react";
import { Link, useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { GlowingButton } from "@/components/GlowingButton";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Terminal, Download, Clock, HardDrive, AlertCircle } from "lucide-react";
import { useBuildWithPolling } from "@/hooks/use-builds-api";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function BuildDetails() {
  const [, params] = useRoute("/app/builds/:id");
  const buildId = params?.id || "";
  
  const { data: build, isLoading } = useBuildWithPolling(buildId);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [build?.logs]);

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-white/5 rounded-xl w-1/3" />
          <div className="h-24 bg-white/5 rounded-xl" />
          <div className="h-96 bg-white/5 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!build) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Build not found.</div>
      </Layout>
    );
  }

  const isRunning = build.status === 'building' || build.status === 'pending';
  const isFailed = build.status === 'failed';
  const isSuccess = build.status === 'success';

  return (
    <Layout>
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <Link href={`/app/projects/${build.projectId}`} className="text-muted-foreground hover:text-white inline-flex items-center transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-display font-bold font-mono">Build {build.id.substring(0, 8)}</h1>
                <StatusBadge status={build.status} />
              </div>
              <p className="text-muted-foreground">Started {formatDistanceToNow(new Date(build.createdAt), { addSuffix: true })}</p>
            </div>
            
            {isSuccess && build.downloadUrl && (
              <a href={build.downloadUrl} download>
                <GlowingButton variant="secondary">
                  <Download className="w-5 h-5 mr-2" />
                  Download Binaries
                </GlowingButton>
              </a>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <GlassCard className="p-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium">
              {isRunning ? 'Compilation in progress...' : isSuccess ? 'Compilation complete' : 'Compilation failed'}
            </span>
            <span className="font-mono text-primary">{build.progress}%</span>
          </div>
          <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
            <motion.div 
              className={`h-full relative ${isFailed ? 'bg-destructive' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${build.progress}%` }}
              transition={{ duration: 0.5 }}
            >
              {/* Inner glow/shine effect */}
              {isRunning && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded bg-white/5 text-muted-foreground">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">Target</div>
                <div className="font-medium">{build.targetPlatform.toUpperCase()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded bg-white/5 text-muted-foreground">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">Duration</div>
                <div className="font-medium">{build.duration ? `${build.duration}s` : '...'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded bg-white/5 text-muted-foreground">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">Size</div>
                <div className="font-medium">{build.fileSize || '...'}</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Console / Logs */}
        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-white/10">
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium font-mono text-sm">Build Logs</span>
            {isFailed && <AlertCircle className="w-4 h-4 text-destructive ml-auto" />}
          </div>
          <div className="flex-1 bg-black p-6 overflow-y-auto font-mono text-sm leading-relaxed text-gray-300">
            {build.logs ? (
              <pre className="whitespace-pre-wrap">{build.logs}</pre>
            ) : (
              <div className="text-muted-foreground/50 italic">Initializing container...</div>
            )}
            <div ref={logsEndRef} />
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
