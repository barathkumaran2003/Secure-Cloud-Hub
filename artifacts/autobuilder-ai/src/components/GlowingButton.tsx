import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GlowingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
}

export const GlowingButton = forwardRef<HTMLButtonElement, GlowingButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl overflow-hidden px-6 py-2.5";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_0_25px_0px_rgba(124,58,237,0.7)]",
      secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_0px_rgba(59,130,246,0.7)]",
      danger: "bg-destructive text-white hover:bg-destructive/90 shadow-[0_0_20px_-5px_rgba(225,29,72,0.5)] hover:shadow-[0_0_25px_0px_rgba(225,29,72,0.7)]",
      ghost: "bg-transparent text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(
          baseStyles,
          variants[variant],
          (disabled || isLoading) && "opacity-50 cursor-not-allowed transform-none",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Subtle inner top highlight */}
        <div className="absolute inset-0 border-t border-white/20 rounded-xl pointer-events-none" />
        
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
GlowingButton.displayName = "GlowingButton";
