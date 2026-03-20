import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { GlowingButton } from "@/components/GlowingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw, Key, CreditCard, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleCopyKey = () => {
    navigator.clipboard.writeText("sk_live_a1b2c3d4e5f6g7h8i9j0");
    toast({
      title: "Copied!",
      description: "API Key copied to clipboard.",
    });
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and API keys.</p>
        </div>

        <div className="grid gap-8">
          {/* API Keys */}
          <GlassCard className="p-8 border-primary/20">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">API Keys</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Use this key to authenticate requests from your CI/CD pipelines. Keep it secure.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input 
                  readOnly 
                  value="sk_live_••••••••••••••••••••" 
                  className="font-mono bg-black border-white/10 pr-12"
                />
                <button 
                  onClick={handleCopyKey}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <GlowingButton variant="secondary" className="whitespace-nowrap">
                <RefreshCw className="w-4 h-4 mr-2" /> Roll Key
              </GlowingButton>
            </div>
          </GlassCard>

          {/* Billing / Plan */}
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Billing & Plan</h2>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
              <div>
                <div className="text-sm text-primary font-bold tracking-widest uppercase mb-1">Current Plan</div>
                <div className="text-3xl font-bold font-display text-white">Pro Tier</div>
                <div className="text-muted-foreground mt-2 text-sm">Next billing date: Oct 1, 2025</div>
              </div>
              <GlowingButton>Manage Subscription</GlowingButton>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span>Builds this month</span>
                <span className="font-medium text-white">45 / Unlimited</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span>Storage used</span>
                <span className="font-medium text-white">2.4 GB / 5 GB</span>
              </div>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-white">Email on Build Failure</Label>
                  <p className="text-sm text-muted-foreground mt-1">Receive an email immediately if a build fails.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-white">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground mt-1">Get a summary of your builds and project activity.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium text-white">Product Updates</Label>
                  <p className="text-sm text-muted-foreground mt-1">Hear about new features and platform improvements.</p>
                </div>
                <Switch className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
