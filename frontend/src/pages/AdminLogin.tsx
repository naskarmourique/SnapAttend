import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { LogIn, User, Lock, ShieldCheck, ChevronLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any existing session when the login page is reached
  useEffect(() => {
    localStorage.removeItem("snapattend_token");
    localStorage.removeItem("snapattend_role");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    try {
      const res = await authApi.login(params as any); 
      if (res.data.role !== "admin") {
        toast.error("Access denied. This portal is for Administrators only.");
        return;
      }
      
      localStorage.setItem("snapattend_token", res.data.access_token);
      localStorage.setItem("snapattend_role", res.data.role);
      toast.success("Welcome back, Administrator.");
      
      // Use window.location for absolute redirection to clear any React state
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed. Check admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(100,100,255,0.05),transparent_50%)]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Landing
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground mt-2 font-medium">Secure Administrative Access</p>
        </div>

        <GlassCard glow className="border-primary/20">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 ml-1">Admin Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  className="w-full glass-card bg-background/50 pl-10 pr-4 py-3 outline-none focus:ring-2 ring-primary/50 transition-all border-border/50"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 ml-1">Access Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  className="w-full glass-card bg-background/50 pl-10 pr-4 py-3 outline-none focus:ring-2 ring-primary/50 transition-all border-border/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <GlassButton type="submit" size="lg" className="w-full mt-4 h-12" disabled={loading}>
              <span className="flex items-center justify-center gap-2">
                {loading ? "Verifying..." : <><LogIn className="h-5 w-5" /> Administrator Sign In</>}
              </span>
            </GlassButton>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
