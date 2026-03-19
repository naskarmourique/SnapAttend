import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { LogIn, UserCircle, Hash, ScanFace, ChevronLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function StudentLogin() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
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
    params.append("username", name);
    params.append("password", rollNumber);

    try {
      const res = await authApi.login(params as any); 
      if (res.data.role !== "student") {
        toast.error("Invalid student credentials.");
        return;
      }
      
      localStorage.setItem("snapattend_token", res.data.access_token);
      localStorage.setItem("snapattend_role", res.data.role);
      toast.success(`Welcome, ${name}!`);
      
      // Use window.location for absolute redirection to clear any React state
      setTimeout(() => {
        window.location.href = "/student";
      }, 500);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed. Verify your name and roll number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.05),transparent_50%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Landing
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <ScanFace className="h-10 w-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
          <p className="text-muted-foreground mt-2 font-medium">Access your biometric records</p>
        </div>

        <GlassCard glow className="border-purple-500/20">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 ml-1">Full Name</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  className="w-full glass-card bg-background/50 pl-10 pr-4 py-3 outline-none focus:ring-2 ring-purple-500/50 transition-all border-border/50"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 ml-1">Roll Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  className="w-full glass-card bg-background/50 pl-10 pr-4 py-3 outline-none focus:ring-2 ring-purple-500/50 transition-all border-border/50"
                  placeholder="e.g. CS202401"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>
            </div>
            
            <GlassButton type="submit" size="lg" className="w-full mt-4 h-12 bg-purple-600 hover:bg-purple-700" disabled={loading}>
              <span className="flex items-center justify-center gap-2 text-white">
                {loading ? "Identifying..." : <><LogIn className="h-5 w-5" /> Student Sign In</>}
              </span>
            </GlassButton>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
