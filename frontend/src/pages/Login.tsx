import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { LogIn, User, Lock, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    try {
      console.log("Submitting login...");
      const res = await authApi.login(params as any); 
      console.log("Login Response:", res.data);
      
      if (res.data.access_token) {
        localStorage.setItem("snapattend_token", res.data.access_token);
        localStorage.setItem("snapattend_role", res.data.role);
        console.log("Token and Role saved. Navigating...");
        toast.success(`Login successful! Welcome ${res.data.role}.`);
        
        // Use window.location for absolute redirection to clear any state
        setTimeout(() => {
          window.location.href = res.data.role === "admin" ? "/dashboard" : "/student";
        }, 500);
      } else {
        console.error("No token in response");
        toast.error("Authentication failed: No token received");
      }
    } catch (err: any) {
      console.error("Login Error Object:", err);
      const msg = err.response?.data?.detail || "Login failed. Check connection.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(100,100,255,0.05),transparent_50%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SnapAttend Admin</h1>
          <p className="text-muted-foreground mt-2">Secure biometric access portal</p>
        </div>

        <GlassCard glow>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  className="w-full glass-card bg-background/50 pl-10 pr-4 py-2.5 outline-none focus:ring-2 ring-primary/50 transition-all"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  className="w-full glass-card bg-background/50 pl-10 pr-4 py-2.5 outline-none focus:ring-2 ring-primary/50 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <GlassButton type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              <span className="flex items-center justify-center gap-2">
                {loading ? "Authenticating..." : <><LogIn className="h-4 w-4" /> Sign In</>}
              </span>
            </GlassButton>
          </form>
        </GlassCard>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2024 SnapAttend • Secure Biometric Identification System
        </p>
      </motion.div>
    </div>
  );
}
