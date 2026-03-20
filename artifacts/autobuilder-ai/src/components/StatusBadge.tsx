import { cn } from "./GlowingButton";

interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return <span className="text-muted-foreground text-sm">-</span>;
  
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    building: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const defaultStyle = "bg-white/10 text-white border-white/20";

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize flex items-center gap-1.5 w-max",
      styles[status.toLowerCase()] || defaultStyle,
      className
    )}>
      {status === 'building' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
      )}
      {status}
    </span>
  );
}
