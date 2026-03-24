import { Link } from "wouter";
import { motion } from "framer-motion";
import { TerminalSquare, Zap, Shield, Cpu, ChevronRight } from "lucide-react";
import { GlowingButton } from "@/components/GlowingButton";
import { GlassCard } from "@/components/GlassCard";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center box-glow">
              <TerminalSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              AutoBuilder<span className="text-primary">.ai</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-white transition-colors">Documentation</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
            <Link href="/app" className="block">
              <GlowingButton>Get Started</GlowingButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={"/images/hero-mesh.png"} 
            alt="Futuristic Grid" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-white/80">AutoBuilder Engine v2.0 is live</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-display font-extrabold tracking-tight mb-8 leading-tight"
            >
              Compile. Automate. <br />
              <span className="gradient-text text-glow">Deploy Anywhere.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl leading-relaxed"
            >
              Upload your frontend or backend repository. We handle the native compilation into Windows EXE and Android APKs automatically in the cloud.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link href="/app" className="w-full sm:w-auto">
                <GlowingButton className="w-full sm:w-auto text-lg px-8 py-4">
                  Start Building Now
                  <ChevronRight className="w-5 h-5 ml-2" />
                </GlowingButton>
              </Link>
              <GlowingButton variant="ghost" className="w-full sm:w-auto text-lg px-8 py-4">
                View Documentation
              </GlowingButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold mb-4">Enterprise-grade build pipeline</h2>
            <p className="text-xl text-white/60">Everything you need to turn code into distributable binaries.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Distributed edge compilation reduces build times by up to 80% compared to local pipelines." },
              { icon: Cpu, title: "Multi-Platform", desc: "Generate optimized .exe for Windows and .apk for Android simultaneously from a single trigger." },
              { icon: Shield, title: "Code Security", desc: "Your source code is isolated in ephemeral, air-gapped containers that are destroyed post-build." }
            ].map((f, i) => (
              <GlassCard key={i} className="p-8" hoverable>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6 border border-primary/30">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-white/60 leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold mb-4">Transparent Pricing</h2>
            <p className="text-xl text-white/60">Scale your native distribution effortlessly.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Free */}
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold mb-2">Hobby</h3>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-white/40 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-white/70">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> 10 Builds/month</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Standard Queue</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Community Support</li>
              </ul>
              <GlowingButton variant="ghost" className="w-full bg-white/5">Current Plan</GlowingButton>
            </GlassCard>

            {/* Pro */}
            <GlassCard className="p-8 border-primary/50 relative transform md:-translate-y-4 box-glow">
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">$49<span className="text-lg text-white/40 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-white/70">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Unlimited Builds</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Priority Queueing</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Up to 5GB Artifacts</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Email Support</li>
              </ul>
              <GlowingButton className="w-full">Upgrade to Pro</GlowingButton>
            </GlassCard>

            {/* Enterprise */}
            <GlassCard className="p-8">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-4 mb-8 text-white/70">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Dedicated Runners</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Custom Build Scripts</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> SLA Guarantees</li>
              </ul>
              <GlowingButton variant="ghost" className="w-full bg-white/5">Contact Sales</GlowingButton>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black/80">
        <div className="max-w-7xl mx-auto px-6 text-center text-white/40 text-sm">
          © 2025 AutoBuilder AI. All rights reserved. Premium code compilation.
        </div>
      </footer>
    </div>
  );
}
