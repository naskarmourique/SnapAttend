import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import { useTheme } from "@/hooks/useTheme";
import { 
  ShieldCheck, 
  User, 
  ScanFace, 
  Sun, 
  Moon, 
  ArrowRight, 
  Lock, 
  Key,
  UserCircle,
  Hash,
  CheckCircle2,
  Zap,
  BarChart3,
  Camera
} from "lucide-react";
import { toast } from "sonner";

type View = "hero" | "admin-login" | "student-login";

export default function Index() {
  const [view, setView] = useState<View>("hero");
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Admin Login State
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  // Student Login State
  const [studentName, setStudentName] = useState("");
  const [studentRoll, setStudentRoll] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === "admin" && adminPass === "admin123") {
      localStorage.setItem("user_role", "admin");
      localStorage.removeItem("student_roll");
      toast.success("Welcome, Administrator");
      navigate("/dashboard");
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName && studentRoll) {
      localStorage.setItem("user_role", "student");
      localStorage.setItem("student_roll", studentRoll);
      toast.success(`Welcome, ${studentName}`);
      navigate("/dashboard");
    } else {
      toast.error("Please enter both Name and Roll Number");
    }
  };

  const features = [
    { icon: Zap, title: "Real-time Recognition", desc: "Ultra-fast face detection using optimized AI pipelines." },
    { icon: ShieldCheck, title: "Anti-Spoofing AI", desc: "Advanced liveness detection to prevent biometric fraud." },
    { icon: BarChart3, title: "Live Analytics", desc: "Instant data visualization for attendance trends and rates." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? "py-4 bg-background/60 backdrop-blur-xl border-b border-border/40" : "py-8 bg-transparent"}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView("hero")}>
            <div className="glass-card-glow p-2 group-hover:scale-110 transition-transform duration-500">
              <ScanFace className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Snap<span className="text-primary neon-text">Attend</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <GlassButton variant="primary" size="sm" onClick={() => setView("student-login")}>
              Student Portal
            </GlassButton>
          </div>
        </div>
      </nav>

      <main className="relative pt-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />

        <AnimatePresence mode="wait">
          {view === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-6"
            >
              {/* Hero Section */}
              <section className="py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                      AI-Powered Attendance System
                    </span>
                    <h1 className="text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-8">
                      Attendance Redefined by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 neon-text">AI Precision</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                      SnapAttend combines state-of-the-art facial recognition with real-time analytics to create a seamless, touchless attendance experience.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                      <GlassButton size="lg" className="px-10 group" onClick={() => setView("admin-login")}>
                        Admin Dashboard <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </GlassButton>
                      <button 
                        onClick={() => setView("student-login")}
                        className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 group"
                      >
                        Check Student Records <span className="w-8 h-[1px] bg-muted-foreground group-hover:w-12 group-hover:bg-primary transition-all duration-300" />
                      </button>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="flex-1 w-full max-w-xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                    <GlassCard className="p-2 border-primary/30 relative z-10">
                      <div className="aspect-video rounded-xl overflow-hidden bg-background/50 relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                          <div className="w-20 h-20 rounded-full border-2 border-primary border-dashed animate-spin-slow mb-6 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-primary" />
                          </div>
                          <p className="text-sm font-medium opacity-50 uppercase tracking-[0.3em]">Ready for Scan</p>
                        </div>
                        {/* Scanning Effect Overlay */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/20 to-transparent animate-scan" />
                      </div>
                    </GlassCard>
                    {/* Floating Info Cards */}
                    <motion.div 
                      className="absolute -top-6 -right-6 glass-card p-4 flex items-center gap-3 z-20"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Accuracy</p>
                        <p className="text-sm font-bold">99.8% Match</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </section>

              {/* Features Grid */}
              <section className="py-20 border-t border-border/40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <GlassCard className="h-full hover:border-primary/50 transition-colors group">
                        <f.icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* Login Views */}
          {(view === "admin-login" || view === "student-login") && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[70vh]"
            >
              <div className="w-full max-w-md">
                <button 
                  onClick={() => setView("hero")}
                  className="mb-8 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" /> Back to Home
                </button>

                <GlassCard glow className="p-8">
                  <div className="text-center mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${view === 'admin-login' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'}`}>
                      {view === 'admin-login' ? <ShieldCheck className="h-7 w-7" /> : <User className="h-7 w-7" />}
                    </div>
                    <h2 className="text-3xl font-display font-bold">
                      {view === 'admin-login' ? 'Admin Access' : 'Student Portal'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      {view === 'admin-login' ? 'Secure access for system administrators' : 'Enter your credentials to view attendance'}
                    </p>
                  </div>

                  <form 
                    onSubmit={view === 'admin-login' ? handleAdminLogin : handleStudentLogin}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        {view === 'admin-login' ? 'Username' : 'Full Name'}
                      </label>
                      <div className="glass-card flex items-center gap-3 px-4 py-1.5 focus-within:border-primary/50 transition-colors">
                        {view === 'admin-login' ? <Lock className="h-4 w-4 opacity-50" /> : <UserCircle className="h-4 w-4 opacity-50" />}
                        <input 
                          type="text"
                          value={view === 'admin-login' ? adminUser : studentName}
                          onChange={(e) => view === 'admin-login' ? setAdminUser(e.target.value) : setStudentName(e.target.value)}
                          placeholder={view === 'admin-login' ? "Admin ID" : "Your full name"}
                          className="bg-transparent outline-none text-sm w-full py-2.5"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        {view === 'admin-login' ? 'Security Key' : 'Roll Number'}
                      </label>
                      <div className="glass-card flex items-center gap-3 px-4 py-1.5 focus-within:border-primary/50 transition-colors">
                        {view === 'admin-login' ? <Key className="h-4 w-4 opacity-50" /> : <Hash className="h-4 w-4 opacity-50" />}
                        <input 
                          type={view === 'admin-login' ? "password" : "text"}
                          value={view === 'admin-login' ? adminPass : studentRoll}
                          onChange={(e) => view === 'admin-login' ? setAdminPass(e.target.value) : setStudentRoll(e.target.value)}
                          placeholder={view === 'admin-login' ? "••••••••" : "e.g. CS202401"}
                          className="bg-transparent outline-none text-sm w-full py-2.5"
                          required
                        />
                      </div>
                    </div>

                    <GlassButton type="submit" className="w-full py-4 text-sm uppercase tracking-widest font-bold" variant={view === 'admin-login' ? 'primary' : 'secondary'}>
                      Sign In to Portal
                    </GlassButton>
                  </form>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-50">SnapAttend AI</p>
            <p className="text-xs text-muted-foreground">© 2026 High-Precision Recognition. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
