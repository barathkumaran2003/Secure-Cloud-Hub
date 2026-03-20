import { HTMLAttributes, forwardRef } from "react";
import { cn } from "./GlowingButton";
import { motion } from "framer-motion";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] rounded-2xl relative overflow-hidden",
          hoverable && "hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300",
          className
        )}
        {...props}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export const AnimatedGlassCard = motion(GlassCard);
