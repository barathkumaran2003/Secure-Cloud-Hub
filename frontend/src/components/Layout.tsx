import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  TerminalSquare,
  LogOut,
  Plus
} from "lucide-react";
import { cn } from "./GlowingButton";
import { motion } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/app" },
    { icon: FolderKanban, label: "Projects", href: "/app/projects" },
    { icon: Settings, label: "Settings", href: "/app/settings" },
  ];

  const isNewBuildActive = location === "/app/new-build";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-3xl flex flex-col relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center box-glow">
            <TerminalSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            AutoBuilder<span className="text-primary">.ai</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {/* New Build CTA */}
          <Link href="/app/new-build" className="block mb-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden group",
                isNewBuildActive
                  ? "bg-primary shadow-[0_0_24px_-4px_rgba(124,58,237,0.6)]"
                  : "bg-primary/80 hover:bg-primary shadow-[0_0_16px_-4px_rgba(124,58,237,0.4)] hover:shadow-[0_0_24px_-4px_rgba(124,58,237,0.6)]"
              )}
            >
              <div className="absolute inset-0 border-t border-white/20 rounded-xl pointer-events-none" />
              <Plus className="w-5 h-5 text-white relative z-10" />
              <span className="font-semibold text-white relative z-10">New Build</span>
            </motion.div>
          </Link>

          <div className="pt-1 pb-2">
            <p className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">Navigation</p>
          </div>

          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/app' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                  isActive ? "text-white bg-white/10" : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-xl border border-primary/30" 
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                  <span className="font-medium relative z-10">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <img src={"/images/avatar.png"} alt="User" className="w-9 h-9 rounded-full border border-white/20" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Alice Builder</p>
              <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
            </div>
            <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
