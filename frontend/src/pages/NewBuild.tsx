import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, CheckCircle2, AlertCircle, FileArchive,
  Play, ChevronRight, Monitor, Smartphone, Layers,
  Zap, Code2, Server, Coffee, FolderOpen, RotateCcw,
  Cpu, Package
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { GlowingButton } from "@/components/GlowingButton";
import { cn } from "@/components/GlowingButton";
import { useTriggerBuildMutation } from "@/hooks/use-builds-api";
import { useCreateProjectMutation } from "@/hooks/use-projects-api";
import { useToast } from "@/hooks/use-toast";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileInfo {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  detectedStack?: string[];
}

type StackDef = { name: string; icon: React.ComponentType<{ className?: string }>; color: string; keywords: string[] };

const STACK_DEFINITIONS: StackDef[] = [
  { name: "React", icon: Code2, color: "#61DAFB", keywords: ["react", "jsx", "tsx", "next"] },
  { name: "Vue", icon: Code2, color: "#42b883", keywords: ["vue", "nuxt"] },
  { name: "Angular", icon: Code2, color: "#DD0031", keywords: ["angular", "ng"] },
  { name: "Node.js", icon: Server, color: "#3C873A", keywords: ["node", "express", "nestjs", "fastify"] },
  { name: "Python", icon: Cpu, color: "#3776AB", keywords: ["python", "django", "flask", "fastapi", ".py"] },
  { name: "Spring Boot", icon: Coffee, color: "#6DB33F", keywords: ["spring", ".java", "maven", "gradle"] },
  { name: "Electron", icon: Monitor, color: "#9FEAF9", keywords: ["electron"] },
  { name: "React Native", icon: Smartphone, color: "#61DAFB", keywords: ["react-native", "expo"] },
];

function detectStack(filename: string): string[] {
  const lower = filename.toLowerCase();
  return STACK_DEFINITIONS
    .filter(s => s.keywords.some(k => lower.includes(k)))
    .map(s => s.name)
    .slice(0, 3);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isValidFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ["application/zip", "application/x-zip-compressed", "application/java-archive"];
  const validExtensions = [".zip", ".jar"];
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!validExtensions.includes(ext) && !validTypes.includes(file.type)) {
    return { valid: false, error: "Only .zip and .jar files are supported." };
  }
  if (file.size > 500 * 1024 * 1024) {
    return { valid: false, error: "File must be under 500 MB." };
  }
  return { valid: true };
}

function simulateUpload(
  onProgress: (p: number) => void,
  onDone: () => void
) {
  let p = 0;
  const interval = setInterval(() => {
    p += Math.random() * 18 + 8;
    if (p >= 100) {
      p = 100;
      clearInterval(interval);
      onProgress(100);
      setTimeout(onDone, 300);
    } else {
      onProgress(Math.round(p));
    }
  }, 180);
  return () => clearInterval(interval);
}

interface DropZoneProps {
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  fileInfo: FileInfo | null;
  onFile: (file: File) => void;
  onRemove: () => void;
  accent: "violet" | "blue";
}

function DropZone({ label, sublabel, icon: Icon, fileInfo, onFile, onRemove, accent }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accentColor = accent === "violet"
    ? { border: "border-violet-500/60", bg: "bg-violet-500/10", glow: "shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)]", ring: "ring-violet-500/30", dot: "bg-violet-400", text: "text-violet-400", bar: "bg-gradient-to-r from-violet-500 to-purple-400" }
    : { border: "border-blue-500/60", bg: "bg-blue-500/10", glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]", ring: "ring-blue-500/30", dot: "bg-blue-400", text: "text-blue-400", bar: "bg-gradient-to-r from-blue-500 to-cyan-400" };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  if (fileInfo) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative rounded-2xl border p-6 transition-all duration-300 overflow-hidden",
          fileInfo.status === "success"
            ? `${accentColor.border} ${accentColor.bg} ${accentColor.glow}`
            : fileInfo.status === "error"
              ? "border-red-500/60 bg-red-500/10"
              : "border-white/10 bg-white/[0.03]"
        )}
      >
        {/* Background shimmer on success */}
        {fileInfo.status === "success" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}

        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            fileInfo.status === "error" ? "bg-red-500/20" : accentColor.bg
          )}>
            {fileInfo.status === "success"
              ? <CheckCircle2 className={cn("w-6 h-6", accentColor.text)} />
              : fileInfo.status === "error"
                ? <AlertCircle className="w-6 h-6 text-red-400" />
                : <FileArchive className={cn("w-6 h-6", accentColor.text)} />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-white truncate text-sm">{fileInfo.file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(fileInfo.file.size)}</p>
              </div>
              <button
                onClick={onRemove}
                className="text-muted-foreground hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            {(fileInfo.status === "uploading" || fileInfo.status === "success") && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{fileInfo.status === "success" ? "Upload complete" : "Uploading..."}</span>
                  <span>{fileInfo.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", accentColor.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: `${fileInfo.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {fileInfo.status === "error" && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fileInfo.error}
              </p>
            )}

            {fileInfo.status === "success" && fileInfo.detectedStack && fileInfo.detectedStack.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Detected:</span>
                {fileInfo.detectedStack.map(s => (
                  <span key={s} className={cn("text-xs px-2 py-0.5 rounded-full font-medium", accentColor.bg, accentColor.text, "border", accentColor.border)}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Replace option */}
        {(fileInfo.status === "success" || fileInfo.status === "error") && (
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-4 text-xs text-muted-foreground hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replace file
          </button>
        )}
        <input ref={inputRef} type="file" accept=".zip,.jar" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      </motion.div>
    );
  }

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative rounded-2xl border-2 border-dashed p-8 cursor-pointer group transition-all duration-300 text-center select-none",
        isDragging
          ? `${accentColor.border} ${accentColor.bg} ${accentColor.glow} ring-1 ${accentColor.ring}`
          : "border-white/[0.10] hover:border-white/20 hover:bg-white/[0.02]"
      )}
    >
      {/* Animated corner accents */}
      <div className={cn("absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg transition-colors duration-300", isDragging ? accentColor.border : "border-white/20 group-hover:border-white/30")} />
      <div className={cn("absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg transition-colors duration-300", isDragging ? accentColor.border : "border-white/20 group-hover:border-white/30")} />
      <div className={cn("absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg transition-colors duration-300", isDragging ? accentColor.border : "border-white/20 group-hover:border-white/30")} />
      <div className={cn("absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 rounded-br-lg transition-colors duration-300", isDragging ? accentColor.border : "border-white/20 group-hover:border-white/30")} />

      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300",
        isDragging ? `${accentColor.bg} ${accentColor.glow}` : "bg-white/[0.05] group-hover:bg-white/[0.08]"
      )}>
        <Icon className={cn("w-7 h-7 transition-colors duration-300", isDragging ? accentColor.text : "text-muted-foreground group-hover:text-white/70")} />
      </div>

      <p className="font-semibold text-white mb-1">{label}</p>
      <p className="text-sm text-muted-foreground mb-4">{sublabel}</p>

      <div className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300",
        isDragging
          ? `${accentColor.border} ${accentColor.text} ${accentColor.bg}`
          : "border-white/10 text-muted-foreground group-hover:border-white/20 group-hover:text-white"
      )}>
        <FolderOpen className="w-4 h-4" />
        Browse File
      </div>

      <p className="text-xs text-muted-foreground mt-3">Supports .zip · .jar up to 500 MB</p>

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm"
          >
            <div className={cn("flex flex-col items-center gap-3", accentColor.text)}>
              <Upload className="w-10 h-10" />
              <p className="font-bold text-lg">Drop to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={inputRef} type="file" accept=".zip,.jar" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </motion.div>
  );
}

const PLATFORM_OPTIONS = [
  { value: "exe", label: "Windows Executable", sub: ".exe — Win 10/11 x64", icon: Monitor, color: "text-blue-400" },
  { value: "apk", label: "Android APK", sub: ".apk — Android 8+", icon: Smartphone, color: "text-green-400" },
  { value: "both", label: "Both Platforms", sub: ".exe + .apk bundled", icon: Layers, color: "text-violet-400" },
] as const;

type Platform = "exe" | "apk" | "both";

export default function NewBuild() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createProject = useCreateProjectMutation();

  const [frontendFile, setFrontendFile] = useState<FileInfo | null>(null);
  const [backendFile, setBackendFile] = useState<FileInfo | null>(null);
  const [platform, setPlatform] = useState<Platform>("both");
  const [projectName, setProjectName] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStarted, setBuildStarted] = useState(false);

  const handleFile = useCallback((type: "frontend" | "backend") => (file: File) => {
    const validation = isValidFile(file);
    if (!validation.valid) {
      const info: FileInfo = { file, status: "error", progress: 0, error: validation.error };
      type === "frontend" ? setFrontendFile(info) : setBackendFile(info);
      return;
    }

    const startInfo: FileInfo = { file, status: "uploading", progress: 0 };
    type === "frontend" ? setFrontendFile(startInfo) : setBackendFile(startInfo);

    simulateUpload(
      (p) => {
        const updating: FileInfo = { file, status: "uploading", progress: p };
        type === "frontend" ? setFrontendFile(updating) : setBackendFile(updating);
      },
      () => {
        const stacks = detectStack(file.name);
        const done: FileInfo = {
          file,
          status: "success",
          progress: 100,
          detectedStack: stacks.length > 0 ? stacks : [type === "frontend" ? "React" : "Node.js"],
        };
        type === "frontend" ? setFrontendFile(done) : setBackendFile(done);
      }
    );
  }, []);

  const allDetectedStacks = [
    ...(frontendFile?.status === "success" ? frontendFile.detectedStack ?? [] : []),
    ...(backendFile?.status === "success" ? backendFile.detectedStack ?? [] : []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const bothReady = frontendFile?.status === "success" || backendFile?.status === "success";
  const hasAny = frontendFile !== null || backendFile !== null;

  const handleStartBuild = async () => {
    if (!bothReady) return;
    setIsBuilding(true);
    try {
      const name = projectName.trim() || `Build ${new Date().toLocaleDateString()}`;
      const type = frontendFile?.status === "success" && backendFile?.status === "success"
        ? "fullstack" : frontendFile?.status === "success" ? "frontend" : "backend";

      const project = await createProject.mutateAsync({ data: { name, type } });
      setBuildStarted(true);

      setTimeout(() => {
        navigate(`/app/projects/${project.id}`);
      }, 1800);
    } catch {
      toast({ title: "Build failed to start", description: "Please try again.", variant: "destructive" });
      setIsBuilding(false);
    }
  };

  if (buildStarted) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto shadow-[0_0_60px_-10px_rgba(124,58,237,0.8)]"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Build Initiated!</h2>
              <p className="text-muted-foreground">Redirecting to project dashboard...</p>
            </div>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-violet-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Package className="w-4 h-4" />
            <span>New Build</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Upload & Configure</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Start a New Build</h1>
          <p className="text-muted-foreground text-lg">
            Upload your project files and we'll compile them into EXE and APK automatically.
          </p>
        </motion.div>

        {/* Step indicators */}
        <div className="flex items-center gap-3">
          {["Upload Files", "Stack Detection", "Configure", "Launch Build"].map((step, i) => {
            const isActive = i === 0 || (i === 1 && hasAny) || (i === 2 && bothReady) || (i === 3 && bothReady);
            return (
              <div key={step} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-500",
                    isActive ? "bg-violet-500/20 border-violet-500/60 text-violet-300" : "bg-white/5 border-white/10 text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>
                  <span className={cn("text-sm font-medium hidden sm:block transition-colors duration-300", isActive ? "text-white" : "text-muted-foreground")}>
                    {step}
                  </span>
                </div>
                {i < 3 && <div className={cn("h-px w-8 transition-colors duration-500", isActive ? "bg-violet-500/40" : "bg-white/10")} />}
              </div>
            );
          })}
        </div>

        {/* ── SECTION 1: Upload ── */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Upload className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upload Project Files</h2>
              <p className="text-sm text-muted-foreground">Upload frontend and/or backend zip archives</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                Frontend Project
                <span className="text-xs text-muted-foreground ml-auto">(React, Vue, Angular…)</span>
              </div>
              <DropZone
                label="Drop your frontend here"
                sublabel="Drag & drop or browse"
                icon={Code2}
                fileInfo={frontendFile}
                onFile={handleFile("frontend")}
                onRemove={() => setFrontendFile(null)}
                accent="violet"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                Backend Project
                <span className="text-xs text-muted-foreground ml-auto">(Node, Python, Java…)</span>
              </div>
              <DropZone
                label="Drop your backend here"
                sublabel="Drag & drop or browse"
                icon={Server}
                fileInfo={backendFile}
                onFile={handleFile("backend")}
                onRemove={() => setBackendFile(null)}
                accent="blue"
              />
            </div>
          </div>
        </GlassCard>

        {/* ── SECTION 2: Stack Detection ── */}
        <AnimatePresence>
          {hasAny && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Smart Stack Detection</h2>
                    <p className="text-sm text-muted-foreground">Auto-detected from your uploaded files</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {allDetectedStacks.length > 0
                    ? allDetectedStacks.map((stackName, i) => {
                        const def = STACK_DEFINITIONS.find(s => s.name === stackName);
                        const Icon = def?.icon ?? Code2;
                        return (
                          <motion.div
                            key={stackName}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                          >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${def?.color}18`, border: `1px solid ${def?.color}30` }}>
                              <Icon className="w-6 h-6" style={{ color: def?.color }} />
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-sm text-white">{stackName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Detected</p>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          </motion.div>
                        );
                      })
                    : [frontendFile, backendFile].filter(Boolean).map((f, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                          {f?.status === "uploading"
                            ? <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><div className="w-5 h-5 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin" /></div>
                            : <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-yellow-400" /></div>
                          }
                          <p className="text-xs text-muted-foreground text-center">Analyzing...</p>
                        </div>
                      ))
                  }

                  {/* Unknown slots */}
                  {Array.from({ length: Math.max(0, 4 - Math.max(allDetectedStacks.length, 1)) }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-dashed border-white/[0.06] opacity-40">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center">
                        <Code2 className="w-6 h-6 text-white/20" />
                      </div>
                      <p className="text-xs text-muted-foreground">Awaiting upload</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECTION 3: Configuration ── */}
        <AnimatePresence>
          {bothReady && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Build Configuration</h2>
                    <p className="text-sm text-muted-foreground">Select your output targets and project name</p>
                  </div>
                </div>

                {/* Project name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">Project Name</label>
                  <input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. My Awesome App"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>

                {/* Platform selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Target Platform</label>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {PLATFORM_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setPlatform(opt.value)}
                        className={cn(
                          "relative p-5 rounded-2xl border text-left transition-all duration-300 group",
                          platform === opt.value
                            ? "border-violet-500/60 bg-violet-500/10 shadow-[0_0_25px_-5px_rgba(124,58,237,0.3)]"
                            : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                        )}
                      >
                        {platform === opt.value && (
                          <motion.div layoutId="platformSelect" className="absolute inset-0 rounded-2xl bg-violet-500/5 border border-violet-500/30" initial={false} />
                        )}
                        <div className="relative z-10">
                          <opt.icon className={cn("w-7 h-7 mb-3 transition-colors", platform === opt.value ? opt.color : "text-muted-foreground group-hover:text-white/60")} />
                          <p className={cn("font-semibold text-sm mb-0.5 transition-colors", platform === opt.value ? "text-white" : "text-white/70")}>{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.sub}</p>
                        </div>
                        {platform === opt.value && (
                          <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-violet-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECTION 4: Summary + Start Build ── */}
        <AnimatePresence>
          {bothReady && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard className="p-8 border-violet-500/20 bg-gradient-to-br from-violet-500/[0.07] to-transparent">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-violet-400" />
                      Build Summary
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {frontendFile?.status === "success" && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm">
                          <Code2 className="w-4 h-4 text-violet-400" />
                          <span className="text-white/80 truncate max-w-[140px]">{frontendFile.file.name}</span>
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        </div>
                      )}
                      {backendFile?.status === "success" && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm">
                          <Server className="w-4 h-4 text-blue-400" />
                          <span className="text-white/80 truncate max-w-[140px]">{backendFile.file.name}</span>
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">
                        {PLATFORM_OPTIONS.find(p => p.value === platform)?.icon &&
                          (() => { const Icon = PLATFORM_OPTIONS.find(p => p.value === platform)!.icon; return <Icon className="w-4 h-4 text-muted-foreground" />; })()
                        }
                        <span className="text-white/80">{PLATFORM_OPTIONS.find(p => p.value === platform)?.label}</span>
                      </div>
                    </div>
                  </div>

                  <GlowingButton
                    onClick={handleStartBuild}
                    isLoading={isBuilding}
                    disabled={!bothReady || isBuilding}
                    className="text-base px-8 py-4 shadow-[0_0_40px_-8px_rgba(124,58,237,0.7)]"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Build
                  </GlowingButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt if nothing uploaded */}
        {!hasAny && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-muted-foreground pb-4">
            Upload at least one project file above to unlock the build configuration.
          </motion.p>
        )}
      </div>
    </Layout>
  );
}
